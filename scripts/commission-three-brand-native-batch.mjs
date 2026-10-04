import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifestPath = process.argv[2];
const apply = process.argv.includes('--apply');
if (!manifestPath) throw new Error('Usage: node scripts/commission-three-brand-native-batch.mjs <manifest.json> [--apply]');

const base = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const batch = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (batch.version !== 1 || !Array.isArray(batch.items) || batch.items.length === 0) {
  throw new Error('Invalid native social batch manifest');
}

const validated = batch.items.map((item) => {
  if (!['J Merrill One', 'J Merrill Publishing', 'J Merrill Financial'].includes(item.brand)) throw new Error(`Invalid brand ${item.ref}`);
  if (!['facebook', 'linkedin'].includes(item.platform)) throw new Error(`Invalid platform ${item.ref}`);
  if (!item.ref || !item.caption || !item.asset || !item.sha256 || !item.source || !item.destinationId) throw new Error(`Incomplete item ${item.ref}`);
  if (!new URL(item.source).hostname.match(/^(www\.)?(jmerrill\.one|jmerrill\.financial|jmerrill\.pub)$/)) throw new Error(`Untrusted source ${item.ref}`);
  const actualHash = createHash('sha256').update(readFileSync(resolve(item.asset))).digest('hex');
  if (actualHash !== item.sha256) throw new Error(`Media hash mismatch ${item.ref}`);
  const captionHash = createHash('sha256').update(item.caption).digest('hex');
  return { ...item, captionHash };
});

if (!apply) {
  console.log(JSON.stringify({ mode: 'DRY_RUN', count: validated.length, items: validated.map(({ ref, captionHash, sha256 }) => ({ ref, captionHash, sha256 })) }, null, 2));
  process.exit(0);
}

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
  if (!response.ok) throw new Error(`Dataverse ${path.split('?')[0]} HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.status === 204 ? {} : response.json();
}

async function ensure(set, idColumn, key, payload, checkColumns) {
  const url = new URL(`${base}/api/data/v9.2/${set}`);
  url.searchParams.set('$select', [idColumn, 'jm1_idempotencykey', ...checkColumns].join(','));
  url.searchParams.set('$filter', `jm1_idempotencykey eq '${key.replaceAll("'", "''")}'`);
  const found = (await dv(`${set}${url.search}`)).value || [];
  if (found.length > 1) throw new Error(`Duplicate authority key ${key}`);
  if (found.length === 1) {
    for (const column of checkColumns) {
      if (found[0][column] !== payload[column]) throw new Error(`Existing ${key} differs at ${column}`);
    }
    return { id: found[0][idColumn], created: false };
  }
  const created = await dv(set, { method: 'POST', body: JSON.stringify(payload) });
  return { id: created[idColumn], created: true };
}

const results = [];
for (const item of validated) {
  const marker = `jm1-native-social-2026-10:${item.brand.replaceAll(' ', '-').toLowerCase()}`;
  const key = `${marker}:${item.ref.toLowerCase()}`;
  const campaign = await ensure('jm1_campaignauthorities', 'jm1_campaignauthorityid', `${marker}:campaign`, {
    jm1_name: `${item.brand} October 2026 native social`,
    jm1_branch: item.brand,
    jm1_program: 'Three-brand social presence',
    jm1_campaigntype: 'native_social',
    jm1_subject: 'Source-backed educational and brand content',
    jm1_audience: 'Public brand audience',
    jm1_cta: 'Use the exact item link',
    jm1_cadence: 'Rolling 14-day reviewed coverage',
    jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.',
    jm1_idempotencykey: `${marker}:campaign`
  }, ['jm1_branch', 'jm1_state']);
  const content = await ensure('jm1_contentworks', 'jm1_contentworkid', `${key}:content`, {
    jm1_name: `${item.ref} exact native caption`,
    jm1_branch: item.brand,
    jm1_stage: item.ref.toLowerCase(),
    jm1_audience: 'Public brand audience',
    jm1_copybrief: `Standing founder marketing authority; source ${item.source}; caption SHA-256 ${item.captionHash}; batch ${batch.id}`,
    jm1_draftcopy: item.caption,
    jm1_publicreadystate: 'PASS',
    jm1_idempotencykey: `${key}:content`
  }, ['jm1_draftcopy', 'jm1_publicreadystate']);
  const creative = await ensure('jm1_creativeworks', 'jm1_creativeworkid', `${key}:creative`, {
    jm1_name: `${item.ref} exact visual`,
    jm1_branch: item.brand,
    jm1_stage: item.ref.toLowerCase(),
    jm1_assetpath: item.asset,
    jm1_assethash: item.sha256,
    jm1_dimensions: item.dimensions,
    jm1_publicreadystate: 'PASS',
    jm1_idempotencykey: `${key}:creative`
  }, ['jm1_assethash', 'jm1_publicreadystate']);
  const social = await ensure('jm1_socialexecutions', 'jm1_socialexecutionid', `${key}:social`, {
    jm1_name: `${item.ref} native execution`,
    jm1_branch: item.brand,
    jm1_platform: item.platform,
    jm1_executor: item.executor,
    jm1_requesteddestination: item.destinationId,
    jm1_requestedmediahash: item.sha256,
    jm1_captionversion: item.captionHash,
    jm1_status: item.nativeState,
    jm1_readbackstate: 'EXACT_CONTENT_MEDIA_BOUND_BOOKING_PENDING',
    jm1_idempotencykey: `${key}:social`,
    jm1_requestedschedule: item.scheduledAt
  }, ['jm1_requestedmediahash', 'jm1_captionversion']);
  results.push({ ref: item.ref, campaign, content, creative, social });
}

console.log(JSON.stringify({ mode: 'APPLIED', count: results.length, results }, null, 2));
