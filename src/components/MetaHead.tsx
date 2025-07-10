// src/components/MetaHead.tsx
'use client';

import Head from 'next/head';

interface MetaHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export default function MetaHead({
  title,
  description,
  image = 'https://www.jmerrill.one/og-default.jpg',
  url = 'https://www.jmerrill.one',
}: MetaHeadProps) {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Favicon preload (optional) */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}