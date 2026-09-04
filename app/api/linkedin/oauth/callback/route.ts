import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashNullable(value: string | null) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      {
        status: "LINKEDIN_OAUTH_RETURNED_ERROR",
        error,
        errorDescriptionPresent: Boolean(url.searchParams.get("error_description")),
        stateHash: hashNullable(state),
      },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json({
      status: "LINKEDIN_OAUTH_CALLBACK_READY",
      codeReceived: false,
      stateHash: hashNullable(state),
    });
  }

  return NextResponse.json(
    {
      status: "LINKEDIN_OAUTH_CODE_RECEIVED_EXCHANGE_HELD",
      codeReceived: true,
      stateHash: hashNullable(state),
      nextStep: "Server-side token exchange requires approved LinkedIn product scopes and governed client secret storage.",
    },
    { status: 202 },
  );
}
