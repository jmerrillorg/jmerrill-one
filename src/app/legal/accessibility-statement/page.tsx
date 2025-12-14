// ✅ DO NOT USE "use client"

import HeroLogo from '@/components/shared/HeroLogo';

export const metadata = {
  title: "Accessibility Statement | J Merrill One",
  description:
    "Learn how J Merrill One ensures digital accessibility across its website and platforms, and how you can provide feedback.",
  openGraph: {
    title: "Accessibility Statement | J Merrill One",
    description:
      "Our commitment to making J Merrill One accessible and inclusive for all users.",
    url: "https://jmerrill.one/legal/accessibility-statement",
    siteName: "J Merrill One",
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Accessibility Statement | J Merrill One",
    description:
      "Read about our digital accessibility standards and how to report issues.",
  },
};

export default function AccessibilityStatementPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-background text-foreground">
      <div className="max-w-3xl mx-auto">
        <HeroLogo />
        <h1 className="text-4xl font-bold text-primary mt-6 mb-6">Accessibility Statement</h1>

        <p className="mb-6 text-muted-foreground">
          J Merrill One and its associated brands are committed to providing a website that is
          accessible to the widest possible audience, regardless of technology or ability. We aim
          to comply with all applicable standards, including Web Content Accessibility Guidelines
          (WCAG) 2.1 Level AA.
        </p>

        <h2 className="text-2xl font-semibold text-primary mb-2">Ongoing Efforts</h2>
        <p className="mb-6">
          We continuously review and improve our site to meet evolving accessibility standards. We
          test our platform using common screen readers, contrast checkers, keyboard navigation,
          and mobile responsiveness tools.
        </p>

        <h2 className="text-2xl font-semibold text-primary mb-2">Limitations</h2>
        <p className="mb-6">
          While we strive for full accessibility, there may be some areas that are not yet fully
          optimized. We welcome your feedback to help us improve.
        </p>

        <h2 className="text-2xl font-semibold text-primary mb-2">Third-Party Content</h2>
        <p className="mb-6">
          Some third-party tools and integrations (e.g., embedded booking calendars, payment
          systems, or external video platforms) may not meet full accessibility standards. We are
          actively working to offer alternatives or enhancements where possible.
        </p>

        <h2 className="text-2xl font-semibold text-primary mb-2">Contact Us</h2>
        <p className="text-muted-foreground">
          If you encounter any barriers or have suggestions for improvement, please reach out:
        </p>
        <p className="mt-2">
          📧{' '}
          <a href="mailto:accessibility@jmerrill.one" className="underline text-primary">
            accessibility@jmerrill.one
          </a>
          <br />
          📞 +1 (614) 965-6057
          <br />
          📍 2323 W 5th Ave, Suite 120, Columbus, OH 43204
        </p>
      </div>
    </main>
  );
}