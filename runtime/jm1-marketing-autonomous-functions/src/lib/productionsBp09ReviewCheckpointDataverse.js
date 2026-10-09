import { ManagedIdentityCredential } from '@azure/identity';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

export function createProductionsReviewCheckpointDataverseAdapter({
  apiBase, getToken, teamId, runtimeUserId, reviewerSystemUserId, reviewerObjectId,
  fetchImpl = fetch, maxPages = 10
}) {
  if (![teamId, runtimeUserId, reviewerSystemUserId, reviewerObjectId].every((id) => GUID.test(id || ''))) {
    throw fail('CHECKPOINT_AUTHORITY_CONFIG_INVALID');
  }
  const etags = new Map();
  const actionsByBinding = new Map();
  const receiptByLead = new Map();

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
      const pluginCode = value?.error?.message?.match(/PRD_CHECKPOINT_[A-Z_]+/)?.[0];
      const code = pluginCode ? pluginCode.replace('PRD_', '') : response.status === 403 ? 'CHECKPOINT_AUTHORITY_DENIED'
        : response.status === 412 ? 'CHECKPOINT_CONCURRENT_MODIFICATION'
          : `CHECKPOINT_DATAVERSE_${response.status}`;
      throw fail(code, response.status);
    }
    return { value, etag: response.headers.get('ETag') || value['@odata.etag'] || null };
  }

  async function callApi(name, body) {
    return request(name, 'POST', body);
  }

  function mapLead(row) {
    const checkpoint = parseCheckpoint(row.checkpoint);
    const version = row.version;
    etags.set(row.leadId.toLowerCase(), version);
    receiptByLead.set(row.leadId.toLowerCase(), row.receiptId.toLowerCase());
    actionsByBinding.set(`${row.receiptId.toLowerCase()}:${row.leadId.toLowerCase()}`, row.actions || []);
    return {
      id: row.leadId,
      brand: row.subject === 'JM1 Website Intake - J Merrill Productions' ? 'JMPRODUCTIONS' : 'OTHER',
      receiptId: row.receiptId,
      ownerId: row.ownerId,
      stateCode: row.stateCode,
      statusCode: row.statusCode,
      acceptedAt: row.acceptedAt || null,
      checkpoint,
      etag: version
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
      const rows = [];
      let pageNumber = 1;
      let moreRecords = true;
      while (moreRecords) {
        if (pageNumber > maxPages) throw fail('CHECKPOINT_SCAN_CAPACITY');
        const { value } = await callApi('jm1_ListProductionsReviewCheckpointCandidates', { PageNumber: pageNumber });
        const page = JSON.parse(value.RowsJson || '[]');
        if (!Array.isArray(page)) throw fail('CHECKPOINT_PROJECTION_INVALID');
        rows.push(...page);
        if (rows.length > limit) throw fail('CHECKPOINT_SCAN_CAPACITY');
        moreRecords = value.MoreRecords === true;
        pageNumber += 1;
      }
      return rows.map((row) => {
        if (GUID.test(row?.receiptId || '') && GUID.test(row?.leadId || '')) {
          receiptByLead.set(row.leadId.toLowerCase(), row.receiptId.toLowerCase());
        }
        return ({
        id: row.receiptId,
        leadId: row.leadId,
        acceptedAt: row.acceptedAt,
        brand: 'JMPRODUCTIONS',
        ownerId: teamId
        });
      });
    },

    async getLead(id) {
      if (!GUID.test(id || '')) throw fail('CHECKPOINT_LEAD_ID_INVALID');
      const receiptId = receiptByLead.get(id.toLowerCase());
      if (!receiptId) throw fail('CHECKPOINT_RECEIPT_BINDING_REQUIRED');
      const { value } = await callApi('jm1_GetProductionsReviewCheckpoint', { LeadId: id, ReceiptId: receiptId });
      const evidence = JSON.parse(value.EvidenceJson || 'null');
      if (!evidence || evidence.leadId?.toLowerCase() !== id.toLowerCase() || evidence.receiptId?.toLowerCase() !== receiptId) {
        throw fail('CHECKPOINT_PROJECTION_INVALID');
      }
      return mapLead(evidence);
    },

    async listReviewerActions({ receiptId, leadId, limit = 10 }) {
      if (!GUID.test(receiptId || '') || !GUID.test(leadId || '')) throw fail('CHECKPOINT_ACTION_BINDING_INVALID');
      const actions = actionsByBinding.get(`${receiptId.toLowerCase()}:${leadId.toLowerCase()}`);
      if (!actions || actions.length > Math.min(limit, 10)) throw fail('CHECKPOINT_ACTION_BINDING_REQUIRED');
      return actions;
    },

    async saveCheckpoint({ receiptId, leadId, checkpoint }) {
      if (!GUID.test(receiptId || '') || !GUID.test(leadId || '') || checkpoint?.receiptId?.toLowerCase() !== receiptId.toLowerCase() ||
          checkpoint?.leadId?.toLowerCase() !== leadId.toLowerCase()) throw fail('CHECKPOINT_WRITE_BINDING_INVALID');
      const expectedVersion = etags.get(leadId.toLowerCase());
      if (!expectedVersion) throw fail('CHECKPOINT_VERSION_REQUIRED');
      const { value } = await callApi('jm1_SaveProductionsReviewCheckpoint', {
        ReceiptId: receiptId, LeadId: leadId, ExpectedVersion: expectedVersion,
        CheckpointJson: JSON.stringify(checkpoint)
      });
      if (typeof value.RowVersion !== 'string' || !value.RowVersion) throw fail('CHECKPOINT_VERSION_READBACK_MISSING');
      etags.set(leadId.toLowerCase(), value.RowVersion);
      const key = `${receiptId.toLowerCase()}:${leadId.toLowerCase()}`;
      if (!actionsByBinding.has(key)) actionsByBinding.set(key, []);
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
