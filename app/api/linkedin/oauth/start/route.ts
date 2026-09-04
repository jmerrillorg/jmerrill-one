import { NextRequest, NextResponse } from "next/server";
import { createLinkedInOAuthState } from "../state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SCOPES = ["w_organization_social", "r_organization_social"];
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";

export function GET(request: NextRequest) {
  const clientId = process.env.JM1_LINKEDIN_CLIENT_ID || "";
  const redirectUri = process.env.JM1_LINKEDIN_REDIRECT_URI || "https://jmerrill.one/api/linkedin/oauth/callback";
  const organizationId = process.env.JM1_LINKEDIN_ORGANIZATION_ID || "13048648";
  const scopes = parseScopes(process.env.JM1_LINKEDIN_OAUTH_SCOPES || process.env.JM1_LINKEDIN_GRANTED_SCOPES);
  const returnTo = new URL(request.url).searchParams.get("returnTo") || "jm1-linkedin-runtime";

  if (!clientId) {
    return NextResponse.json({ status: "LINKEDIN_CLIENT_ID_NOT_CONFIGURED" }, { status: 503 });
  }

  const state = createLinkedInOAuthState({ organizationId, returnTo });
  if (!state.ok) {
    return NextResponse.json(
      {
        status: state.status,
        secretReference: "jm1-core-vault/JM1-LINKEDIN-ORGANIZATION-PUBLISHER-OAUTH-STATE-SECRET",
      },
      { status: 503 },
    );
  }

  const authorizationUrl = new URL(LINKEDIN_AUTH_URL);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state.state);
  authorizationUrl.searchParams.set("scope", scopes.join(" "));

  return NextResponse.redirect(authorizationUrl);
}

function parseScopes(value = "") {
  const parsed = value.split(/[\s,]+/).map((scope) => scope.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_SCOPES;
}
