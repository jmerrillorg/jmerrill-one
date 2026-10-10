import { createHash } from 'node:crypto';
import { leadId, parseReceipt, receiptId } from './intake.js';

const RELAY = 'https://func-jm1-acs-email-relay.azurewebsites.net';
const AUDIENCE = 'api://84530e9b-2842-4ca6-8fe6-1a11eed051d1/.default';
const DESTINATION = 'productions@jmerrill.one';
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DATAVERSE_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const MAX_ATTEMPTS = 3;

function hold(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function digestMatches(receipt, message) {
  const stored = Object.entries(receipt.submission).map(([key, value]) => [key, key === 'message' ? message : value]);
  for (let requestPosition = 0; requestPosition <= stored.length; requestPosition++) {
    const withRequest = [...stored];
    withRequest.splice(requestPosition, 0, ['requestId', receipt.requestId]);
    const ownerPositions = receipt.followUpOwnerId ? withRequest.length + 1 : 1;
    for (let ownerPosition = 0; ownerPosition < ownerPositions; ownerPosition++) {
      const entries = [...withRequest];
      if (receipt.followUpOwnerId) entries.splice(ownerPosition, 0, ['followUpOwnerId', receipt.followUpOwnerId]);
      const teamPositions = receipt.followUpTeamId ? entries.length + 1 : 1;
      for (let teamPosition = 0; teamPosition < teamPositions; teamPosition++) {
        const withTeam = [...entries];
        if (receipt.followUpTeamId) withTeam.splice(teamPosition, 0, ['followUpTeamId', receipt.followUpTeamId]);
        const candidate = createHash('sha256').update(JSON.stringify(Object.fromEntries(withTeam))).digest('hex');
        if (candidate === receipt.digest) return true;
      }
    }
  }
  return false;
}

export function createProductionsRelay({ fetchImpl = fetch, credential } = {}) {
  let managedCredential = credential;
  async function request(route, payload) {
    if (!managedCredential) {
      const { ManagedIdentityCredential } = await import('@azure/identity');
      managedCredential = new ManagedIdentityCredential();
    }
    const token = await managedCredential.getToken(AUDIENCE);
    if (!token?.token) throw hold('RELAY_TOKEN_UNAVAILABLE');
    const response = await fetchImpl(`${RELAY}/api/${route}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { status: response.status, body: await response.json().catch(() => ({})) };
  }
  return {
    probe: (payload) => request('relay-authority-probe', payload),
    send: (payload) => request('send-enterprise-governed-email', payload),
    lookup: (payload) => request('lookup-productions-review-notice', payload)
  };
}

export function createProductionsReviewCheckpointNotifier(relay) {
  const templates = {
    OVERDUE: 'PRODUCTIONS.BP09_REVIEW_OVERDUE',
    RESOLVED: 'PRODUCTIONS.BP09_REVIEW_RESOLVED'
  };
  function payloadFor({ type, receiptId, leadId, transitionId, eventId }) {
    const templateId = templates[type];
    const expectedKey = `bp09:productions:review:${type?.toLowerCase()}:${receiptId}:${transitionId}`;
    if (!templateId || !GUID.test(receiptId || '') || !GUID.test(leadId || '') ||
        !DATAVERSE_GUID.test(transitionId || '') || eventId !== expectedKey) throw hold('CHECKPOINT_NOTICE_INPUT_INVALID');
    return {
      brand: 'JMPRODUCTIONS', to: DESTINATION, templateId, templateVersion: '1.0.0',
      idempotencyKey: eventId, templateData: { referenceId: receiptId, leadId, transitionId }
    };
  }
  async function send({ type, receiptId, leadId, transitionId, eventId }) {
    const payload = payloadFor({ type, receiptId, leadId, transitionId, eventId });
    const { templateId } = payload;
    const authority = await relay.probe(payload);
    if (authority.status !== 200 || authority.body.authorized !== true || authority.body.noSend !== true ||
        authority.body.callerId !== 'one-bp09-productions-prod' || authority.body.brand !== 'JMPRODUCTIONS' ||
        authority.body.templateId !== templateId || authority.body.templateVersion !== '1.0.0' ||
        authority.body.recipient !== DESTINATION || authority.body.idempotencyKey !== eventId) throw hold('CHECKPOINT_NOTICE_AUTHORITY_DENIED');
    const result = await relay.send(payload);
    if (![200, 202].includes(result.status) || result.body.accepted !== true ||
        result.body.deliveryState !== 'ACCEPTED' || !result.body.jm1MessageId ||
        !GUID.test(result.body.jm1MessageId) ||
        result.body.recipient !== DESTINATION || result.body.idempotencyKey !== eventId) throw hold('CHECKPOINT_NOTICE_ACCEPTANCE_UNPROVEN');
    return { accepted: true, receiptId: result.body.jm1MessageId, idempotencyKey: eventId,
      recipient: DESTINATION, privacySafe: true };
  }
  async function getDelivery({ type, receiptId, leadId, transitionId, eventId, relayReceiptId }) {
    if (!GUID.test(relayReceiptId || '')) return { state: 'UNKNOWN', retryAuthorized: false };
    const envelope = payloadFor({ type, receiptId, leadId, transitionId, eventId });
    const result = await relay.lookup({ ...envelope, receiptId: relayReceiptId });
    if (result.status === 200 && exactKeys(result.body, ['status', 'receiptId', 'providerMessageId', 'acceptedAt', 'deliveryEvidenceAvailable', 'retryAuthorized']) &&
        result.body.status === 'accepted' &&
        result.body.receiptId === relayReceiptId && typeof result.body.providerMessageId === 'string' &&
        result.body.providerMessageId.length > 0 && ISO_INSTANT.test(result.body.acceptedAt || '') && Number.isFinite(Date.parse(result.body.acceptedAt)) &&
        result.body.deliveryEvidenceAvailable === false && result.body.retryAuthorized === false) {
      return { state: 'ACCEPTED', receiptId: relayReceiptId, providerMessageId: result.body.providerMessageId,
        acceptedAt: result.body.acceptedAt, retryAuthorized: false, deliveryEvidenceAvailable: false };
    }
    if (result.status === 200 && exactKeys(result.body, ['status', 'receiptId', 'failedAt', 'retryAuthorized']) &&
        result.body.status === 'failed' && result.body.receiptId === relayReceiptId &&
        ISO_INSTANT.test(result.body.failedAt || '') && Number.isFinite(Date.parse(result.body.failedAt)) && result.body.retryAuthorized === false) {
      return { state: 'FAILED', receiptId: relayReceiptId, failedAt: result.body.failedAt, retryAuthorized: false };
    }
    const unknownKeys = result.body?.code ? ['status', 'code', 'retryAuthorized'] : ['status', 'retryAuthorized'];
    const codeMatchesStatus = result.status === 200 || result.status === 503 && !result.body?.code ||
      result.status === 403 && result.body?.code === 'LOOKUP_CALLER_DENIED' ||
      result.status === 400 && ['LOOKUP_REQUEST_INVALID', 'LOOKUP_RECEIPT_REQUIRED'].includes(result.body?.code);
    if ([200, 400, 403, 503].includes(result.status) && exactKeys(result.body, unknownKeys) && codeMatchesStatus &&
        result.body.status === 'unknown' && result.body.retryAuthorized === false) {
      return { state: 'UNKNOWN', retryAuthorized: false };
    }
    throw hold('CHECKPOINT_NOTICE_LOOKUP_RESPONSE_INVALID');
  }
  return { send, getDelivery };
}

async function verifiedBinding(adapter, id) {
  if (!GUID.test(id)) throw hold('NOTICE_REFERENCE_INVALID');
  const row = await adapter.request(`/jm1_executionlogs(${id})`);
  const receipt = parseReceipt(row);
  if (!receipt || receipt.id !== id || receiptId(receipt.requestId) !== id ||
      !/^[0-9a-f]{64}$/.test(receipt.digest) || receipt.state !== 'COMPLETED' ||
      receipt.finalState !== 'LEAD_CREATED' || receipt.channel !== 'jmerrill.productions/contact' ||
      receipt.routingDestination !== 'J Merrill Productions' || receipt.submission.intent !== 'productions' ||
      receipt.consent?.given !== true || receipt.consent?.purpose !== 'respond_to_inquiry' ||
      receipt.submission.message !== '' || !GUID.test(receipt.leadReference || '') ||
      !GUID.test(receipt.contactReference || '') || leadId(receipt.requestId) !== receipt.leadReference) {
    throw hold('NOTICE_SOURCE_NOT_ELIGIBLE');
  }
  const lead = await adapter.request(`/leads(${receipt.leadReference})?$select=leadid,_parentcontactid_value,description,subject`);
  const contact = await adapter.request(`/contacts(${receipt.contactReference})?$select=contactid`);
  const marker = `Intake receipt: ${id}`;
  const prefix = `Source: ${receipt.submission.source || 'Website'}\n${marker}\n\n`;
  if (lead?.leadid !== receipt.leadReference || lead._parentcontactid_value !== receipt.contactReference ||
      lead.subject !== 'JM1 Website Intake - J Merrill Productions' || !lead.description?.startsWith(prefix) ||
      !lead.description.slice(prefix.length).trim() ||
      contact?.contactid !== receipt.contactReference) throw hold('NOTICE_BINDING_MISMATCH');
  if (!digestMatches(receipt, lead.description.slice(prefix.length))) throw hold('NOTICE_DIGEST_MISMATCH');
  const filter = encodeURIComponent(`contains(description,'${marker}')`);
  const matches = await adapter.request(`/leads?$select=leadid&$filter=${filter}&$top=2`);
  if (matches?.value?.length !== 1 || matches.value[0].leadid !== receipt.leadReference) {
    throw hold('NOTICE_LEAD_NOT_UNIQUE');
  }
  return receipt;
}

function payloadFor(receipt) {
  return {
    brand: 'JMPRODUCTIONS',
    to: DESTINATION,
    templateId: 'PRODUCTIONS.BP09_NOTICE',
    templateVersion: '1.0.0',
    templateData: { referenceId: receipt.id, leadId: receipt.leadReference }
  };
}

function probeAccepted(result, id) {
  return result.status === 200 && result.body.authorized === true && result.body.noSend === true &&
    result.body.callerId === 'one-bp09-productions-prod' && result.body.brand === 'JMPRODUCTIONS' &&
    result.body.templateId === 'PRODUCTIONS.BP09_NOTICE' && result.body.templateVersion === '1.0.0' &&
    result.body.recipient === DESTINATION && result.body.referenceId === id &&
    result.body.idempotencyKey === `bp09:productions:notice:${id}`;
}

async function saveNotice(adapter, receipt, notice) {
  const detail = { ...receipt, notice };
  if (JSON.stringify(detail).length > 2000) throw hold('NOTICE_RECEIPT_CAPACITY');
  await adapter.request(`/jm1_executionlogs(${receipt.id})`, 'PATCH', {
    jm1_actiondescription: JSON.stringify(detail)
  });
  return detail;
}

export async function reconcileProductionsBp09Notice({ adapter, relay, id, mode, now = new Date() }) {
  if (!['probe', 'send', 'replay'].includes(mode)) return { state: 'OFF' };
  const receipt = await verifiedBinding(adapter, id);
  const payload = payloadFor(receipt);
  const prior = receipt.notice || {};
  if (mode === 'replay') {
    if (prior.state !== 'PROVIDER_ACCEPTED' || !prior.relayMessageId || !prior.providerMessageId) {
      throw hold('NOTICE_REPLAY_NOT_READY');
    }
    if (prior.replayState === 'VERIFIED') return { state: 'REPLAY_VERIFIED' };
    if (prior.replayState === 'ATTEMPTING' || prior.replayState === 'HELD') {
      return { state: 'HELD', code: 'NOTICE_REPLAY_RECONCILIATION_REQUIRED', newlyHeld: false };
    }
    const probe = await relay.probe(payload);
    if (!probeAccepted(probe, id)) throw hold('NOTICE_PROBE_DENIED');
    const started = await saveNotice(adapter, receipt, { ...prior, replayState: 'ATTEMPTING' });
    let result;
    try {
      result = await relay.send(payload);
    } catch {
      await saveNotice(adapter, started, { ...prior, replayState: 'HELD' });
      return { state: 'HELD', code: 'NOTICE_REPLAY_UNCERTAIN', newlyHeld: true };
    }
    if (result.status !== 200 || result.body.accepted !== true || result.body.replay !== true ||
        result.body.deliveryState !== 'ACCEPTED' || result.body.jm1MessageId !== prior.relayMessageId ||
        result.body.providerMessageId !== prior.providerMessageId) {
      await saveNotice(adapter, started, { ...prior, replayState: 'HELD' });
      return { state: 'HELD', code: 'NOTICE_REPLAY_MISMATCH', newlyHeld: true };
    }
    await saveNotice(adapter, started, { ...prior, replayState: 'VERIFIED' });
    return { state: 'REPLAY_VERIFIED' };
  }
  if (prior.state === 'PROVIDER_ACCEPTED') return { state: prior.state, relayMessageId: prior.relayMessageId };
  if (prior.state === 'HELD' || prior.state === 'FAILED') return { state: prior.state, code: prior.code, newlyHeld: false };
  if (mode === 'probe') {
    const result = await relay.probe(payload);
    if (!probeAccepted(result, id)) throw hold('NOTICE_PROBE_DENIED');
    return { state: 'PROBE_OK' };
  }
  if ((prior.attempts || 0) >= MAX_ATTEMPTS) {
    await saveNotice(adapter, receipt, { ...prior, state: 'HELD', code: 'NOTICE_ATTEMPTS_EXHAUSTED' });
    return { state: 'HELD', code: 'NOTICE_ATTEMPTS_EXHAUSTED', newlyHeld: true };
  }
  if (prior.nextAt && Date.parse(prior.nextAt) > now.getTime()) return { state: 'WAITING' };
  const probe = await relay.probe(payload);
  if (!probeAccepted(probe, id)) throw hold('NOTICE_PROBE_DENIED');
  const attempt = (prior.attempts || 0) + 1;
  const started = await saveNotice(adapter, receipt, {
    state: 'ATTEMPTING', attempts: attempt,
    nextAt: new Date(now.getTime() + attempt * 5 * 60_000).toISOString()
  });
  let result;
  try {
    result = await relay.send(payload);
  } catch {
    await saveNotice(adapter, started, { state: 'HELD', attempts: attempt, code: 'NOTICE_SEND_UNCERTAIN' });
    return { state: 'HELD', code: 'NOTICE_SEND_UNCERTAIN', newlyHeld: true };
  }
  if ((result.status === 200 || result.status === 202) && result.body.accepted === true &&
      result.body.deliveryState === 'ACCEPTED' && result.body.jm1MessageId && result.body.providerMessageId &&
      (!result.body.callerId || result.body.callerId === 'one-bp09-productions-prod') &&
      (!result.body.brand || result.body.brand === 'JMPRODUCTIONS') &&
      (!result.body.sourceRecord || result.body.sourceRecord === id)) {
    await saveNotice(adapter, started, {
      state: 'PROVIDER_ACCEPTED', attempts: attempt,
      relayMessageId: result.body.jm1MessageId, providerMessageId: result.body.providerMessageId
    });
    return { state: 'PROVIDER_ACCEPTED', relayMessageId: result.body.jm1MessageId };
  }
  const code = result.status === 409 ? 'NOTICE_RELAY_CONFLICT'
    : result.body.inProgress ? 'NOTICE_RELAY_UNCERTAIN' : 'NOTICE_RELAY_REJECTED';
  await saveNotice(adapter, started, { state: 'HELD', attempts: attempt, code });
  return { state: 'HELD', code, newlyHeld: true };
}

function nextReceiptPath(nextLink) {
  const url = new URL(nextLink);
  const path = url.pathname.match(/\/api\/data\/v\d+\.\d+(\/jm1_executionlogs)$/);
  if (!path) throw hold('NOTICE_SCAN_NEXTLINK_INVALID');
  return `${path[1]}${url.search}`;
}

export async function reconcileProductionsBp09Notices({ adapter, relay, startAt, now = new Date(), maxPages = 20 }) {
  const start = Date.parse(startAt);
  if (!Number.isFinite(start) || new Date(start).toISOString() !== startAt || maxPages < 1) {
    throw hold('NOTICE_CONTINUOUS_CONFIG_INVALID');
  }
  const filter = encodeURIComponent(`jm1_actiontype eq 'BP09WebsiteIntakeV2' and jm1_executionstatus eq 835500001 and jm1_startedon ge ${startAt}`);
  let path = `/jm1_executionlogs?$select=jm1_executionlogid,jm1_actiondescription,jm1_actiontype,jm1_startedon&$filter=${filter}&$orderby=jm1_startedon asc&$top=100`;
  const outcomes = [];
  let pages = 0;
  while (path) {
    if (++pages > maxPages) throw hold('NOTICE_SCAN_CAPACITY_EXCEEDED');
    const page = await adapter.request(path);
    for (const row of page?.value || []) {
      let receipt;
      try {
        receipt = parseReceipt(row);
      } catch {
        outcomes.push({ id: row.jm1_executionlogid, state: 'FAILED', code: 'NOTICE_RECEIPT_INVALID' });
        continue;
      }
      if (!receipt || !Number.isFinite(Date.parse(receipt.receivedAt))) {
        outcomes.push({ id: row.jm1_executionlogid, state: 'FAILED', code: 'NOTICE_RECEIPT_INVALID' });
        continue;
      }
      if (Date.parse(receipt.receivedAt) < start || receipt.channel !== 'jmerrill.productions/contact' ||
          receipt.routingDestination !== 'J Merrill Productions' || receipt.submission.intent !== 'productions') continue;
      if (receipt.state !== 'COMPLETED' || receipt.finalState !== 'LEAD_CREATED') {
        outcomes.push({ id: receipt.id, state: 'FAILED', code: 'NOTICE_RECEIPT_STATE_MISMATCH' });
        continue;
      }
      if (receipt.notice?.state === 'PROVIDER_ACCEPTED') continue;
      try {
        const result = await reconcileProductionsBp09Notice({ adapter, relay, id: receipt.id, mode: 'send', now });
        const overdue = result.state !== 'PROVIDER_ACCEPTED' && now.getTime() - Date.parse(receipt.receivedAt) > 15 * 60_000;
        outcomes.push({ id: receipt.id, state: overdue && result.state === 'WAITING' ? 'OVERDUE' : result.state,
          code: result.code || (overdue ? 'NOTICE_OVERDUE' : null) });
      } catch (error) {
        outcomes.push({ id: receipt.id, state: 'FAILED', code: error.code || 'NOTICE_UNCLASSIFIED' });
      }
    }
    path = page?.['@odata.nextLink'] ? nextReceiptPath(page['@odata.nextLink']) : null;
  }
  return outcomes;
}
