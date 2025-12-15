import type { Metadata } from "next";
import DivisionShell from "@/components/DivisionShell";

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: "J Merrill Foundation | J Merrill One",
  description:
    "The J Merrill Foundation advances community impact through education, innovation, and mission-driven initiatives.",
};

// -------------------------
// Foundation Division Page
// -------------------------
export default function FoundationPage() {
  return (
    <DivisionShell
      title="J Merrill Foundation"
      description="The J Merrill Foundation advances community impact through education, innovation, and mission-driven initiatives—grounded in service, stewardship, and long-term public benefit."
      bullets={[
        "Community programs and outreach",
        "Digital empowerment initiatives",
        "Mission-aligned partnerships and grants",
      ]}
      ctaLabel="Visit J Merrill Foundation"
      ctaHref="https://jmerrill.foundation"
    />
  );
}