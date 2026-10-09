import { execFileSync } from 'node:child_process';
import { addedRows, formId, reviewFormXml, restoreFormXml, table } from './jsj-inquiry-review-form.mjs';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const restore = process.argv.includes('--restore');
if (apply && restore) throw new Error('Choose --apply or --restore');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': 'JMerrillOne',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 400)}`);
  return { value: body ? JSON.parse(body) : {}, etag: response.headers.get('etag') };
}

const path = `/systemforms(${formId})?$select=formid,name,type,objecttypecode,formactivationstate,ismanaged,iscustomizable,formxml`;
const before = await request(path);
const form = before.value;
if (form.formid !== formId || form.objecttypecode !== table || form.type !== 2 || form.formactivationstate !== 1 || form.ismanaged || !form.iscustomizable?.Value) {
  throw new Error('Unexpected JSJ main form authority');
}
const target = restore ? restoreFormXml(form.formxml) : reviewFormXml(form.formxml);
const changed = target !== form.formxml;
if ((apply || restore) && changed) {
  const etag = before.etag || form['@odata.etag'];
  if (!etag) throw new Error('JSJ form row version unavailable');
  await request(`/systemforms(${formId})`, {
    method: 'PATCH',
    headers: { 'If-Match': etag },
    body: JSON.stringify({ formxml: target }),
  });
  await request('/PublishXml', {
    method: 'POST',
    body: JSON.stringify({ ParameterXml: `<importexportxml><entities><entity>${table}</entity></entities></importexportxml>` }),
  });
}
let after = form;
if (apply || restore) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    after = (await request(path)).value;
    if (after.formxml === target) break;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
if ((apply || restore) && after.formxml !== target) throw new Error('Published JSJ form readback did not match the target');
reviewFormXml(after.formxml);
console.log(JSON.stringify({ environment: url, formId, table, mode: restore ? 'RESTORE' : apply ? 'APPLY' : 'READ_ONLY', changed: (apply || restore) && changed, reviewFieldsPresent: after.formxml.includes(addedRows) }, null, 2));
