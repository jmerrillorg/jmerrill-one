import Link from "next/link";
import HeroLogo from "@/components/shared/HeroLogo";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-16 bg-background text-foreground">
      <HeroLogo />

      <h1 className="text-4xl font-bold mt-6 text-publishing">J Merrill One</h1>
      <p className="text-lg mt-2 max-w-2xl text-secondary">
        Where innovation meets impact — across publishing, financial services, and mission-driven outreach.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl w-full">
        <Link
          href="/brands/publishing"
          className="block p-6 rounded-2xl shadow-md bg-card hover:shadow-lg border border-secondary/50"
        >
          <h2 className="text-xl font-semibold text-publishing mb-2">Publishing</h2>
          <p className="text-sm text-muted-foreground">
            Helping authors help themselves — with full-service, blockchain, audiobook, branding, legacy, and marketing.
          </p>
        </Link>

        <Link
          href="/brands/financial"
          className="block p-6 rounded-2xl shadow-md bg-card hover:shadow-lg border border-secondary/50"
        >
          <h2 className="text-xl font-semibold text-financial mb-2">Financial</h2>
          <p className="text-sm text-muted-foreground">
            From insurance and advance planning to financial literacy and legacy protection — your future is in good hands.
          </p>
        </Link>

        <Link
          href="/brands/foundation"
          className="block p-6 rounded-2xl shadow-md bg-card hover:shadow-lg border border-secondary/50"
        >
          <h2 className="text-xl font-semibold text-foundation mb-2">Foundation</h2>
          <p className="text-sm text-muted-foreground">
            Merging purpose with innovation — community programs, labs, and digital empowerment to drive change.
          </p>
        </Link>
      </section>

      <div className="mt-10 text-sm text-secondary">
        Unified. Automated. Future-proof. <br /> Powered by Microsoft 365, Dynamics 365, and AI.
      </div>
    </div>
  );
}