import { signOut } from '@/app/auth/actions';
import { auth } from '@/lib/auth/server';
import { Button } from 'react-bootstrap';
import AccountButton from './AccountButton';

export default async function AuthButtons() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    return (
      <div className='d-flex gap-2 justify-content-center justify-content-lg-start'>
        <AccountButton name={session.user.name || session.user.email} />
        <form action={signOut}>
          <Button type='submit' variant='primary'>
            Sign Out
          </Button>
        </form>
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
