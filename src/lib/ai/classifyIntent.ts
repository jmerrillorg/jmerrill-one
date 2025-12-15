import { SERVICE_TAXONOMY } from "@/data/serviceTaxonomy";

export type IntentResult = {
  division: keyof typeof SERVICE_TAXONOMY;
  confidence: number; // 0–1
  rationale: string;
};

export async function classifyIntent(input: string): Promise<IntentResult[]> {
  // Phase 6A: hybrid (rules + AI-ready contract)
  const text = input.toLowerCase();

  const scored = Object.entries(SERVICE_TAXONOMY).map(([key, v]) => {
    const hits = v.examples.filter(e => text.includes(e)).length;
    return {
      division: key as keyof typeof SERVICE_TAXONOMY,
      confidence: Math.min(1, hits / Math.max(1, v.examples.length)),
      rationale: hits
        ? `Matched examples: ${v.examples.filter(e => text.includes(e)).join(", ")}`
        : "No direct example match",
    };
  });

  return scored
    .filter(r => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}