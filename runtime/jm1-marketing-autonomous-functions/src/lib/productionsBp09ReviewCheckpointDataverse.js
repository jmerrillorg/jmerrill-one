import { ManagedIdentityCredential } from '@azure/identity';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUBJECT = 'JM1 Website Intake - J Merrill Productions';
const FIELDS = 'leadid,subject,statecode,statuscode,jm1_bp09intakereceiptid,jm1_bp09receivedat,jm1_bp09reviewcheckpoint,_ownerid_value,versionnumber';

function fail(code, status) {
  const error = new Error(code);
  error.code = code;
  if (status) error.status = status;
  return error;
}

function parseCheckpoint(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { throw fail('CHECKPOINT_LEAD_STATE_INVALID'); }
}

function nextPath(nextLink, apiBase) {
  const url = new URL(nextLink, apiBase);
  if (url.origin !== new URL(apiBase).origin || !url.pathname.startsWith(new URL(apiBase).pathname)) throw fail('CHECKPOINT_NEXTLINK_INVALID');
  return `${url.pathname.slice(new URL(apiBase).pathname.length)}${url.search}`;
}

export function createProductionsReviewCheckpointDataverseAdapter({
  apiBase, getToken, teamId, runtimeUserId, reviewerSystemUserId, reviewerObjectId,
  fetchImpl = fetch, maxPages = 10
}) {
  if (![teamId, runtimeUserId, reviewerSystemUserId, reviewerObjectId].every((id) => GUID.test(id || ''))) {
    throw fail('CHECKPOINT_AUTHORITY_CONFIG_INVALID');
  }
  const etags = new Map();

  async function request(path, method = 'GET', body, headers = {}) {
    const response = await fetchImpl(`${apiBase}/${path.replace(/^\//, '')}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'OData-Version': '4.0',
        'OData-MaxVersion': '4.0',
        Authorization: `Bearer ${await getToken()}`,
        ...headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    const text = await response.text();
    let value = {};
    try { value = text ? JSON.parse(text) : {}; } catch { value = {}; }
    if (!response.ok) {
      const code = response.status === 403 ? 'CHECKPOINT_AUTHORITY_DENIED'
        : response.status === 412 ? 'CHECKPOINT_CONCURRENT_MODIFICATION'
          : `CHECKPOINT_DATAVERSE_${response.status}`;
      throw fail(code, response.status);
    }
    return { value, etag: response.headers.get('ETag') || value['@odata.etag'] || null };
  }

  async function allPages(path, pageLimit = maxPages) {
    const rows = [];
    for (let page = 0; path; page++) {
      if (page >= pageLimit) throw fail('CHECKPOINT_SCAN_CAPACITY');
      const result = await request(path);
      rows.push(...(result.value.value || []));
      path = result.value['@odata.nextLink'] ? nextPath(result.value['@odata.nextLink'], apiBase) : null;
    }
    return rows;
  }

  function mapLead(row) {
    const checkpoint = parseCheckpoint(row.jm1_bp09reviewcheckpoint);
    const etag = row['@odata.etag'];
    etags.set(row.leadid.toLowerCase(), etag);
    return {
      id: row.leadid,
      brand: row.subject === SUBJECT ? 'JMPRODUCTIONS' : 'OTHER',
      receiptId: row.jm1_bp09intakereceiptid,
      ownerId: row._ownerid_value,
      stateCode: row.statecode,
      statusCode: row.statuscode,
      acceptedAt: row.jm1_bp09receivedat || null,
      checkpoint,
      etag
    };
  }

  return {
    teamId: teamId.toLowerCase(),
    runtimeUserId: runtimeUserId.toLowerCase(),
    reviewerSystemUserId: reviewerSystemUserId.toLowerCase(),
    reviewerObjectId: reviewerObjectId.toLowerCase(),

    async authorityCheck() {
      const { value } = await request('WhoAmI()');
      return value.UserId?.toLowerCase() === runtimeUserId.toLowerCase();
    },

    async listPendingReceipts({ limit = 100 } = {}) {
      const filter = encodeURIComponent(`_ownerid_value eq ${teamId} and subject eq '${SUBJECT}' and jm1_bp09intakereceiptid ne null and statecode eq 0`);
      const pageSize = Math.min(limit, 100);
      const rows = await allPages(`leads?$select=${FIELDS}&$filter=${filter}&$orderby=createdon asc&$top=${pageSize}`, Math.ceil(limit / pageSize));
      if (rows.length > limit) throw fail('CHECKPOINT_SCAN_CAPACITY');
      return rows.map(mapLead).map((lead) => ({
        id: lead.receiptId,
        leadId: lead.id,
        acceptedAt: lead.acceptedAt,
        brand: lead.brand,
        ownerId: lead.ownerId,
        checkpoint: lead.checkpoint
      }));
    },

    async getLead(id) {
      if (!GUID.test(id || '')) throw fail('CHECKPOINT_LEAD_ID_INVALID');
      const { value } = await request(`leads(${id})?$select=${FIELDS}`);
      return mapLead(value);
    },

    async listReviewerActions({ receiptId, leadId, limit = 10 }) {
      if (!GUID.test(receiptId || '') || !GUID.test(leadId || '')) throw fail('CHECKPOINT_ACTION_BINDING_INVALID');
      const filter = encodeURIComponent(`jm1_receiptid eq '${receiptId}' and jm1_leadid eq '${leadId}'`);
      const select = 'jm1_productionsinquiryactionid,jm1_receiptid,jm1_leadid,jm1_actionid,jm1_outcome,jm1_before,jm1_after,jm1_actorid,jm1_actorobjectid,jm1_key,createdon,_createdby_value';
      const { value } = await request(`jm1_productionsinquiryactions?$select=${select}&$filter=${filter}&$orderby=createdon asc&$top=${Math.min(limit, 10)}`);
      if (value['@odata.nextLink']) throw fail('CHECKPOINT_ACTION_SCAN_CAPACITY');
      return (value.value || []).map((row) => ({
        id: row.jm1_productionsinquiryactionid,
        receiptId: row.jm1_receiptid,
        leadId: row.jm1_leadid,
        actionId: row.jm1_actionid,
        outcome: row.jm1_outcome,
        before: row.jm1_before,
        after: row.jm1_after,
        actorUserId: row.jm1_actorid?.toLowerCase(),
        actorObjectId: row.jm1_actorobjectid?.toLowerCase(),
        idempotencyKey: row.jm1_key,
        recordedAt: row.createdon,
        recordingActorId: row._createdby_value?.toLowerCase() || null
      }));
    },

    async saveCheckpoint({ leadId, checkpoint }) {
      if (!GUID.test(leadId || '') || checkpoint?.leadId?.toLowerCase() !== leadId.toLowerCase()) throw fail('CHECKPOINT_WRITE_BINDING_INVALID');
      const etag = etags.get(leadId.toLowerCase());
      if (!etag) throw fail('CHECKPOINT_ETAG_REQUIRED');
      const result = await request(`leads(${leadId})`, 'PATCH', {
        jm1_bp09reviewcheckpoint: JSON.stringify(checkpoint)
      }, { 'If-Match': etag, Prefer: 'return=representation' });
      if (result.etag) etags.set(leadId.toLowerCase(), result.etag);
      else await this.getLead(leadId);
    }
  };
}

export function createManagedIdentityTokenProvider({ resourceUrl, credential } = {}) {
  if (!resourceUrl) throw fail('CHECKPOINT_DATAVERSE_RESOURCE_MISSING');
  const managedIdentity = credential || new ManagedIdentityCredential();
  return async () => {
    const result = await managedIdentity.getToken(`${resourceUrl.replace(/\/$/, '')}/.default`);
    if (!result?.token) throw fail('CHECKPOINT_MI_TOKEN_UNAVAILABLE');
    return result.token;
  };
}
