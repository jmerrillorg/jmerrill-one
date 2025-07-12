'use client';

import { useEffect, useState } from 'react';

const bookingLinks: Record<string, string> = {
  publishing: 'https://outlook.office.com/book/JMerrillPublishingInc@jmerrill.pub/',
  financial: 'https://outlook.office.com/book/JMerrillFinancialLLC@jmerrill.pub/',
  foundation: 'https://outlook.office.com/owa/calendar/JMerrillFoundationInc2@jmerrill.one/bookings/',
};

// ✅ Correctly typed props for Next.js app router
type AppointmentsPageProps = {
  searchParams?: {
    brand?: string;
  };
};

export default function SchedulePage({ searchParams }: AppointmentsPageProps) {
  const brandParam = searchParams?.brand?.toLowerCase() || 'publishing';
  const [iframeUrl, setIframeUrl] = useState<string>(bookingLinks['publishing']);

  useEffect(() => {
    const selected = brandParam.toLowerCase();
    const base = bookingLinks[selected] || bookingLinks['publishing'];
    setIframeUrl(base);
  }, [brandParam]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-center">
      <main className="flex-grow px-4 pt-10 pb-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold mb-2">Book a Consultation</h1>
          <p className="text-md mb-6 text-gray-600 dark:text-gray-300">
            Schedule your personalized session with our team below. Select your brand and service type as needed.
          </p>

          {/* Brand Selector */}
          <div className="flex justify-center space-x-4 mb-6">
            {Object.keys(bookingLinks).map((b) => (
              <button
                key={b}
                onClick={() => window.location.href = `/appointments?brand=${b}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition border ${
                  brandParam === b
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300'
                }`}
              >
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>

          {/* Embedded Scheduler */}
          <div className="w-full h-[850px]">
            <iframe
              src={iframeUrl}
              width="100%"
              height="100%"
              allowFullScreen
              frameBorder="0"
              scrolling="yes"
              title="Book a Consultation"
              aria-label="Book a Consultation with J Merrill"
              className="rounded-lg shadow-md"
            ></iframe>
          </div>

          {/* Need Help CTA */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Need help choosing a service?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">Contact us</a> or call (614) 965-6057.
          </div>
        </div>
      </main>
    </div>
  );
}