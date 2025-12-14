// src/lib/graphClient.ts
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

// -------------------
// Types
// -------------------
export interface RawService {
  id: string;
  displayName: string;
  defaultDuration?: string;
  price?: number;
  description?: string;
}

export interface CleanService {
  id: string;
  displayName: string;
  defaultDuration?: string;
  price?: number;
  description?: string;
}

export interface RawBusiness {
  id: string;
  displayName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CleanBusiness {
  key: string; // maps back to brand key (publishing, financial, etc.)
  id: string;
  displayName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface GraphError {
  statusCode?: number;
  message?: string;
}

// -------------------
// Business Map
// -------------------
// Maps brand keys (URLs) -> Booking Business IDs from Microsoft Graph
export const businessMap: Record<string, string> = {
  publishing: process.env.BOOKINGS_PUBLISHING_ID || "",
  financial: process.env.BOOKINGS_FINANCIAL_ID || "",
  foundation: process.env.BOOKINGS_FOUNDATION_ID || "",
  jackie: process.env.BOOKINGS_JACKIE_ID || "",
};

// -------------------
// Graph Client Factory
// -------------------
export function getGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// -------------------
// Services
// -------------------
export async function getServices(businessId: string): Promise<RawService[]> {
  const client = getGraphClient(await getAccessToken());
  const result = await client
    .api(`/solutions/bookingBusinesses/${businessId}/services`)
    .get();

  return result.value as RawService[];
}

// -------------------
// Businesses
// -------------------
export async function getBusinesses(): Promise<RawBusiness[]> {
  const client = getGraphClient(await getAccessToken());
  const result = await client.api("/solutions/bookingBusinesses").get();

  return result.value as RawBusiness[];
}

// -------------------
// Access Token
// -------------------
async function getAccessToken(): Promise<string> {
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: process.env.AZURE_GRAPH_SCOPE!,
        grant_type: "client_credentials",
      }),
    }
  );

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}