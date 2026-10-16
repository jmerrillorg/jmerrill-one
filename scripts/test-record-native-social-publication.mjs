import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('./record-native-social-publication.mjs', import.meta.url);
const temp = mkdtempSync(path.join(os.tmpdir(), 'jm1-publication-receipt-'));
const base = {
  dataverseRecordId: 'f15ced8b-05c7-f111-aaaf-00224820105b',
  brand: 'J Merrill One',
  platform: 'linkedin',
  requestedDestination: '106683183',
  actualDestination: '106683183',
  expectedProductionDestination: '106683183',
  scheduledAt: '2026-10-15T14:00:00Z',
  publishedDateET: '2026-10-15',
  publishedAt: null,
  platformPostId: 'urn:li:share:7515757146525810688',
  observedAt: '2026-10-16T13:00:00Z',
  evidenceUrl: 'https://www.linkedin.com/company/106683183/admin/page-posts/published/',
  source: 'LINKEDIN_NATIVE_PUBLISHED_LIST',
  captionSha256: '27a8d6c6cdc34ae4fadd86a1394327b8fa670f95e06f444eaca132e098a23cfc',
  mediaSha256: null
};

function run(manifest, name) {
  const manifestPath = path.join(temp, `${name}.json`);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  return spawnSync(process.execPath, [script.pathname, manifestPath], { encoding: 'utf8' });
}

try {
  const valid = run(base, 'valid');
  assert.equal(valid.status, 0, valid.stderr);
  assert.equal(JSON.parse(valid.stdout).mode, 'DRY_RUN');
  assert.match(valid.stdout, /PUBLISHED_DATE_ET=2026-10-15/);
  assert.ok(JSON.parse(valid.stdout).evidence.length <= 120);
  assert.match(valid.stdout, /recordId.*f15ced8b/);

  const stdin = spawnSync(process.execPath, [script.pathname, '-'], { input: JSON.stringify(base), encoding: 'utf8' });
  assert.equal(stdin.status, 0, stdin.stderr);
  assert.equal(JSON.parse(stdin.stdout).mode, 'DRY_RUN');

  const missingRequestedDestination = run({ ...base, requestedDestination: '' }, 'missing-requested-destination');
  assert.notEqual(missingRequestedDestination.status, 0);

  const wrongActualDestination = run({ ...base, actualDestination: '1270611542802820' }, 'wrong-actual-destination');
  assert.notEqual(wrongActualDestination.status, 0);

  const wrongPublicationDate = run({ ...base, publishedDateET: '2026-10-16' }, 'wrong-publication-date');
  assert.notEqual(wrongPublicationDate.status, 0);

  process.stdout.write('Publication receipt validation tests passed (5 cases).\n');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
