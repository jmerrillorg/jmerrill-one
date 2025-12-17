'use client';

import type { Journey } from '@/lib/journeys';

export function JourneyCard({
  journey,
  onPrimary,
  onSecondary,
}: {
  journey: Journey;
  onPrimary?: () => void;
  onSecondary?: (href: string) => void;
}) {
  return (
    <section className="mt-10 max-w-xl rounded-lg border bg-card p-6">
      <h2 className="mb-2 text-xl font-semibold text-primary">
        {journey.hero}
      </h2>

      {journey.subhead && (
        <p className="mb-5 text-sm text-muted-foreground">
          {journey.subhead}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={journey.primaryCta.href}
          onClick={onPrimary}
          className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {journey.primaryCta.label}
        </a>

        {journey.secondaryCtas?.map((cta) => (
          <a
            key={cta.href}
            href={cta.href}
            onClick={() => onSecondary?.(cta.href)}
            className="rounded-md border px-6 py-2 text-sm hover:bg-muted/50"
          >
            {cta.label}
          </a>
        ))}
      </div>

      {journey.nextBestActions?.length ? (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold">
            Next best actions
          </h3>

          <div className="flex flex-col gap-2">
            {journey.nextBestActions.map((a) => (
              <a
                key={a.href + a.label}
                href={a.href}
                className="rounded-md border px-4 py-2 text-left text-sm hover:bg-muted/50"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}