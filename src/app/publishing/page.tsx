import type { Metadata } from "next";
import DivisionShell from "@/components/DivisionShell";

// -------------------------
// Page Metadata (SEO + Canon)
// -------------------------
export const metadata: Metadata = {
  title: "J Merrill Publishing | J Merrill One",
  description:
    "Professional publishing, editorial guidance, and author legacy support across print, digital, and audio formats.",
};

// -------------------------
// Publishing Division Page
// -------------------------
export default function PublishingPage() {
  return (
    <DivisionShell
      title="J Merrill Publishing"
      description="J Merrill Publishing helps authors transform ideas into professionally published works—providing editorial excellence, strategic guidance, and long-term legacy support across print, digital, and audio formats."
      bullets={[
        "Full-service publishing and editorial guidance",
        "Print, digital, and audiobook production",
        "Author branding, legacy, and distribution strategy",
      ]}
      ctaLabel="Visit J Merrill Publishing"
      ctaHref="https://jmerrill.pub"
    />
  );
}