'use client';

import { signOut } from '@/app/auth/actions';
import { authClient } from '@/lib/auth/client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import AccountButton from './AccountButton';

export default function AuthButtons() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [signedOutAt, setSignedOutAt] = useState<string | null>(null);
  const signedOut = signedOutAt === pathname;

  // Sign-in happens in server actions, so re-sync the client session on navigation.
  useEffect(() => {
    refetch({ query: { disableCookieCache: true } });
  }, [pathname, refetch]);

  const handleSignOut = async () => {
    await signOut();
    setSignedOutAt(pathname);
    authClient.$store.notify('$sessionSignal');
    await refetch({ query: { disableCookieCache: true } });
    router.push('/');
    router.refresh();
  };

  if (isPending) {
    return (
      <div className='d-flex gap-2 auth-actions-placeholder' aria-busy='true' />
    );
  }

  if (session?.user && !signedOut) {
    return (
      <div className='d-flex gap-2 justify-content-center justify-content-lg-start'>
        <AccountButton name={session.user.name || session.user.email} />
        <Button type='button' variant='primary' onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className='d-flex gap-2 justify-content-center justify-content-lg-start'>
      <Button href='/auth/login' variant='light'>
        Login
      </Button>
      <Button href='/auth/register' variant='primary'>
        Register
      </Button>
    </div>
  );
}
