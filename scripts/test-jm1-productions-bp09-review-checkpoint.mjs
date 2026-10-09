import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateProductionsReviewDueAt,
  createInitialProductionsReviewCheckpoint,
  reconcileProductionsReviewCheckpoints,
  validateProductionsReviewCheckpoint
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09ReviewCheckpoint.js';
import { createProductionsReviewCheckpointNotifier } from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09Notice.js';

const receiptId = 'd59fec05-5773-48f3-aaca-dfc27735f93a';
const leadId = '0a352dac-3f81-45b0-a0ba-ceed45a7ea22';
const reviewerSystemUserId = '5adf7e12-f093-f011-b4cb-6045bdeb7c0e';
const reviewerObjectId = '9586f34b-b5f3-437b-bc64-3e44d2518427';
const recordingActorId = 'cc352dac-3f81-45b0-a0ba-ceed45a7ea22';
const actionRecordId = '4a352dac-3f81-45b0-a0ba-ceed45a7ea22';
const teamId = '36ee36cf-6ebf-f111-aaaf-6045bdd69435';

test('business-day deadline respects DST and observed federal holiday vectors', () => {
  assert.equal(calculateProductionsReviewDueAt('2026-10-30T15:00:00.000Z'), '2026-11-02T16:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-11-10T15:00:00.000Z'), '2026-11-12T15:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-03-06T15:00:00.000Z'), '2026-03-09T14:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-10-30T13:00:00.000Z'), '2026-10-30T21:00:00.000Z');
  assert.throws(() => calculateProductionsReviewDueAt('2026-10-30'), { code: 'CHECKPOINT_ACCEPTED_AT_INVALID' });
});

test('versioned checkpoint binds the receipt and Lead with independent event states', () => {
  const checkpoint = createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z' });
  assert.equal(validateProductionsReviewCheckpoint(checkpoint, { receiptId, leadId }), true);
  assert.equal(checkpoint.alerts.overdue.transitionId, receiptId);
  assert.equal(checkpoint.alerts.overdue.eventId, `bp09:productions:review:overdue:${receiptId}:${receiptId}`);
  assert.equal(checkpoint.alerts.resolved, null);
  assert.equal(validateProductionsReviewCheckpoint(checkpoint, { receiptId, leadId: actionRecordId }), false);
});

function adapter(overrides = {}) {
  const state = { checkpoint: null, writes: 0 };
  return {
    state, teamId, reviewerSystemUserId, reviewerObjectId,
    authorityCheck: async () => true,
    listPendingReceipts: async () => [{ id: receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z',
      brand: 'JMPRODUCTIONS', ownerId: teamId }],
    getLead: async () => ({ id: leadId, brand: 'JMPRODUCTIONS', receiptId, ownerId: teamId,
      acceptedAt: '2026-10-30T15:00:00.000Z', checkpoint: state.checkpoint, etag: 'W/"1"' }),
    listReviewerActions: async () => [],
    saveCheckpoint: async ({ checkpoint }) => { state.checkpoint = checkpoint; state.writes++; },
    ...overrides
  };
}

function deliveredAcceptance(event) {
  return { accepted: true, receiptId: recordingActorId, idempotencyKey: event.eventId,
    recipient: 'productions@jmerrill.one', privacySafe: true };
}

test('repeated overdue scans retain overdue state and never resend provider-accepted notice', async () => {
  const store = adapter();
  const events = [];
  const notify = { send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  const now = new Date('2026-11-02T16:00:00.000Z');
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now });
  const priorWrites = store.state.writes;
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now });
  assert.equal(store.state.checkpoint.state, 'OVERDUE');
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'RECEIPT_PENDING');
  assert.equal(store.state.checkpoint.decision, null);
  assert.equal(events.length, 1);
  assert.equal(store.state.writes, priorWrites);
});

test('confirmed relay failure retries with the same event key and receipt after bounded wait', async () => {
  const store = adapter();
  const checkpoint = createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z' });
  checkpoint.state = 'OVERDUE';
  checkpoint.alerts.overdue = { ...checkpoint.alerts.overdue, state: 'RECEIPT_PENDING', attempts: 1,
    lastAttemptAt: '2026-11-02T15:55:00.000Z', relayReceiptId: recordingActorId };
  store.state.checkpoint = checkpoint;
  const events = [];
  let lookups = 0;
  const notify = { getDelivery: async ({ relayReceiptId: id }) => {
    assert.equal(id, recordingActorId);
    lookups += 1;
    return { state: 'FAILED', receiptId: id, failedAt: '2026-11-02T16:00:00.000Z', retryAuthorized: false };
  }, send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-02T16:00:00.000Z') });
  assert.equal(store.state.checkpoint.state, 'OVERDUE');
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'RETRY_WAIT');
  assert.equal(store.state.checkpoint.alerts.overdue.failureCode, 'RELAY_FAILURE_CONFIRMED');
  assert.equal(store.state.checkpoint.alerts.overdue.nextAttemptAt, '2026-11-02T16:05:00.000Z');
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-02T16:06:00.000Z') });
  assert.equal(lookups, 1);
  assert.equal(events.length, 1);
  assert.equal(events[0].eventId, store.state.checkpoint.alerts.overdue.eventId);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'RECEIPT_PENDING');
  assert.equal(store.state.checkpoint.alerts.overdue.relayReceiptId, recordingActorId);
});

