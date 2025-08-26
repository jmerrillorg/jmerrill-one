import HeroLogo from '@/components/shared/HeroLogo';
import { BrandCard } from '@/components/BrandCard';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-16 bg-background text-foreground">
      <HeroLogo />

      <h1 className="text-4xl font-bold mt-6 text-publishing">J Merrill One</h1>
      <p className="text-lg mt-2 max-w-2xl text-secondary">
        Where innovation meets impact — across publishing, financial services, and mission-driven outreach.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl w-full">
        <BrandCard brand="Publishing" variant="home" />
        <BrandCard brand="Financial" variant="home" />
        <BrandCard brand="Foundation" variant="home" />
      </section>

      <div className="mt-10 text-sm text-secondary">
        Unified. Automated. Future-proof. <br /> Powered by Microsoft 365, Dynamics 365, and AI.
      </div>
    </div>
  );
} 