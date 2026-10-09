import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const guard = process.argv.includes('--guard');
if (guard && !apply) throw new Error('--guard requires --apply');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${url}/api/data/v9.2`;
const assemblyName = 'jm1-jsj-inquiry-reviewer-plugin';
const actionName = 'jm1_ReviewJSJInquiry';
const types = ['Jm1.Jsj.InquiryReview.ReviewJSJInquiry', 'Jm1.Jsj.InquiryReview.GuardJSJReviewFields'];
const fields = [
  'jm1_disposition', 'jm1_dispositiondecidedby', 'jm1_dispositiondecisionat',
  'jm1_dispositionsource', 'jm1_dispositionrecordedby', 'jm1_dispositionrecordedat',
  'jm1_closedat', 'jm1_reviewnextaction', 'jm1_reviewdueat',
  'jm1_reviewexternalreference', 'jm1_reviewhistory',
];

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json',
      'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': 'JMerrillOne', ...init.headers },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 400)}`);
  return body ? JSON.parse(body) : {};
}

async function unique(path, label) {
  const rows = (await request(path)).value;
  if (rows.length > 1) throw new Error(`Duplicate ${label}`);
  return rows[0] || null;
}

let assembly = await unique(`/pluginassemblies?$select=pluginassemblyid,name&$filter=name eq '${assemblyName}'`, 'JSJ assembly');
if (apply) {
  const content = readFileSync(new URL('../runtime/jm1-jsj-inquiry-reviewer-plugin/bin/Release/net48/jm1-jsj-inquiry-reviewer-plugin.dll', import.meta.url)).toString('base64');
  if (!assembly) await request('/pluginassemblies', { method: 'POST', body: JSON.stringify({
    name: assemblyName, content, sourcetype: 0, isolationmode: 2,
    description: 'Bounded Jackie Smith Jr. inquiry review action and field guard',
  }) });
  else await request(`/pluginassemblies(${assembly.pluginassemblyid})`, { method: 'PATCH', body: JSON.stringify({ content }) });
  assembly = await unique(`/pluginassemblies?$select=pluginassemblyid,name&$filter=name eq '${assemblyName}'`, 'JSJ assembly');
}
if (!assembly && apply) throw new Error('JSJ assembly registration unavailable');
const registeredTypes = {};
if (assembly) {
  for (const name of types) {
    let type = await unique(`/plugintypes?$select=plugintypeid,typename&$filter=typename eq '${name}'`, name);
    if (!type && apply) {
      await request('/plugintypes', { method: 'POST', body: JSON.stringify({
        name, typename: name, friendlyname: name.split('.').at(-1), assemblyname: assemblyName,
        version: '1.0.0.0', 'pluginassemblyid@odata.bind': `pluginassemblies(${assembly.pluginassemblyid})`,
      }) });
      type = await unique(`/plugintypes?$select=plugintypeid,typename&$filter=typename eq '${name}'`, name);
    }
    registeredTypes[name] = type?.plugintypeid || null;
  }
}
let customApi = await unique(`/customapis?$select=customapiid,uniquename,_plugintypeid_value,executeprivilegename&$filter=uniquename eq '${actionName}'`, 'JSJ review API');
if (!customApi && apply) {
  const names = ['InquiryId', 'IdempotencyKey', 'Reference', 'ActionId', 'ExpectedVersion',
    'NextAction', 'DueAt', 'ExternalReference', 'Reason', 'TargetState', 'CorrectionOf'];
  await request('/customapis', { method: 'POST', body: JSON.stringify({
    uniquename: actionName, name: actionName, displayname: 'Review JSJ Inquiry',
    description: 'Jackie-only, row-versioned inquiry review; no customer communication.',
    bindingtype: 0, isfunction: false, isprivate: false, allowedcustomprocessingsteptype: 0,
    executeprivilegename: 'prvReadjm1_JSJInquiry',
    'PluginTypeId@odata.bind': `plugintypes(${registeredTypes[types[0]]})`,
    CustomAPIRequestParameters: names.map((name) => ({
      name: `${actionName}.${name}`, uniquename: name, displayname: name,
      type: name === 'InquiryId' || name === 'IdempotencyKey' ? 12 : 10,
      isoptional: false,
    })),
    CustomAPIResponseProperties: [{ name: `${actionName}.Result`, uniquename: 'Result', displayname: 'Result', type: 10 }],
  }) });
  customApi = await unique(`/customapis?$select=customapiid,uniquename,_plugintypeid_value,executeprivilegename&$filter=uniquename eq '${actionName}'`, 'JSJ review API');
}
if (customApi && (customApi._plugintypeid_value !== registeredTypes[types[0]] ||
  customApi.executeprivilegename !== 'prvReadjm1_JSJInquiry')) throw new Error('JSJ review API binding drift');

const stepName = 'JSJ Review Fields Guard';
let step = await unique(`/sdkmessageprocessingsteps?$select=sdkmessageprocessingstepid,name,stage,mode,filteringattributes&$filter=name eq '${stepName}'`, 'JSJ guard step');
if (guard && !step) {
  const message = await unique("/sdkmessages?$select=sdkmessageid,name&$filter=name eq 'Update'", 'Update message');
  const filters = (await request("/sdkmessagefilters?$select=sdkmessagefilterid,primaryobjecttypecode,_sdkmessageid_value&$filter=primaryobjecttypecode eq 'jm1_jsjinquiry'")).value;
  const filter = filters.find((item) => item._sdkmessageid_value === message?.sdkmessageid);
  if (!message || !filter) throw new Error('JSJ update filter unavailable');
  await request('/sdkmessageprocessingsteps', { method: 'POST', body: JSON.stringify({
    name: stepName, description: 'Protect JSJ review fields from direct updates',
    stage: 20, mode: 0, rank: 1, supporteddeployment: 0,
    filteringattributes: fields.join(','),
    'eventhandler_plugintype@odata.bind': `plugintypes(${registeredTypes[types[1]]})`,
    'sdkmessageid@odata.bind': `sdkmessages(${message.sdkmessageid})`,
    'sdkmessagefilterid@odata.bind': `sdkmessagefilters(${filter.sdkmessagefilterid})`,
  }) });
  step = await unique(`/sdkmessageprocessingsteps?$select=sdkmessageprocessingstepid,name,stage,mode,filteringattributes&$filter=name eq '${stepName}'`, 'JSJ guard step');
}
if (step && (step.stage !== 20 || step.mode !== 0 || step.filteringattributes !== fields.join(',')))
  throw new Error('JSJ guard step drift');
console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'READ_ONLY', assemblyId: assembly?.pluginassemblyid || null,
  types: registeredTypes, customApiId: customApi?.customapiid || null,
  guardStepId: step?.sdkmessageprocessingstepid || null }, null, 2));
