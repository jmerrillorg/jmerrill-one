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
  assert.equal(checkpoint.alerts.overdue.eventId, `bp09:productions:review-overdue:${receiptId}`);
  assert.equal(checkpoint.alerts.resolved, null);
  assert.equal(validateProductionsReviewCheckpoint(checkpoint, { receiptId, leadId: actionRecordId }), false);
});

function adapter(overrides = {}) {
  const state = { checkpoint: null, writes: 0 };
  return {
    state, teamId, reviewerSystemUserId, reviewerObjectId,
    authorityCheck: async () => true,
    listPendingReceipts: async () => [{ id: receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z',
      brand: 'JMPRODUCTIONS', ownerId: teamId, checkpoint: state.checkpoint }],
    getLead: async () => ({ id: leadId, brand: 'JMPRODUCTIONS', receiptId, ownerId: teamId,
      acceptedAt: '2026-10-30T15:00:00.000Z', etag: 'W/"1"' }),
    listReviewerActions: async () => [],
    saveCheckpoint: async ({ checkpoint }) => { state.checkpoint = checkpoint; state.writes++; },
    ...overrides
  };
}

function deliveredAcceptance(event) {
  return { accepted: true, messageId: `msg-${event.eventId}`, idempotencyKey: event.eventId,
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
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'PROVIDER_ACCEPTED');
  assert.equal(store.state.checkpoint.decision, null);
  assert.equal(events.length, 1);
  assert.equal(store.state.writes, priorWrites);
});

test('notification failure keeps overdue checkpoint and retries with one stable event id', async () => {
  const store = adapter();
  const events = [];
  const notify = { send: async (event) => {
    events.push(event);
    if (events.length === 1) { const error = new Error('route unavailable'); error.code = 'ROUTE_DOWN'; throw error; }
    return deliveredAcceptance(event);
  } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-02T16:00:00.000Z') });
  assert.equal(store.state.checkpoint.state, 'OVERDUE');
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'RETRY_WAIT');
  assert.equal(store.state.checkpoint.alerts.overdue.failureCode, 'ROUTE_DOWN');
  assert.equal(store.state.checkpoint.alerts.overdue.nextAttemptAt, '2026-11-02T16:05:00.000Z');
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-02T16:06:00.000Z') });
  assert.equal(events.length, 2);
  assert.equal(events[0].eventId, events[1].eventId);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'PROVIDER_ACCEPTED');
});

test('uncertain send is not replayed until delivery lookup proves the event absent', async () => {
  const store = adapter();
  const started = createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z' });
  started.state = 'OVERDUE';
  started.alerts.overdue = { ...started.alerts.overdue, state: 'ATTEMPTING', attempts: 1, lastAttemptAt: '2026-11-02T16:00:00.000Z' };
  store.state.checkpoint = started;
  const events = [];
  const ambiguous = { getDelivery: async () => ({ state: 'UNKNOWN' }), send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify: ambiguous, now: new Date('2026-11-02T16:01:00.000Z') });
  assert.equal(events.length, 0);
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'ATTEMPTING');

  const absent = { getDelivery: async () => ({ state: 'NOT_FOUND' }), send: async (event) => { events.push(event); return deliveredAcceptance(event); } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify: absent, now: new Date('2026-11-02T16:02:00.000Z') });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventId, started.alerts.overdue.eventId);
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
  assert.equal(store.state.checkpoint.alerts.resolved.state, 'PROVIDER_ACCEPTED');
  assert.match(events[0].eventId, new RegExp(`^bp09:productions:review-resolved:${receiptId}:`));
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

test('a resolved notice has independent retry state from overdue notice', async () => {
  const store = adapter({ listReviewerActions: async () => [{ id: actionRecordId, receiptId, leadId,
    actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED', before: 'NEW', after: 'FOLLOW_UP_REQUIRED',
    actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId, idempotencyKey: receiptId,
    recordedAt: '2026-11-02T17:00:00.000Z', recordingActorId }] });
  const notify = { send: async () => { const error = new Error('delivery unavailable'); error.code = 'RELAY_UNAVAILABLE'; throw error; } };
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now: new Date('2026-11-03T00:00:00.000Z') });
  assert.equal(store.state.checkpoint.state, 'RESOLVED');
  assert.equal(store.state.checkpoint.alerts.overdue.state, 'NOT_DUE');
  assert.equal(store.state.checkpoint.alerts.resolved.state, 'RETRY_WAIT');
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
      jm1MessageId: 'relay-message-1', recipient: 'productions@jmerrill.one', idempotencyKey: payload.idempotencyKey } })
  };
  const notifier = createProductionsReviewCheckpointNotifier(relay);
  const eventId = `bp09:productions:review-overdue:${receiptId}`;
  const result = await notifier.send({ type: 'OVERDUE', receiptId, leadId, eventId });
  assert.equal(result.accepted, true);
  assert.equal(result.idempotencyKey, eventId);
  assert.deepEqual(calls[0].templateData, { referenceId: receiptId, leadId });
  assert.equal(JSON.stringify(calls[0]).includes('message'), false);
  await assert.rejects(() => notifier.send({ type: 'OVERDUE', receiptId, leadId, eventId: `${eventId}:duplicate` }),
    { code: 'CHECKPOINT_NOTICE_INPUT_INVALID' });
});
