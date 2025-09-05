import HeroLogo from "@/components/shared/HeroLogo";

export const metadata = {
  title: "Terms & Conditions | J Merrill One",
  description:
    "Understand the rules, responsibilities, and policies that govern your use of J Merrill One’s publishing, financial, and nonprofit services.",
  openGraph: {
    title: "Terms & Conditions | J Merrill One",
    description:
      "Review the terms that apply to all users of J Merrill One’s platforms and services.",
    url: "https://www.jmerrill.one/legal/terms-and-conditions",
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
      <div className="flex justify-center mb-6">
        <HeroLogo />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-primary text-center">
        Terms &amp; Conditions
      </h1>

      <p className="mb-4 text-center">
        These Terms &amp; Conditions apply to all users of <strong>J Merrill One</strong> and the
        associated services of:
      </p>

      <ul className="list-disc list-inside mb-6">
        <li>J Merrill Publishing, Inc.</li>
        <li>J Merrill Financial, LLC</li>
        <li>J Merrill Foundation, Inc.</li>
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
        guaranteed and are subject to service stage and agreement terms.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">5. Disclaimers</h2>
      <p className="mb-6">
        We make no guarantees of outcomes unless expressly stated in a service agreement. All
        services are provided on an &ldquo;as-is&rdquo; basis.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">6. Limitation of Liability</h2>
      <p className="mb-6">
        We are not liable for damages, losses, or service interruptions beyond our control,
        including those caused by third-party platforms.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">7. Communications (SMS)</h2>
      <p className="mb-4">
        By providing your phone number, you consent to receive SMS messages for service updates and
        appointment reminders. <strong>Message frequency may vary</strong> and <strong>message &amp; data rates may apply</strong>.
        You may opt out at any time by replying <strong>STOP</strong>. For assistance, reply <strong>HELP</strong>.
      </p>
      <p className="mb-6">
        <strong>Mobile information sharing:</strong> Mobile (SMS) opt-in information will <strong>not</strong> be
        shared with third parties or affiliates for marketing or promotional purposes. We may share limited information
        with carriers, SMS aggregators, and platform providers solely as necessary to deliver messages and to comply with law.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">8. Modifications</h2>
      <p className="mb-6">
        These terms may be updated. Continued use of our site means you accept the latest
        version.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">9. Governing Law</h2>
      <p className="mb-6">
        This agreement shall be governed by the laws of the State of Ohio, USA.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">10. Related Policies</h2>
      <p className="mb-6">
        Please review our{" "}
        <a
          href="/legal/privacy-policy"
          className="underline text-primary"
        >
          Privacy Policy
        </a>{" "}
        to understand how we collect, use, and protect your information. By using our
        services, you agree to both these Terms &amp; Conditions and our Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold text-primary mb-2">11. Contact Us</h2>
      <p className="mb-2">
        📧{" "}
        <a href="mailto:legal@jmerrill.one" className="underline text-primary">
          legal@jmerrill.one
        </a>
        <br />
        📞 +1 (614) 965-6057
        <br />
        📍 2323 W 5th Ave, Suite 120, Columbus, OH 43204
      </p>
    </main>
  );
}