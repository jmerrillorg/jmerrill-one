// 📄 /new_one/src/app/legal/page.tsx
'use client';

import HeroLogo from '@/components/shared/HeroLogo';

export default function LegalHubPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-background text-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold text-primary mt-6 mb-4">Legal Information</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Below are the official legal policies governing your use of <strong>J Merrill One</strong> and its services.
        </p>

        <ul className="space-y-4 text-lg text-primary font-medium">
          <li>
            <a href="/legal/privacy-policy" className="hover:underline">Privacy Policy</a>
          </li>
          <li>
            <a href="/legal/terms-and-conditions" className="hover:underline">Terms & Conditions</a>
          </li>
          <li>
            <a href="/legal/accessibility-statement" className="hover:underline">Accessibility Statement</a>
          </li>
          <li>
            <a href="/legal/website-disclaimer" className="hover:underline">Website Disclaimer</a>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground mt-12">
          For questions or concerns, contact us at <a href="mailto:legal@jmerrill.one" className="underline text-primary">legal@jmerrill.one</a>
        </p>
      </div>
    </main>
  );
}