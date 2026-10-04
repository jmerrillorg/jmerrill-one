import { createHash } from 'node:crypto';
import { leadId, parseReceipt, receiptId } from './intake.js';
import { classifyProductionsInquiryRetention, productionsInquiryDueAt } from './productionsBp09Retention.js';

const ACTION = 'PRDBP09DispositionV1';
const LEGACY_RECEIPT = '34d724a8-4ed5-418e-a709-b23319448e2f';
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function failure(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

export function dispositionManifestId(receiptId) {
  if (!GUID.test(receiptId)) throw failure('DISPOSITION_RECEIPT_ID_INVALID');
  const hex = createHash('sha256').update(`JM1-PRD-BP09-DISPOSITION-V1:${receiptId.toLowerCase()}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function manifestFor(receipt, state) {
  return {
    version: 1,
    receiptId: receipt.id,
    leadId: receipt.leadReference,
    contactId: receipt.contactReference,
    receivedAt: receipt.receivedAt,
    dueAt: productionsInquiryDueAt(receipt.receivedAt),
    sourceChannel: receipt.channel,
    state
  };
}

function sameManifest(left, right) {
  return ['version', 'receiptId', 'leadId', 'contactId', 'receivedAt', 'dueAt', 'sourceChannel', 'state']
    .every((key) => left?.[key] === right?.[key]);
}

export async function prepareProductionsBp09Disposition({ adapter, id, now = new Date() }) {
  if (!GUID.test(id) || !Number.isFinite(now.getTime())) throw failure('DISPOSITION_INPUT_INVALID');
  const sourceRow = await adapter.request(`/jm1_executionlogs(${id})`);
  const receipt = parseReceipt(sourceRow);
  if (!receipt || sourceRow.jm1_executionstatus !== 835500001 || receipt.id !== id || receiptId(receipt.requestId) !== id ||
      leadId(receipt.requestId) !== receipt.leadReference || receipt.state !== 'COMPLETED' ||
      receipt.finalState !== 'LEAD_CREATED' || receipt.submission?.intent !== 'productions' ||
      receipt.consent?.given !== true || receipt.consent?.purpose !== 'respond_to_inquiry' ||
      receipt.routingDestination !== 'J Merrill Productions' ||
      !GUID.test(receipt.leadReference || '') || !GUID.test(receipt.contactReference || '')) {
    throw failure('DISPOSITION_SOURCE_INVALID');
  }
  const legacy = receipt.id === LEGACY_RECEIPT && receipt.channel === 'jmerrill.one/contact';
  if (!legacy && receipt.channel !== 'jmerrill.productions/contact') return { state: 'SKIPPED_OTHER_CHANNEL' };
  const dueAt = productionsInquiryDueAt(receipt.receivedAt);
  if (now.getTime() < Date.parse(dueAt)) return { state: 'RETAIN', dueAt };
  const lead = await adapter.request(`/leads(${receipt.leadReference})?$select=leadid,_parentcontactid_value,description`);
  const contact = await adapter.request(`/contacts(${receipt.contactReference})?$select=contactid`);
  const marker = `Intake receipt: ${id}`;
  const matches = await adapter.request(`/leads?$select=leadid&$filter=${encodeURIComponent(`contains(description,'${marker}')`)}&$top=2`);
  if (lead?.leadid !== receipt.leadReference || lead._parentcontactid_value !== receipt.contactReference ||
      !lead.description?.includes(marker) || contact?.contactid !== receipt.contactReference ||
      matches?.value?.length !== 1 || matches.value[0].leadid !== receipt.leadReference) {
    throw failure('DISPOSITION_BINDING_INVALID');
  }
  if (!legacy) {
    const classification = classifyProductionsInquiryRetention({ receipt, lead, review: null, now });
    if (classification.state === 'RETAIN') return { state: 'RETAIN', dueAt: classification.manifest.dueAt };
    if (classification.state !== 'REVIEW_REQUIRED') throw failure('DISPOSITION_CLASSIFICATION_INVALID');
  }
  const state = legacy ? 'PENDING_LEGACY_SOURCE_REVIEW' : 'PENDING_PRODUCTIONS_OWNER_REVIEW';
  const manifest = manifestFor(receipt, state);
  if (JSON.stringify(manifest).length > 2000) throw failure('DISPOSITION_MANIFEST_CAPACITY');
  const manifestId = dispositionManifestId(id);
  let row = await adapter.request(`/jm1_executionlogs(${manifestId})`);
  if (!row) {
    try {
      await adapter.request('/jm1_executionlogs', 'POST', {
        jm1_executionlogid: manifestId,
        jm1_name: `Productions BP-09 disposition ${id}`,
        jm1_sourceentity: 'website_intake',
        jm1_sourcerecordid: id,
        jm1_actiontype: ACTION,
        jm1_actiondescription: JSON.stringify(manifest),
        jm1_executionstatus: 835500000,
        jm1_bandlevel: 835500000,
        jm1_startedon: now.toISOString()
      });
    } catch {
      // A timed-out creation can still have committed; read before reporting failure.
    }
    row = await adapter.request(`/jm1_executionlogs(${manifestId})`);
  }
  let stored;
  try { stored = JSON.parse(row?.jm1_actiondescription || ''); } catch { throw failure('DISPOSITION_MANIFEST_INVALID'); }
  if (row?.jm1_executionlogid !== manifestId || row.jm1_actiontype !== ACTION ||
      row.jm1_sourcerecordid !== id || !sameManifest(stored, manifest)) {
    throw failure('DISPOSITION_MANIFEST_CONFLICT');
  }
  return { state, manifestId, manifest: stored };
}

export async function scanProductionsBp09DispositionCandidates({ adapter, now = new Date(), maxPages = 20 }) {
  if (!Number.isFinite(now.getTime()) || !Number.isInteger(maxPages) || maxPages < 1) {
    throw failure('DISPOSITION_SCAN_CONFIG_INVALID');
  }
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  // Include leap-day and end-of-month candidates; per-row classification determines the actual due time.
  cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  const filter = encodeURIComponent(`jm1_actiontype eq 'BP09WebsiteIntakeV2' and jm1_executionstatus eq 835500001 and jm1_startedon le ${cutoff.toISOString()}`);
  let path = `/jm1_executionlogs?$select=jm1_executionlogid,jm1_actiondescription,jm1_actiontype,jm1_startedon&$filter=${filter}&$orderby=jm1_startedon asc&$top=100`;
  const outcomes = [];
  let pages = 0;
  while (path) {
    if (++pages > maxPages) throw failure('DISPOSITION_SCAN_CAPACITY_EXCEEDED');
    const page = await adapter.request(path);
    for (const row of page?.value || []) {
      try {
        const detail = parseReceipt(row);
        if (!detail) throw failure('DISPOSITION_RECEIPT_INVALID');
        if (detail.routingDestination !== 'J Merrill Productions' || detail.submission?.intent !== 'productions') continue;
        outcomes.push({ id: row.jm1_executionlogid,
          ...await prepareProductionsBp09Disposition({ adapter, id: row.jm1_executionlogid, now }) });
      } catch (error) {
        outcomes.push({ id: row.jm1_executionlogid, state: 'FAILED', code: error.code || 'DISPOSITION_UNCLASSIFIED' });
      }
    }
    if (!page?.['@odata.nextLink']) break;
    const next = new URL(page['@odata.nextLink']);
    if (!/\/api\/data\/v\d+\.\d+\/jm1_executionlogs$/.test(next.pathname)) {
      throw failure('DISPOSITION_SCAN_NEXTLINK_INVALID');
    }
    path = `/jm1_executionlogs${next.search}`;
  }
  return outcomes;
}
