'use client';

import Link from 'next/link';

export default function MarketingPromotionPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">Marketing & Promotion</h1>
        <p className="text-lg text-muted-foreground mb-6">
          A great book deserves a great launch. We craft marketing campaigns that amplify your message, elevate your brand, and connect with your audience across multiple platforms.
        </p>

        <div className="space-y-4">
          <p>✅ Launch strategy tailored to your genre and goals</p>
          <p>✅ Author press kit and media assets</p>
          <p>✅ Amazon, Goodreads, and BookBub optimization</p>
          <p>✅ Social media content and scheduling support</p>
          <p>✅ Email marketing, press outreach, and podcast pitching</p>
        </div>

        <div className="mt-10 space-y-4">
          <p>
            Whether you&apos;re releasing your debut or relaunching a backlist title, our team is here to help you shine. Your words matter — let’s make sure the world hears them.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/join" className="text-blue-600 hover:underline">
            Ready to promote your book? Start here.
          </Link>
        </div>
      </div>
    </div>
  );
}