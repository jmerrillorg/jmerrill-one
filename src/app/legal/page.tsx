export default function LegalHubPage() {
    return (
      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
        <h1 className="text-3xl font-bold text-primary text-center mb-6">Legal Information</h1>
        <p className="text-center text-secondary mb-8">
          Below you will find links to the official legal policies that govern the use of <strong>J Merrill One</strong> and its associated services.
        </p>
        <ul className="space-y-4 text-center text-primary text-lg">
          <li><a href="/legal/privacy-policy" className="hover:underline">Privacy Policy</a></li>
          <li><a href="/legal/terms-and-conditions" className="hover:underline">Terms & Conditions</a></li>
          <li><a href="/legal/accessibility-statement" className="hover:underline">Accessibility Statement</a></li>
          <li><a href="/legal/website-disclaimer" className="hover:underline">Website Disclaimer</a></li>
        </ul>
        <p className="text-sm text-center text-subtle mt-10">
          For questions or concerns, contact us at <a href="mailto:legal@jmerrill.one" className="underline text-primary">legal@jmerrill.one</a>
        </p>
      </main>
    );
  }