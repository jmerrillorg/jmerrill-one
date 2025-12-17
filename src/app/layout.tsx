// src/app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Geist_Mono } from 'next/font/google';

import '@/styles/globals.css';
import '@/lib/appInsights';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { siteMetadata } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = siteMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={[
          inter.variable,
          geistMono.variable,
          'font-sans antialiased',
          'bg-background text-foreground',
          'min-h-screen flex flex-col',
          'relative overflow-x-hidden',
        ].join(' ')}
      >
        {/* -------------------------------------------
           Stationary Brand Background (Global)
           ------------------------------------------- */}
        <div
          aria-hidden
          className="
            pointer-events-none
            fixed inset-0
            z-0
            bg-no-repeat
            bg-center
            bg-contain
            opacity-[0.06]
          "
          style={{
            backgroundImage: "url('/logo.jpg')",
          }}
        />

        {/* App chrome sits ABOVE background */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}