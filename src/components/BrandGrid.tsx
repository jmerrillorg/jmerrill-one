import DivisionCard from '@/components/DivisionCard';

export default function BrandGrid() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DivisionCard
        title="Publishing"
        subtitle="jmerrill.pub"
        description="Helping authors help themselves — full-service publishing, audiobooks, branding, and legacy strategy."
        href="/publishing"
        color="publishing"
      />

      <DivisionCard
        title="Financial"
        subtitle="jmerrill.financial"
        description="Advanced planning, estate strategy, and final expense guidance — with clarity and compassion."
        href="/financial"
        color="financial"
      />

      <DivisionCard
        title="Foundation"
        subtitle="jmerrill.foundation"
        description="Community programs, innovation labs, and digital empowerment initiatives that drive change."
        href="/foundation"
        color="foundation"
      />

      <DivisionCard
        title="Productions"
        subtitle="jmerrill.productions"
        description="Media, storytelling, and digital production — bringing ideas to life through film, audio, and immersive content."
        href="/productions"
        color="productions"
      />
    </section>
  );
}