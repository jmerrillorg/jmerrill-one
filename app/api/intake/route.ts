import { NextRequest, NextResponse } from "next/server";
import { canon } from "@/content/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntakeIntent = "publishing" | "financial" | "foundation" | "productions" | "general";

type IntakePayload = {
  intent?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  sourceUrl?: string;
  consent?: boolean;
  submittedAt?: string;
  correlationId?: string;
  companyWebsite?: string;
};

type DataverseCreateResult = {
  id?: string;
  contactid?: string;
  leadid?: string;
  jm1_executionlogid?: string;
};

const VALID_INTENTS = new Set<IntakeIntent>([
  "publishing",
  "financial",
  "foundation",
  "productions",
  "general",
]);

const LEAD_INTENTS = new Set<IntakeIntent>(["publishing", "financial", "productions"]);
const rateLimitWindowMs = 60_000;
const rateLimitMax = 10;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function clean(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMultiline(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function emailIsValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function rateLimitAllows(key: string) {
  const now = Date.now();
  const bucket = requestBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (bucket.count >= rateLimitMax) {
    return false;
  }

  bucket.count += 1;
  return true;
}

function getDataverseConfig() {
  const apiBase =
    process.env.DATAVERSE_WEB_API_BASE_URL ||
    (process.env.DATAVERSE_RESOURCE_URL
      ? `${process.env.DATAVERSE_RESOURCE_URL.replace(/\/$/, "")}/api/data/v9.2`
      : "");
  const resource =
    process.env.DATAVERSE_RESOURCE_URL ||
    process.env.DATAVERSE_URL ||
    apiBase.replace(/\/api\/data\/v[0-9.]+$/, "");
  const tenantId = process.env.DATAVERSE_TENANT_ID || process.env.AZURE_TENANT_ID || "";
  const clientId = process.env.DATAVERSE_CLIENT_ID || "";
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET || "";

  if (!apiBase || !resource || !tenantId || !clientId || !clientSecret) {
    return null;
  }

  return {
    apiBase: apiBase.replace(/\/$/, ""),
    resource: resource.replace(/\/$/, ""),
    tenantId,
    clientId,
    clientSecret,
  };
}

async function getDataverseToken(config: NonNullable<ReturnType<typeof getDataverseConfig>>) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: `${config.resource}/.default`,
  });

  const response = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Dataverse token request failed: ${response.status}`);
  }

  const token = (await response.json()) as { access_token?: string };
  if (!token.access_token) {
    throw new Error("Dataverse token request returned no access token.");
  }

  return token.access_token;
}

async function dataverseFetch<T>(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${config.apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "OData-Version": "4.0",
      "OData-MaxVersion": "4.0",
      Prefer: "return=representation",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dataverse ${init?.method || "GET"} ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

function escapeODataLiteral(value: string) {
  return value.replace(/'/g, "''");
}

async function findContactByEmail(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  email: string,
) {
  const filter = encodeURIComponent(`emailaddress1 eq '${escapeODataLiteral(email)}'`);
  return dataverseFetch<{ value: Array<{ contactid: string }> }>(
    config,
    token,
    `/contacts?$select=contactid&$filter=${filter}&$top=2`,
  );
}

async function findExecutionLogByCorrelation(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  correlationId: string,
) {
  const filter = encodeURIComponent(
    `jm1_sourceentity eq 'website_intake' and jm1_sourcerecordid eq '${escapeODataLiteral(correlationId)}' and jm1_actiontype eq 'BP09WebsiteIntake'`,
  );
  return dataverseFetch<{ value: Array<{ jm1_executionlogid: string }> }>(
    config,
    token,
    `/jm1_executionlogs?$select=jm1_executionlogid&$filter=${filter}&$top=1`,
  );
}

async function createContact(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  payload: Required<Pick<IntakePayload, "firstName" | "lastName" | "email" | "message">> &
    Pick<IntakePayload, "phone" | "source" | "correlationId">,
) {
  const description = [
    "JM1 website intake contact.",
    `Correlation ID: ${payload.correlationId}`,
    `Source: ${payload.source || "Not provided"}`,
    "",
    payload.message,
  ].join("\n");

  return dataverseFetch<DataverseCreateResult>(config, token, "/contacts", {
    method: "POST",
    body: JSON.stringify({
      firstname: payload.firstName,
      lastname: payload.lastName,
      emailaddress1: payload.email,
      telephone1: payload.phone || undefined,
      description,
    }),
  });
}

async function createLead(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  payload: Required<Pick<IntakePayload, "firstName" | "lastName" | "email" | "message" | "intent">> &
    Pick<IntakePayload, "phone" | "source" | "correlationId"> & { contactId: string },
) {
  const intentLabel = intentToLabel(payload.intent);
  const description = [
    "JM1 governed website intake.",
    `Intent: ${intentLabel}`,
    `Correlation ID: ${payload.correlationId}`,
    `Source: ${payload.source || "Not provided"}`,
    "",
    payload.message,
  ].join("\n");

  return dataverseFetch<DataverseCreateResult>(config, token, "/leads", {
    method: "POST",
    body: JSON.stringify({
      subject: `JM1 Website Intake - ${intentLabel} - ${payload.firstName} ${payload.lastName}`,
      firstname: payload.firstName,
      lastname: payload.lastName,
      emailaddress1: payload.email,
      telephone1: payload.phone || undefined,
      description,
      "parentcontactid@odata.bind": `/contacts(${payload.contactId})`,
    }),
  });
}

async function createExecutionLog(
  config: NonNullable<ReturnType<typeof getDataverseConfig>>,
  token: string,
  detail: Record<string, unknown>,
) {
  const correlationId = String(detail.correlationId || "");

  return dataverseFetch<DataverseCreateResult>(config, token, "/jm1_executionlogs", {
    method: "POST",
    body: JSON.stringify({
      jm1_name: `BP-09 Website Intake ${correlationId}`,
      jm1_sourceentity: "website_intake",
      jm1_sourcerecordid: correlationId,
      jm1_actiontype: "BP09WebsiteIntake",
      jm1_actiondescription: JSON.stringify(detail),
      jm1_executionstatus: 835500000,
      jm1_bandlevel: 835500000,
    }),
  });
}

function intentToLabel(intent?: string) {
  if (!intent || intent === "general") {
    return "General";
  }

  return intent.charAt(0).toUpperCase() + intent.slice(1);
}

function fallbackEmail(intent?: string) {
  const routes = canon.intake.emailRoutes as Record<string, string>;
  return intent && routes[intent] ? routes[intent] : routes.fallback;
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (!rateLimitAllows(clientKey)) {
    return json(429, {
      success: false,
      code: "RATE_LIMITED",
      message: "This intake path is temporarily rate limited.",
      fallbackEmail: fallbackEmail(),
    });
  }

  let body: IntakePayload;
  try {
    body = (await request.json()) as IntakePayload;
  } catch {
    return json(400, { success: false, code: "INVALID_JSON", message: "The intake payload was not valid JSON." });
  }

  if (clean(body.companyWebsite, 200)) {
    return json(202, { success: true, status: "accepted", correlationId: body.correlationId || "screened" });
  }

  const intent = VALID_INTENTS.has(body.intent as IntakeIntent) ? (body.intent as IntakeIntent) : "general";
  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const message = cleanMultiline(body.message, 4000);
  const source = clean(body.source, 120);
  const sourceUrl = clean(body.sourceUrl, 500);
  const submittedAt = clean(body.submittedAt, 40) || new Date().toISOString();
  const correlationId = clean(body.correlationId, 80) || crypto.randomUUID();

  if (!firstName || !lastName || !email || !message) {
    return json(400, {
      success: false,
      code: "MISSING_REQUIRED_FIELDS",
      message: "First name, last name, email, and message are required.",
      fallbackEmail: fallbackEmail(intent),
    });
  }

  if (!emailIsValid(email)) {
    return json(400, {
      success: false,
      code: "INVALID_EMAIL",
      message: "A valid email address is required.",
      fallbackEmail: fallbackEmail(intent),
    });
  }

  if (body.consent !== true) {
    return json(400, {
      success: false,
      code: "CONSENT_REQUIRED",
      message: "Consent is required before JM1 can process this request.",
      fallbackEmail: fallbackEmail(intent),
    });
  }

  const config = getDataverseConfig();
  if (!config) {
    return json(503, {
      success: false,
      code: "INTAKE_NOT_CONFIGURED",
      message: "The governed intake endpoint is not configured for Dataverse writes.",
      fallbackEmail: fallbackEmail(intent),
      correlationId,
    });
  }

  try {
    const token = await getDataverseToken(config);
    const existingExecution = await findExecutionLogByCorrelation(config, token, correlationId);
    if (existingExecution.value.length > 0) {
      return json(202, {
        success: true,
        status: "accepted",
        idempotentReplay: true,
        correlationId,
        intent: intentToLabel(intent),
      });
    }

    const contacts = await findContactByEmail(config, token, email);

    if (contacts.value.length > 1) {
      await createExecutionLog(config, token, {
        packageId: "BP-09",
        status: "identity_resolution_required",
        reason: "Multiple Contacts matched submitted email address.",
        intent,
        source,
        sourceUrl,
        submittedAt,
        correlationId,
      });

      return json(202, {
        success: true,
        status: "identity_resolution_required",
        correlationId,
        intent: intentToLabel(intent),
      });
    }

    const createdContact =
      contacts.value[0]?.contactid
        ? null
        : await createContact(config, token, {
            firstName,
            lastName,
            email,
            phone,
            message,
            source,
            correlationId,
          });
    const contactId = contacts.value[0]?.contactid || createdContact?.contactid || createdContact?.id;

    if (!contactId) {
      throw new Error("Contact creation did not return a contact id.");
    }

    let leadCreated = false;
    if (LEAD_INTENTS.has(intent)) {
      await createLead(config, token, {
        intent,
        firstName,
        lastName,
        email,
        phone,
        message,
        source,
        correlationId,
        contactId,
      });
      leadCreated = true;
    }

    await createExecutionLog(config, token, {
      packageId: "BP-09",
      status: "accepted",
      intent,
      contactMatched: Boolean(contacts.value[0]?.contactid),
      leadCreated,
      semanticDisposition: leadCreated ? "lead_created" : "contact_review",
      source,
      sourceUrl,
      submittedAt,
      correlationId,
    });

    return json(202, {
      success: true,
      status: "accepted",
      correlationId,
      intent: intentToLabel(intent),
    });
  } catch (error) {
    console.error("JM1 intake submission failed", error);

    return json(502, {
      success: false,
      code: "DATAVERSE_WRITE_FAILED",
      message: "JM1 could not complete the governed intake write.",
      fallbackEmail: fallbackEmail(intent),
      correlationId,
    });
  }
}
