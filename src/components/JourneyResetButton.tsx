'use client';

import { useRouter } from 'next/navigation';
import { clearJourney } from '@/lib/journeySession';
import { appInsights } from '@/lib/appInsights';

/**
 * JM1 Canon — Journey Reset Control
 * Clears persisted journey state and returns the user
 * to a neutral starting point.
 */
export function JourneyResetButton() {
  const router = useRouter();

  function handleReset() {
    // Clear session-scoped journey
    clearJourney('session');

    // Canonical telemetry
    appInsights?.trackEvent({
      name: 'JM1.JourneyReset',
      properties: {
        scope: 'session',
      },
    });

    // Soft reset UX (stay on brand, no hard reload)
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleReset}
      className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted/50 transition"
      aria-label="Start over and reset your journey"
    >
      Start over
    </button>
  );
}