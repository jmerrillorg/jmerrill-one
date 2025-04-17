import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "J Merrill Foundation, Inc.",
  description: "Join our mission to serve, educate, and empower through nonprofit outreach and community initiatives.",
  path: "/foundation",
});

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">J Merrill Foundation, Inc.</h1>
      <p className="text-lg text-secondary mb-6">
        Purpose. Wisdom. Empowerment. We&rsquo;re building programs and partnerships that uplift communities and transform futures.
      </p>
      <p className="text-subtle">This page will include funding opportunities, volunteer initiatives, and impact reports. Stay tuned.</p>
    </main>
  );
}
