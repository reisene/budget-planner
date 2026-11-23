import { stripe } from '@/lib/stripe';
import pkg from '@/package.json';
import { NextResponse } from 'next/server';

import { getBillingAccess } from '@/lib/billing';
import { prisma } from '@/lib/db';

const appUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : pkg.homepage;

export async function POST(request: Request) {
  const { user, isAdmin, hasPlus } = await getBillingAccess();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isAdmin || hasPlus) {
    return NextResponse.json({ error: 'Already has access' }, { status: 409 });
  }

  let plan: unknown;

  try {
    plan = (await request.json())?.plan;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const priceId =
    plan === 'monthly'
      ? process.env.STRIPE_PRICE_MONTHLY
      : plan === 'yearly'
        ? process.env.STRIPE_PRICE_YEARLY
        : null;

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  try {
    // Istniejący klient Stripe jest zawsze używany ponownie, także po anulowaniu lub zaległej płatności.
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existing?.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : { customer_email: user.email }),
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
      success_url: `${appUrl}/pricing?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('Stripe checkout creation failed:', error);
    return NextResponse.json(
      { error: 'Could not start checkout' },
      { status: 502 },
    );
  }
}
