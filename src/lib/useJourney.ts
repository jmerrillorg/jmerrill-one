'use client';

import { useEffect, useState } from 'react';
import type { Journey } from '@/lib/journeys';
import { loadJourney } from '@/lib/journeySession';

/**
 * JM1 Canon — useJourney
 * Client-only hook returning the active Journey
 */
export function useJourney(
  mode: 'session' | 'local' = 'session'
): Journey | null {
  const [journey, setJourney] = useState<Journey | null>(null);

  useEffect(() => {
    const j = loadJourney(mode); // ✅ now truly Journey | null
    setJourney(j);
  }, [mode]);

  return journey;
}