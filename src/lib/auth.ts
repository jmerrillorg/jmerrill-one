// src/utils/auth.ts
import { ConfidentialClientApplication } from "@azure/msal-node";

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

export async function getAccessToken(): Promise<string | null> {
  try {
    const result = await cca.acquireTokenByClientCredential({
      scopes: [process.env.AZURE_GRAPH_SCOPE || "https://graph.microsoft.com/.default"],
    });
    return result?.accessToken || null;
  } catch (err) {
    console.error("Failed to acquire token:", err);
    return null;
  }
}