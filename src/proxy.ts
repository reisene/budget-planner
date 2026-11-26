import { auth } from '@/lib/auth/server';

export default auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: '/auth/login',
});

export const config = {
  // Protected routes requiring authentication
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/auth/callback',
    '/dashboard/:path*',
  ],
};
