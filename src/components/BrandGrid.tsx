import { brands } from "@/data/brands";

export default function BrandGrid() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {brands.map((b) => (
          <div
            key={b.key}
            className="border-b border-jm1-mist pb-8 last:border-0"
          >
            <h2 className="text-xl font-semibold mb-2">{b.name}</h2>

            <a
              href={b.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm mb-3"
            >
              {b.label}
            </a>

            <p className="text-jm1-slate max-w-3xl mb-3">
              {b.description}
            </p>

            <a
              href={b.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-jm1-accent font-medium"
            >
              Visit site →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}