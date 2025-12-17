import type { Metadata } from 'next';
import DivisionShell from '@/components/DivisionShell';
import { JourneyResetButton } from '@/components/JourneyResetButton';

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: 'J Merrill Productions | J Merrill One',
  description:
    'Creative production, digital media, and content systems that bring stories, brands, and missions to life.',
};

// -------------------------
// Productions Division Page
// Phase 10.5 — Journey Persistence (Server-safe)
// -------------------------
//
// Canon Rules Enforced:
// • Server Component only
// • No JourneyBadge (client-only)
// • No sessionStorage / localStorage access
// • Journey reset is explicit and user-controlled
//
// -------------------------
export default function ProductionsPage() {
  return (
    <DivisionShell
      title={
        <div className="flex items-center justify-between gap-3">
          <span>J Merrill Productions</span>

          {/* Canon: optional user-controlled journey reset */}
          <JourneyResetButton />
        </div>
      }
      description="J Merrill Productions delivers creative production and digital storytelling across media—supporting brands, authors, ministries, and mission-driven initiatives."
      bullets={[
        'Video, audio, and digital media production',
        'Branded content and storytelling systems',
        'Creative direction for publishing, ministry, and business',
      ]}
      ctaLabel="Visit J Merrill Productions"
      ctaHref="https://jmerrill.productions"
    />
  );
}