import type { Route } from 'next';
import { redirect } from 'next/navigation';

// proxy.ts exchanges the OAuth session verifier for a session cookie on this route.
export default function AuthCallbackPage() {
  redirect('/' as Route);
}
