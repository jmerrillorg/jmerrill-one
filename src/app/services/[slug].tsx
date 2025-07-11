'use client';

import Link from 'next/link';

export default function FullServicePublishingPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Full-Service Publishing</h1>
        <p className="text-lg text-muted-foreground mb-6">
          From manuscript to market — editing, design, ISBN, and distribution included. Our full-service package guides authors every step of the way with professionalism, transparency, and tenacity.
        </p>

        <div className="space-y-4">
          <p>✅ Professional editing tailored to your genre and audience</p>
          <p>✅ Custom cover design and interior layout (print + ebook)</p>
          <p>✅ ISBN, barcode, and library registration</p>
          <p>✅ Distribution to Amazon, IngramSpark, and more</p>
          <p>✅ Dedicated publishing consultant</p>
        </div>

        <div className="mt-8">
          <Link href="/onboarding" className="text-blue-600 hover:underline">
            Ready to begin? Submit your manuscript here.
          </Link>
        </div>
      </div>
    </div>
  );
}