'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithMagicLink,
} from '../actions';

export default function LoginForm() {
  const [loginState, loginAction, loginPending] = useActionState(
    signInWithEmail,
    null,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    null,
  );

  return (
    <>
      <Form action={loginAction} className='mb-4'>
        {loginState?.error && (
          <Alert variant='danger'>{loginState.error}</Alert>
        )}
        <Form.Group className='mb-3' controlId='login-email'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            name='email'
            autoComplete='email'
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='login-password'>
          <Form.Label>Hasło</Form.Label>
          <Form.Control
            type='password'
            name='password'
            autoComplete='current-password'
            required
          />
        </Form.Group>
        <Button type='submit' className='w-100' disabled={loginPending}>
          Zaloguj się
        </Button>
      </Form>

      <Form action={signInWithGoogle} className='mb-4'>
        <Button type='submit' variant='outline-light' className='w-100'>
          <FcGoogle aria-hidden='true' className='me-2' size={20} />
          Kontynuuj z Google
        </Button>
      </Form>

      <Form action={magicAction} className='mb-4'>
        {magicState?.error && (
          <Alert variant='danger'>{magicState.error}</Alert>
        )}
        {magicState?.success && (
          <Alert variant='success'>{magicState.success}</Alert>
        )}
        <Form.Group className='mb-3' controlId='magic-email'>
          <Form.Label>Zaloguj się linkiem na email</Form.Label>
          <Form.Control
            type='email'
            name='email'
            autoComplete='email'
            required
          />
        </Form.Group>
        <Button
          type='submit'
          variant='outline-primary'
          className='w-100'
          disabled={magicPending}
        >
          Wyślij magic link
        </Button>
      </Form>

      <p className='text-center mb-0'>
        Nie masz konta? <Link href='/auth/register'>Zarejestruj się</Link>
      </p>
    </>
  );
}
