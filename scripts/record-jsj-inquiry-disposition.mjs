import { execFileSync } from 'node:child_process';
import { dispositionPatch } from './lib/jsj-inquiry-disposition.mjs';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const args = Object.fromEntries(process.argv.slice(2).filter((arg) => arg.startsWith('--') && arg.includes('=')).map((arg) => arg.slice(2).split(/=(.*)/s).slice(0, 2)));
const apply = process.argv.includes('--apply');
const id = args.id;
const reference = args.reference;
if (!/^[0-9a-f-]{36}$/i.test(id || '') || !/^JSJ-[A-Z0-9]+$/.test(reference || '')) throw new Error('Exact row ID and reference required');
if (!args.source || !args.decidedBy || !args.outcome) throw new Error('Outcome, decision maker, and source required');
const account = JSON.parse(execFileSync('az', ['account', 'show', '-o', 'json'], { encoding: 'utf8' }));
const recordedBy = `${account.user?.name || 'unknown'} (Codex operator)`;
if (recordedBy.startsWith('unknown')) throw new Error('Authenticated recording actor unavailable');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;
const fields = 'jm1_jsjinquiryid,jm1_name,jm1_deliverystate,jm1_closedat,jm1_disposition,jm1_dispositiondecidedby,jm1_dispositiondecisionat,jm1_dispositionsource,jm1_dispositionrecordedby,jm1_dispositionrecordedat,_ownerid_value';
const path = `/jm1_jsjinquiries(${id})`;
const before = await request(`${path}?$select=${fields}`);
const etag = before['@odata.etag'];
if (!etag) throw new Error('Inquiry row version unavailable');
const patch = dispositionPatch(before, {
  id, reference, outcome: args.outcome, decidedBy: args.decidedBy,
  decisionAt: args.decisionAt || null, source: args.source,
  recordedBy, recordedAt: new Date().toISOString(),
});
if (apply) {
  await request(path, { method: 'PATCH', headers: { 'If-Match': etag }, body: JSON.stringify(patch) });
  const after = await request(`${path}?$select=${fields}`);
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'jm1_closedat' || key === 'jm1_dispositionrecordedat' || key === 'jm1_dispositiondecisionat') {
      if (value === null ? after[key] !== null : new Date(after[key]).getTime() !== new Date(value).getTime()) throw new Error(`Disposition readback mismatch: ${key}`);
    } else if (after[key] !== value) throw new Error(`Disposition readback mismatch: ${key}`);
  }
  if (after.jm1_jsjinquiryid !== id || after.jm1_name !== reference || after.jm1_deliverystate !== before.jm1_deliverystate || after._ownerid_value !== before._ownerid_value) throw new Error('Inquiry invariant changed');
  console.log(JSON.stringify({ mode: 'APPLY', id, reference, beforeEtag: etag, afterEtag: after['@odata.etag'], disposition: after.jm1_disposition, closedAt: after.jm1_closedat, decisionAt: after.jm1_dispositiondecisionat, decidedBy: after.jm1_dispositiondecidedby, source: after.jm1_dispositionsource, recordedBy: after.jm1_dispositionrecordedby, recordedAt: after.jm1_dispositionrecordedat }, null, 2));
} else {
  console.log(JSON.stringify({ mode: 'READ_ONLY', id, reference, beforeEtag: etag, proposed: patch }, null, 2));
}

async function request(resource, init = {}) {
  const response = await fetch(`${api}${resource}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${resource}: ${response.status} ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : {};
}
