export default function Hero() {
  return (
    <section className="px-6 pt-16 pb-14">
      <div className="mx-auto max-w-4xl">
        {/* Brand Title */}
        <h1
          className="
            text-hero
            font-semibold
            tracking-tight
            text-foreground
            mb-5
          "
        >
          J Merrill One
        </h1>

        {/* Positioning Statement */}
        <p
          className="
            max-w-3xl
            text-lg
            leading-relaxed
            text-secondary
          "
        >
          Where innovation meets impact — integrating publishing, financial services,
          and mission-driven outreach into one connected ecosystem.
        </p>
      </div>
    </section>
  );
}