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
      <main className="max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-6 text-primary">Accessibility Statement</h1>
  
        <p className="mb-6">
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
        <p className="mb-2">
          If you encounter any barriers or have suggestions for improvement, please reach out:
          <br />
          📧{' '}
          <a href="mailto:accessibility@jmerrill.one" className="underline text-primary">
            accessibility@jmerrill.one
          </a>
          <br />
          📞 +1 (614) 965-6057
          <br />
          📍 434 Hillpine Dr., Columbus, OH 43207
        </p>
      </main>
    );
  }