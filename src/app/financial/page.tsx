import type { Metadata } from 'next';
import DivisionShell from '@/components/DivisionShell';
import { JourneyResetButton } from '@/components/JourneyResetButton';

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: 'J Merrill Financial | J Merrill One',
  description:
    'Advanced planning and estate guidance delivered with clarity, compassion, and long-term vision.',
};

// -------------------------
// Financial Division Page
// Phase 10.5 — Journey Persistence (Server-safe)
// Step 5 — Subtle Division Accent Enabled
// -------------------------
//
// Canon Rules Enforced:
// • Server Component only
// • No JourneyBadge (client-only)
// • No sessionStorage / localStorage access
// • No journey reads on the server
// • Journey reset is explicit and user-controlled
// • Visual identity via Financial brand accent
//
// -------------------------
export default function FinancialPage() {
  return (
    <DivisionShell
      division="financial"
      title={
        <div className="flex items-center justify-between gap-3">
          <span>J Merrill Financial</span>

          {/* Canon: optional user-controlled journey reset */}
          <JourneyResetButton />
        </div>
      }
      description="J Merrill Financial provides advanced planning and estate guidance—helping individuals and families make informed decisions with confidence, compassion, and long-term clarity."
      bullets={[
        'Advanced planning & estate strategy',
        'Final expense and legacy coordination',
        'Client-first guidance rooted in trust and transparency',
      ]}
      ctaLabel="Visit J Merrill Financial"
      ctaHref="https://jmerrill.financial"
    />
  );
}