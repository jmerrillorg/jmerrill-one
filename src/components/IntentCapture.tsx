'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { appInsights } from '@/lib/appInsights';
import { computeJourney } from '@/lib/journeys';
import { JourneyCard } from '@/components/JourneyCard';

// JM1 Canon — Telemetry helpers
import {
  getClientSessionId,
  generateCorrelationId,
  getPageUrl,
  getUserAgent,
} from '@/lib/telemetry';

type Division =
  | 'publishing'
  | 'financial'
  | 'foundation'
  | 'productions'
  | 'unknown';

/**
 * JM1 Canon — Required baseline confidence map
 */
const EMPTY_CONFIDENCE: Record<Division, number> = {
  publishing: 0,
  financial: 0,
  foundation: 0,
  productions: 0,
  unknown: 0,
};

interface IntentResponse {
  primary?: Division;
  secondary?: Division[];
  confidence?: Partial<Record<Division, number>>;
}

// -------------------------
// Labels / Explanations
// -------------------------
const divisionLabels: Record<Division, string> = {
  publishing: 'J Merrill Publishing',
  financial: 'J Merrill Financial',
  foundation: 'J Merrill Foundation',
  productions: 'J Merrill Productions',
  unknown: 'Our Team',
};

const explanationMap: Partial<Record<Division, string>> = {
  publishing: 'Your intent referenced writing, publishing, or authorship.',
  financial: 'Your intent referenced insurance, planning, or legacy decisions.',
  foundation: 'Your intent emphasized mission, giving, or community impact.',
  productions: 'Your intent referenced media, video, or creative production.',
};

// -------------------------
// Clarification Options
// -------------------------
const clarificationOptions: { key: Division; label: string }[] = [
  { key: 'publishing', label: 'Publishing a book or written work' },
  { key: 'financial', label: 'Planning, estate, or financial guidance' },
  { key: 'foundation', label: 'Community, nonprofit, or mission work' },
  { key: 'productions', label: 'Media, video, or creative production' },
];

