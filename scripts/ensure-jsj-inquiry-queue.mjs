import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const name = 'jm1_jsj_inquiry_queue.html';
const source = readFileSync(new URL('../powerplatform/webresources/jm1_jsj_inquiry_queue.html', import.meta.url));
const content = source.toString('base64');
const sourceHash = createHash('sha256').update(source).digest('hex');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json',
      'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': 'JMerrillOne', ...init.headers },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : {};
}

async function resource() {
  const filter = encodeURIComponent(`name eq '${name}'`);
  const rows = (await request(`/webresourceset?$select=webresourceid,name,webresourcetype,content&$filter=${filter}`)).value;
  if (rows.length > 1 || rows[0] && rows[0].webresourcetype !== 1) throw new Error('JSJ queue resource authority drift');
  return rows[0] || null;
}

let web = await resource();
if (apply && !web) {
  await request('/webresourceset', { method: 'POST', body: JSON.stringify({
    name, displayname: 'JSJ private inquiry review queue', webresourcetype: 1, content,
  }) });
  web = await resource();
} else if (apply && web.content !== content) {
  await request(`/webresourceset(${web.webresourceid})`, { method: 'PATCH', body: JSON.stringify({ content }) });
}
if (apply) {
  if (!web) throw new Error('JSJ queue resource missing after create');
  await request('/PublishXml', { method: 'POST', body: JSON.stringify({
    ParameterXml: `<importexportxml><webresources><webresource>${web.webresourceid}</webresource></webresources></importexportxml>`,
  }) });
  web = await resource();
  if (web?.content !== content) throw new Error('Published JSJ queue source does not match repository');
}
console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'READ_ONLY', name,
  resourceId: web?.webresourceid || null, sourceHash, resourceMatchesSource: web?.content === content,
  privateUrl: `${url}/main.aspx?pagetype=webresource&webresourceName=${encodeURIComponent(name)}` }, null, 2));
