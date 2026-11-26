'use client';

import * as Sentry from '@sentry/nextjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <html lang='en' data-bs-theme='dark'>
      <body className='min-vh-100 d-flex align-items-center justify-content-center text-center'>
        <main className='container py-5'>
          <h1 className='h3 mb-3'>Something went wrong!</h1>
          <p className='mb-3' role='alert'>
            An unexpected error has occurred.
          </p>
          <button type='button' className='btn btn-primary' onClick={reset}>
            Try again
          </button>
          {error.digest && (
            <p className='text-muted mt-3 mb-0 small'>
              Error ID: <code>{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
