import type { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <Container style={{ maxWidth: 420 }}>
      <h1 className='h3 mb-4 text-center'>Login</h1>
      <LoginForm />
    </Container>
  );
}
