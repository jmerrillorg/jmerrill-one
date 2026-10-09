import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { actionFormXml, resourceName, restoreActionFormXml } from './jsj-inquiry-action-form.mjs';
import { formId, table } from './jsj-inquiry-review-form.mjs';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const restore = process.argv.includes('--restore');
if (apply && restore) throw new Error('Choose --apply or --restore');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;
const source = readFileSync(new URL('../powerplatform/webresources/jm1_jsj_inquiry_review.html', import.meta.url));
const content = source.toString('base64');
const sourceHash = createHash('sha256').update(source).digest('hex');

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json',
      'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': 'JMerrillOne', ...init.headers },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 400)}`);
  return { value: body ? JSON.parse(body) : {}, etag: response.headers.get('etag') };
}

async function resource() {
  const filter = encodeURIComponent(`name eq '${resourceName}'`);
  const rows = (await request(`/webresourceset?$select=webresourceid,name,webresourcetype,content&$filter=${filter}`)).value.value;
  if (rows.length > 1) throw new Error('Duplicate JSJ review resources');
  if (rows[0] && rows[0].webresourcetype !== 1) throw new Error('JSJ review resource type drift');
  return rows[0] || null;
}

let web = await resource();
if (apply && !web) {
  await request('/webresourceset', { method: 'POST', body: JSON.stringify({
    name: resourceName, displayname: 'JSJ inquiry review action', webresourcetype: 1, content,
  }) });
  web = await resource();
} else if (apply && web.content !== content) {
  await request(`/webresourceset(${web.webresourceid})`, {
    method: 'PATCH', body: JSON.stringify({ content }),
  });
  web = await resource();
}
if (apply) await request('/PublishXml', { method: 'POST', body: JSON.stringify({
  ParameterXml: `<importexportxml><webresources><webresource>${web.webresourceid}</webresource></webresources></importexportxml>`,
}) });
// Dataverse returns the published layer from webresourceset after PATCH.
if (apply) web = await resource();
if ((apply || restore) && (!web || web.content !== content)) throw new Error('JSJ review resource readback mismatch');
if (!web) {
  console.log(JSON.stringify({ mode: 'READ_ONLY', resourcePresent: false, sourceHash }, null, 2));
  process.exit(0);
}
const path = `/systemforms(${formId})?$select=formid,name,type,objecttypecode,formactivationstate,ismanaged,iscustomizable,formxml`;
const before = await request(path);
const form = before.value;
if (form.formid !== formId || form.objecttypecode !== table || form.type !== 2 ||
    form.formactivationstate !== 1 || form.ismanaged || !form.iscustomizable?.Value)
  throw new Error('Unexpected JSJ form authority');
const target = restore ? restoreActionFormXml(form.formxml, web.webresourceid) : actionFormXml(form.formxml, web.webresourceid);
if ((apply || restore) && target !== form.formxml) {
  const etag = before.etag || form['@odata.etag'];
  if (!etag) throw new Error('JSJ form row version unavailable');
  await request(`/systemforms(${formId})`, { method: 'PATCH',
    headers: { 'If-Match': etag }, body: JSON.stringify({ formxml: target }) });
  await request('/PublishXml', { method: 'POST', body: JSON.stringify({
    ParameterXml: `<importexportxml><entities><entity>${table}</entity></entities></importexportxml>`,
  }) });
}
const after = (await request(path)).value;
if ((apply || restore) && after.formxml !== target) throw new Error('JSJ action form readback mismatch');
console.log(JSON.stringify({ mode: restore ? 'RESTORE' : apply ? 'APPLY' : 'READ_ONLY', formId,
  resourceId: web.webresourceid, sourceHash, resourceMatchesSource: web.content === content,
  actionPresent: after.formxml.includes('WebResource_JSJInquiryReview') }, null, 2));
