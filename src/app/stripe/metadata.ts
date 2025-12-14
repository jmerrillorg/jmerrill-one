// src/app/stripe/metadata.ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stripe Verification | J Merrill One',
  description: 'Overview of J Merrill One and its business divisions for Stripe account verification purposes.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Stripe Verification | J Merrill One',
    description: 'Overview of J Merrill One and its business divisions for Stripe account verification purposes.',
    url: 'https://www.jmerrill.one/stripe',
    siteName: 'J Merrill One',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.jmerrill.one/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'J Merrill One – Publishing. Financial Services. Nonprofit Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stripe Verification | J Merrill One',
    description: 'Overview of J Merrill One and its business divisions for Stripe account verification purposes.',
    images: ['https://www.jmerrill.one/og-image.jpg'],
  },
};