import { NextRequest, NextResponse } from 'next/server';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = req.nextUrl.searchParams.get('id');
  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const tokenRes = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    const accessToken = tokenRes?.accessToken;
    if (!accessToken) {
      throw new Error('Access token missing');
    }

    const photoRes = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`, {
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
    console.error('Photo fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}