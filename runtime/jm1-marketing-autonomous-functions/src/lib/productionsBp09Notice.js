import { createHash } from 'node:crypto';
import { leadId, parseReceipt, receiptId } from './intake.js';

const RELAY = 'https://func-jm1-acs-email-relay.azurewebsites.net';
const AUDIENCE = 'api://84530e9b-2842-4ca6-8fe6-1a11eed051d1/.default';
const DESTINATION = 'productions@jmerrill.one';
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_ATTEMPTS = 3;

function hold(code) {
  const error = new Error(code);
  error.code = code;
  return error;
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
    send: (payload) => request('send-enterprise-governed-email', payload)
  };
}

async function verifiedBinding(adapter, id) {
  if (!GUID.test(id)) throw hold('NOTICE_REFERENCE_INVALID');
  const row = await adapter.request(`/jm1_executionlogs(${id})`);
  const receipt = parseReceipt(row);
  if (!receipt || receipt.id !== id || receiptId(receipt.requestId) !== id ||
      !/^[0-9a-f]{64}$/.test(receipt.digest) || receipt.state !== 'COMPLETED' ||
      receipt.finalState !== 'LEAD_CREATED' || receipt.channel !== 'jmerrill.productions/contact' ||
      receipt.routingDestination !== 'J Merrill Productions' || receipt.submission.intent !== 'productions' ||
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
  const original = { requestId: receipt.requestId, ...receipt.submission,
    message: lead.description.slice(prefix.length),
    ...(receipt.followUpOwnerId ? { followUpOwnerId: receipt.followUpOwnerId } : {}) };
  const digest = createHash('sha256').update(JSON.stringify(original)).digest('hex');
  if (digest !== receipt.digest) throw hold('NOTICE_DIGEST_MISMATCH');
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
  if (mode !== 'probe' && mode !== 'send') return { state: 'OFF' };
  const receipt = await verifiedBinding(adapter, id);
  const payload = payloadFor(receipt);
  const prior = receipt.notice || {};
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
