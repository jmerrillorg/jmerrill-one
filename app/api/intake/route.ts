import { NextRequest, NextResponse } from "next/server";
import { canon } from "@/content/canon";
import {
  acceptIntake,
  createIntakeDataverseAdapter,
  processIntake,
} from "@/runtime/jm1-marketing-autonomous-functions/src/lib/intake.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Intent = "publishing" | "financial" | "foundation" | "productions" | "general";
type Payload = Record<string, unknown>;

const intents = new Set<Intent>(["publishing", "financial", "foundation", "productions", "general"]);
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function cleanMessage(value: unknown) {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").trim()
    : "";
}

function fallbackEmail(intent: Intent) {
  const routes = canon.intake.emailRoutes as Record<string, string>;
  return routes[intent] || routes.fallback;
}

function response(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function rateLimitAllows(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= 10) return false;
  bucket.count += 1;
  return true;
}

function dataverseConfig() {
  const apiBase = process.env.DATAVERSE_WEB_API_BASE_URL ||
    (process.env.DATAVERSE_RESOURCE_URL ? `${process.env.DATAVERSE_RESOURCE_URL.replace(/\/$/, "")}/api/data/v9.2` : "");
  const resource = process.env.DATAVERSE_RESOURCE_URL || process.env.DATAVERSE_URL || apiBase.replace(/\/api\/data\/v[0-9.]+$/, "");
  const tenant = process.env.DATAVERSE_TENANT_ID || process.env.AZURE_TENANT_ID;
  const client = process.env.DATAVERSE_CLIENT_ID;
  const secret = process.env.DATAVERSE_CLIENT_SECRET;
  if (!apiBase || !resource || !tenant || !client || !secret) return null;
  return { apiBase: apiBase.replace(/\/$/, ""), resource: resource.replace(/\/$/, ""), tenant, client, secret };
}

async function tokenFor(config: NonNullable<ReturnType<typeof dataverseConfig>>) {
  const tokenResponse = await fetch(`https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials", client_id: config.client, client_secret: config.secret,
      scope: `${config.resource}/.default`,
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Dataverse auth failed: ${tokenResponse.status}`);
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Dataverse auth returned no token.");
  return token.access_token;
}

export async function POST(request: NextRequest) {
  if (!rateLimitAllows(request)) {
    return response(429, { success: false, message: "Please wait a moment before trying again.", fallbackEmail: fallbackEmail("general") });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
  } catch {
    return response(400, { success: false, message: "Please check your request and try again." });
  }

  if (clean(body.companyWebsite, 200)) return response(202, { success: true, status: "received" });
  const intent = intents.has(body.intent as Intent) ? body.intent as Intent : "general";
  const requestId = clean(request.headers.get("Idempotency-Key") || body.correlationId, 80).toLowerCase();
  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const message = cleanMessage(body.message);
  const source = clean(body.source, 120);
  const sourceUrl = clean(body.sourceUrl, 180);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(requestId)) {
    return response(400, { success: false, message: "Please refresh the form and try again.", fallbackEmail: fallbackEmail(intent) });
  }
  if (!firstName || !lastName || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(400, { success: false, message: "Please complete your name, email, and message.", fallbackEmail: fallbackEmail(intent) });
  }
  if (message.length > 700) {
    return response(400, { success: false, message: "Please shorten your message to 700 characters.", fallbackEmail: fallbackEmail(intent) });
  }
  if (body.consent !== true) {
    return response(400, { success: false, message: "Please agree to let us respond to your request.", fallbackEmail: fallbackEmail(intent) });
  }

  const config = dataverseConfig();
  if (!config) {
    return response(503, { success: false, message: "We can't receive this request right now.", fallbackEmail: fallbackEmail(intent) });
  }
  const submission = { requestId, intent, firstName, lastName, email, phone, message, source, sourceUrl };
  try {
    const token = await tokenFor(config);
    const adapter = createIntakeDataverseAdapter({ apiBase: config.apiBase, getToken: async () => token });
    const { receipt, replay } = await acceptIntake(adapter, submission);
    try {
      await processIntake(adapter, receipt.id);
    } catch (error) {
      console.error("JM1 intake will retry from durable receipt", error instanceof Error ? error.message : "unknown");
    }
    return response(202, { success: true, status: "received", idempotentReplay: replay });
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      if (error.code === "KEY_REUSED") return response(409, { success: false, message: "Please refresh the form and try again.", fallbackEmail: fallbackEmail(intent) });
      if (error.code === "RECEIPT_TOO_LARGE") return response(400, { success: false, message: "Please shorten your message and try again.", fallbackEmail: fallbackEmail(intent) });
    }
    console.error("JM1 intake could not create durable receipt", error instanceof Error ? error.message : "unknown");
    return response(503, { success: false, message: "We can't receive this request right now.", fallbackEmail: fallbackEmail(intent) });
  }
}
