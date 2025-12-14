// src/app/api/team/photo/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

/**
 * Acquire Microsoft Graph access token using
 * OAuth 2.0 Client Credentials (no MSAL dependency)
 */
async function getAccessToken(): Promise<string> {
  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID,
  } = process.env;

  if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_TENANT_ID) {
    throw new Error("Azure credentials not configured");
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: AZURE_CLIENT_ID,
        client_secret: AZURE_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${text}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

/**
 * GET /api/team/photo?id=<userPrincipalName | objectId>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = req.nextUrl.searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user ID" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAccessToken();

    const graphRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        userId
      )}/photo/$value`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!graphRes.ok) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: graphRes.status }
      );
    }

    const buffer = await graphRes.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          graphRes.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Graph photo fetch error:", error);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}