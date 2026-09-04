import {
  DATAVERSE_CLIENT_ID,
  DATAVERSE_CLIENT_SECRET,
  DATAVERSE_TENANT_ID,
  DATAVERSE_URL,
  DATAVERSE_WEB_API_BASE_URL
} from './config.js';

let cachedToken = null;

export async function getDataverseToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 120000) return cachedToken.accessToken;

  const body = new URLSearchParams({
    client_id: DATAVERSE_CLIENT_ID,
    client_secret: DATAVERSE_CLIENT_SECRET,
    grant_type: 'client_credentials',
    resource: DATAVERSE_URL
  });

  const response = await fetch(`https://login.microsoftonline.com/${DATAVERSE_TENANT_ID}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Dataverse service-principal auth failed: ${response.status} ${json.error || json.error_description || 'unknown'}`);

  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + Number(json.expires_in || 3600) * 1000
  };
  return cachedToken.accessToken;
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
  const response = await dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=EntitySetName`);
  return response.EntitySetName;
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
