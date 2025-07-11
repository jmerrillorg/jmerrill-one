'use client';

import Link from 'next/link';

export default function LegacyPublishingPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Legacy Publishing</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Some books are more than stories — they’re legacies. Our Legacy Publishing service is designed for family histories, memoirs, community records, and spiritual reflections.
        </p>

        <div className="space-y-4">
          <p>✅ Personalized support for elders, veterans, and faith leaders</p>
          <p>✅ Audio interviews and transcription services (optional)</p>
          <p>✅ Premium formatting for heirloom-quality prints</p>
          <p>✅ Multi-generational copyright and estate registration guidance</p>
          <p>✅ Private or public distribution — your legacy, your way</p>
        </div>

        <div className="mt-10 space-y-4">
          <p>
            Preserve wisdom. Pass down truth. Share the journey. Legacy books are timeless gifts for your family, community, and future generations.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/join" className="text-blue-600 hover:underline">
            Ready to preserve your legacy? Start here.
          </Link>
        </div>
      </div>
    </div>
  );
}