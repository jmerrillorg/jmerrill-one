export const metadata = {
  title: "Website Disclaimer | J Merrill One",
  description:
    "Read our disclaimer on website content, professional advice limitations, and third-party tools used across J Merrill One.",
  openGraph: {
    title: "Website Disclaimer | J Merrill One",
    description:
      "Understand the limits of liability and use of content on the J Merrill One platform.",
    url: "https://jmerrill.one/legal/website-disclaimer",
    siteName: "J Merrill One",
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Website Disclaimer | J Merrill One",
    description:
      "This disclaimer explains how J Merrill One handles content, links, and external services.",
  },
};

export default function WebsiteDisclaimerPage() {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-6 text-primary">Website Disclaimer</h1>
  
        <p className="mb-6">
          The information provided on this website is for general informational and educational
          purposes only. All content is provided in good faith; however, we make no representation
          or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity,
          reliability, availability, or completeness of any information on the site.
        </p>
  
        <h2 className="text-2xl font-semibold text-primary mb-2">Professional Advice Disclaimer</h2>
        <p className="mb-6">
          This website may contain information related to publishing, financial services,
          community development, or legacy planning. Such information is not intended as a
          substitute for professional advice. You should consult qualified professionals before
          making any decisions.
        </p>
  
        <h2 className="text-2xl font-semibold text-primary mb-2">External Links Disclaimer</h2>
        <p className="mb-6">
          The website may contain (or you may be sent through the site) links to other websites or
          content belonging to or originating from third parties. Such links are not
          investigated, monitored, or checked for accuracy, adequacy, or completeness by us.
        </p>
  
        <h2 className="text-2xl font-semibold text-primary mb-2">Errors and Omissions Disclaimer</h2>
        <p className="mb-6">
          While we strive to ensure that the information presented is accurate and up-to-date,
          errors or omissions may occur. We reserve the right to make additions, deletions, or
          modifications to the content at any time without prior notice.
        </p>
  
        <h2 className="text-2xl font-semibold text-primary mb-2">Limitation of Liability</h2>
        <p className="mb-6">
          In no event shall J Merrill One or its affiliated entities be liable for any direct,
          indirect, incidental, special, or consequential damages arising out of or in connection
          with your use of the website or reliance on any information provided.
        </p>
  
        <h2 className="text-2xl font-semibold text-primary mb-2">Contact Us</h2>
        <p className="mb-2">
          If you have questions or concerns about this disclaimer:
          <br />
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