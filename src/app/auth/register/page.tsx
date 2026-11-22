import type { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Register' };

export default function RegisterPage() {
  return (
    <Container style={{ maxWidth: 420 }}>
      <h1 className='h3 mb-4 text-center'>Register</h1>
      <RegisterForm />
    </Container>
  );
}
