export const metadata = {
  title: "Terms & Conditions | J Merrill One",
  description:
    "Understand the rules, responsibilities, and policies that govern your use of J Merrill One's publishing, financial, nonprofit, and media services.",
  openGraph: {
    title: "Terms & Conditions | J Merrill One",
    description:
      "Review the terms that apply to all users of J Merrill One's platforms and services.",
    url: "https://jmerrill.one/legal/terms-and-conditions",
    siteName: "J Merrill One",
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | J Merrill One",
    description:
      "Understand your rights and responsibilities when using J Merrill One.",
  },
};

export default function TermsConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6 text-primary">Terms &amp; Conditions</h1>

      <p className="mb-4">
        These Terms &amp; Conditions apply to all users of <strong>J Merrill One</strong> and the
        associated services of:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>J Merrill Publishing, Inc.</li>
        <li>J Merrill Financial, LLC</li>
        <li>J Merrill Foundation, Inc.</li>
        <li>J Merrill Productions</li>
      </ul>

      <h2 className="text-2xl font-semibold text-primary mb-2">1. Use of Site</h2>
      <p className="mb-6">
        By accessing this site, you agree to use it in accordance with these terms and all
        applicable laws. Unauthorized use is strictly prohibited.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">2. Intellectual Property</h2>
      <p className="mb-6">
        All content is the property of J Merrill One entities unless otherwise noted.
        Reproduction or distribution without permission is prohibited.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">3. Service Eligibility</h2>
      <p className="mb-6">
        Use of our services may require age verification, signed agreements, and payment
        where applicable. We reserve the right to decline service.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">4. Payments &amp; Refunds</h2>
      <p className="mb-6">
        All services are billed as outlined in project agreements or invoices. Refunds are not
        guaranteed and subject to service stage and agreement terms.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">5. Disclaimers</h2>
      <p className="mb-6">
        We make no guarantees of outcomes unless expressly stated in a service agreement. All
        services are provided on an &quot;as-is&quot; basis.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">6. Limitation of Liability</h2>
      <p className="mb-6">
        We are not liable for damages, losses, or service interruptions beyond our control,
        including those caused by third-party platforms.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">7. Modifications</h2>
      <p className="mb-6">
        These terms may be updated. Continued use of our site means you accept the latest
        version.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">8. Governing Law</h2>
      <p className="mb-6">
        This agreement shall be governed by the laws of the State of Ohio, USA.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">9. Contact Us</h2>
      <p className="mb-2">
        📧{' '}
        <a href="mailto:legal@jmerrill.one" className="underline text-primary">
          legal@jmerrill.one
        </a>
        <br />
        📞 +1 (614) 965-6057
        <br />
        📍 434 Hillpine Dr., Columbus, OH 43207
      </p>
    </main>
  );
}