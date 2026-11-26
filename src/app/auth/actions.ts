'use server';

import { auth } from '@/lib/auth/server';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

type RegisterState = { error?: string; verifyEmail?: string } | null;

type EmailOtpApi = {
  emailOtp: {
    verifyEmail: (body: {
      email: string;
      otp: string;
    }) => Promise<{ error: { message?: string } | null }>;
    sendVerificationOtp: (body: {
      email: string;
      type: 'email-verification';
    }) => Promise<{ error: { message?: string } | null }>;
  };
};

// The typed server API does not expose emailOtp, but the endpoints exist.
const emailOtpApi = () => auth as unknown as EmailOtpApi;

export async function signUpWithEmail(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'Email is required' };
  }

  const { data, error } = await auth.signUp.email({
    email,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return {
      error:
        error.message || 'Failed to create an account. Please try again later.',
    };
  }

  // No session means that email verification is required.
  if (!data?.token) {
    return { verifyEmail: email };
  }

  redirect('/' as Route);
}

export async function verifyEmailCode(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = formData.get('email') as string;
  const otp = (formData.get('otp') as string)?.trim();
  if (!otp) {
    return { verifyEmail: email, error: 'Verification code is required' };
  }

  const { error } = await emailOtpApi().emailOtp.verifyEmail({ email, otp });

  if (error) {
    return {
      verifyEmail: email,
      error: error.message || 'Invalid or expired code. Please try again.',
    };
  }

  redirect('/' as Route);
}

export async function resendVerificationCode(email: string) {
  const { error } = await emailOtpApi().emailOtp.sendVerificationOtp({
    email,
    type: 'email-verification',
  });

  return error
    ? { error: error.message || 'Failed to resend the code.' }
    : { success: 'A new code has been sent.' };
}

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const { error } = await auth.signIn.email({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return {
      error: error.message || 'Failed to sign in. Please try again later.',
    };
  }

  redirect('/' as Route);
}

export async function signOut() {
  await auth.signOut();
}

export async function signInWithGoogle() {
  const { data, error } = await auth.signIn.social({
    provider: 'google',
    callbackURL: '/auth/callback',
  });

  if (error || !data?.url) {
    throw new Error(error?.message || 'Failed to sign in with Google.');
  }

  redirect(data.url as Route);
}

export async function signInWithMagicLink(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'Email is required' };
  }

  // The typed server API does not expose magicLink yet, but the endpoint exists.
  const signIn = auth.signIn as unknown as {
    magicLink: (body: {
      email: string;
      callbackURL: string;
    }) => Promise<{ error: { message?: string } | null }>;
  };
  const { error } = await signIn.magicLink({
    email,
    callbackURL: '/',
  });

  if (error) {
    return {
      error:
        error.message || 'Failed to send the magic link. Please try again.',
    };
  }

  return { success: 'Check your email for the sign-in link.' };
}
