import type { Metadata } from "next";
import DivisionShell from "@/components/DivisionShell";

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: "J Merrill Financial | J Merrill One",
  description:
    "Advanced planning and estate guidance delivered with clarity, compassion, and long-term vision.",
};

// -------------------------
// Financial Division Page
// -------------------------
export default function FinancialPage() {
  return (
    <DivisionShell
      title="J Merrill Financial"
      description="J Merrill Financial provides advanced planning and estate guidance—helping individuals and families make informed decisions with confidence, compassion, and long-term clarity."
      bullets={[
        "Advanced planning & estate strategy",
        "Final expense and legacy coordination",
        "Client-first guidance rooted in trust and transparency",
      ]}
      ctaLabel="Visit J Merrill Financial"
      ctaHref="https://jmerrill.financial"
    />
  );
}