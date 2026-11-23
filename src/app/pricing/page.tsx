import { getBillingAccess } from '@/lib/billing';
import { getPlusPrices } from '@/lib/prices';
import PricingClient from './PricingClient';

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const [{ user, isAdmin, hasPlus }, prices] = await Promise.all([
    getBillingAccess(),
    getPlusPrices(),
  ]);

  return (
    <PricingClient
      prices={prices}
      isLoggedIn={!!user}
      isAdmin={isAdmin}
      hasPlus={hasPlus}
      checkout={
        checkout === 'success' || checkout === 'cancelled' ? checkout : null
      }
    />
  );
}
