import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  /**
   * Canon update:
   * Title must accept ReactNode so divisions can
   * inject journey controls, badges, or telemetry UI
   */
  title: ReactNode;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
};

export default function DivisionShell({
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="mb-6 text-jm1-slate">
          {description}
        </p>

        <ul className="mb-8 list-disc space-y-2 pl-5 text-jm1-slate">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md bg-jm1-brand px-4 py-2 font-medium text-white transition hover:opacity-90"
        >
          {ctaLabel} →
        </Link>
      </div>
    </main>
  );
}