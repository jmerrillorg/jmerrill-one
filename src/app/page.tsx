// ✅ Home Page /src/app/page.tsx
import { buildMetadata } from "../lib/seo";
import { ServiceCard } from "../components/ServiceCard";
import HeroLogo from "../components/client/HeroLogo";

export const metadata = buildMetadata({
  title: "Welcome to J Merrill One",
  description: "J Merrill One – Publishing. Financial Services. Nonprofit Impact.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      {/* Animated Logo */}
      <HeroLogo />

      {/* Headline */}
      <h1 className="text-4xl font-bold text-primary mt-6 text-center">
        Welcome to <strong>J Merrill One</strong>
      </h1>
      <p className="mt-2 text-lg text-secondary text-center">
        <strong>J Merrill One</strong> – Publishing. Financial Services. Nonprofit Impact.
      </p>

      {/* Mission */}
      <section className="mt-8 max-w-4xl text-center px-6">
        <p className="text-base text-muted">
          At <strong>J Merrill One</strong>, we empower individuals, entrepreneurs, and communities
          through transformative publishing, financial security, and mission-driven nonprofit engagement.
        </p>
      </section>

      {/* Services */}
      <section className="mt-10 w-full max-w-6xl px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            href="https://www.jmerrill.pub"
            emoji="📘"
            title="Publishing"
            description="Empowering authors with full-service publishing solutions."
            borderColor="publishing"
            ringColor="publishing"
          />
          <ServiceCard
            href="https://www.jmerrill.foundation"
            emoji="🟣"
            title="Foundation"
            description="Supporting communities through outreach and education."
            borderColor="foundation"
            ringColor="foundation"
          />
          <ServiceCard
            href="https://www.jmerrill.financial"
            emoji="💼"
            title="Financial"
            description="Providing financial services, insurance, and legacy planning."
            borderColor="financial"
            ringColor="financial"
          />
        </div>
      </section>

      {/* Contact card only (legal lives in global <Footer />) */}
      <section className="mt-12 w-full max-w-4xl px-6 py-6 rounded-xl shadow bg-card text-body">
        <h2 className="text-2xl font-semibold text-primary text-center mb-6">Contact Us</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-subtle">
          <div className="text-center md:text-left">
            <p className="font-bold text-body">Headquarters</p>
            <p>2323 W 5th Ave, Suite 120</p>
            <p>Columbus, OH 43204</p>
          </div>
          <div className="text-center md:text-left">
            <p className="font-bold text-body">Contact</p>
            <p>Main Line: (614) 965-6057</p>
            <p>
              Email:&nbsp;
              <a href="mailto:info@jmerrill.one" className="text-primary underline">
                info@jmerrill.one
              </a>
            </p>
            <p>
              Web:&nbsp;
              <a href="https://www.jmerrill.one" className="text-primary underline">
                www.jmerrill.one
              </a>
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="font-bold text-body">Hours</p>
            <p>Mon–Thu: 10 AM – 6 PM</p>
            <p>Fri: 10 AM – 4 PM</p>
            <p>Sat: By Appointment Only</p>
            <p>Sun: Closed</p>
          </div>
        </div>
      </section>
    </div>
  );
}