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
// -------------------------
//
// Canon Rules Enforced:
// • This page is a Server Component
// • No access to sessionStorage / localStorage
// • Journey logic is client-only and optional
// • Reset is explicit, user-controlled, and reversible
//
// -------------------------
export default function PublishingPage() {
  return (
    <DivisionShell
      title={
        <div className="flex items-center justify-between gap-3">
          <span>J Merrill Publishing</span>

          {/* Canon: Client-only control to clear persisted journey */}
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