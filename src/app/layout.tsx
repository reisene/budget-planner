import AppNavbar from '@/components/AppNavbar';
import AuthButtons from '@/components/AuthButtons';
import Footer from '@/components/Footer';
import pkg from '@/package.json';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata, Viewport } from 'next';
import React from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  themeColor: '#212529',
};

export const metadata: Metadata = {
  applicationName: 'Budget Planner',
  title: {
    default: 'Budget Planner',
    template: '%s | Budget Planner',
  },
  description: 'A simple budget planner app.',
  keywords: ['budget', 'planner', 'finance', 'expenses', 'income'],
  authors: [
    {
      name: pkg.author.name,
      url: pkg.author.url,
    },
  ],
  creator: pkg.author.name,
  publisher: pkg.author.name,
  metadataBase: new URL(pkg.homepage),
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Budget Planner',
    description: 'A simple budget planner app.',
    url: pkg.homepage,
    siteName: 'Budget Planner',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Planner',
    description: 'A simple budget planner app.',
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' data-bs-theme='dark'>
      <body className={'min-vh-100 d-flex flex-column'}>
        <AppNavbar authButtons={<AuthButtons />} />
        <main className='py-4 flex-grow-1'>{children}</main>
        <Analytics />
        <SpeedInsights />
        <Footer />
      </body>
    </html>
  );
}
