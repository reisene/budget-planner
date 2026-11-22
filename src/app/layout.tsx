import AppNavbar from '@/components/AppNavbar';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' data-bs-theme='dark'>
      <body className={'min-vh-100 d-flex flex-column'}>
        <AppNavbar />
        <main className='py-4 flex-grow-1'>{children}</main>
        <Analytics />
        <SpeedInsights />
        <Footer />
      </body>
    </html>
  );
}
