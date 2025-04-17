import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Financial Services | J Merrill One",
  description: "Get expert guidance on insurance, pre-need planning, and legacy services from J Merrill Financial, LLC.",
  path: "/financial",
});

export default function FinancialPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-financial mb-4">J Merrill Financial, LLC</h1>
      <p className="text-lg text-secondary mb-6">
        Providing pre-need planning, insurance solutions, and financial empowerment for every stage of life.
      </p>
      <p className="text-subtle">
        Full page experience launching soon. Appointments available now via the link above.
      </p>
    </main>
  );
}