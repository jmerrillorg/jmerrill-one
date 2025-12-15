export type DivisionKey =
  | "publishing"
  | "financial"
  | "foundation"
  | "productions";

export const SERVICE_TAXONOMY: Record<DivisionKey, {
  label: string;
  description: string;
  route: string;
  examples: string[];
}> = {
  publishing: {
    label: "Publishing",
    description: "Books, editorial guidance, author legacy, distribution.",
    route: "/publishing",
    examples: ["write a book", "publish my manuscript", "audiobook"],
  },
  financial: {
    label: "Financial",
    description: "Advanced planning, estate guidance, legacy coordination.",
    route: "/financial",
    examples: ["estate planning", "final expense", "legacy planning"],
  },
  foundation: {
    label: "Foundation",
    description: "Community impact, grants, outreach, mission initiatives.",
    route: "/foundation",
    examples: ["community program", "nonprofit support", "grants"],
  },
  productions: {
    label: "Productions",
    description: "Media production, storytelling, digital content.",
    route: "/productions",
    examples: ["video production", "podcast", "branding content"],
  },
};