export default function IntentCapture() {
  const router = useRouter();

  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);

  const [primary, setPrimary] = useState<Division | null>(null);
  const [secondary, setSecondary] = useState<Division[]>([]);
  const [confidence, setConfidence] =
    useState<Record<Division, number>>(EMPTY_CONFIDENCE);

  const [needsClarification, setNeedsClarification] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(false);
  const [journey, setJourney] =
    useState<ReturnType<typeof computeJourney> | null>(null);

  // -------------------------
  // Phase 10.5 — Persisted Journey Restore
  // -------------------------
  useEffect(() => {
    const stored = sessionStorage.getItem('jm1:lastJourney');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed?.journey) {
        setJourney(parsed.journey);
        setPrimary(parsed.primary ?? null);
        setConfidence(parsed.confidence ?? EMPTY_CONFIDENCE);
      }
    } catch {
      sessionStorage.removeItem('jm1:lastJourney');
    }
  }, []);

  // -------------------------
  // Submit Intent
  // -------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim()) return;

    setLoading(true);

    const clientSessionId = getClientSessionId();
    const correlationId = generateCorrelationId();
    const pageUrl = getPageUrl();
    const userAgent = getUserAgent();

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          clientSessionId,
          correlationId,
          pageUrl,
          userAgent,
        }),
      });

      if (!res.ok) throw new Error(`Intent API failed: ${res.status}`);

      const data: IntentResponse = await res.json();

      const resolvedPrimary: Division =
        data.primary && divisionLabels[data.primary]
          ? data.primary
          : 'unknown';

      const resolvedConfidence: Record<Division, number> = {
        ...EMPTY_CONFIDENCE,
        ...(data.confidence ?? {}),
      };

      const primaryConfidence = resolvedConfidence[resolvedPrimary];

      setPrimary(resolvedPrimary);
      setSecondary(Array.isArray(data.secondary) ? data.secondary : []);
      setConfidence(resolvedConfidence);
      setNeedsClarification(primaryConfidence < 0.4);

      // -------------------------
      // Phase 10 — Journey Computation
      // -------------------------
      const computedJourney = computeJourney({
        primary: resolvedPrimary,
        confidence: resolvedConfidence,
        intent,
        clientSessionId,
      });

      setJourney(computedJourney);

      sessionStorage.setItem(
        'jm1:lastJourney',
        JSON.stringify({
          journey: computedJourney,
          primary: resolvedPrimary,
          confidence: resolvedConfidence,
          timestamp: Date.now(),
        })
      );

      appInsights?.trackEvent({
        name: 'JM1.JourneyComputed',
        properties: {
          journeyId: computedJourney.journeyId,
          variant: computedJourney.variant,
          primary: resolvedPrimary,
          confidence: primaryConfidence,
        },
      });

      // -------------------------
      // Phase 9.1 — Auto Redirect
      // -------------------------
      if (primaryConfidence >= 0.85) {
        setAutoRedirect(true);

        appInsights?.trackEvent({
          name: 'JM1.IntentAutoRedirect',
          properties: {
            primary: resolvedPrimary,
            confidence: primaryConfidence,
          },
        });

        setTimeout(() => proceed(resolvedPrimary), 1200);
      }

      // -------------------------
      // Telemetry
      // -------------------------
      appInsights?.trackEvent({
        name: 'JM1.IntentRouted',
        properties: {
          intent,
          primary: resolvedPrimary,
          confidence: resolvedConfidence,
          clientSessionId,
          correlationId,
        },
      });
    } catch (err) {
      console.error('Intent submission failed', err);
      setPrimary('unknown');
      setNeedsClarification(true);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Navigation
  // -------------------------
  function proceed(target: Division) {
    appInsights?.trackEvent({
      name: 'JM1.IntentOverride',
      properties: {
        recommended: primary,
        chosen: target,
      },
    });

    router.push(target !== 'unknown' ? `/${target}` : '/contact');
  }

  // -------------------------
  // Phase 6.5 — Clarification
  // -------------------------
  if (needsClarification) {
    return (
      <section className="mt-16 max-w-xl rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-primary">
          Help us point you in the right direction
        </h2>

        <div className="flex flex-col gap-3">
          {clarificationOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => proceed(opt.key)}
              className="rounded-md border px-4 py-2 text-left text-sm hover:bg-muted/50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  // -------------------------
  // Phase 10 — Journey UI (highest priority)
  // -------------------------
  if (journey) {
    return (
      <JourneyCard
        journey={journey}
        onPrimary={() =>
          appInsights?.trackEvent({
            name: 'JM1.JourneyPrimaryCTA',
            properties: {
              journeyId: journey.journeyId,
              variant: journey.variant,
            },
          })
        }
        onSecondary={(href) =>
          appInsights?.trackEvent({
            name: 'JM1.JourneySecondaryCTA',
            properties: {
              journeyId: journey.journeyId,
              variant: journey.variant,
              href,
            },
          })
        }
      />
    );
  }

  // -------------------------
  // Phase 9.2 — Ranked Fallback
  // -------------------------
  if (primary) {
    const ranked = Object.entries(confidence)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]) as [Division, number][];

    return (
      <section className="mt-16 max-w-xl rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold text-primary mb-1">
          We recommend {divisionLabels[primary]}
        </h2>

        <p className="text-xs italic text-muted-foreground mb-4">
          {explanationMap[primary]}
        </p>

        {autoRedirect && (
          <p className="mb-4 text-xs text-muted-foreground">
            Redirecting you automatically…
          </p>
        )}

        <div className="flex flex-col gap-2 mb-6">
          {ranked.map(([div, score]) => (
            <button
              key={div}
              onClick={() => proceed(div)}
              className="rounded-md border px-4 py-3 text-left hover:bg-muted/50"
            >
              <div className="flex justify-between">
                <span>{divisionLabels[div]}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(score * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setPrimary(null);
            setConfidence(EMPTY_CONFIDENCE);
            setJourney(null);
            setAutoRedirect(false);
            sessionStorage.removeItem('jm1:lastJourney');
          }}
          className="rounded-md border px-6 py-2 text-sm hover:bg-muted/50"
        >
          Go back
        </button>
      </section>
    );
  }

  // -------------------------
  // Initial Form
  // -------------------------
  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="mb-4 text-xl font-semibold text-primary">
        Not sure where to start?
      </h2>

      <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-4">
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Describe what you're looking to do..."
          className="rounded-md border px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
        />

        <button
          disabled={loading}
          className="self-start rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Reviewing…' : 'Get Recommendation'}
        </button>
      </form>
    </section>
  );
}