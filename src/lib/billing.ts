import 'server-only';

import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

export async function getBillingAccess() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user) {
    return { user: null, isAdmin: false, hasPlus: false };
  }

  // Neon Auth session jest źródłem roli, nie dane przesłane przez przeglądarkę.
  // Pole `role` (plugin Admin) istnieje w runtime, ale nie w typie sesji.
  const role = (user as { role?: string | null }).role;

  if (role === 'admin') {
    return { user, isAdmin: true, hasPlus: true };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  // `past_due` = okres karencji, gdy Stripe ponawia nieudaną płatność.
  const hasPlus =
    ['active', 'trialing', 'past_due'].includes(subscription?.status ?? '') &&
    !!subscription?.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date();

  return { user, isAdmin: false, hasPlus };
}
