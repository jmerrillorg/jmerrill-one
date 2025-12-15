import Link from "next/link";

type Props = {
  title: string;
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
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          {title}
        </h1>

        <p className="text-jm1-slate mb-6">
          {description}
        </p>

        <ul className="list-disc pl-5 space-y-2 text-jm1-slate mb-8">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md bg-jm1-brand px-4 py-2 text-white font-medium hover:opacity-90 transition"
        >
          {ctaLabel} →
        </Link>
      </div>
    </main>
  );
}