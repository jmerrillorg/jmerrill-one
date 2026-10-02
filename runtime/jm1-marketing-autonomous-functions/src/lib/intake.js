import { createHash } from 'node:crypto';

export const INTAKE_ACTION = 'BP09WebsiteIntakeV2';
export const INTAKE_STATES = Object.freeze({
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  RETRY_PENDING: 'RETRY_PENDING',
  COMPLETED: 'COMPLETED',
  ESCALATED: 'ESCALATED'
});

const LEAD_INTENTS = new Set(['publishing', 'financial', 'productions']);
const ROUTES = Object.freeze({
  publishing: 'J Merrill Publishing',
  financial: 'J Merrill Financial',
  foundation: 'J Merrill Foundation',
  productions: 'J Merrill Productions',
  general: 'J Merrill One'
});

function guid(kind, value) {
  const hex = createHash('sha256').update(`JM1-BP09-V2:${kind}:${value}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function parseReceipt(row) {
  if (!row || row.jm1_actiontype !== INTAKE_ACTION) return null;
  const detail = JSON.parse(row.jm1_actiondescription || '{}');
  if (detail.version !== 2 || !detail.requestId || !detail.digest || !detail.submission) return null;
  return { ...detail, id: row.jm1_executionlogid };
}

export function receiptId(requestId) {
  return guid('receipt', requestId);
}

export function createIntakeDataverseAdapter({ apiBase, getToken, fetchImpl = fetch }) {
  async function request(path, method = 'GET', body) {
    const response = await fetchImpl(`${apiBase}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'OData-Version': '4.0',
        'OData-MaxVersion': '4.0',
        Prefer: 'return=representation',
        Authorization: `Bearer ${await getToken()}`
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Dataverse ${method} ${path.split('?')[0]} failed: ${response.status}`);
    }
    if (response.status === 204) return {};
    return response.json();
  }
  return { request };
}

async function getById(adapter, set, id) {
  return adapter.request(`/${set}(${id})`);
}

async function createOrRead(adapter, set, id, body) {
  const existing = await getById(adapter, set, id);
  if (existing) return existing;
  try {
    return await adapter.request(`/${set}`, 'POST', body);
  } catch (error) {
    // A timed-out POST may have committed. Never allocate another ID on replay.
    const committed = await getById(adapter, set, id);
    if (committed) return committed;
    throw error;
  }
}

function receiptBody(detail) {
  return {
    jm1_name: `BP-09 Website Intake ${detail.requestId}`,
    jm1_executionlogid: detail.id,
    jm1_sourceentity: 'website_intake',
    jm1_sourcerecordid: detail.requestId,
    jm1_actiontype: INTAKE_ACTION,
    jm1_actiondescription: JSON.stringify(detail),
    jm1_executionstatus: 835500000,
    jm1_bandlevel: 835500000,
    jm1_startedon: detail.receivedAt
  };
}

function assertReceiptFits(detail, maxLength = 2000) {
  if (JSON.stringify(detail).length > maxLength) {
    const error = new Error('Intake receipt exceeds the governed Dataverse field limit.');
    error.code = 'RECEIPT_TOO_LARGE';
    throw error;
  }
}

async function saveReceipt(adapter, detail) {
  assertReceiptFits(detail);
  await adapter.request(`/jm1_executionlogs(${detail.id})`, 'PATCH', {
    jm1_actiondescription: JSON.stringify(detail),
    jm1_executionstatus: detail.state === INTAKE_STATES.COMPLETED ? 835500001 : 835500000,
    ...(detail.state === INTAKE_STATES.COMPLETED ? { jm1_completedon: new Date().toISOString() } : {})
  });
}

export async function acceptIntake(adapter, submission) {
  const requestId = submission.requestId;
  const id = receiptId(requestId);
  const submissionDigest = digest(submission);
  const existing = parseReceipt(await getById(adapter, 'jm1_executionlogs', id));
  if (existing) {
    if (existing.digest !== submissionDigest) {
      const error = new Error('Idempotency key is already bound to another submission.');
      error.code = 'KEY_REUSED';
      throw error;
    }
    return { receipt: existing, replay: true };
  }
  const now = new Date().toISOString();
  const detail = {
    version: 2,
    id,
    requestId,
    idempotencyKey: requestId,
    digest: submissionDigest,
    receivedAt: now,
    channel: 'jmerrill.one/contact',
    consent: { given: true, version: 'JM1-CONTACT-2026-10-02', timestamp: now, purpose: 'respond_to_inquiry' },
    contactReference: null,
    leadReference: null,
    routingDestination: ROUTES[submission.intent],
    state: INTAKE_STATES.RECEIVED,
    lastAttempt: null,
    finalState: null,
    attempts: 0,
    submission
  };
  assertReceiptFits(detail, 1600);
  try {
    await adapter.request('/jm1_executionlogs', 'POST', receiptBody(detail));
    return { receipt: detail, replay: false };
  } catch (error) {
    const committed = parseReceipt(await getById(adapter, 'jm1_executionlogs', id));
    if (committed && committed.digest === submissionDigest) return { receipt: committed, replay: true };
    throw error;
  }
}

async function findContacts(adapter, email) {
  const filter = encodeURIComponent(`emailaddress1 eq '${email.replaceAll("'", "''")}'`);
  const result = await adapter.request(`/contacts?$select=contactid&$filter=${filter}&$top=2`);
  return result?.value || [];
}

export async function processIntake(adapter, id) {
  const detail = parseReceipt(await getById(adapter, 'jm1_executionlogs', id));
  if (!detail) throw new Error('Intake receipt is missing or invalid.');
  if (detail.state === INTAKE_STATES.COMPLETED || detail.state === INTAKE_STATES.ESCALATED) return detail;
  const input = detail.submission;
  detail.state = INTAKE_STATES.PROCESSING;
  detail.lastAttempt = new Date().toISOString();
  detail.attempts += 1;
  await saveReceipt(adapter, detail);
  try {
    const contacts = await findContacts(adapter, input.email);
    if (contacts.length > 1) {
      detail.state = INTAKE_STATES.ESCALATED;
      detail.finalState = 'IDENTITY_RESOLUTION_REQUIRED';
      await saveReceipt(adapter, detail);
      return detail;
    }
    let contactId = contacts[0]?.contactid;
    let contactOwnsMessage = false;
    if (!contactId) {
      contactId = guid('contact-email', input.email);
      const contact = await createOrRead(adapter, 'contacts', contactId, {
        contactid: contactId,
        firstname: input.firstName,
        lastname: input.lastName,
        emailaddress1: input.email,
        telephone1: input.phone || undefined,
        description: LEAD_INTENTS.has(input.intent)
          ? `JM1 website contact. Intake receipt: ${id}`
          : `JM1 website inquiry for ${detail.routingDestination}. Intake receipt: ${id}\n\n${input.message}`
      });
      contactOwnsMessage = !LEAD_INTENTS.has(input.intent) && contact.description?.includes(`Intake receipt: ${id}`);
    }
    detail.contactReference = contactId;
    await saveReceipt(adapter, detail);
    if (LEAD_INTENTS.has(input.intent)) {
      const leadId = guid('lead', detail.requestId);
      await createOrRead(adapter, 'leads', leadId, {
        leadid: leadId,
        subject: `JM1 Website Intake - ${detail.routingDestination}`,
        firstname: input.firstName,
        lastname: input.lastName,
        emailaddress1: input.email,
        telephone1: input.phone || undefined,
        description: `Source: ${input.source || 'Website'}\nIntake receipt: ${id}\n\n${input.message}`,
        'parentcontactid@odata.bind': `/contacts(${contactId})`
      });
      detail.leadReference = leadId;
      await saveReceipt(adapter, detail);
    }
    detail.state = INTAKE_STATES.COMPLETED;
    detail.finalState = LEAD_INTENTS.has(input.intent) ? 'LEAD_CREATED' : 'CONTACT_REVIEW';
    // Retain a message in the receipt only when no business record owns it.
    if (LEAD_INTENTS.has(input.intent) || contactOwnsMessage) detail.submission = { ...input, message: '' };
    await saveReceipt(adapter, detail);
    return detail;
  } catch (error) {
    detail.state = INTAKE_STATES.RETRY_PENDING;
    try { await saveReceipt(adapter, detail); } catch { /* Timer scans stale PROCESSING too. */ }
    throw error;
  }
}

export async function reconcileIntake(adapter, now = new Date(), limit = 50) {
  const cutoff = new Date(now.getTime() - 2 * 60_000).toISOString();
  const filter = encodeURIComponent(`jm1_actiontype eq '${INTAKE_ACTION}' and jm1_executionstatus eq 835500000 and modifiedon lt ${cutoff}`);
  const result = await adapter.request(`/jm1_executionlogs?$select=jm1_executionlogid,jm1_actiondescription,jm1_actiontype&$filter=${filter}&$orderby=modifiedon asc&$top=${limit}`);
  const outcomes = [];
  for (const row of result?.value || []) {
    const receipt = parseReceipt(row);
    if (!receipt || ![INTAKE_STATES.RECEIVED, INTAKE_STATES.PROCESSING, INTAKE_STATES.RETRY_PENDING].includes(receipt.state)) continue;
    try {
      const completed = await processIntake(adapter, receipt.id);
      outcomes.push({ id: receipt.id, state: completed.state });
    } catch {
      outcomes.push({ id: receipt.id, state: INTAKE_STATES.RETRY_PENDING });
    }
  }
  return outcomes;
}
