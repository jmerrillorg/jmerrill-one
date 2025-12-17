import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();

  const url = process.env.COPILOT_CLARIFY_FLOW_URL;
  if (!url) {
    return NextResponse.json(
      { error: "Missing COPILOT_CLARIFY_FLOW_URL" },
      { status: 500 }
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}