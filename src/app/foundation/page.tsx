import type { Metadata } from 'next';
import DivisionShell from '@/components/DivisionShell';
import { JourneyResetButton } from '@/components/JourneyResetButton';

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: 'J Merrill Foundation | J Merrill One',
  description:
    'The J Merrill Foundation advances community impact through education, innovation, and mission-driven initiatives.',
};

// -------------------------
// Foundation Division Page
// Phase 10.5 — Journey Persistence (Server-safe)
// -------------------------
//
// Canon Rules Enforced:
// • Server Component only
// • No sessionStorage / localStorage access
// • No journey reads on the server
// • Journey reset is explicit and client-controlled
//
// -------------------------
export default function FoundationPage() {
  return (
    <DivisionShell
      title={
        <div className="flex items-center justify-between gap-3">
          <span>J Merrill Foundation</span>

          {/* Canon: optional user-controlled journey reset */}
          <JourneyResetButton />
        </div>
      }
      description="The J Merrill Foundation advances community impact through education, innovation, and mission-driven initiatives—grounded in service, stewardship, and long-term public benefit."
      bullets={[
        'Community programs and outreach',
        'Digital empowerment initiatives',
        'Mission-aligned partnerships and grants',
      ]}
      ctaLabel="Visit J Merrill Foundation"
      ctaHref="https://jmerrill.foundation"
    />
  );
}