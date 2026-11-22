'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle, signUpWithEmail } from '../actions';

export default function RegisterForm() {
  const [state, action, pending] = useActionState(signUpWithEmail, null);

  return (
    <>
      <Form action={action} className='mb-4'>
        {state?.error && <Alert variant='danger'>{state.error}</Alert>}
        <Form.Group className='mb-3' controlId='register-name'>
          <Form.Label>Imię</Form.Label>
          <Form.Control type='text' name='name' autoComplete='name' required />
        </Form.Group>
        <Form.Group className='mb-3' controlId='register-email'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            name='email'
            autoComplete='email'
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='register-password'>
          <Form.Label>Hasło</Form.Label>
          <Form.Control
            type='password'
            name='password'
            autoComplete='new-password'
            minLength={8}
            required
          />
        </Form.Group>
        <Button type='submit' className='w-100' disabled={pending}>
          Zarejestruj się
        </Button>
      </Form>

      <Form action={signInWithGoogle} className='mb-4'>
        <Button type='submit' variant='outline-light' className='w-100'>
          <FcGoogle aria-hidden='true' className='me-2' size={20} />
          Zarejestruj się z Google
        </Button>
      </Form>

      <p className='text-center mb-0'>
        Masz już konto? <Link href='/auth/login'>Zaloguj się</Link>
      </p>
    </>
  );
}