test('uncertain send and unknown lookup never authorize a blind replay', async () => {
  const store = adapter();
  const started = createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z' });
  started.state = 'OVERDUE';
  started.alerts.overdue = { ...started.alerts.overdue, state: 'ATTEMPTING', attempts: 1, lastAttemptAt: '2026-11-02T16:00:00.000Z' };
  store.state.checkpoint = started;
  const events = [];
  const ambiguous = { getDelivery: async () => ({ state: 'UNKNOWN', retryAuthorized: false }), send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify: ambiguous, now: new Date('2026-11-02T16:01:00.000Z') });
  assert.equal(events.length, 0);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'ATTEMPTING');

  started.alerts.overdue = { ...started.alerts.overdue, state: 'RECEIPT_PENDING', relayReceiptId: recordingActorId };
  store.state.checkpoint = started;
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify: ambiguous, now: new Date('2026-11-02T16:02:00.000Z') });
  assert.equal(events.length, 0);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'RECEIPT_PENDING');
});

test('relay acceptance cannot regress to failed or trigger a duplicate send', async () => {
  const store = adapter();
  const checkpoint = createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z' });
  checkpoint.state = 'OVERDUE';
  checkpoint.alerts.overdue = { ...checkpoint.alerts.overdue, state: 'PROVIDER_ACCEPTED', attempts: 1,
    lastAttemptAt: '2026-11-02T15:55:00.000Z', relayReceiptId: recordingActorId,
    messageId: 'provider-123', providerAcceptedAt: '2026-11-02T15:55:01.000Z' };
  store.state.checkpoint = checkpoint;
  let sends = 0;
  const notify = { getDelivery: async () => ({ state: 'FAILED', receiptId: recordingActorId,
    failedAt: '2026-11-02T16:00:00.000Z', retryAuthorized: false }),
  send: async () => { sends += 1; return deliveredAcceptance({ eventId: checkpoint.alerts.overdue.eventId }); } };
  const result = await reconcileProductionsReviewCheckpoints({ adapter: store, notify,
    now: new Date('2026-11-02T16:00:00.000Z') });
  assert.equal(result[0].code, 'CHECKPOINT_RELAY_STATE_DRIFT');
  assert.equal(sends, 0);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'PROVIDER_ACCEPTED');
});

