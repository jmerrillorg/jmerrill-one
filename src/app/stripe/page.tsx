'use client';

import Link from 'next/link';
import Head from 'next/head';
import HeroLogo from '@/components/shared/HeroLogo';

export default function StripeVerificationPage() {
  return (
    <>
      <Head>
        <title>Stripe Verification | J Merrill One</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
        <HeroLogo className="mb-4" />
        <h1 className="text-3xl font-bold mb-6">Welcome to J Merrill One</h1>

        <p className="mb-4">
          J Merrill One is a parent company overseeing four innovative business divisions:
        </p>
        <ul className="list-disc list-inside mb-6">
          <li><strong>J Merrill Publishing, Inc.</strong> – Full-service book publishing, audiobook production, and blockchain-powered digital publishing.</li>
          <li><strong>J Merrill Financial, LLC.</strong> – Pre-need funeral planning, life insurance consultations, and personal legacy services.</li>
          <li><strong>J Merrill Foundation, Inc.</strong> – A nonprofit focused on literacy initiatives, virtual book clubs, and grant-funded community projects.</li>
          <li><strong>J Merrill Productions</strong> – Audio and video recording services, sound engineering, and creative studio offerings.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3">Our Services</h2>
        <div className="mb-6">
          <h3 className="font-semibold">📚 Publishing Services</h3>
          <p>Manuscript editing, blockchain publishing, audiobook production</p>

          <h3 className="font-semibold mt-3">💼 Financial Services</h3>
          <p>Pre-need funeral and insurance planning, legacy services</p>

          <div className="mt-4 p-4 bg-gray-800 border-l-4 border-yellow-400 text-sm text-yellow-100">
            <strong>Note:</strong> Insurance policies are not purchased or funded through Stripe.
            All insurance products are handled directly through licensed carriers and underwriters.
          </div>

          <h3 className="font-semibold mt-6">❤️ Foundation Programs</h3>
          <p>Donations, virtual book clubs, community literacy support</p>

          <h3 className="font-semibold mt-3">🎧 Media & Production</h3>
          <p>Sound engineering, studio rentals, event AV services</p>
        </div>

        <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
        <p className="mb-6">
          J Merrill One Headquarters<br />
          434 Hillpine Dr., Columbus, OH 43207<br />
          <a href="mailto:info@jmerrill.one" className="text-blue-400 underline">info@jmerrill.one</a><br />
          +1 (614) 965-6057
        </p>

        <div className="flex gap-6">
          <Link href="https://www.jmerrill.one/legal/privacy-policy" target="_blank" className="text-blue-400 underline">
            Privacy Policy
          </Link>
          <Link href="https://www.jmerrill.one/legal/terms-and-conditions" target="_blank" className="text-blue-400 underline">
            Terms of Service
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Payments are securely processed via Stripe. Services are fulfilled by each respective business division.
        </p>
      </main>
    </>
  );
}