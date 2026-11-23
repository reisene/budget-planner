'use client';

import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import {
  resendVerificationCode,
  signInWithGoogle,
  signUpWithEmail,
  verifyEmailCode,
} from '../actions';

function VerifyForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(verifyEmailCode, null);
  const [message, setMessage] = useState<{
    error?: string;
    success?: string;
  } | null>(null);
  const [resending, startResend] = useTransition();

  const feedback = state?.error ? { error: state.error } : message;

  return (
    <Form action={action}>
      <p>
        We sent a verification code to <strong>{email}</strong>. Enter it below
        to activate your account.
      </p>
      {feedback?.error && <Alert variant='danger'>{feedback.error}</Alert>}
      {message?.success && !state?.error && (
        <Alert variant='success'>{message.success}</Alert>
      )}
      <input type='hidden' name='email' value={email} />
      <Form.Group className='mb-3' controlId='verify-otp'>
        <Form.Label>Verification code</Form.Label>
        <Form.Control
          type='text'
          name='otp'
          inputMode='numeric'
          autoComplete='one-time-code'
          maxLength={6}
          required
        />
      </Form.Group>
      <Button type='submit' className='w-100 mb-2' disabled={pending}>
        Verify email
      </Button>
      <Button
        type='button'
        variant='outline-light'
        className='w-100'
        disabled={resending}
        onClick={() =>
          startResend(async () => {
            setMessage(await resendVerificationCode(email));
          })
        }
      >
        Resend code
      </Button>
    </Form>
  );
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(signUpWithEmail, null);

  if (state?.verifyEmail) {
    return <VerifyForm email={state.verifyEmail} />;
  }

  return (
    <>
      <Form action={action} className='mb-4'>
        {state?.error && <Alert variant='danger'>{state.error}</Alert>}
        <Form.Group className='mb-3' controlId='register-name'>
          <Form.Label>Name</Form.Label>
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
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            name='password'
            autoComplete='new-password'
            minLength={8}
            required
          />
        </Form.Group>
        <Button type='submit' className='w-100' disabled={pending}>
          Register
        </Button>
      </Form>

      <Form action={signInWithGoogle} className='mb-4'>
        <Button type='submit' variant='outline-light' className='w-100'>
          <FcGoogle aria-hidden='true' className='me-2' size={20} />
          Register with Google
        </Button>
      </Form>

      <p className='text-center mb-0'>
        Already have an account? <Link href='/auth/login'>Sign in</Link>
      </p>
    </>
  );
}
