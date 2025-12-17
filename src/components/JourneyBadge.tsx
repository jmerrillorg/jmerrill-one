'use client';

import type { Division } from '@/lib/types';
import type { Journey } from '@/lib/journeys';
import { loadJourney } from '@/lib/journeySession';

type Props = {
  division: Division;
};

export default function JourneyBadge({ division }: Props) {
  const journey = loadJourney('session');

  if (!journey) return null;

  // Optional guard if you later add division scoping
  // (safe even if not currently used)
  if (
    division !== 'unknown' &&
    journey.primaryCta?.href &&
    !journey.primaryCta.href.includes(division)
  ) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
      <span>Guided by your intent</span>
      <span className="opacity-60">•</span>
      <span>{journey.variant}</span>
    </div>
  );
}