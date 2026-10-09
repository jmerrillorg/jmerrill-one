import assert from 'node:assert/strict';
import test from 'node:test';
import {
  productionsReviewDueAt,
  reconcileProductionsReviewCheckpoints
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsReviewCheckpoint.js';

const receiptId = '11111111-1111-4111-8111-111111111111';
const leadId = '22222222-2222-4222-8222-222222222222';
const auditId = '33333333-3333-4333-8333-333333333333';
const acceptedAt = '2026-10-09T13:00:00.000Z';
const candidate = { ReceiptId: receiptId, LeadId: leadId, AcceptedAt: acceptedAt };
const actor = {
  AuditId: auditId, ReceiptId: receiptId, LeadId: leadId,
  ActionId: 'ACCEPT_FOR_FOLLOW_UP', Outcome: 'ACCEPTED', Before: 'NEW', After: 'FOLLOW_UP_REQUIRED',
  ActorUserId: '44444444-4444-4444-8444-444444444444',
  ActorObjectId: '55555555-5555-4555-8555-555555555555',
  RecordingActorId: '66666666-6666-4666-8666-666666666666',
  RecordedAt: '2026-10-12T14:00:00.000Z', IdempotencyKey: receiptId
};

function fixture({ actions = [], brand = 'JMPRODUCTIONS' } = {}) {
  let rowVersion = '1';
  let checkpoint = null;
  const calls = [];
  const adapter = { async request(api, _method, body) {
    calls.push({ api, body });
    if (api.endsWith('ListProductionsReviewCheckpointCandidates')) {
      return { RowsJson: JSON.stringify([{ ...candidate, Brand: brand }]), MoreRecords: false };
    }
    if (api.endsWith('GetProductionsReviewCheckpoint')) {
      if (body.ReceiptId !== receiptId || body.LeadId !== leadId) throw Object.assign(new Error(), { code: 'BINDING' });
      return { EvidenceJson: JSON.stringify({ ReceiptId: receiptId, LeadId: leadId, AcceptedAt: acceptedAt,
        RowVersion: rowVersion, Actions: actions, ...(checkpoint ? { Checkpoint: checkpoint } : {}) }) };
    }
    if (api.endsWith('SaveProductionsReviewCheckpoint')) {
      if (body.ExpectedVersion !== rowVersion || body.ReceiptId !== receiptId || body.LeadId !== leadId) {
        throw Object.assign(new Error(), { code: 'CHECKPOINT_ROW_VERSION_CONFLICT' });
      }
      checkpoint = JSON.parse(body.CheckpointJson);
      rowVersion = String(Number(rowVersion) + 1);
      return { RowVersion: rowVersion };
    }
    throw new Error(`Unexpected API ${api}`);
  } };
  const relayCalls = [];
  const relay = {
    async probe(payload) {
      relayCalls.push({ kind: 'probe', payload });
      return { status: 200, body: { authorized: true, noSend: true,
        callerId: 'one-bp09-productions-prod', brand: 'JMPRODUCTIONS',
        templateId: payload.templateId, templateVersion: '1.0.0', recipient: 'productions@jmerrill.one',
        referenceId: receiptId,
        idempotencyKey: `bp09:productions:review:${payload.templateId.endsWith('OVERDUE') ? 'overdue' : 'resolved'}:${receiptId}:${payload.templateData.transitionId}` } };
    },
    async send(payload) {
      relayCalls.push({ kind: 'send', payload });
      return { status: 202, body: { accepted: true, deliveryState: 'ACCEPTED',
        jm1MessageId: '77777777-7777-4777-8777-777777777777', providerMessageId: 'provider-message' } };
    },
    async lookup(payload) {
      relayCalls.push({ kind: 'lookup', payload });
      return { status: 200, body: { status: 'accepted', receiptId: payload.receiptId,
        providerMessageId: 'provider-message', deliveryEvidenceAvailable: false, retryAuthorized: false } };
    }
  };
  return { adapter, relay, calls, relayCalls, getCheckpoint: () => checkpoint };
}

test('business deadline honors work hours, weekends, federal holidays, and DST', () => {
  assert.equal(productionsReviewDueAt('2026-10-09T13:00:00.000Z'), '2026-10-09T21:00:00.000Z');
  assert.equal(productionsReviewDueAt('2026-10-09T13:00:00Z'), '2026-10-09T21:00:00.000Z');
  assert.equal(productionsReviewDueAt('2026-10-09T22:00:00.000Z'), '2026-10-13T21:00:00.000Z');
  assert.equal(productionsReviewDueAt('2026-10-10T15:00:00.000Z'), '2026-10-13T21:00:00.000Z');
  assert.equal(productionsReviewDueAt('2026-11-25T23:00:00.000Z'), '2026-11-27T22:00:00.000Z');
  assert.equal(productionsReviewDueAt('2026-03-06T17:00:00.000Z'), '2026-03-09T16:00:00.000Z');
});

test('repeated scheduled scans persist one pending checkpoint and do not send early', async () => {
  const f = fixture();
  const first = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T20:59:00.000Z') });
  const second = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T20:59:00.000Z') });
  assert.equal(first[0].state, 'PENDING');
  assert.equal(second[0].state, 'PENDING');
  assert.equal(f.calls.filter(({ api }) => api.endsWith('SaveProductionsReviewCheckpoint')).length, 1);
  assert.equal(f.relayCalls.length, 0);
  assert.equal(f.getCheckpoint().receiptId, receiptId);
});

test('due scan persists overdue before an idempotent, privacy-safe provider notice', async () => {
  const f = fixture();
  const result = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T21:05:00.000Z') });
  assert.equal(result[0].state, 'OVERDUE');
  assert.equal(f.getCheckpoint().alerts.overdue.state, 'PROVIDER_ACCEPTED');
  assert.equal(f.getCheckpoint().alerts.overdue.deliveredAt, null);
  assert.deepEqual(f.relayCalls.map(({ kind }) => kind), ['probe', 'send', 'lookup']);
  const payload = f.relayCalls.find(({ kind }) => kind === 'send').payload;
  assert.equal(payload.to, 'productions@jmerrill.one');
  assert.deepEqual(Object.keys(payload.templateData).sort(), ['leadId', 'referenceId', 'transitionId']);
  assert.doesNotMatch(JSON.stringify(payload), /synthetic|message body|emailaddress|description/i);
  await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T21:10:00.000Z') });
  assert.equal(f.relayCalls.length, 3);
});

test('attributable review resolves checkpoint and emits separate overdue and resolution events', async () => {
  const f = fixture({ actions: [actor] });
  const result = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-12T15:00:00.000Z') });
  assert.equal(result[0].state, 'RESOLVED');
  assert.equal(f.getCheckpoint().decision.id, auditId);
  assert.equal(f.getCheckpoint().alerts.overdue.state, 'PROVIDER_ACCEPTED');
  assert.equal(f.getCheckpoint().alerts.resolved.state, 'PROVIDER_ACCEPTED');
  assert.equal(f.relayCalls.filter(({ kind }) => kind === 'send').length, 2);
});

test('mismatched action cannot resolve; cross-brand candidate fails closed', async () => {
  const mismatch = fixture({ actions: [{ ...actor, LeadId: '88888888-8888-4888-8888-888888888888' }] });
  const result = await reconcileProductionsReviewCheckpoints({ ...mismatch, now: new Date('2026-10-09T20:00:00.000Z') });
  assert.equal(result[0].state, 'PENDING');
  assert.equal(mismatch.getCheckpoint().decision, null);
  const futureAction = fixture({ actions: [{ ...actor, RecordedAt: '2026-10-12T16:00:00.000Z' }] });
  const future = await reconcileProductionsReviewCheckpoints({ ...futureAction, now: new Date('2026-10-12T15:00:00.000Z') });
  assert.equal(future[0].state, 'OVERDUE');
  assert.equal(futureAction.getCheckpoint().decision, null);
  const crossBrand = fixture({ brand: 'JM1PUBLISHING' });
  await assert.rejects(reconcileProductionsReviewCheckpoints({ ...crossBrand, now: new Date('2026-10-09T20:00:00.000Z') }),
    (error) => error.code === 'CHECKPOINT_CANDIDATE_INVALID');
  assert.equal(crossBrand.calls.some(({ api }) => api.endsWith('GetProductionsReviewCheckpoint')), false);
});

test('delivery probe failure keeps overdue state and uses bounded delayed retry', async () => {
  const f = fixture();
  f.relay.probe = async () => { throw Object.assign(new Error(), { code: 'NETWORK' }); };
  const first = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T21:05:00.000Z') });
  assert.equal(first[0].state, 'OVERDUE');
  assert.equal(f.getCheckpoint().alerts.overdue.state, 'RETRY_WAIT');
  assert.equal(f.getCheckpoint().alerts.overdue.attempts, 1);
  const waiting = await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T21:06:00.000Z') });
  assert.equal(waiting[0].state, 'OVERDUE');
  assert.equal(f.getCheckpoint().alerts.overdue.attempts, 1);
  f.relay.probe = fixture().relay.probe;
  await reconcileProductionsReviewCheckpoints({ ...f, now: new Date('2026-10-09T21:10:00.000Z') });
  assert.equal(f.getCheckpoint().alerts.overdue.state, 'PROVIDER_ACCEPTED');
});

test('save denial remains closed; unknown delivery lookup recovers by lookup without a resend', async () => {
  const denied = fixture();
  denied.adapter.request = async (api) => {
    if (api.endsWith('ListProductionsReviewCheckpointCandidates')) return { RowsJson: JSON.stringify([candidate]), MoreRecords: false };
    throw Object.assign(new Error(), { code: 'CHECKPOINT_RUNTIME_AUTHORITY_DENIED' });
  };
  const noAuthority = await reconcileProductionsReviewCheckpoints({ ...denied, now: new Date('2026-10-09T21:05:00.000Z') });
  assert.equal(noAuthority[0].state, 'HELD');
  assert.equal(noAuthority[0].failure, 'CHECKPOINT_RUNTIME_AUTHORITY_DENIED');

  const uncertain = fixture();
  let lookupCalls = 0;
  const acceptedLookup = uncertain.relay.lookup;
  uncertain.relay.lookup = async (...args) => {
    lookupCalls++;
    if (lookupCalls === 1) throw new Error('temporary unknown');
    return acceptedLookup(...args);
  };
  const unknownResult = await reconcileProductionsReviewCheckpoints({ ...uncertain, now: new Date('2026-10-09T21:05:00.000Z') });
  assert.equal(unknownResult[0].state, 'OVERDUE');
  assert.equal(uncertain.getCheckpoint().state, 'OVERDUE');
  assert.equal(uncertain.getCheckpoint().alerts.overdue.state, 'RETRY_WAIT');
  assert.equal(uncertain.getCheckpoint().alerts.overdue.lookupOnly, true);
  assert.ok(uncertain.getCheckpoint().alerts.overdue.messageId);
  assert.equal(uncertain.getCheckpoint().decision, null);
  await reconcileProductionsReviewCheckpoints({ ...uncertain, now: new Date('2026-10-09T21:10:00.000Z') });
  assert.deepEqual(uncertain.relayCalls.map(({ kind }) => kind), ['probe', 'send', 'lookup']);
  assert.equal(lookupCalls, 2);
  assert.equal(uncertain.getCheckpoint().alerts.overdue.state, 'PROVIDER_ACCEPTED');
});
