import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = 'https://jm1enterprisedev.crm.dynamics.com/api/data/v9.2';
const token = process.env.DATAVERSE_TOKEN;
if (!token) throw new Error('DATAVERSE_TOKEN is required');
const teamId = '36ee36cf-6ebf-f111-aaaf-6045bdd69435';
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json',
  'Content-Type': 'application/json; charset=utf-8', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0' };
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const text = await response.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: response.status, body: parsed };
}
function ok(result, label) {
  assert.ok(result.status >= 200 && result.status < 300, `${label}: ${JSON.stringify(result)}`);
  return result.body;
}
async function fixture(channel, subject) {
  const leadId = randomUUID();
  const receiptId = randomUUID();
  const detail = {
    version: 2, id: receiptId, requestId: randomUUID(),
    state: 'COMPLETED', channel, routingDestination: channel === 'jmerrill.productions/contact'
      ? 'J Merrill Productions' : 'J Merrill Publishing',
    consent: { given: true, purpose: 'respond_to_inquiry' },
    leadReference: leadId, submission: { intent: channel === 'jmerrill.productions/contact'
      ? 'productions' : 'publishing', firstName: 'Synthetic', lastName: 'Reviewer' },
  };
  ok(await request('/jm1_executionlogs', 'POST', {
    jm1_executionlogid: receiptId, jm1_name: `Synthetic BP09 ${receiptId}`,
    jm1_actiontype: 'BP09WebsiteIntakeV2', jm1_actiondescription: JSON.stringify(detail),
  }), 'receipt create');
  ok(await request('/leads', 'POST', {
    leadid: leadId, subject, firstname: 'Synthetic', lastname: 'Reviewer',
    emailaddress1: 'synthetic-reviewer@example.invalid',
    description: `Source: ${channel}\nIntake receipt: ${receiptId}\n\nSynthetic-only test`,
    jm1_bp09intakereceiptid: receiptId,
    'ownerid@odata.bind': `/teams(${teamId})`,
  }), 'lead create');
  const lead = ok(await request(`/leads(${leadId})?$select=leadid,statuscode,statecode,versionnumber,_ownerid_value`), 'lead read');
  return { leadId, receiptId, version: String(lead.versionnumber) };
}
const own = await fixture('jmerrill.productions/contact', 'JM1 Website Intake - J Merrill Productions');
if (process.argv.includes('--create-only')) {
  console.log(JSON.stringify({ syntheticFixture: own }));
  process.exit(0);
}
const key = randomUUID();
const input = { LeadId: own.leadId, ReceiptId: own.receiptId, IdempotencyKey: key,
  ExpectedVersion: own.version, ActionId: 'ACCEPT_FOR_FOLLOW_UP' };
const wrongAction = await request('/jm1_AcceptProductionsInquiry', 'POST', { ...input, ActionId: 'CONTACTED' });
assert.match(wrongAction.body?.error?.message || '', /PRD_REVIEW_ACTION_DENIED/);
const stale = await request('/jm1_AcceptProductionsInquiry', 'POST', { ...input, ExpectedVersion: '0' });
assert.match(stale.body?.error?.message || '', /PRD_REVIEW_STALE_VERSION/);
const wrongReceipt = await request('/jm1_AcceptProductionsInquiry', 'POST', {
  ...input, ReceiptId: randomUUID(), IdempotencyKey: randomUUID(),
});
assert.ok(wrongReceipt.status >= 400, 'unlinked receipt must fail');
const before = ok(await request(`/leads(${own.leadId})?$select=statuscode`), 'lead before');
assert.equal(before.statuscode, 1);
const accepted = ok(await request('/jm1_AcceptProductionsInquiry', 'POST', input), 'accepted action');
assert.equal(accepted.Outcome, 'ACCEPTED');
const after = ok(await request(`/leads(${own.leadId})?$select=statuscode,statecode`), 'lead after');
assert.equal(after.statuscode, 730000001);
const audit = ok(await request(`/jm1_productionsinquiryactions(${accepted.AuditId})?$select=jm1_leadid,jm1_receiptid,jm1_actionid,jm1_actorid,jm1_outcome,jm1_before,jm1_after`), 'audit read');
assert.equal(audit.jm1_leadid, own.leadId);
assert.equal(audit.jm1_receiptid, own.receiptId);
assert.equal(audit.jm1_actionid, 'ACCEPT_FOR_FOLLOW_UP');
assert.equal(audit.jm1_outcome, 'ACCEPTED');
assert.equal(audit.jm1_before, 'NEW');
assert.equal(audit.jm1_after, 'FOLLOW_UP_REQUIRED');
const replay = ok(await request('/jm1_AcceptProductionsInquiry', 'POST', input), 'replay');
assert.equal(replay.Outcome, 'REPLAY');
assert.equal(replay.AuditId, accepted.AuditId);
const changed = await request('/jm1_AcceptProductionsInquiry', 'POST', { ...input, LeadId: randomUUID() });
assert.match(changed.body?.error?.message || '', /PRD_REVIEW_KEY_REUSED/);

const other = await fixture('jmerrill.one/contact', 'JM1 Website Intake - J Merrill Publishing');
const otherResult = await request('/jm1_AcceptProductionsInquiry', 'POST', {
  LeadId: other.leadId, ReceiptId: other.receiptId, IdempotencyKey: randomUUID(),
  ExpectedVersion: other.version, ActionId: 'ACCEPT_FOR_FOLLOW_UP',
});
assert.match(otherResult.body?.error?.message || '', /PRD_REVIEW_RECEIPT_DENIED/);
const otherAfter = ok(await request(`/leads(${other.leadId})?$select=statuscode`), 'other-brand lead');
assert.equal(otherAfter.statuscode, 1);
console.log(JSON.stringify({ technicalActor: 'admin-only sandbox test', accepted: own,
  auditId: accepted.AuditId, otherBrandDenied: other.leadId,
  cases: ['wrong action', 'stale version', 'unlinked receipt', 'accepted transition',
    'audit readback', 'replay', 'changed-key', 'cross-brand'] }));
