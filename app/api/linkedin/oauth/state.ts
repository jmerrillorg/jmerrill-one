import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

type LinkedInOAuthState = {
  provider: "linkedin";
  app: "JM1 Organization Publisher";
  organizationId: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
  returnTo: string;
};

export type VerifiedLinkedInOAuthState =
  | { ok: true; payload: LinkedInOAuthState; stateHash: string }
  | { ok: false; status: "MISSING_STATE" | "MISSING_STATE_SECRET" | "INVALID_STATE_FORMAT" | "INVALID_STATE_SIGNATURE" | "EXPIRED_STATE"; stateHash: string | null };

export function createLinkedInOAuthState({ organizationId, returnTo }: { organizationId: string; returnTo: string }) {
  const secret = process.env.JM1_LINKEDIN_OAUTH_STATE_SECRET || "";
  if (!secret) return { ok: false as const, status: "LINKEDIN_OAUTH_STATE_SECRET_NOT_CONFIGURED" };

  const now = Date.now();
  const payload: LinkedInOAuthState = {
    provider: "linkedin",
    app: "JM1 Organization Publisher",
    organizationId,
    nonce: randomUUID(),
    issuedAt: now,
    expiresAt: now + STATE_TTL_MS,
    returnTo,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(body, secret);
  const state = `${body}.${signature}`;
  return { ok: true as const, state, stateHash: stateHash(state), expiresAt: new Date(payload.expiresAt).toISOString() };
}

export function verifyLinkedInOAuthState(state: string | null): VerifiedLinkedInOAuthState {
  if (!state) return { ok: false, status: "MISSING_STATE", stateHash: null };
  const hash = stateHash(state);
  const secret = process.env.JM1_LINKEDIN_OAUTH_STATE_SECRET || "";
  if (!secret) return { ok: false, status: "MISSING_STATE_SECRET", stateHash: hash };

  const [body, signature] = state.split(".");
  if (!body || !signature) return { ok: false, status: "INVALID_STATE_FORMAT", stateHash: hash };

  const expected = sign(body, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return { ok: false, status: "INVALID_STATE_SIGNATURE", stateHash: hash };
  }

  const payload = parsePayload(body);
  if (!payload || payload.provider !== "linkedin") return { ok: false, status: "INVALID_STATE_FORMAT", stateHash: hash };
  if (payload.expiresAt < Date.now()) return { ok: false, status: "EXPIRED_STATE", stateHash: hash };
  return { ok: true, payload, stateHash: hash };
}

export function stateHash(value: string): string;
export function stateHash(value: null): null;
export function stateHash(value: string | null): string | null;
export function stateHash(value: string | null) {
  if (!value) return null;
  return createHmac("sha256", "jm1-linkedin-state-evidence").update(value).digest("hex").slice(0, 16);
}

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function parsePayload(body: string) {
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (
      parsed
      && parsed.provider === "linkedin"
      && parsed.app === "JM1 Organization Publisher"
      && typeof parsed.organizationId === "string"
      && typeof parsed.nonce === "string"
      && typeof parsed.issuedAt === "number"
      && typeof parsed.expiresAt === "number"
      && typeof parsed.returnTo === "string"
    ) {
      return parsed as LinkedInOAuthState;
    }
  } catch {
    return null;
  }
  return null;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}
