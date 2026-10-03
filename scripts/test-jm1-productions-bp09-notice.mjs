import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { leadId, receiptId } from '../runtime/jm1-marketing-autonomous-functions/src/lib/intake.js';
import { reconcileProductionsBp09Notice } from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09Notice.js';

function fixture(overrides = {}) {
  const requestId = randomUUID();
  const id = receiptId(requestId);
  const linkedLead = leadId(requestId);
  const contactId = randomUUID();
  const submission = { intent: 'productions', firstName: 'Synthetic', lastName: 'Visitor',
    email: 'synthetic@example.invalid', phone: '', message: 'Synthetic body',
    source: 'jmerrill.productions/contact', sourceUrl: 'https://jmerrill.productions/contact' };
  const digest = createHash('sha256').update(JSON.stringify({ requestId, ...submission })).digest('hex');
  const detail = {
    version: 2, id, requestId, digest,
    state: 'COMPLETED', finalState: 'LEAD_CREATED',
    channel: 'jmerrill.productions/contact', routingDestination: 'J Merrill Productions',
    leadReference: linkedLead, contactReference: contactId,
    submission: { ...submission, message: '' }, ...overrides
  };
  const receipt = { jm1_executionlogid: id, jm1_actiontype: 'BP09WebsiteIntakeV2', jm1_actiondescription: JSON.stringify(detail) };
  const lead = { leadid: linkedLead, _parentcontactid_value: contactId,
    subject: 'JM1 Website Intake - J Merrill Productions',
    description: `Source: jmerrill.productions/contact\nIntake receipt: ${id}\n\nSynthetic body` };
  const contact = { contactid: contactId };
  let duplicate = false;
  let failFinalPatch = false;
  const adapter = {
    async request(path, method = 'GET', body) {
      if (path.startsWith('/jm1_executionlogs(')) {
        if (method === 'PATCH') {
          if (failFinalPatch && JSON.parse(body.jm1_actiondescription).notice?.state === 'PROVIDER_ACCEPTED') {
            failFinalPatch = false;
            throw new Error('lost receipt patch');
          }
          receipt.jm1_actiondescription = body.jm1_actiondescription;
          return {};
        }
        return receipt;
      }
      if (path.startsWith('/leads?')) return { value: duplicate ? [lead, { leadid: randomUUID() }] : [lead] };
      if (path.startsWith('/leads(')) return lead;
      if (path.startsWith('/contacts(')) return contact;
      throw new Error(`Unexpected ${method} ${path}`);
    }
  };
  const calls = { probe: [], send: [] };
  const relay = {
    async probe(payload) {
      calls.probe.push(payload);
      return { status: 200, body: { authorized: true, noSend: true, callerId: 'one-bp09-productions-prod',
        brand: 'JMPRODUCTIONS', templateId: 'PRODUCTIONS.BP09_NOTICE', templateVersion: '1.0.0',
        recipient: 'productions@jmerrill.one', referenceId: id,
        idempotencyKey: `bp09:productions:notice:${id}` } };
    },
    async send(payload) {
      calls.send.push(payload);
      return { status: 202, body: { accepted: true, deliveryState: 'ACCEPTED',
        jm1MessageId: randomUUID(), providerMessageId: randomUUID() } };
    }
  };
  return { id, receipt, lead, contact, adapter, relay, calls,
    duplicate: () => { duplicate = true; }, failFinalPatch: () => { failFinalPatch = true; } };
}

const baseline = fixture();
assert.deepEqual(await reconcileProductionsBp09Notice({ ...baseline, mode: 'off' }), { state: 'OFF' });
assert.equal(baseline.calls.probe.length, 0);
assert.equal((await reconcileProductionsBp09Notice({ ...baseline, mode: 'probe' })).state, 'PROBE_OK');
assert.equal(baseline.calls.send.length, 0);
const first = await reconcileProductionsBp09Notice({ ...baseline, mode: 'send' });
assert.equal(first.state, 'PROVIDER_ACCEPTED');
assert.equal(baseline.calls.send.length, 1);
assert.deepEqual(Object.keys(baseline.calls.send[0]).sort(), ['brand', 'templateData', 'templateId', 'templateVersion', 'to']);
assert.equal(baseline.calls.send[0].to, 'productions@jmerrill.one');
assert.deepEqual(baseline.calls.send[0].templateData, { referenceId: baseline.id, leadId: baseline.lead.leadid });
assert.equal(JSON.stringify(baseline.calls.send[0]).includes('Synthetic body'), false);
assert.equal((await reconcileProductionsBp09Notice({ ...baseline, mode: 'send' })).state, 'PROVIDER_ACCEPTED');
assert.equal(baseline.calls.send.length, 1);
assert.equal(JSON.parse(baseline.receipt.jm1_actiondescription).notice.providerMessageId.length, 36);

for (const override of [
  { channel: 'jmerrill.one/contact' }, { routingDestination: 'J Merrill Publishing' },
  { leadReference: randomUUID() }, { state: 'RETRY_PENDING' }
]) {
  const denied = fixture(override);
  await assert.rejects(() => reconcileProductionsBp09Notice({ ...denied, mode: 'send' }), /NOTICE_SOURCE_NOT_ELIGIBLE/);
  assert.equal(denied.calls.probe.length, 0);
  assert.equal(denied.calls.send.length, 0);
}

const duplicate = fixture();
duplicate.duplicate();
await assert.rejects(() => reconcileProductionsBp09Notice({ ...duplicate, mode: 'send' }), /NOTICE_LEAD_NOT_UNIQUE/);
assert.equal(duplicate.calls.send.length, 0);

const uncertain = fixture();
uncertain.relay.send = async (payload) => { uncertain.calls.send.push(payload); throw new Error('lost transport response'); };
assert.deepEqual(await reconcileProductionsBp09Notice({ ...uncertain, mode: 'send' }),
  { state: 'HELD', code: 'NOTICE_SEND_UNCERTAIN', newlyHeld: true });
assert.equal((await reconcileProductionsBp09Notice({ ...uncertain, mode: 'send' })).state, 'HELD');
assert.equal(uncertain.calls.send.length, 1);

const conflict = fixture();
conflict.relay.send = async (payload) => { conflict.calls.send.push(payload); return { status: 409, body: { code: 'IDEMPOTENCY_KEY_CONFLICT' } }; };
assert.equal((await reconcileProductionsBp09Notice({ ...conflict, mode: 'send' })).code, 'NOTICE_RELAY_CONFLICT');
assert.equal(conflict.calls.send.length, 1);

const deniedProbe = fixture();
deniedProbe.relay.probe = async () => ({ status: 403, body: { authorized: false } });
await assert.rejects(() => reconcileProductionsBp09Notice({ ...deniedProbe, mode: 'send' }), /NOTICE_PROBE_DENIED/);
assert.equal(deniedProbe.calls.send.length, 0);

const postWrite = fixture();
postWrite.failFinalPatch();
await assert.rejects(() => reconcileProductionsBp09Notice({ ...postWrite, mode: 'send' }), /lost receipt patch/);
assert.equal(postWrite.calls.send.length, 1);
const next = new Date(Date.now() + 6 * 60_000);
assert.equal((await reconcileProductionsBp09Notice({ ...postWrite, mode: 'send', now: next })).state, 'PROVIDER_ACCEPTED');
assert.equal(postWrite.calls.send.length, 2);
assert.deepEqual(postWrite.calls.send[0], postWrite.calls.send[1]);

console.log('Productions BP-09 notice: source binding, no-send probe, exact replay, uncertain hold, and cross-brand denial PASS');
