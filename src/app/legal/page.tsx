import HeroLogo from "@/components/shared/HeroLogo";
import Link from "next/link";

export const metadata = {
  title: "Legal Information | J Merrill One",
  description:
    "Access J Merrill One’s legal policies including Privacy Policy, Terms & Conditions, Accessibility, and Website Disclaimer.",
  openGraph: {
    title: "Legal Information | J Merrill One",
    description:
      "View official J Merrill One policies covering privacy, terms of service, accessibility, and disclaimers.",
    url: "https://www.jmerrill.one/legal",
    siteName: "J Merrill One",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Legal Information | J Merrill One",
    description:
      "Browse J Merrill One’s legal center for all official policies and statements.",
  },
};

export default function LegalCenterPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 bg-background text-foreground">
      <div className="flex justify-center mb-6">
        <HeroLogo />
      </div>

      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Legal Center</h1>

      <p className="mb-8 text-center">
        Below you’ll find the official policies that govern your use of J Merrill One’s
        publishing, financial, and nonprofit services.
      </p>

      <ul className="space-y-4 text-lg">
        <li>
          📄{" "}
          <Link
            href="/legal/privacy-policy"
            className="text-primary underline hover:text-primary/80"
          >
            Privacy Policy
          </Link>
        </li>
        <li>
          📜{" "}
          <Link
            href="/legal/terms-and-conditions"
            className="text-primary underline hover:text-primary/80"
          >
            Terms &amp; Conditions
          </Link>
        </li>
        <li>
          ♿{" "}
          <Link
            href="/legal/accessibility-statement"
            className="text-primary underline hover:text-primary/80"
          >
            Accessibility Statement
          </Link>
        </li>
        <li>
          ⚖️{" "}
          <Link
            href="/legal/website-disclaimer"
            className="text-primary underline hover:text-primary/80"
          >
            Website Disclaimer
          </Link>
        </li>
      </ul>

      <p className="mt-12 text-sm text-muted-foreground text-center">
        For questions or concerns regarding these policies, contact us at{" "}
        <a href="mailto:legal@jmerrill.one" className="underline text-primary">
          legal@jmerrill.one
        </a>
        .
      </p>
    </main>
  );
}