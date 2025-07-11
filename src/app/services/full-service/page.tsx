'use client';

import Link from 'next/link';

export default function FullServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary dark:text-primary">
          Full-Service Publishing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          From manuscript to market — editing, design, ISBN, and distribution included.
        </p>

        <div className="text-left space-y-6">
          <p>
            Our Full-Service Publishing package is designed for authors who want a complete, professional publishing experience without the guesswork. We take your manuscript and manage every step — with you in the loop, always.
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>✅ Editorial review and proofing</li>
            <li>✅ Interior layout & cover design (print + ebook)</li>
            <li>✅ ISBN assignment & copyright registration</li>
            <li>✅ Print-on-demand + eBook distribution</li>
            <li>✅ Author dashboard and royalty support</li>
          </ul>

          <div className="space-y-4">
  <p>
    We distribute your book to over <strong>45,000+ global outlets</strong> — getting your work into the hands of readers where it matters most:
  </p>
  <ul className="list-disc list-inside space-y-2">
    <li>Independent bookstores</li>
    <li>Major online retailers</li>
    <li>Brick-and-mortar chain stores</li>
    <li>eBook platforms</li>
    <li>Libraries and universities</li>
  </ul>
  <p>
    Your story deserves a wide stage — and we’ve built the network to deliver.
  </p>
</div>
        </div>

        <div className="mt-12">
          <Link
            href="/join"
            className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ready to Publish? Start Here →
          </Link>
        </div>
      </div>
    </div>
  );
}