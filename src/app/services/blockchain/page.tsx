'use client';

import Link from 'next/link';

export default function BlockchainPublishingPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Blockchain Publishing</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Protect your work. Track royalties. Authenticate your story. Blockchain Publishing secures your intellectual property on the blockchain, offering authors unmatched transparency and traceability.
        </p>

        <div className="space-y-4">
          <p>✅ Immutable proof of authorship using blockchain timestamping</p>
          <p>✅ Smart contract-based royalty tracking and transparency</p>
          <p>✅ NFT-enabled editions for limited releases or collectors</p>
          <p>✅ Integration with your publishing contract and metadata</p>
          <p>✅ Backed by our secure, author-first infrastructure</p>
        </div>

        <div className="mt-10 space-y-4">
          <p>
            Whether you&apos;re protecting your poetry or pioneering a new genre, Blockchain Publishing adds a new layer of security and credibility to your work — especially in a digital-first world.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/join" className="text-blue-600 hover:underline">
            Interested in blockchain integration? Get started here.
          </Link>
        </div>
      </div>
    </div>
  );
}