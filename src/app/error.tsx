'use client';

import { useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import {
  BsArrowClockwise,
  BsExclamationTriangle,
  BsHouse,
} from 'react-icons/bs';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className={'py-5 page-medium text-center'}>
      <h1 className={'h3 mb-3'}>Something went wrong!</h1>
      <BsExclamationTriangle
        size={64}
        className='text-danger mb-3'
        aria-hidden='true'
      />
      <p className={'mb-3'} role='alert'>
        An unexpected error has occurred.
      </p>
      <p className={'text-muted mb-3'}>
        If the problem persists, please contact support.
      </p>
      <div className={'d-flex flex-wrap justify-content-center gap-2 mb-3'}>
        <Button
          onClick={reset}
          variant={'primary'}
          className={'d-inline-flex align-items-center gap-2'}
        >
          <BsArrowClockwise aria-hidden='true' />
          Try again
        </Button>
        <Button
          href='/'
          variant={'secondary'}
          className={'d-inline-flex align-items-center gap-2'}
        >
          <BsHouse aria-hidden='true' />
          Go Home
        </Button>
      </div>
      {error.digest && (
        <p className={'text-muted mb-0 small'}>
          Error ID: <code>{error.digest}</code>
        </p>
      )}
    </Container>
  );
}
