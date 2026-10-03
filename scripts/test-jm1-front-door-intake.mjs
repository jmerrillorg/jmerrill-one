import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  acceptIntake, INTAKE_STATES, processIntake, reconcileIntake
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/intake.js';

function createMock() {
  const tables = { jm1_executionlogs: new Map(), contacts: new Map(), leads: new Map() };
  const counts = { jm1_executionlogs: 0, contacts: 0, leads: 0 };
  let failAfterLeadCommit = false;
  let failAfterReceiptPatch = false;
  let failFinalReceiptPatch = false;
  return {
    tables, counts,
    failLeadOnce() { failAfterLeadCommit = true; },
    failReceiptPatchOnce() { failAfterReceiptPatch = true; },
    failFinalReceiptPatchOnce() { failFinalReceiptPatch = true; },
    async request(path, method = 'GET', body) {
      const set = path.slice(1).split(/[?(]/)[0];
      if (path.startsWith('/contacts?')) {
        const email = decodeURIComponent(path).match(/emailaddress1 eq '([^']+)'/)?.[1];
        return { value: [...tables.contacts.values()].filter((row) => row.emailaddress1 === email).map((row) => ({ contactid: row.contactid })) };
      }
      if (path.startsWith('/jm1_executionlogs?')) {
        return { value: [...tables.jm1_executionlogs.values()].filter((row) => row.jm1_executionstatus === 835500000) };
      }
      const id = path.match(/\(([0-9a-f-]{36})\)/)?.[1];
      if (method === 'GET') return tables[set]?.get(id) || null;
      if (method === 'POST') {
        const key = { jm1_executionlogs: 'jm1_executionlogid', contacts: 'contactid', leads: 'leadid' }[set];
        const recordId = body[key];
        if (tables[set].has(recordId)) throw new Error('duplicate key');
        tables[set].set(recordId, { ...body });
        counts[set]++;
        if (set === 'leads' && failAfterLeadCommit) {
          failAfterLeadCommit = false;
          throw new Error('simulated lost response after lead commit');
        }
        return { ...body };
      }
      if (method === 'PATCH') {
        if (set === 'jm1_executionlogs' && failFinalReceiptPatch && JSON.parse(body.jm1_actiondescription).state === INTAKE_STATES.COMPLETED) {
          failFinalReceiptPatch = false;
          throw new Error('simulated failure after business mutation before final receipt');
        }
        if (set === 'jm1_executionlogs' && failAfterReceiptPatch) {
          failAfterReceiptPatch = false;
          throw new Error('simulated receipt patch failure');
        }
        const row = tables[set].get(id);
        if (!row) throw new Error('missing row');
        Object.assign(row, body);
        return {};
      }
      throw new Error(`unexpected ${method} ${path}`);
    }
  };
}

const expectedRoutes = {
  general: 'J Merrill One', publishing: 'J Merrill Publishing', financial: 'J Merrill Financial',
  foundation: 'J Merrill Foundation', productions: 'J Merrill Productions'
};

for (const [intent, route] of Object.entries(expectedRoutes)) {
  const mock = createMock();
  const submission = {
    requestId: randomUUID(), intent, firstName: 'Synthetic', lastName: 'Visitor',
    email: `${intent}@example.invalid`, phone: '', message: 'Controlled intake proof', source: 'test', sourceUrl: 'https://jmerrill.one/contact'
  };
  if (intent === 'productions') {
    submission.source = 'jmerrill.productions/contact';
    submission.sourceUrl = 'https://jmerrill.productions/contact';
    submission.followUpTeamId = '36ee36cf-6ebf-f111-aaaf-6045bdd69435';
  }
  const accepted = await acceptIntake(mock, submission);
  assert.equal(accepted.replay, false);
  assert.equal(accepted.receipt.state, INTAKE_STATES.RECEIVED);
  assert.equal(mock.counts.jm1_executionlogs, 1);
  assert.equal(accepted.receipt.consent.given, true);
  assert.equal(accepted.receipt.consent.purpose, 'respond_to_inquiry');
  assert.equal(accepted.receipt.routingDestination, route);
  if (intent === 'publishing') mock.failLeadOnce();
  const processed = await processIntake(mock, accepted.receipt.id);
  assert.equal(processed.state, INTAKE_STATES.COMPLETED);
  assert.equal(processed.routingDestination, route);
  assert.equal(processed.submission.sourceUrl, submission.sourceUrl);
  if (intent === 'productions') {
    assert.equal(processed.channel, 'jmerrill.productions/contact');
    assert.equal([...mock.tables.leads.values()][0]['ownerid@odata.bind'], `/teams(${submission.followUpTeamId})`);
    assert.equal([...mock.tables.leads.values()][0].description.includes(`Intake receipt: ${accepted.receipt.id}`), true);
  }
  assert.equal(mock.counts.contacts, 1);
  assert.equal(mock.counts.leads, ['publishing', 'financial', 'productions'].includes(intent) ? 1 : 0);
  if (['general', 'foundation'].includes(intent)) {
    assert.equal([...mock.tables.contacts.values()][0].description.includes('Controlled intake proof'), true);
  }
  const replay = await acceptIntake(mock, submission);
  assert.equal(replay.replay, true);
  await processIntake(mock, replay.receipt.id);
  assert.equal(mock.counts.jm1_executionlogs, 1);
  assert.equal(mock.counts.contacts, 1);
  assert.equal(mock.counts.leads, ['publishing', 'financial', 'productions'].includes(intent) ? 1 : 0);
  await assert.rejects(() => acceptIntake(mock, { ...submission, message: 'Changed with same key' }), /already bound/);
}

