'use client';

import Link from 'next/link';

export default function BrandingPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Branding</h1>
        <p className="text-lg text-muted-foreground mb-6">
          A powerful book deserves a powerful brand. From your author logo to your online presence, we help you craft a cohesive identity that opens doors and builds trust.
        </p>

        <div className="space-y-4">
          <p>✅ Custom author logo design</p>
          <p>✅ Social media banners and promo graphics</p>
          <p>✅ Brand colors, fonts, and templates</p>
          <p>✅ Personal brand consulting for authors and influencers</p>
          <p>✅ Website branding integration (optional add-on)</p>
        </div>

        <div className="mt-10 space-y-4">
          <p>
            Whether you’re starting fresh or refining your look, we ensure your message is consistent, polished, and unmistakably yours — across every platform.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/join" className="text-blue-600 hover:underline">
            Let’s build your author brand. Start here.
          </Link>
        </div>
      </div>
    </div>
  );
}