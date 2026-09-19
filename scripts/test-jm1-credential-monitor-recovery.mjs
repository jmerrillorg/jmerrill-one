import assert from 'node:assert/strict';

import {
  CREDENTIAL_STATES,
  classifyCredentialMetadata
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/runtime.js';
import {
  buildCredentialMonitorRecords,
  executeCredentialMonitorScan
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/credentialMonitor.js';

const now = new Date('2026-09-18T12:00:00.000Z');
const atDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const state = (metadata) => classifyCredentialMetadata(metadata, now).state;

const scenarios = [
  ['null expiration', { expiresAt: null }, CREDENTIAL_STATES.EXPIRATION_UNKNOWN],
  ['empty expiration', { expiresAt: '' }, CREDENTIAL_STATES.EXPIRATION_UNKNOWN],
  ['missing expiration', {}, CREDENTIAL_STATES.EXPIRATION_UNKNOWN],
  ['known valid', { expiresAt: atDays(61) }, CREDENTIAL_STATES.KNOWN_VALID],
  ['60 day boundary', { expiresAt: atDays(60) }, CREDENTIAL_STATES.EXPIRING_60D],
  ['30 day boundary', { expiresAt: atDays(30) }, CREDENTIAL_STATES.EXPIRING_30D],
  ['14 day boundary', { expiresAt: atDays(14) }, CREDENTIAL_STATES.EXPIRING_14D],
  ['7 day boundary', { expiresAt: atDays(7) }, CREDENTIAL_STATES.EXPIRING_7D],
  ['expired', { expiresAt: atDays(-1) }, CREDENTIAL_STATES.EXPIRED],
  ['malformed timestamp', { expiresAt: 'September someday' }, CREDENTIAL_STATES.INVALID_METADATA],
  ['timezone missing', { expiresAt: '2026-10-01T12:00:00' }, CREDENTIAL_STATES.INVALID_METADATA],
  ['nonexpiring proven', { nonexpiringProven: true }, CREDENTIAL_STATES.NONEXPIRING_PROVEN],
  ['credential not issued', { notIssued: true }, CREDENTIAL_STATES.NOT_ISSUED],
  ['provider readback unavailable', { readbackAvailable: false }, CREDENTIAL_STATES.READBACK_FAILED],
  ['issued after expiration', { issuedAt: atDays(2), expiresAt: atDays(1) }, CREDENTIAL_STATES.INVALID_METADATA],
  ['rotation after expiration', { rotationDueAt: atDays(2), expiresAt: atDays(1) }, CREDENTIAL_STATES.INVALID_METADATA],
  ['rotation due before expiration', { rotationDueAt: atDays(-1), expiresAt: atDays(30) }, CREDENTIAL_STATES.ROTATION_DUE]
];

for (const [name, metadata, expected] of scenarios) {
  assert.equal(state(metadata), expected, name);
}

const precise = '2026-12-01T12:00:00.123456Z';
assert.equal(classifyCredentialMetadata({ expiresAt: precise }, now).expiresAt, precise);

const records = buildCredentialMonitorRecords({
  marker: 'credential-monitor-proof',
  verifiedAt: now.toISOString(),
  meta: {
    present: true,
    reference: 'vault/meta-token',
    secretVersion: 'metadata-only',
    issuedAt: '',
    expiresAt: '',
    rotationDueAt: ''
  },
  linkedin: {
    present: false,
    reference: 'vault/linkedin-token',
    expiresAt: ''
  }
});

assert.equal(records[0].state, CREDENTIAL_STATES.EXPIRATION_UNKNOWN);
assert.equal(records[0].payload.jm1_expiresat, null);
assert.equal(records[0].payload.jm1_rotationdueat, null);
assert.equal(records[1].state, CREDENTIAL_STATES.NOT_ISSUED);
assert.equal(records[1].payload.jm1_expiresat, null);

const attempted = [];
const isolatedScan = await executeCredentialMonitorScan(records, async (payload) => {
  attempted.push(payload.jm1_platform);
  if (payload.jm1_platform === 'Meta') throw new Error('controlled Dataverse write failure');
  return { id: 'existing-linkedin-row', created: false };
});
assert.deepEqual(attempted, ['Meta', 'LinkedIn']);
assert.equal(isolatedScan.processed, 2);
assert.equal(isolatedScan.succeeded, 1);
assert.equal(isolatedScan.failed, 1);
assert.equal(isolatedScan.results[0].state, CREDENTIAL_STATES.READBACK_FAILED);

const rowStore = new Map();
const upsert = async (payload) => {
  const created = !rowStore.has(payload.jm1_idempotencykey);
  rowStore.set(payload.jm1_idempotencykey, payload);
  return { id: payload.jm1_idempotencykey, created };
};
const first = await executeCredentialMonitorScan(records, upsert);
const second = await executeCredentialMonitorScan(records, upsert);
assert.equal(first.succeeded, 2);
assert.equal(second.succeeded, 2);
assert.equal(rowStore.size, 2);
assert.ok(second.results.every((result) => result.write.created === false));

console.log(JSON.stringify({
  artifact: 'JM1-ONE-CRED-001-NEGATIVE-TESTS',
  passed: scenarios.length + 12,
  failed: 0,
  scanIdempotency: 'PASS',
  oneBadCredentialIsolation: 'PASS',
  secretValuesLogged: false
}, null, 2));