const pending = createMock();
const submission = {
  requestId: randomUUID(), intent: 'financial', firstName: 'Retry', lastName: 'Proof',
  email: 'retry@example.invalid', phone: '', message: 'Controlled failure proof', source: 'test'
};
const { receipt } = await acceptIntake(pending, submission);
pending.failReceiptPatchOnce();
await assert.rejects(() => processIntake(pending, receipt.id), /receipt patch failure/);
assert.equal(pending.counts.contacts, 0);
const outcomes = await reconcileIntake(pending, new Date(Date.now() + 10 * 60_000));
assert.equal(outcomes[0].state, INTAKE_STATES.COMPLETED);
assert.equal(pending.counts.jm1_executionlogs, 1);
assert.equal(pending.counts.contacts, 1);
assert.equal(pending.counts.leads, 1);

const postWrite = createMock();
const postWriteRequest = { ...submission, requestId: randomUUID(), email: 'postwrite@example.invalid' };
const postWriteReceipt = (await acceptIntake(postWrite, postWriteRequest)).receipt;
postWrite.failFinalReceiptPatchOnce();
await assert.rejects(() => processIntake(postWrite, postWriteReceipt.id), /failure after business mutation/);
assert.equal(postWrite.counts.contacts, 1);
assert.equal(postWrite.counts.leads, 1);
const postWriteReplay = await acceptIntake(postWrite, postWriteRequest);
assert.equal(postWriteReplay.replay, true);
const final = await processIntake(postWrite, postWriteReplay.receipt.id);
assert.equal(final.state, INTAKE_STATES.COMPLETED);
assert.equal(postWrite.counts.jm1_executionlogs, 1);
assert.equal(postWrite.counts.contacts, 1);
assert.equal(postWrite.counts.leads, 1);

const longMessage = createMock();
const longSubmission = {
  requestId: randomUUID(), intent: 'productions', firstName: 'Jane', lastName: 'Smith',
  email: 'long@example.invalid', phone: '', message: 'M'.repeat(700),
  source: 'jmerrill.productions/contact', sourceUrl: 'https://jmerrill.productions/contact',
  followUpTeamId: '36ee36cf-6ebf-f111-aaaf-6045bdd69435'
};
const longReceipt = (await acceptIntake(longMessage, longSubmission)).receipt;
assert.equal((await processIntake(longMessage, longReceipt.id)).state, INTAKE_STATES.COMPLETED);

const legacyOwner = createMock();
const legacySubmission = { ...longSubmission, requestId: randomUUID(), email: 'legacy@example.invalid',
  followUpOwnerId: '5adf7e12-f093-f011-b4cb-6045bdeb7c0e' };
delete legacySubmission.followUpTeamId;
const legacyReceipt = (await acceptIntake(legacyOwner, legacySubmission)).receipt;
assert.equal((await processIntake(legacyOwner, legacyReceipt.id)).state, INTAKE_STATES.COMPLETED);
assert.equal([...legacyOwner.tables.leads.values()][0]['ownerid@odata.bind'],
  `/systemusers(${legacySubmission.followUpOwnerId})`);
const teamAfterCutover = { ...legacySubmission, followUpTeamId: '36ee36cf-6ebf-f111-aaaf-6045bdd69435' };
delete teamAfterCutover.followUpOwnerId;
assert.equal((await acceptIntake(legacyOwner, teamAfterCutover)).replay, true);
assert.equal(legacyOwner.counts.jm1_executionlogs, 1);
assert.equal(legacyOwner.counts.leads, 1);
await assert.rejects(() => acceptIntake(legacyOwner, { ...teamAfterCutover, message: 'Changed after cutover' }),
  /already bound/);

console.log('JM1 front-door intake: 5/5 brand matrix, durable receipt, replay, post-write failure, and timer recovery PASS');
