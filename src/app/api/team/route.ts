// src/app/api/team/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domainFilter = searchParams.get('domain');
    const jobTitleFilter = searchParams.get('jobTitle');
    const departmentFilter = searchParams.get('department');

    const tenantId = process.env.AZURE_TENANT_ID!;
    const clientId = process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.AZURE_CLIENT_SECRET!;

    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default',
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(`Access token not received: ${JSON.stringify(tokenData)}`);
    }

    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    const allUsers: any[] = [];
    let response = await client
      .api('/users')
      .select('id,displayName,jobTitle,mail,userPrincipalName,mobilePhone,department')
      .top(999)
      .get();

    allUsers.push(...response.value);

    while (response['@odata.nextLink']) {
      response = await client.api(response['@odata.nextLink']).get();
      allUsers.push(...response.value);
    }

    // Optional filters
    const filteredUsers = allUsers.filter((user) => {
      const domainMatch = domainFilter ? user.mail?.toLowerCase().endsWith(domainFilter.toLowerCase()) : true;
      const jobMatch = jobTitleFilter ? user.jobTitle?.toLowerCase().includes(jobTitleFilter.toLowerCase()) : true;
      const deptMatch = departmentFilter ? user.department?.toLowerCase().includes(departmentFilter.toLowerCase()) : true;
      return domainMatch && jobMatch && deptMatch;
    });

    // Append profilePhoto proxy route URL (optional – requires image proxy setup)
    const enrichedUsers = filteredUsers.map(user => ({
      ...user,
      profilePhotoUrl: `/api/team/photo?id=${user.id}`,
    }));

    return NextResponse.json(enrichedUsers);
  } catch (error: any) {
    console.error('Graph API Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}