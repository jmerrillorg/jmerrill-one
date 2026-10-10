import assert from 'node:assert/strict';
import test from 'node:test';
import { createProductionsReviewCheckpointDataverseAdapter } from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09ReviewCheckpointDataverse.js';

const apiBase = 'https://jm1hq.crm.dynamics.com/api/data/v9.2';
const teamId = '36ee36cf-6ebf-f111-aaaf-6045bdd69435';
const runtimeUserId = 'f4a3c9e1-6f6e-4e3a-ae51-2f1985f35a1d';
const reviewerSystemUserId = '5adf7e12-f093-f011-b4cb-6045bdeb7c0e';
const reviewerObjectId = '9586f34b-b5f3-437b-bc64-3e44d2518427';
const receiptId = 'd59fec05-5773-48f3-aaca-dfc27735f93a';
const leadId = '0a352dac-3f81-45b0-a0ba-ceed45a7ea22';
const actionId = '4a352dac-3f81-45b0-a0ba-ceed45a7ea22';

function response(status, value, etag = null) {
  return { status, ok: status >= 200 && status < 300, headers: { get: (name) => name.toLowerCase() === 'etag' ? etag : null },
    text: async () => value === null ? '' : JSON.stringify(value) };
}

function mockFetch(calls) {
  return async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const path = new URL(url).pathname;
    if (path.endsWith('/WhoAmI()')) return response(200, { UserId: runtimeUserId });
    if (path.endsWith('/jm1_ListProductionsReviewCheckpointCandidates')) return response(200, {
      RowsJson: JSON.stringify([{ receiptId, leadId, acceptedAt: '2026-10-09T13:00:00.000Z' }]), MoreRecords: false
    });
    if (path.endsWith('/jm1_GetProductionsReviewCheckpoint')) return response(200, { EvidenceJson: JSON.stringify({
      receiptId, leadId, acceptedAt: '2026-10-09T13:00:00.000Z', checkpoint: JSON.stringify({ version: 2, receiptId, leadId,
        acceptedAt: '2026-10-09T13:00:00.000Z', dueAt: '2026-10-09T21:00:00.000Z', state: 'PENDING' }),
      subject: 'JM1 Website Intake - J Merrill Productions', ownerId: teamId, stateCode: 0, statusCode: 1,
      version: '19', actions: [{ id: actionId, receiptId, leadId, actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED',
        before: 'NEW', after: 'FOLLOW_UP_REQUIRED', actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId,
        idempotencyKey: receiptId, recordedAt: '2026-10-09T14:00:00.000Z', recordingActorId: runtimeUserId }]
    }) });
    if (path.endsWith('/jm1_SaveProductionsReviewCheckpoint')) return response(200, { RowVersion: '20' });
    return response(404, { error: { message: `Unexpected request ${url}` } });
  };
}

test('adapter uses only the identity-gated Productions checkpoint APIs and exact action projection', async () => {
  const calls = [];
  const adapter = createProductionsReviewCheckpointDataverseAdapter({ apiBase, teamId, runtimeUserId,
    reviewerSystemUserId, reviewerObjectId, getToken: async () => 'test-token', fetchImpl: mockFetch(calls) });
  assert.equal(await adapter.authorityCheck(), true);
  const leads = await adapter.listPendingReceipts({ limit: 100 });
  assert.equal(leads[0].id, receiptId);
  assert.equal(leads[0].leadId, leadId);
  assert.equal(leads[0].ownerId, teamId);
  assert.equal(leads[0].acceptedAt, '2026-10-09T13:00:00.000Z');
  const lead = await adapter.getLead(leadId);
  assert.equal(lead.etag, '19');
  const actions = await adapter.listReviewerActions({ receiptId, leadId, limit: 10 });
  assert.deepEqual(actions[0], {
    id: actionId, receiptId, leadId, actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED', before: 'NEW',
    after: 'FOLLOW_UP_REQUIRED', actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId,
    idempotencyKey: receiptId, recordedAt: '2026-10-09T14:00:00.000Z', recordingActorId: runtimeUserId
  });
  await adapter.saveCheckpoint({ receiptId, leadId, checkpoint: { version: 2, receiptId, leadId } });
  const listCall = calls.find((call) => new URL(call.url).pathname.endsWith('/jm1_ListProductionsReviewCheckpointCandidates'));
  const readCall = calls.find((call) => new URL(call.url).pathname.endsWith('/jm1_GetProductionsReviewCheckpoint'));
  const saveCall = calls.find((call) => new URL(call.url).pathname.endsWith('/jm1_SaveProductionsReviewCheckpoint'));
  assert.deepEqual(JSON.parse(listCall.options.body), { PageNumber: 1 });
  assert.deepEqual(JSON.parse(readCall.options.body), { LeadId: leadId, ReceiptId: receiptId });
  assert.equal(JSON.parse(saveCall.options.body).ExpectedVersion, '19');
  assert.deepEqual(Object.keys(JSON.parse(saveCall.options.body)).sort(), ['CheckpointJson', 'ExpectedVersion', 'LeadId', 'ReceiptId']);
  assert.equal(calls.some((call) => /\/leads|\/jm1_productionsinquiryactions|\/jm1_executionlogs/.test(new URL(call.url).pathname)), false);
  assert.equal(adapter.runtimeUserId, runtimeUserId);
});

test('adapter fails closed when configured identity or team is malformed', () => {
  assert.throws(() => createProductionsReviewCheckpointDataverseAdapter({ apiBase, teamId: 'bad', runtimeUserId,
    reviewerSystemUserId, reviewerObjectId, getToken: async () => 'x' }), { code: 'CHECKPOINT_AUTHORITY_CONFIG_INVALID' });
});
