// src/lib/auth.ts
// Centralized Azure Graph OAuth (Client Credentials)
// SWA-safe, Node runtime, no MSAL dependency

export async function getGraphAccessToken(): Promise<string> {
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
    throw new Error("Failed to acquire Graph access token");
  }

  const json = await res.json();
  return json.access_token as string;
}