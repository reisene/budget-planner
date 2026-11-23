import { stripe } from '@/lib/stripe';
import { unstable_cache } from 'next/cache';

export type PlusPrices = {
  monthly: string;
  yearly: string;
  yearlySavings: string | null;
};

function format(amount: number, currency: string) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

const fetchPlusPrices = unstable_cache(
  async (): Promise<PlusPrices> => {
    const monthlyId = process.env.STRIPE_PRICE_MONTHLY;
    const yearlyId = process.env.STRIPE_PRICE_YEARLY;

    if (!monthlyId || !yearlyId) {
      throw new Error('Missing STRIPE_PRICE_MONTHLY or STRIPE_PRICE_YEARLY');
    }

    const [monthly, yearly] = await Promise.all([
      stripe.prices.retrieve(monthlyId),
      stripe.prices.retrieve(yearlyId),
    ]);

    if (monthly.unit_amount == null || yearly.unit_amount == null) {
      throw new Error('Stripe prices have no unit_amount');
    }

    const savings = monthly.unit_amount * 12 - yearly.unit_amount;

    return {
      monthly: format(monthly.unit_amount, monthly.currency),
      yearly: format(yearly.unit_amount, yearly.currency),
      yearlySavings: savings > 0 ? format(savings, yearly.currency) : null,
    };
  },
  ['stripe-plus-prices'],
  { revalidate: 3600 },
);

// Returns null when Stripe is unreachable so the page can still render.
export async function getPlusPrices(): Promise<PlusPrices | null> {
  try {
    return await fetchPlusPrices();
  } catch (error) {
    console.error('Failed to load Stripe prices', error);
    return null;
  }
}
