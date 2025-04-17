import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "J Merrill Productions",
  description: "Coming soon: Multimedia and immersive storytelling experiences powered by J Merrill Productions.",
  path: "/productions",
});

export default function ProductionsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-productions mb-4">J Merrill Productions</h1>
      <p className="text-lg text-secondary mb-6">
        Storytelling. Energy. Impact. Our media division is expanding into immersive content, digital storytelling, and creative production.
      </p>
      <p className="text-subtle">
        Launch in progress — stay tuned for film services, media partnerships, and original content.
      </p>
    </main>
  );
}
