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
    if (path.endsWith('/leads')) return response(200, { value: [{
      leadid: leadId, subject: 'JM1 Website Intake - J Merrill Productions', statecode: 0, statuscode: 1,
      jm1_bp09intakereceiptid: receiptId, jm1_bp09receivedat: '2026-10-09T13:00:00.000Z', jm1_bp09reviewcheckpoint: JSON.stringify({ version: 2, receiptId, leadId,
        acceptedAt: '2026-10-09T13:00:00.000Z', dueAt: '2026-10-09T21:00:00.000Z', state: 'PENDING' }),
      _ownerid_value: teamId, versionnumber: 19, createdon: '2026-10-09T13:00:01Z', '@odata.etag': 'W/"1"'
    }] });
    if (path.endsWith(`/leads(${leadId})`) && options.method === 'PATCH') return response(200, {}, 'W/"2"');
    if (path.endsWith(`/leads(${leadId})`)) return response(200, {
      leadid: leadId, subject: 'JM1 Website Intake - J Merrill Productions', statecode: 0, statuscode: 1,
      jm1_bp09intakereceiptid: receiptId, jm1_bp09receivedat: '2026-10-09T13:00:00.000Z', jm1_bp09reviewcheckpoint: null, _ownerid_value: teamId,
      versionnumber: 19, '@odata.etag': 'W/"1"'
    });
    if (path.endsWith('/jm1_productionsinquiryactions')) return response(200, { value: [{
      jm1_productionsinquiryactionid: actionId, jm1_receiptid: receiptId, jm1_leadid: leadId,
      jm1_actionid: 'ACCEPT_FOR_FOLLOW_UP', jm1_outcome: 'ACCEPTED', jm1_before: 'NEW', jm1_after: 'FOLLOW_UP_REQUIRED',
      jm1_actorid: reviewerSystemUserId, jm1_actorobjectid: reviewerObjectId, jm1_key: receiptId,
      createdon: '2026-10-09T14:00:00Z', _createdby_value: runtimeUserId
    }] });
    return response(404, { error: { message: `Unexpected request ${url}` } });
  };
}

test('adapter uses the managed-identity projection and exact existing reviewer-action schema', async () => {
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
  assert.equal(lead.etag, 'W/"1"');
  const actions = await adapter.listReviewerActions({ receiptId, leadId, limit: 10 });
  assert.deepEqual(actions[0], {
    id: actionId, receiptId, leadId, actionId: 'ACCEPT_FOR_FOLLOW_UP', outcome: 'ACCEPTED', before: 'NEW',
    after: 'FOLLOW_UP_REQUIRED', actorUserId: reviewerSystemUserId, actorObjectId: reviewerObjectId,
    idempotencyKey: receiptId, recordedAt: '2026-10-09T14:00:00Z', recordingActorId: runtimeUserId
  });
  await adapter.saveCheckpoint({ receiptId, leadId, checkpoint: { version: 2, receiptId, leadId } });
  const leadRead = calls.find((call) => new URL(call.url).pathname.endsWith('/leads'));
  const actionRead = calls.find((call) => new URL(call.url).pathname.endsWith('/jm1_productionsinquiryactions'));
  const patch = calls.find((call) => call.options.method === 'PATCH');
  assert.match(leadRead.url, /subject%20eq%20'JM1%20Website%20Intake/);
  assert.match(leadRead.url, new RegExp(teamId));
  assert.doesNotMatch(decodeURIComponent(leadRead.url), /description|emailaddress1|telephone1/);
  assert.match(decodeURIComponent(actionRead.url), /jm1_receiptid eq/);
  assert.match(decodeURIComponent(actionRead.url), /jm1_leadid eq/);
  assert.equal(patch.options.headers['If-Match'], 'W/"1"');
  assert.deepEqual(Object.keys(JSON.parse(patch.options.body)), ['jm1_bp09reviewcheckpoint']);
});

test('adapter fails closed when configured identity or team is malformed', () => {
  assert.throws(() => createProductionsReviewCheckpointDataverseAdapter({ apiBase, teamId: 'bad', runtimeUserId,
    reviewerSystemUserId, reviewerObjectId, getToken: async () => 'x' }), { code: 'CHECKPOINT_AUTHORITY_CONFIG_INVALID' });
});
