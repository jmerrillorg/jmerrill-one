import { execFileSync } from 'node:child_process';
import { eligibleForDeletion, retentionCutoff } from './lib/jsj-retention-policy.mjs';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;
const cutoff = retentionCutoff(new Date());
const fields = 'jm1_jsjinquiryid,jm1_name,jm1_closedat,jm1_retentionhold,jm1_transferredat,jm1_authoritativerecord';
const filter = `jm1_closedat lt ${cutoff.toISOString()} and jm1_retentionhold eq null and jm1_transferredat eq null and jm1_authoritativerecord eq null`;
let path = `/jm1_jsjinquiries?$select=${fields}&$filter=${encodeURIComponent(filter)}&$top=500`;
const candidates = [];
while (path) {
  const page = await request(path);
  for (const row of page.value) {
    if (!eligibleForDeletion(row, cutoff)) {
      throw new Error(`Retention safety check failed for ${row.jm1_name}`);
    }
    candidates.push({ id: row.jm1_jsjinquiryid, reference: row.jm1_name });
  }
  path = page['@odata.nextLink']?.replace(api, '') || null;
}
if (apply) {
  for (const candidate of candidates) {
    const current = await request(`/jm1_jsjinquiries(${candidate.id})?$select=${fields}`);
    if (!eligibleForDeletion(current, cutoff)) continue;
    if (!current['@odata.etag']) throw new Error(`Missing row version for ${candidate.reference}`);
    await request(`/jm1_jsjinquiries(${candidate.id})`, { method: 'DELETE', headers: { 'If-Match': current['@odata.etag'] } });
  }
}
console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'READ_ONLY', cutoff: cutoff.toISOString(), count: candidates.length, references: candidates.map((item) => item.reference) }, null, 2));

async function request(path, init = {}) {
  const response = await fetch(path.startsWith('https:') ? path : `${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse retention ${init.method || 'GET'} failed (${response.status}): ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : {};
}
