import { NextResponse } from 'next/server';

type Division =
  | 'publishing'
  | 'financial'
  | 'foundation'
  | 'productions'
  | 'unknown';

function classifyIntent(intent: string): {
  recommendation: Division;
  confidence: number;
} {
  const text = intent.toLowerCase();

  const rules: Record<Division, string[]> = {
    publishing: ['book', 'publish', 'author', 'manuscript'],
    financial: ['estate', 'planning', 'pre-need', 'insurance', 'funeral'],
    foundation: ['nonprofit', 'donation', 'community', 'grant'],
    productions: ['video', 'media', 'podcast', 'production'],
    unknown: [],
  };

  let bestMatch: Division = 'unknown';
  let highestScore = 0;

  for (const [division, keywords] of Object.entries(rules)) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > highestScore) {
      highestScore = score;
      bestMatch = division as Division;
    }
  }

  return {
    recommendation: bestMatch,
    confidence: Math.min(highestScore / 3, 1), // normalize 0–1
  };
}

export async function POST(req: Request) {
  const { intent } = await req.json();

  const { recommendation, confidence } = classifyIntent(intent);

  // Telemetry (console now, App Insights next)
  console.log('[JM1 INTENT]', {
    intent,
    recommendation,
    confidence,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    recommendation,
    confidence,
  });
}