import type { Metadata } from "next";
import DivisionShell from "@/components/DivisionShell";

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: "J Merrill Productions | J Merrill One",
  description:
    "Creative production, digital media, and content systems that bring stories, brands, and missions to life.",
};

// -------------------------
// Productions Division Page
// -------------------------
export default function ProductionsPage() {
  return (
    <DivisionShell
      title="J Merrill Productions"
      description="J Merrill Productions delivers creative production and digital storytelling across media—supporting brands, authors, ministries, and mission-driven initiatives."
      bullets={[
        "Video, audio, and digital media production",
        "Branded content and storytelling systems",
        "Creative direction for publishing, ministry, and business",
      ]}
      ctaLabel="Visit J Merrill Productions"
      ctaHref="https://jmerrill.productions"
    />
  );
}