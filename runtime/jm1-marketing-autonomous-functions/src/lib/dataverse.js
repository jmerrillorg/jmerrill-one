import {
  DATAVERSE_CLIENT_ID,
  DATAVERSE_CLIENT_SECRET,
  DATAVERSE_AUTH_MODE,
  DATAVERSE_TENANT_ID,
  DATAVERSE_URL,
  DATAVERSE_WEB_API_BASE_URL
} from './config.js';

export const DATAVERSE_ENTITY_SETS = Object.freeze({
  jm1_campaignauthority: 'jm1_campaignauthorities',
  jm1_contentwork: 'jm1_contentworks',
  jm1_creativework: 'jm1_creativeworks',
  jm1_socialexecution: 'jm1_socialexecutions',
  jm1_credentialmonitor: 'jm1_credentialmonitors',
  jm1_marketingexception: 'jm1_marketingexceptions',
  jm1_marketingcontrolloop: 'jm1_marketingcontrolloops',
  jm1_journeyexecution: 'jm1_journeyexecutions',
  jm1_mediaasset: 'jm1_mediaassets',
  jm1pub_titlemarketinghealth: 'jm1pub_titlemarketinghealths',
  jm1pub_productionasset: 'jm1pub_productionassets',
  jm1pub_editorialapprovalgate: 'jm1pub_editorialapprovalgates',
  jm1pub_editorialartifact: 'jm1pub_editorialartifacts',
  jm1pub_title: 'jm1pub_titles',
  jm1_executionlog: 'jm1_executionlogs',
  contact: 'contacts',
  lead: 'leads',
  msdynmkt_journeys: 'msdynmkt_journeys',
  msdynmkt_journeytemplates: 'msdynmkt_journeytemplates',
  msdynmkt_emails: 'msdynmkt_emails',
  msdynmkt_segments: 'msdynmkt_segments',
  msdynmkt_topics: 'msdynmkt_topics',
  msdynmkt_contactpointconsent4: 'msdynmkt_contactpointconsent4s'
});

export function createDataverseTokenProvider({
  mode = DATAVERSE_AUTH_MODE,
  resource = DATAVERSE_URL,
  tenantId = DATAVERSE_TENANT_ID,
  clientId = DATAVERSE_CLIENT_ID,
  clientSecret = DATAVERSE_CLIENT_SECRET,
  fetchImpl = fetch,
  managedCredentialFactory
} = {}) {
  let tokenCache = null;
  let managedCredential = null;
  return async function getToken() {
    if (tokenCache && tokenCache.expiresAt > Date.now() + 120000) return tokenCache.accessToken;
    let token;
    let expiresIn = 3600;
    if (mode === 'system_assigned_managed_identity') {
      if (!resource) throw new Error('Managed identity Dataverse auth requires a resource URL');
      if (!managedCredential) {
        if (managedCredentialFactory) managedCredential = await managedCredentialFactory();
        else {
          const { ManagedIdentityCredential } = await import('@azure/identity');
          managedCredential = new ManagedIdentityCredential();
        }
      }
      const result = await managedCredential.getToken(`${resource}/.default`);
      if (!result?.token) throw new Error('Managed identity Dataverse auth returned no token');
      token = result.token;
      expiresIn = Math.max(1, (result.expiresOnTimestamp - Date.now()) / 1000);
    } else if (mode === 'client_credentials') {
      if (!tenantId || !clientId || !clientSecret) throw new Error('Client-credential Dataverse auth is not configured');
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        resource
      });
      const response = await fetchImpl(`https://login.microsoftonline.com/${tenantId}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`Dataverse service-principal auth failed: ${response.status} ${json.error || json.error_description || 'unknown'}`);
      token = json.access_token;
      expiresIn = Number(json.expires_in || 3600);
    } else {
      throw new Error(`Unsupported Dataverse auth mode: ${mode}`);
    }
    if (!token) throw new Error('Dataverse auth returned no token');
    tokenCache = { accessToken: token, expiresAt: Date.now() + expiresIn * 1000 };
    return token;
  };
}

const getToken = createDataverseTokenProvider();

export async function getDataverseToken() {
  return getToken();
}

export async function dv(path, init = {}, allowFailure = false) {
  const token = await getDataverseToken();
  const response = await fetch(`${DATAVERSE_WEB_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok && allowFailure) return { ok: false, status: response.status, body };
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path} failed: ${response.status} ${body.error?.message || text}`);
  return allowFailure ? { ok: true, status: response.status, body } : body;
}

export async function entitySet(logicalName) {
  const name = DATAVERSE_ENTITY_SETS[logicalName];
  if (!name) throw new Error(`Dataverse entity set is not allowlisted: ${logicalName}`);
  return name;
}

export async function queryByIdempotency(entitySetName, key, select, top = 25) {
  const filter = encodeURIComponent(`jm1_idempotencykey eq '${key}'`);
  const response = await dv(`/${entitySetName}?$select=${select}&$filter=${filter}&$top=${top}`);
  return response.value || [];
}

export async function queryByPrefix(entitySetName, prefix, select, top = 100) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${prefix}')`);
  const response = await dv(`/${entitySetName}?$select=${select}&$filter=${filter}&$top=${top}`);
  return response.value || [];
}

export async function upsertByIdempotency(entitySetName, primaryId, payload) {
  const existing = await queryByIdempotency(entitySetName, payload.jm1_idempotencykey, `${primaryId},jm1_idempotencykey`);
  if (existing.length > 0) {
    await dv(`/${entitySetName}(${existing[0][primaryId]})`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return { id: existing[0][primaryId], created: false };
  }

  const created = await dv(`/${entitySetName}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return { id: created[primaryId] || firstGuid(created), created: true };
}

export async function patchById(entitySetName, id, payload) {
  await dv(`/${entitySetName}(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function safeCount(entitySetName) {
  const response = await dv(`/${entitySetName}?$select=createdon&$top=5000`, {}, true);
  return response.ok ? { available: true, count: response.body.value?.length || 0 } : { available: false, count: null, status: response.status };
}

function firstGuid(value) {
  return Object.values(value).find((item) => typeof item === 'string' && /^[0-9a-f-]{36}$/i.test(item)) || null;
}
