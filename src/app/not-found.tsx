'use client';
import { JetBrains_Mono } from 'next/font/google';
import { Button } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin-ext'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function NotFound() {
  return (
    <div className='d-flex flex-column justify-content-center align-items-center vh-100'>
      <h1 className={`${jetBrainsMono.className} display-1 fw-bold`}>404</h1>
      <BsExclamationTriangle size={64} className='text-danger fs-1 mb-3' />
      <p className='fs-3'>
        <span className='text-danger'>Opps!</span> Page not found.
      </p>
      <p className='lead'>The page you’re looking for doesn’t exist.</p>
      <div className='d-flex justify-content-center'>
        <Button href='/' variant='primary' className='mt-3'>
          Go Home
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant='secondary'
          className='mt-3 ms-2'
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
