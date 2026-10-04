import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { leadId, receiptId } from '../runtime/jm1-marketing-autonomous-functions/src/lib/intake.js';
import { dispositionManifestId, prepareProductionsBp09Disposition, scanProductionsBp09DispositionCandidates } from
  '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09Disposition.js';

const requestId = randomUUID();
const id = receiptId(requestId);
const leadReference = leadId(requestId);
const contactReference = randomUUID();
const receivedAt = '2026-10-03T20:00:00.000Z';
const now = new Date('2027-10-04T00:00:00.000Z');
const receipt = { version: 2, id, requestId, digest: 'a'.repeat(64), receivedAt,
  channel: 'jmerrill.productions/contact', routingDestination: 'J Merrill Productions',
  state: 'COMPLETED', finalState: 'LEAD_CREATED', leadReference, contactReference,
  consent: { given: true, purpose: 'respond_to_inquiry' },
  submission: { intent: 'productions', message: '' } };

function fixture(detail = receipt) {
  const logs = new Map([[detail.id, { jm1_executionlogid: detail.id,
    jm1_actiontype: 'BP09WebsiteIntakeV2', jm1_executionstatus: 835500001,
    jm1_actiondescription: JSON.stringify(detail) }]]);
  const lead = { leadid: detail.leadReference, _parentcontactid_value: detail.contactReference,
    description: `Source: Website\nIntake receipt: ${detail.id}\n\nPrivate synthetic body` };
  let writes = 0;
  const adapter = { async request(path, method = 'GET', body) {
    if (path === '/jm1_executionlogs' && method === 'POST') {
      writes++;
      logs.set(body.jm1_executionlogid, body);
      return body;
    }
    const logId = path.match(/^\/jm1_executionlogs\(([0-9a-f-]+)\)$/)?.[1];
    if (logId) return logs.get(logId) || null;
    if (path.startsWith('/jm1_executionlogs?$select=')) return { value: [logs.get(detail.id)] };
    if (path === `/leads(${detail.leadReference})?$select=leadid,_parentcontactid_value,description`) return lead;
    if (path.startsWith('/leads?$select=leadid')) return { value: [{ leadid: lead.leadid }] };
    if (path === `/contacts(${detail.contactReference})?$select=contactid`) return { contactid: detail.contactReference };
    throw new Error(`unexpected ${method} ${path}`);
  } };
  return { adapter, logs, lead, get writes() { return writes; } };
}

const current = fixture();
assert.deepEqual(await prepareProductionsBp09Disposition({ adapter: current.adapter, id,
  now: new Date('2027-10-03T19:59:59.000Z') }), { state: 'RETAIN', dueAt: '2027-10-03T20:00:00.000Z' });
assert.equal(current.writes, 0);
const prepared = await prepareProductionsBp09Disposition({ adapter: current.adapter, id, now });
assert.equal(prepared.state, 'PENDING_PRODUCTIONS_OWNER_REVIEW');
assert.equal(prepared.manifestId, dispositionManifestId(id));
assert.equal(prepared.manifest.dueAt, '2027-10-03T20:00:00.000Z');
assert.equal(JSON.stringify(prepared).includes('Private synthetic body'), false);
assert.equal(current.writes, 1);
assert.equal((await prepareProductionsBp09Disposition({ adapter: current.adapter, id, now })).manifestId,
  prepared.manifestId);
assert.equal(current.writes, 1);
assert.equal((await scanProductionsBp09DispositionCandidates({ adapter: current.adapter, now }))[0].state,
  'PENDING_PRODUCTIONS_OWNER_REVIEW');
assert.equal(current.writes, 1);

const otherBrand = fixture({ ...receipt, routingDestination: 'J Merrill Publishing',
  submission: { intent: 'publishing', message: '' } });
assert.deepEqual(await scanProductionsBp09DispositionCandidates({ adapter: otherBrand.adapter, now }), []);
assert.equal(otherBrand.writes, 0);

const duplicate = fixture();
const originalRequest = duplicate.adapter.request;
duplicate.adapter.request = async (path, method, body) => path.startsWith('/leads?$select=leadid')
  ? { value: [{ leadid: leadReference }, { leadid: randomUUID() }] }
  : originalRequest(path, method, body);
await assert.rejects(() => prepareProductionsBp09Disposition({ adapter: duplicate.adapter, id, now }),
  /DISPOSITION_BINDING_INVALID/);
assert.equal(duplicate.writes, 0);

const changed = fixture({ ...receipt, leadReference: randomUUID() });
await assert.rejects(() => prepareProductionsBp09Disposition({ adapter: changed.adapter, id, now }),
  /DISPOSITION_SOURCE_INVALID/);
assert.equal(changed.writes, 0);

const uncommitted = fixture();
uncommitted.logs.get(id).jm1_executionstatus = 835500000;
await assert.rejects(() => prepareProductionsBp09Disposition({ adapter: uncommitted.adapter, id, now }),
  /DISPOSITION_SOURCE_INVALID/);
assert.equal(uncommitted.writes, 0);

const legacyRequestId = '7bf5a58f-51c3-432d-a90f-0addc24b273e';
const legacyId = '34d724a8-4ed5-418e-a709-b23319448e2f';
assert.equal(receiptId(legacyRequestId), legacyId);
const legacy = fixture({ ...receipt, id: legacyId, requestId: legacyRequestId,
  leadReference: leadId(legacyRequestId), channel: 'jmerrill.one/contact' });
assert.equal((await prepareProductionsBp09Disposition({ adapter: legacy.adapter,
  id: legacyId, now: new Date('2027-10-03T19:59:59.000Z') })).state, 'RETAIN');
assert.equal(legacy.writes, 0);
assert.equal((await prepareProductionsBp09Disposition({ adapter: legacy.adapter,
  id: legacyId, now })).state, 'PENDING_LEGACY_SOURCE_REVIEW');
assert.equal(legacy.writes, 1);

const conflict = fixture();
const conflictingId = dispositionManifestId(id);
conflict.logs.set(conflictingId, { jm1_executionlogid: conflictingId, jm1_actiontype: 'OTHER',
  jm1_sourcerecordid: id, jm1_actiondescription: '{}' });
await assert.rejects(() => prepareProductionsBp09Disposition({ adapter: conflict.adapter, id, now }),
  /DISPOSITION_MANIFEST_CONFLICT/);
assert.equal(conflict.writes, 0);

console.log('Productions BP-09 disposition: due, durable manifest, replay, unique binding, and fail-closed guards PASS');
