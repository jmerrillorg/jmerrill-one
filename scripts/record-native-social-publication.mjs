import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { canReconcileNativePublication } from './lib/native-social-publication-status.mjs';

const manifestPath = process.argv[2];
const apply = process.argv.includes('--apply');
if (!manifestPath) throw new Error('Usage: node scripts/record-native-social-publication.mjs <publication.json> [--apply]');

const manifest = JSON.parse(manifestPath === '-' ? readFileSync(0, 'utf8') : readFileSync(manifestPath, 'utf8'));
const allowedBrands = new Set(['J Merrill One', 'J Merrill Publishing', 'J Merrill Financial']);
if (!allowedBrands.has(manifest.brand) || !['facebook', 'instagram', 'linkedin'].includes(manifest.platform)) {
  throw new Error('Unsupported native publication identity');
}
if (!manifest.dataverseRecordId || !manifest.requestedDestination || !manifest.actualDestination
  || !manifest.expectedProductionDestination || !manifest.scheduledAt || !manifest.platformPostId
  || !manifest.publishedDateET || !manifest.observedAt || !manifest.evidenceUrl || !manifest.captionSha256) {
  throw new Error('Publication evidence must include record, destination, planned slot, platform ID, published date, observation, URL, and caption fingerprint');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.publishedDateET)
  || Number.isNaN(Date.parse(manifest.observedAt))
  || (manifest.publishedAt && Number.isNaN(Date.parse(manifest.publishedAt)))) {
  throw new Error('Invalid date/time evidence');
}
if (manifest.mediaSha256 && !/^[a-f0-9]{64}$/.test(manifest.mediaSha256)) throw new Error('Invalid media SHA-256');
if (!/^https:\/\//.test(manifest.evidenceUrl)) throw new Error('Evidence URL must be HTTPS');

function easternDate(value) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${values.year}-${values.month}-${values.day}`;
}
function sameDestination(left, right) {
  return String(left || '').replace(/^@/, '').toLowerCase() === String(right || '').replace(/^@/, '').toLowerCase();
}
if (easternDate(manifest.scheduledAt) !== manifest.publishedDateET) {
  throw new Error('Refusing publication link: actual publication date does not match the source schedule date');
}
if (!sameDestination(manifest.actualDestination, manifest.expectedProductionDestination)) {
  throw new Error('Refusing publication link: actual destination is not the expected production destination');
}

const base = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const evidence = `NATIVE_PUBLICATION|PUBLISHED_DATE_ET=${manifest.publishedDateET}|OBSERVED_AT=${new Date(manifest.observedAt).toISOString().slice(0, 19)}Z`;
if (evidence.length > 120) throw new Error('Compact publication marker exceeds the Dataverse readback field limit');

if (!apply) {
  process.stdout.write(`${JSON.stringify({ mode: 'DRY_RUN', recordId: manifest.dataverseRecordId, evidence }, null, 2)}\n`);
  process.exit(0);
}

const token = execFileSync('az', [
  'account', 'get-access-token', '--resource', base, '--query', 'accessToken', '-o', 'tsv'
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
async function dv(path, options = {}) {
  const response = await fetch(`${base}/api/data/v9.2/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${options.method || 'GET'} failed: HTTP ${response.status} ${(body || '').slice(0, 240)}`);
  return body ? JSON.parse(body) : {};
}

const row = await dv(`jm1_socialexecutions(${manifest.dataverseRecordId})?$select=jm1_socialexecutionid,jm1_branch,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_actualdestination,jm1_actualschedule,jm1_platformpostid,jm1_captionversion,jm1_requestedmediahash,jm1_readbackstate`);
const checks = [
  ['jm1_branch', manifest.brand],
  ['jm1_platform', manifest.platform],
  ['jm1_requestedschedule', manifest.scheduledAt],
  ['jm1_captionversion', manifest.captionSha256],
  ['jm1_requestedmediahash', manifest.mediaSha256 || null]
];
for (const [field, expected] of checks) {
  if ((row[field] || null) !== expected) throw new Error(`Refusing publication link: ${field} does not exactly match the observed content/slot`);
}
if (!sameDestination(row.jm1_requesteddestination, manifest.requestedDestination)) {
  throw new Error('Refusing publication link: requested destination does not match the source record');
}
if (!canReconcileNativePublication(row.jm1_status)) {
  throw new Error(`Refusing status transition from ${row.jm1_status}; only an eligible exact request or verified native booking can be reconciled`);
}
if (row.jm1_status === 'PUBLISHED_VERIFIED') {
  if (row.jm1_platformpostid !== manifest.platformPostId || !String(row.jm1_readbackstate || '').includes(evidence)) {
    throw new Error('Existing publication evidence differs; preserving without overwrite');
  }
  process.stdout.write(`${JSON.stringify({ mode: 'IDEMPOTENT_EXISTING', id: row.jm1_socialexecutionid, platformPostId: row.jm1_platformpostid }, null, 2)}\n`);
  process.exit(0);
}
if (manifest.previousReadbackState != null && row.jm1_readbackstate !== manifest.previousReadbackState) {
  throw new Error('Refusing publication link: the prior readback changed; preserve and reconcile the new history first');
}
if (!row['@odata.etag']) throw new Error('Dataverse row has no ETag; refusing unguarded publication update');

const readback = evidence;
const patch = {
  jm1_status: 'PUBLISHED_VERIFIED',
  jm1_platformpostid: manifest.platformPostId,
  jm1_actualdestination: manifest.actualDestination,
  jm1_actualschedule: manifest.publishedAt ? new Date(manifest.publishedAt).toISOString() : null,
  jm1_verifiedat: new Date(manifest.observedAt).toISOString(),
  jm1_readbackstate: readback
};
await dv(`jm1_socialexecutions(${manifest.dataverseRecordId})`, {
  method: 'PATCH', headers: { 'If-Match': row['@odata.etag'] }, body: JSON.stringify(patch)
});
const verified = await dv(`jm1_socialexecutions(${manifest.dataverseRecordId})?$select=jm1_status,jm1_platformpostid,jm1_actualdestination,jm1_actualschedule,jm1_verifiedat,jm1_readbackstate`);
for (const [field, expected] of Object.entries(patch)) {
  const actualValue = verified[field] || null;
  const expectedValue = expected || null;
  const isDateTime = ['jm1_actualschedule', 'jm1_verifiedat'].includes(field);
  const matches = isDateTime && actualValue && expectedValue
    ? new Date(actualValue).toISOString().slice(0, 19) === new Date(expectedValue).toISOString().slice(0, 19)
    : actualValue === expectedValue;
  if (!matches) throw new Error(`Post-write readback mismatch at ${field}`);
}
process.stdout.write(`${JSON.stringify({ mode: 'PUBLISHED_VERIFIED', id: manifest.dataverseRecordId, platformPostId: verified.jm1_platformpostid, publishedDateET: manifest.publishedDateET, actualPublicationTime: patch.jm1_actualschedule ? 'VERIFIED' : 'UNKNOWN' }, null, 2)}\n`);
