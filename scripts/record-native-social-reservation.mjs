import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const manifestPath = process.argv[2];
const apply = process.argv.includes('--apply');
if (!manifestPath) throw new Error('Usage: node scripts/record-native-social-reservation.mjs <reservation.json> [--apply]');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const allowedBrands = new Set(['J Merrill One', 'J Merrill Publishing', 'J Merrill Financial']);
if (!allowedBrands.has(manifest.brand) || !['facebook', 'instagram', 'linkedin'].includes(manifest.platform)) throw new Error('Unsupported native reservation identity');
if (!manifest.destination || !manifest.localDate || !manifest.localTime || manifest.timeZone !== 'UNVERIFIED') throw new Error('Reservation must preserve the exact local date/time and explicit unverified timezone');
if (!manifest.caption || !/^[a-f0-9]{64}$/.test(manifest.mediaSha256 || '')) throw new Error('Caption and media SHA-256 are required');

const captionSha256 = createHash('sha256').update(manifest.caption).digest('hex');
const identity = [manifest.brand, manifest.platform, manifest.destination.toLowerCase(), manifest.localDate, manifest.localTime, captionSha256, manifest.mediaSha256].join('|');
const keySuffix = createHash('sha256').update(identity).digest('hex');
const marker = 'jm1-native-reservation-v1';
const idempotencyKey = `${marker}:${keySuffix}`;
const name = `${manifest.brand} ${manifest.platform} native reservation ${manifest.localDate} ${manifest.localTime} ${manifest.timeZone}`;
const readback = [
  'NATIVE_POST_SCHEDULED',
  'TZ_UNVERIFIED',
  'NO_EXTERNAL_BOOKING_ID',
  'NO_PUBLICATION_ID'
].join(';');

const payload = {
  jm1_name: name,
  jm1_branch: manifest.brand,
  jm1_platform: manifest.platform,
  jm1_executor: 'META_NATIVE',
  jm1_requesteddestination: manifest.destination,
  jm1_requestedmediahash: manifest.mediaSha256,
  jm1_captionversion: captionSha256,
  jm1_status: 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED',
  jm1_readbackstate: readback,
  jm1_requestedschedule: null,
  jm1_idempotencykey: idempotencyKey
};

if (!apply) {
  process.stdout.write(`${JSON.stringify({ mode: 'DRY_RUN', payload }, null, 2)}\n`);
  process.exit(0);
}

const base = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const token = execFileSync('az', [
  'account', 'get-access-token', '--resource', base, '--query', 'accessToken', '-o', 'tsv'
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

async function dv(path, options = {}) {
  const response = await fetch(`${base}/api/data/v9.2/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers
    }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${options.method || 'GET'} failed: HTTP ${response.status} ${(body || '').slice(0, 300)}`);
  return body ? JSON.parse(body) : {};
}

const found = await dv(`jm1_socialexecutions?$select=jm1_socialexecutionid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_platform,jm1_requesteddestination,jm1_requestedmediahash,jm1_captionversion,jm1_status,jm1_readbackstate&$filter=jm1_idempotencykey%20eq%20'${idempotencyKey}'`);
if ((found.value || []).length > 1) throw new Error('Duplicate reservation idempotency key; refusing to choose a row');
if (found.value?.length === 1) {
  const existing = found.value[0];
  for (const key of ['jm1_name', 'jm1_branch', 'jm1_platform', 'jm1_requesteddestination', 'jm1_requestedmediahash', 'jm1_captionversion', 'jm1_status', 'jm1_readbackstate']) {
    if (existing[key] !== payload[key]) throw new Error(`Existing reservation differs at ${key}; preserving it without overwrite`);
  }
  process.stdout.write(`${JSON.stringify({ mode: 'IDEMPOTENT_EXISTING', id: existing.jm1_socialexecutionid, status: existing.jm1_status, externalBookingId: null, platformPublicationId: null }, null, 2)}\n`);
} else {
  const created = await dv('jm1_socialexecutions', { method: 'POST', body: JSON.stringify(payload) });
  process.stdout.write(`${JSON.stringify({ mode: 'CREATED', id: created.jm1_socialexecutionid || null, status: payload.jm1_status, externalBookingId: null, platformPublicationId: null, timeZone: 'UNVERIFIED' }, null, 2)}\n`);
}
