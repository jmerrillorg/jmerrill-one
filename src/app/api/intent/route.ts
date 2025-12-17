import { NextResponse } from 'next/server';

interface IntentRequestBody {
  intent: string;
  clientSessionId: string;
  correlationId: string;
  pageUrl: string;
  userAgent: string;
}

export async function POST(req: Request) {
  try {
    // -------------------------
    // Parse & validate request body
    // -------------------------
    const body = (await req.json()) as Partial<IntentRequestBody>;

    const {
      intent,
      clientSessionId,
      correlationId,
      pageUrl,
      userAgent,
    } = body;

    if (typeof intent !== 'string' || intent.trim() === '') {
      throw new Error('Invalid intent');
    }

    if (
      typeof clientSessionId !== 'string' ||
      typeof correlationId !== 'string' ||
      typeof pageUrl !== 'string' ||
      typeof userAgent !== 'string'
    ) {
      throw new Error('Invalid telemetry payload');
    }

    const flowUrl = process.env.POWER_AUTOMATE_INTENT_URL;

    if (!flowUrl) {
      throw new Error('POWER_AUTOMATE_INTENT_URL not set');
    }

    // -------------------------
    // Forward payload to Power Automate
    // -------------------------
    const res = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent,
        clientSessionId,
        correlationId,
        pageUrl,
        userAgent,
      }),
    });

    if (!res.ok) {
      throw new Error(`Flow failed: ${res.status}`);
    }

    const data = await res.json();

    // -------------------------
    // Normalize response for UI
    // -------------------------
    return NextResponse.json({
      primary:
        typeof data?.primary === 'string'
          ? data.primary
          : 'unknown',

      secondary:
        Array.isArray(data?.secondary)
          ? data.secondary
          : [],

      confidence:
        typeof data?.confidence === 'object' && data.confidence !== null
          ? data.confidence
          : {},
    });
  } catch (err) {
    console.error('Intent routing error:', err);

    return NextResponse.json(
      {
        primary: 'unknown',
        secondary: [],
        confidence: {},
      },
      { status: 500 }
    );
  }
}