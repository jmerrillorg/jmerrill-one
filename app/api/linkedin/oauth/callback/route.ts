import { NextRequest, NextResponse } from "next/server";
import { stateHash, verifyLinkedInOAuthState } from "../state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        stateHash: stateHash(state),
      },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json({
      status: "LINKEDIN_OAUTH_CALLBACK_READY",
      codeReceived: false,
      stateHash: stateHash(state),
    });
  }

  const verifiedState = verifyLinkedInOAuthState(state);
  if (!verifiedState.ok) {
    return NextResponse.json(
      {
        status: "LINKEDIN_OAUTH_STATE_VALIDATION_FAILED",
        reason: verifiedState.status,
        codeReceived: true,
        stateHash: verifiedState.stateHash,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      status: "LINKEDIN_OAUTH_CODE_RECEIVED_EXCHANGE_HELD",
      codeReceived: true,
      stateHash: verifiedState.stateHash,
      organizationId: verifiedState.payload.organizationId,
      returnTo: verifiedState.payload.returnTo,
      nextStep: "Server-side token exchange requires approved LinkedIn product scopes and governed client secret storage.",
    },
    { status: 202 },
  );
}
