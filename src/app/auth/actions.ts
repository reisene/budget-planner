'use server';

import { auth } from '@/lib/auth/server';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'Email is required' };
  }

  const { error } = await auth.signUp.email({
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

  redirect('/' as Route);
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
  redirect('/' as Route);
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
