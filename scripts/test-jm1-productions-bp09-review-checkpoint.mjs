import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateProductionsReviewDueAt,
  reconcileProductionsReviewCheckpoints,
  validateProductionsReviewCheckpoint
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09ReviewCheckpoint.js';

const receiptId = 'd59fec05-5773-48f3-aaca-dfc27735f93a';
const leadId = '0a352dac-3f81-45b0-a0ba-ceed45a7ea22';
const reviewerId = '5adf7e12-f093-f011-b4cb-6045bdeb7c0e';
const actionId = '4a352dac-3f81-45b0-a0ba-ceed45a7ea22';

test('business-day deadline respects DST and observed federal holiday vectors', () => {
  assert.equal(calculateProductionsReviewDueAt('2026-10-30T15:00:00.000Z'), '2026-11-02T16:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-11-10T15:00:00.000Z'), '2026-11-12T15:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-03-06T15:00:00.000Z'), '2026-03-09T14:00:00.000Z');
  assert.equal(calculateProductionsReviewDueAt('2026-10-30T13:00:00.000Z'), '2026-10-30T21:00:00.000Z');
  assert.throws(() => calculateProductionsReviewDueAt('2026-10-30'), { code: 'CHECKPOINT_ACCEPTED_AT_INVALID' });
});

test('checkpoint is bound to both exact record identities and valid resolution evidence', () => {
  const checkpoint = { version: 1, receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z', dueAt: '2026-11-02T16:00:00.000Z',
    state: 'PENDING', alertState: 'NOT_DUE', nextAttemptAt: null, resolvedAt: null, decisionId: null, failureCode: null };
  assert.equal(validateProductionsReviewCheckpoint(checkpoint, { receiptId, leadId }), true);
  assert.equal(validateProductionsReviewCheckpoint(checkpoint, { receiptId, leadId: actionId }), false);
  assert.equal(validateProductionsReviewCheckpoint({ ...checkpoint, state: 'RESOLVED' }, { receiptId, leadId }), false);
});

function adapter(overrides = {}) {
  const state = { checkpoint: null, writes: 0 };
  return {
    state, reviewerId,
    authorityCheck: async () => true,
    listPendingReceipts: async () => [{ id: receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z', brand: 'JMPRODUCTIONS', checkpoint: state.checkpoint }],
    getLead: async () => ({ id: leadId, brand: 'JMPRODUCTIONS', receiptId }),
    listReviewerActions: async () => [],
    saveCheckpoint: async (_id, checkpoint) => { state.checkpoint = checkpoint; state.writes++; },
    ...overrides
  };
}

test('repeated overdue scans retain the same event identity and never fabricate review', async () => {
  const store = adapter();
  const events = [];
  const notify = async (event) => { events.push(event); return { accepted: true, messageId: 'relay-1' }; };
  const now = new Date('2026-11-02T16:00:00.000Z');
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now });
  await reconcileProductionsReviewCheckpoints({ adapter: store, notify, now });
  assert.equal(store.state.checkpoint.state, 'OVERDUE');
  assert.equal(store.state.checkpoint.alertState, 'PROVIDER_ACCEPTED');
  assert.equal(store.state.checkpoint.decisionId, null);
  assert.equal(events.length, 2);
  assert.equal(events[0].eventId, events[1].eventId);
});

test('wrong brand, wrong lead, and missing authority fail closed without state writes', async () => {
  const wrongBrand = adapter({ listPendingReceipts: async () => [{ id: receiptId, leadId, acceptedAt: '2026-10-30T15:00:00.000Z', brand: 'JMF' }] });
  const denied = await reconcileProductionsReviewCheckpoints({ adapter: wrongBrand, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(denied[0].code, 'CHECKPOINT_RECEIPT_INVALID');
  assert.equal(wrongBrand.state.writes, 0);

  const mismatched = adapter({ getLead: async () => ({ id: leadId, brand: 'JMPRODUCTIONS', receiptId: actionId }) });
  const mismatch = await reconcileProductionsReviewCheckpoints({ adapter: mismatched, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(mismatch[0].code, 'CHECKPOINT_RECEIPT_LEAD_MISMATCH');
  assert.equal(mismatched.state.writes, 0);

  const noAuthority = adapter({ authorityCheck: async () => false });
  await assert.rejects(reconcileProductionsReviewCheckpoints({ adapter: noAuthority }), { code: 'CHECKPOINT_AUTHORITY_MISSING' });
});

test('only an attributable matching reviewer action resolves a checkpoint', async () => {
  const store = adapter({ listReviewerActions: async () => [
    { id: actionId, receiptId, leadId, actorId: 'ffdded26-f8bf-f111-aaaf-7c1e525b15c2', outcome: 'ACCEPTED', createdAt: '2026-11-02T17:00:00.000Z', attributable: true },
    { id: actionId, receiptId, leadId, actorId: reviewerId, outcome: 'ACCEPTED', createdAt: '2026-11-02T17:00:00.000Z', attributable: true }
  ] });
  const result = await reconcileProductionsReviewCheckpoints({ adapter: store, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(result[0].state, 'RESOLVED');
  assert.equal(store.state.checkpoint.decisionId, actionId);
  assert.equal(store.state.checkpoint.resolvedAt, '2026-11-02T17:00:00.000Z');
});

test('notification failure persists overdue state with bounded retry metadata', async () => {
  const store = adapter();
  const result = await reconcileProductionsReviewCheckpoints({
    adapter: store, now: new Date('2026-11-02T16:00:00.000Z'),
    notify: async () => { const error = new Error('delivery unavailable'); error.code = 'ROUTE_DOWN'; throw error; }
  });
  assert.equal(result[0].state, 'OVERDUE');
  assert.equal(store.state.checkpoint.alertState, 'RETRY_WAIT');
  assert.equal(store.state.checkpoint.failureCode, 'ROUTE_DOWN');
  assert.equal(store.state.checkpoint.nextAttemptAt, '2026-11-02T16:05:00.000Z');
});