test('wrong brand, owner, receipt binding, and missing authority fail closed', async () => {
  const wrongBrand = adapter({ listPendingReceipts: async () => [{ id: receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z', brand: 'JMF', ownerId: teamId }] });
  const denied = await reconcileProductionsReviewCheckpoints({ adapter: wrongBrand, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(denied[0].code, 'CHECKPOINT_RECEIPT_INVALID');
  assert.equal(wrongBrand.state.writes, 0);

  const wrongOwner = adapter({ getLead: async () => ({ id: leadId, brand: 'JMPRODUCTIONS', receiptId, ownerId: recordingActorId, acceptedAt: '2026-10-30T15:00:00.000Z' }) });
  const deniedOwner = await reconcileProductionsReviewCheckpoints({ adapter: wrongOwner, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(deniedOwner[0].code, 'CHECKPOINT_RECEIPT_LEAD_MISMATCH');
  assert.equal(wrongOwner.state.writes, 0);

  const noAuthority = adapter({ authorityCheck: async () => false });
  await assert.rejects(reconcileProductionsReviewCheckpoints({ adapter: noAuthority }), { code: 'CHECKPOINT_AUTHORITY_MISSING' });
});

test('only exact plugin action, reviewer identity, and receipt/Lead binding resolve the checkpoint', async () => {
  const store = adapter({ listReviewerActions: async () => [{ id: actionRecordId, receiptId, leadId,
    actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED', before: 'NEW', after: 'FOLLOW_UP_REQUIRED',
    actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId, idempotencyKey: receiptId,
    recordedAt: '2026-11-02T17:00:00.000Z', recordingActorId }] });
  const events = [];
  const notify = { send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  const result = await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(result[0].state, 'RESOLVED');
  assert.equal(store.state.checkpoint.decision.id, actionRecordId);
  assert.equal(store.state.checkpoint.decision.actorUserId, reviewerSystemUserId);
  assert.equal(store.state.checkpoint.decision.recordingActorId, recordingActorId);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'NOT_DUE');
  assert.equal(store.state.checkpoint.alerts.resolved.state, 'RECEIPT_PENDING');
  assert.match(events[0].eventId, new RegExp(`^bp09:productions:review:resolved:${receiptId}:`));
});

test('audit corrections do not silently reopen or rewrite a resolved checkpoint', async () => {
  const action = { id: actionRecordId, receiptId, leadId, actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED',
    before: 'NEW', after: 'FOLLOW_UP_REQUIRED', actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId,
    idempotencyKey: receiptId, recordedAt: '2026-11-02T17:00:00.000Z', recordingActorId };
  const store = adapter({ listReviewerActions: async () => [action] });
  await reconcileProductionsReviewCheckpoints({ adapter: store, now: new Date('2026-11-03T00:00:00.000Z') });
  const accepted = store.state.checkpoint;
  assert.equal(accepted.state, 'RESOLVED');
  store.baseActions = { ...action, outcome: 'REVOKED' };
  store.listReviewerActions = async () => [store.baseActions];
  const drift = await reconcileProductionsReviewCheckpoints({ adapter: store, now: new Date('2026-11-03T00:05:00.000Z') });
  assert.equal(drift[0].code, 'CHECKPOINT_DECISION_DRIFT');
  assert.equal(store.state.checkpoint.state, 'RESOLVED');
  assert.equal(store.state.checkpoint.decision.outcome, 'ACCEPTED');
});

test('an uncertain resolved notice remains separate and cannot blind-retry', async () => {
  const store = adapter({ listReviewerActions: async () => [{ id: actionRecordId, receiptId, leadId,
    actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED', before: 'NEW', after: 'FOLLOW_UP_REQUIRED',
    actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId, idempotencyKey: receiptId,
    recordedAt: '2026-11-02T17:00:00.000Z', recordingActorId }] });
  const notify = { send: async () => { const error = new Error('delivery unavailable'); error.code = 'RELAY_UNAVAILABLE'; throw error; } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-03T00:00:00.000Z') });
  assert.equal(store.state.checkpoint.state, 'RESOLVED');
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'NOT_DUE');
  assert.equal(store.state.checkpoint.alerts.resolved.state, 'ATTEMPTING');
  assert.equal(store.state.checkpoint.alerts.resolved.failureCode, 'RELAY_UNAVAILABLE');
});

test('notification template request contains opaque IDs only and requires fixed recipient/idempotency proof', async () => {
  const calls = [];
  const relay = {
    probe: async (payload) => {
      calls.push(payload);
      return { status: 200, body: { authorized: true, noSend: true, callerId: 'one-bp09-productions-prod',
        brand: 'JMPRODUCTIONS', templateId: payload.templateId, templateVersion: payload.templateVersion,
        recipient: 'productions@jmerrill.one', idempotencyKey: payload.idempotencyKey } };
    },
    send: async (payload) => ({ status: 202, body: { accepted: true, deliveryState: 'ACCEPTED',
      jm1MessageId: recordingActorId, recipient: 'productions@jmerrill.one', idempotencyKey: payload.idempotencyKey } })
  };
  const notifier = createProductionsReviewCheckpointNotifier(relay);
  const transitionId = receiptId;
  const eventId = `bp09:productions:review:overdue:${receiptId}:${transitionId}`;
  const result = await notifier.send({ type: 'OVERDUE', receiptId, leadId, transitionId, eventId });
  assert.equal(result.accepted, true);
  assert.equal(result.receiptId, recordingActorId);
  assert.equal(result.receiptId, recordingActorId);
  assert.equal(result.idempotencyKey, eventId);
  assert.deepEqual(calls[0].templateData, { referenceId: receiptId, leadId, transitionId });
  assert.equal(JSON.stringify(calls[0]).includes('message'), false);
  await assert.rejects(() => notifier.send({ type: 'OVERDUE', receiptId, leadId, transitionId, eventId: `${eventId}:duplicate` }),
    { code: 'CHECKPOINT_NOTICE_INPUT_INVALID' });
});

test('relay lookup distinguishes accepted, failed, and unknown without claiming delivery or retry authority', async () => {
  const transitionId = receiptId;
  const eventId = `bp09:productions:review:overdue:${receiptId}:${transitionId}`;
  let body = { status: 'accepted', receiptId: recordingActorId, providerMessageId: 'provider-123',
    acceptedAt: '2026-11-02T16:00:00.000Z', deliveryEvidenceAvailable: false, retryAuthorized: false };
  const notifier = createProductionsReviewCheckpointNotifier({
    lookup: async (payload) => {
      assert.equal(payload.receiptId, recordingActorId);
      assert.equal(payload.idempotencyKey, eventId);
      assert.deepEqual(payload.templateData, { referenceId: receiptId, leadId, transitionId });
      return { status: 200, body };
    }
  });
  const common = { type: 'OVERDUE', receiptId, leadId, transitionId, eventId, relayReceiptId: recordingActorId };
  const accepted = await notifier.getDelivery(common);
  assert.equal(accepted.state, 'ACCEPTED');
  assert.equal(accepted.deliveryEvidenceAvailable, false);
  assert.equal(accepted.retryAuthorized, false);

  body = { status: 'failed', receiptId: recordingActorId, failedAt: '2026-11-02T16:01:00.000Z', retryAuthorized: false };
  const failed = await notifier.getDelivery(common);
  assert.equal(failed.state, 'FAILED');
  assert.equal(failed.retryAuthorized, false);

  body = { status: 'unknown', retryAuthorized: false };
  assert.deepEqual(await notifier.getDelivery(common), { state: 'UNKNOWN', retryAuthorized: false });
});
