import Hero from '@/components/Hero';
import BrandGrid from '@/components/BrandGrid';
import PlatformStatement from '@/components/PlatformStatement';
import IntentCapture from '@/components/IntentCapture';

// --------------------------------------------------
// Home Page
// Canon:
// • Composition-only (no state, no effects)
// • Visual hierarchy > content density
// --------------------------------------------------
export default function Home() {
  return (
    <main className="flex flex-col gap-24">
      {/* -------------------------------------------
         Brand identity / introduction
         ------------------------------------------- */}
      <Hero />

      {/* -------------------------------------------
         Core division discovery (card-based)
         ------------------------------------------- */}
      <section className="px-6">
        <BrandGrid />
      </section>

      {/* -------------------------------------------
         Intent-driven entry point
         ------------------------------------------- */}
      <section className="px-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-jm1-mist bg-accent p-8">
          <IntentCapture />
        </div>
      </section>

      {/* -------------------------------------------
         Platform & ecosystem positioning
         (Moved BELOW intent for proper narrative flow)
         ------------------------------------------- */}
      <PlatformStatement />
    </main>
  );
}