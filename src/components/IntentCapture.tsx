'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appInsights } from '@/lib/appInsights';

type Recommendation =
  | 'publishing'
  | 'financial'
  | 'foundation'
  | 'productions'
  | 'unknown'
  | null;

const divisionLabels: Record<string, string> = {
  publishing: 'J Merrill Publishing',
  financial: 'J Merrill Financial',
  foundation: 'J Merrill Foundation',
  productions: 'J Merrill Productions',
};

const divisionMessages: Record<string, string> = {
  publishing:
    'You’re in the right place to bring your ideas to life and publish your work with clarity and confidence.',
  financial:
    'Planning with clarity starts here — let’s help you make informed decisions for today and the future.',
  foundation:
    'Purpose-driven impact begins here — let’s explore how your vision can serve the community.',
  productions:
    'This is where stories take shape through media, creativity, and digital production.',
  unknown:
    'Let’s connect you with the right people to help guide you forward.',
};

const clarificationOptions: { key: Recommendation; label: string }[] = [
  { key: 'publishing', label: 'Publishing a book or written work' },
  { key: 'financial', label: 'Planning, estate, or financial guidance' },
  { key: 'foundation', label: 'Community, nonprofit, or mission work' },
  { key: 'productions', label: 'Media, video, or creative production' },
];

export default function IntentCapture() {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] =
    useState<Recommendation>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [needsClarification, setNeedsClarification] =
    useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });

      const data = await res.json();

      setRecommendation(data.recommendation ?? 'unknown');
      setConfidence(typeof data.confidence === 'number' ? data.confidence : null);

      if (typeof data.confidence === 'number' && data.confidence < 0.4) {
        setNeedsClarification(true);
      }

      appInsights?.trackEvent({
        name: 'JM1.IntentSubmitted',
        properties: {
          intent,
          recommendation: data.recommendation,
          confidence: data.confidence,
          needsClarification: data.confidence < 0.4,
        },
      });
    } catch (err) {
      console.error('Intent submission failed', err);
      setRecommendation('unknown');
      setConfidence(null);
    } finally {
      setLoading(false);
    }
  }

  function proceed(finalRecommendation: Recommendation) {
    if (finalRecommendation && finalRecommendation !== 'unknown') {
      router.push(`/${finalRecommendation}`);
    } else {
      router.push('/contact');
    }
  }

  // -------------------------
  // Clarifying Question (Phase 6.5)
  // -------------------------
  if (needsClarification) {
    return (
      <section className="mt-16 max-w-xl rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-primary">
          Help us point you in the right direction
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Which of these best describes what you’re trying to do?
        </p>

        <div className="flex flex-col gap-3">
          {clarificationOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => proceed(opt.key)}
              className="rounded-md border px-4 py-2 text-left text-sm transition hover:bg-muted/50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  // -------------------------
  // Recommendation Interstitial (Phase 6.6)
  // -------------------------
  if (recommendation) {
    const label =
      recommendation !== 'unknown'
        ? divisionLabels[recommendation]
        : 'our team';

    const message =
      divisionMessages[recommendation] ??
      divisionMessages.unknown;

    const showHighConfidence = confidence !== null && confidence >= 0.7;

    return (
      <section className="mt-16 max-w-xl rounded-lg border bg-card p-6">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-xl font-semibold text-primary">
            We recommend {label}
          </h2>

          {showHighConfidence && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              High confidence match
            </span>
          )}
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => proceed(recommendation)}
            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue
          </button>

          <button
            onClick={() => {
              setRecommendation(null);
              setConfidence(null);
              setNeedsClarification(false);
            }}
            className="rounded-md border px-6 py-2 text-sm text-foreground hover:bg-muted/50"
          >
            Go back
          </button>
        </div>
      </section>
    );
  }

  // -------------------------
  // Initial Intent Form
  // -------------------------
  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="mb-4 text-xl font-semibold text-primary">
        Not sure where to start?
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-xl flex-col gap-4"
      >
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Describe what you're looking to do..."
          className="w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Reviewing…' : 'Get Recommendation'}
        </button>
      </form>
    </section>
  );
}