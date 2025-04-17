import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Publishing Services | J Merrill One",
  description: "Explore full-service publishing, editing, design, and distribution with J Merrill Publishing, Inc.",
  path: "/publishing",
});

export default function PublishingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-publishing mb-4">J Merrill Publishing, Inc.</h1>
      <p className="text-lg text-secondary mb-6">
        Empowering authors with full-service publishing, creative freedom, and forward-thinking distribution strategies.
      </p>
      <p className="text-subtle">
        Page content coming soon — check back for service details, packages, and submission options.
      </p>
    </main>
  );
}