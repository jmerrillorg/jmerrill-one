'use client';

import Link from 'next/link';

export default function AudiobookPublishingPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Audiobook Production</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your words, brought to life. We produce broadcast-quality audiobooks with professional voice talent and distribution to all major platforms — from Audible to Spotify.
        </p>

        <div className="space-y-4">
          <p>✅ Studio-quality narration (human or AI voice options)</p>
          <p>✅ Editing, mastering, and chapter formatting</p>
          <p>✅ Audible, iTunes, and Spotify distribution</p>
          <p>✅ Royalty tracking and usage analytics</p>
          <p>✅ Custom intro/outro and sound branding (if desired)</p>
        </div>

        <div className="mt-10 space-y-4">
          <p>
            Whether you&apos;re a first-time author or expanding an existing release, our audiobook services meet industry standards and elevate your reach — through sound.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/join" className="text-blue-600 hover:underline">
            Let’s turn your book into an audiobook. Start here.
          </Link>
        </div>
      </div>
    </div>
  );
}
