import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ready",
    service: "jmerrill-one",
    release: process.env.JM1_RELEASE_SHA || process.env.JM1_RELEASE_ID || "local",
  });
}
