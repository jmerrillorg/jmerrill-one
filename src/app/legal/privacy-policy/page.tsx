import HeroLogo from "@/components/shared/HeroLogo";

export const metadata = {
  title: "Privacy Policy | J Merrill One",
  description:
    "Learn how J Merrill One collects, uses, and protects your information across publishing, financial, nonprofit, and media services.",
  openGraph: {
    title: "Privacy Policy | J Merrill One",
    description:
      "Review our policies on how we collect and use your data responsibly.",
    url: "https://jmerrill.one/legal/privacy-policy",
    siteName: "J Merrill One – Publishing. Financial Services. Nonprofit Impact.",
    type: "article",
    locale: "en_US",
    images: [
      {
        url: "https://jmerrill.one/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "J Merrill One – Publishing. Financial Services. Nonprofit Impact.",
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
      <div className="flex justify-center mb-6">
        <HeroLogo />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Privacy Policy</h1>

      <p className="mb-4 text-center">
        Welcome to <strong>J Merrill One</strong> – Publishing. Financial Services. Nonprofit Impact.
        This Privacy Policy outlines how we collect, use, disclose, and protect your information across all our affiliated entities:
      </p>

      <ul className="list-disc list-inside mb-6">
        <li>J Merrill Publishing, Inc.</li>
        <li>J Merrill Financial, LLC</li>
        <li>J Merrill Foundation, Inc.</li>
        <li>J Merrill Productions</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6">
        <li>Contact and Identification Information</li>
        <li>Payment and Transaction Data</li>
        <li>Publishing, Production, and Insurance Service Data</li>
        <li>Donor and Volunteer Information</li>
        <li>Device, Usage, and Technical Data (cookies, IP, browser, etc.)</li>
        <li>Consent records and opt-in/opt-out preferences</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">2. How We Use Your Information</h2>
      <p className="mb-6">
        Your information is used to deliver and improve our services, fulfill contractual and legal obligations, process transactions, and communicate with you. We may also use data to:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Provide personalized content and support</li>
        <li>Send confirmations, receipts, and service notices</li>
        <li>Deliver marketing, event, or service updates (with your consent)</li>
        <li>Comply with state, federal, and financial regulations</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">3. Communication & Consent</h2>
      <p className="mb-6">
        By providing your contact information, you consent to receive communications from us via email, phone, or SMS. SMS messages are used only for service updates or appointment reminders and include clear opt-out options. Message and data rates may apply. You can opt out at any time by replying STOP to any SMS or contacting us directly.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">4. Sharing Your Information</h2>
      <p className="mb-6">
        We do <strong>not sell</strong> your personal data. We may share your data only with:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Trusted service providers and business partners</li>
        <li>Payment processors (e.g., Stripe, PayPal)</li>
        <li>Legal or regulatory bodies when required</li>
        <li>Authorized internal team members with appropriate roles</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">5. Data Security</h2>
      <p className="mb-6">
        We implement industry-standard safeguards including data encryption, secure authentication, firewalls, and routine system audits. Access to sensitive information is restricted and monitored.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">6. Your Rights</h2>
      <p className="mb-6">
        You have the right to:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Access and review your personal data</li>
        <li>Request correction or deletion</li>
        <li>Withdraw consent or opt out of communications</li>
        <li>Request a copy of your stored data</li>
      </ul>
      <p className="mb-6">
        Submit requests by emailing us at{" "}
        <a href="mailto:privacy@jmerrill.one" className="text-primary underline">
          privacy@jmerrill.one
        </a>.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">7. Children’s Privacy</h2>
      <p className="mb-6">
        We do not knowingly collect information from children under 13. If we become aware of such data, it will be deleted immediately.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">8. Compliance & Jurisdiction</h2>
      <p className="mb-6">
        This policy is governed by U.S. federal law and the State of Ohio. We comply with GDPR, CAN-SPAM, TCPA, and other relevant regulations.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">9. Updates to this Policy</h2>
      <p className="mb-6">
        This Privacy Policy may be updated periodically. Revisions will be posted here with an updated effective date. Continued use of our services after changes indicates your consent.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">10. Contact Us</h2>
      <p>
        📧{" "}
        <a href="mailto:privacy@jmerrill.one" className="text-primary underline">
          privacy@jmerrill.one
        </a>
        <br />
        📍 2323 W 5th Ave, Suite 120, Columbus, OH 43204
        <br />
        📞 +1 (614) 965-6057
      </p>
    </main>
  );
}