import type { Metadata } from 'next';
import DivisionShell from '@/components/DivisionShell';
import { JourneyResetButton } from '@/components/JourneyResetButton';

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: 'J Merrill Publishing | J Merrill One',
  description:
    'Professional publishing, editorial guidance, and author legacy support across print, digital, and audio formats.',
};

// -------------------------
// Publishing Division Page
// Phase 10.5 — Journey Persistence (Server-safe)
// Step 5 — Subtle Division Accent Enabled
// -------------------------
//
// Canon Rules Enforced:
// • Server Component only
// • No sessionStorage / localStorage access
// • No journey reads on the server
// • Journey reset is explicit and user-controlled
// • Visual identity via Publishing brand accent
//
// -------------------------
export default function PublishingPage() {
  return (
    <DivisionShell
      division="publishing"
      title={
        <div className="flex items-center justify-between gap-3">
          <span>J Merrill Publishing</span>

          {/* Canon: optional user-controlled journey reset */}
          <JourneyResetButton />
        </div>
      }
      description="J Merrill Publishing helps authors transform ideas into professionally published works—providing editorial excellence, strategic guidance, and long-term legacy support across print, digital, and audio formats."
      bullets={[
        'Full-service publishing and editorial guidance',
        'Print, digital, and audiobook production',
        'Author branding, legacy, and distribution strategy',
      ]}
      ctaLabel="Visit J Merrill Publishing"
      ctaHref="https://jmerrill.pub"
    />
  );
}