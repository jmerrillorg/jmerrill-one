import { NextRequest, NextResponse } from 'next/server';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID,
    AZURE_GRAPH_SCOPE = 'https://graph.microsoft.com/.default',
    AZURE_GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0',
  } = process.env;

  if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_TENANT_ID) {
    console.warn('Missing Azure credentials in environment variables');
    return NextResponse.json({ error: 'Azure credentials not configured' }, { status: 500 });
  }

  const msalConfig = {
    auth: {
      clientId: AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
      clientSecret: AZURE_CLIENT_SECRET,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  const userId = req.nextUrl.searchParams.get('id');
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const tokenRes = await cca.acquireTokenByClientCredential({
      scopes: [decodeURIComponent(AZURE_GRAPH_SCOPE)],
    });

    const accessToken = tokenRes?.accessToken;
    if (!accessToken) {
      throw new Error('Access token missing');
    }

    const photoUrl = `${AZURE_GRAPH_ENDPOINT}/users/${userId}/photo/$value`;
    const photoRes = await fetch(photoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!photoRes.ok) {
      throw new Error(`Unable to fetch photo: ${photoRes.statusText}`);
    }

    const imageBuffer = await photoRes.arrayBuffer();
    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': photoRes.headers.get('Content-Type') ?? 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error('Photo fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}