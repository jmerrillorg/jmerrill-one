export const metadata = {
  title: "Privacy Policy | J Merrill One",
  description:
    "Learn how J Merrill One collects, uses, and protects your information across publishing, financial, nonprofit, and media services.",
  openGraph: {
    title: "Privacy Policy | J Merrill One",
    description:
      "Review our policies on how we collect and use your data responsibly.",
    url: "https://jmerrill.one/legal/privacy-policy",
    siteName: "J Merrill One",
    type: "article",
    locale: "en_US",
    images: [
      {
        url: "https://jmerrill.one/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "J Merrill One &rsquo; Your Hub for Publishing, Financial Services, and Community Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | J Merrill One",
    description:
      "How we protect your data across publishing, financial, nonprofit, and media services.",
    images: ["https://jmerrill.one/og-image.jpg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6 text-primary">Privacy Policy</h1>

      <p className="mb-4">
        Welcome to <strong>J Merrill One</strong>, the central platform of:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>J Merrill Publishing, Inc.</li>
        <li>J Merrill Financial, LLC</li>
        <li>J Merrill Foundation, Inc.</li>
        <li>J Merrill Productions</li>
      </ul>

      <p className="mb-6">
        This Privacy Policy explains how we collect, use, disclose, and protect your
        information across all of our services and platforms.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6">
        <li>Contact Information</li>
        <li>Financial and Transactional Data</li>
        <li>Publishing/Production/Insurance Information</li>
        <li>Donor and Volunteer Records</li>
        <li>Technical Usage Data</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">2. Use of Information</h2>
      <p className="mb-6">
        Your data may be used to provide services, process transactions, communicate updates,
        personalize your experience, and fulfill legal obligations.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">3. Sharing of Information</h2>
      <p className="mb-6">
        We do not sell your data. We may share it with service providers, payment processors,
        legal authorities (if required), and internal staff with appropriate permissions.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">4. Security</h2>
      <p className="mb-6">
        We take appropriate measures to secure your data including encryption, authentication
        protocols, and regular monitoring.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">5. Your Rights</h2>
      <p className="mb-6">
        You may request access to your data, corrections, deletion, or opt-out of marketing
        communications at any time.
        <br />
        📧{' '}
        <a href="mailto:privacy@jmerrill.one" className="text-primary underline">
          privacy@jmerrill.one
        </a>
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">6. Children&apos;s Privacy</h2>
      <p className="mb-6">
        We do not knowingly collect personal data from children under the age of 13.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">7. Updates to this Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy at any time. Updated versions will be posted on
        this page with the effective date.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">8. Contact Us</h2>
      <p>
        📧{' '}
        <a href="mailto:privacy@jmerrill.one" className="text-primary underline">
          privacy@jmerrill.one
        </a>
        <br />
        📍 434 Hillpine Dr., Columbus, OH 43207
        <br />
        📞 +1 (614) 965-6057
      </p>
    </main>
  );
}