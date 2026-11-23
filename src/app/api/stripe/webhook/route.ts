import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

async function saveSubscription(subscriptionId: string) {
  // Zawsze pobieramy aktualny stan z Stripe, żeby spóźnione zdarzenia nie nadpisały nowszych danych.
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  let userId: string | undefined = subscription.metadata.userId;

  if (!userId) {
    const known = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
    userId = known?.userId;
  }

  if (!userId) {
    // Subskrypcja spoza tej aplikacji — potwierdzamy zdarzenie, by Stripe nie ponawiał go w nieskończoność.
    console.warn(`Subscription ${subscription.id} has no known user, skipping`);
    return;
  }

  const item = subscription.items.data[0];

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      priceId: item?.price.id ?? null,
      status: subscription.status,
      currentPeriodStart: item
        ? new Date(item.current_period_start * 1000)
        : null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      priceId: item?.price.id ?? null,
      status: subscription.status,
      currentPeriodStart: item
        ? new Date(item.current_period_start * 1000)
        : null,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: 'Invalid Stripe signature' },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (subscriptionId) {
          await saveSubscription(subscriptionId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await saveSubscription(subscription.id);
        break;
      }

      case 'invoice.payment_failed':
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof sub === 'string' ? sub : sub?.id;

        if (subscriptionId) {
          await saveSubscription(subscriptionId);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
