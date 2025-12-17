import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Division } from '@/lib/types';

/* ======================================================
   Division → Brand Class Map (CANONICAL)
   ====================================================== */

const DIVISION_ACCENTS: Record<
  Division,
  {
    bar: string;
    button: string;
  }
> = {
  publishing: {
    bar: 'bg-publishing-primary',
    button: 'bg-publishing-primary hover:bg-publishing-accent',
  },
  financial: {
    bar: 'bg-financial-primary',
    button: 'bg-financial-primary hover:bg-financial-accent',
  },
  foundation: {
    bar: 'bg-foundation-primary',
    button: 'bg-foundation-primary hover:bg-foundation-accent',
  },
  productions: {
    bar: 'bg-productions-primary',
    button: 'bg-productions-primary hover:bg-productions-accent',
  },
  unknown: {
    bar: 'bg-jm1-blue',
    button: 'bg-jm1-blue hover:bg-jm1-sky',
  },
};

type Props = {
  /**
   * Canon:
   * Title accepts ReactNode to support
   * badges, journey UI, or controls inline
   */
  title: ReactNode;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;

  /**
   * Step 5 — subtle brand accent
   */
  division?: Division;

  /**
   * Phase-ready visual marker
   */
  icon?: ReactNode;
};

export default function DivisionShell({
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  division = 'unknown',
  icon,
}: Props) {
  const accent = DIVISION_ACCENTS[division];

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* ==================================================
            Card Container
           ================================================== */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
          {/* Subtle Division Accent Bar */}
          <div
            className={`absolute inset-x-0 top-0 h-0.5 ${accent.bar}`}
            aria-hidden
          />

          {/* ==================================================
              Header
             ================================================== */}
          <div className="mb-6 flex items-start gap-4">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                {icon}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>

              <div className="h-px w-16 bg-border" />
            </div>
          </div>

          {/* ==================================================
              Description
             ================================================== */}
          <p className="mb-6 max-w-2xl leading-relaxed text-secondary">
            {description}
          </p>

          {/* ==================================================
              Feature Bullets
             ================================================== */}
          <ul className="mb-8 list-disc space-y-2 pl-5 text-secondary">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          {/* ==================================================
              CTA
             ================================================== */}
          <div className="border-t pt-6">
            <Link
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'inline-flex items-center gap-2 rounded-lg',
                'px-5 py-2.5 text-sm font-medium text-white',
                'transition',
                accent.button,
              ].join(' ')}
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}