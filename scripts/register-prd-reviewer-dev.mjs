// Register the compiled, sandbox-only BP-09 Custom API before exporting its solution.
import { readFileSync } from 'node:fs';

const base = 'https://jm1enterprisedev.crm.dynamics.com/api/data/v9.2';
const token = process.env.DATAVERSE_TOKEN;
if (!token) throw new Error('DATAVERSE_TOKEN is required');
const solution = 'JM1ProductionsBP09InquiryReview';
const assemblyName = 'jm1-productions-bp09-reviewer-plugin';
const pluginDll = process.env.PRD_REVIEWER_PLUGIN_DLL || new URL('../runtime/jm1-productions-bp09-reviewer-plugin/bin/Release/net48/jm1-productions-bp09-reviewer-plugin.dll', import.meta.url);
const skipReviewerWebResource = process.argv.includes('--skip-reviewer-webresource');

async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'OData-Version': '4.0', 'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': solution },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const assemblies = await request(`/pluginassemblies?$select=pluginassemblyid,name&$filter=name eq '${assemblyName}'`);
if (assemblies.value.length > 1) throw new Error('Duplicate plug-in assemblies');
const content = readFileSync(pluginDll).toString('base64');
if (assemblies.value.length === 0) {
  await request('/pluginassemblies', 'POST', {
    name: assemblyName, content, sourcetype: 0, isolationmode: 2,
    description: 'Bounded Productions BP-09 reviewer action',
  });
} else {
  await request(`/pluginassemblies(${assemblies.value[0].pluginassemblyid})`, 'PATCH', { content });
}
const resolved = await request(`/pluginassemblies?$select=pluginassemblyid,name&$filter=name eq '${assemblyName}'`);
if (resolved.value.length !== 1) throw new Error('Plug-in assembly readback failed');
const assemblyId = resolved.value[0].pluginassemblyid;
const typeName = 'Jm1.Productions.Bp09.AcceptProductionsInquiry';
const types = await request(`/plugintypes?$select=plugintypeid,typename&$filter=_pluginassemblyid_value eq ${assemblyId}`);
let type = types.value.find(item => item.typename === typeName);
if (!type) {
  await request('/plugintypes', 'POST', {
    name: typeName, typename: typeName, friendlyname: 'Accept Productions Inquiry',
    assemblyname: assemblyName, version: '1.0.0.0',
    'pluginassemblyid@odata.bind': `pluginassemblies(${assemblyId})`,
  });
  const created = await request(`/plugintypes?$select=plugintypeid,typename&$filter=_pluginassemblyid_value eq ${assemblyId}`);
  type = created.value.find(item => item.typename === typeName);
}
if (!type) throw new Error('Bounded action plug-in type not registered');

const apiName = 'jm1_AcceptProductionsInquiry';
const apis = await request(`/customapis?$select=customapiid,uniquename&$filter=uniquename eq '${apiName}'`);
if (apis.value.length > 1) throw new Error('Duplicate reviewer APIs');
if (apis.value.length === 0) {
  const parameters = [
    ['LeadId', 12], ['ReceiptId', 12], ['IdempotencyKey', 12],
    ['ExpectedVersion', 10], ['ActionId', 10],
  ];
  await request('/customapis', 'POST', {
    uniquename: apiName, name: apiName, displayname: 'Accept Productions Inquiry',
    description: 'Only NEW to FOLLOW_UP_REQUIRED for a completed, consented, team-owned BP-09 Productions Lead.',
    bindingtype: 0, isfunction: false, isprivate: false,
    allowedcustomprocessingsteptype: 0,
    executeprivilegename: 'prvReadjm1_ProductionsReviewPermit',
    'PluginTypeId@odata.bind': `plugintypes(${type.plugintypeid})`,
    CustomAPIRequestParameters: parameters.map(([name, value]) => ({
      name: `${apiName}.${name}`, uniquename: name, displayname: name,
      type: value, isoptional: false,
    })),
    CustomAPIResponseProperties: [
      { name: `${apiName}.Outcome`, uniquename: 'Outcome', displayname: 'Outcome', type: 10 },
      { name: `${apiName}.AuditId`, uniquename: 'AuditId', displayname: 'Audit ID', type: 12 },
    ],
  });
}
const result = await request(`/customapis?$select=customapiid,uniquename,executeprivilegename,_plugintypeid_value&$filter=uniquename eq '${apiName}'`);
if (result.value.length !== 1 || result.value[0]._plugintypeid_value !== type.plugintypeid ||
    result.value[0].executeprivilegename !== 'prvReadjm1_ProductionsReviewPermit')
  throw new Error('Reviewer API readback failed');

const checkpointApis = [
  {
    name: 'jm1_ListProductionsReviewCheckpointCandidates',
    display: 'List Productions Review Checkpoint Candidates',
    type: 'Jm1.Productions.Bp09.ListProductionsReviewCheckpointCandidates',
    pluginTypeId: '0e50c9e5-c3c6-4a13-a372-d56ab16ba75a',
    requests: [['PageNumber', 7]],
    responses: [['RowsJson', 10], ['MoreRecords', 0]],
  },
  {
    name: 'jm1_GetProductionsReviewCheckpoint',
    display: 'Get Productions Review Checkpoint',
    type: 'Jm1.Productions.Bp09.GetProductionsReviewCheckpoint',
    pluginTypeId: 'dd30e06f-b9d0-4793-8215-e54f31fb4d18',
    requests: [['ReceiptId', 12], ['LeadId', 12]],
    responses: [['EvidenceJson', 10]],
  },
  {
    name: 'jm1_SaveProductionsReviewCheckpoint',
    display: 'Save Productions Review Checkpoint',
    type: 'Jm1.Productions.Bp09.SaveProductionsReviewCheckpoint',
    pluginTypeId: '485ef7f8-bb61-4e0e-ae84-837672291259',
    requests: [['ReceiptId', 12], ['LeadId', 12], ['ExpectedVersion', 10], ['CheckpointJson', 10]],
    responses: [['RowVersion', 10]],
  },
];

const checkpointTypes = await request(`/plugintypes?$select=plugintypeid,typename&$filter=_pluginassemblyid_value eq ${assemblyId}`);
const checkpointApiReadbacks = [];
for (const specification of checkpointApis) {
  let checkpointType = checkpointTypes.value.find(item => item.typename === specification.type);
  if (checkpointTypes.value.filter(item => item.typename === specification.type).length > 1)
    throw new Error(`Duplicate plug-in type ${specification.type}`);
  if (!checkpointType) {
    await request('/plugintypes', 'POST', {
      plugintypeid: specification.pluginTypeId,
      name: specification.type, typename: specification.type, friendlyname: specification.display,
      assemblyname: assemblyName, version: '1.0.0.0',
      'pluginassemblyid@odata.bind': `pluginassemblies(${assemblyId})`,
    });
    const refreshed = await request(`/plugintypes?$select=plugintypeid,typename&$filter=_pluginassemblyid_value eq ${assemblyId}`);
    checkpointType = refreshed.value.find(item => item.typename === specification.type);
  }
  if (!checkpointType || checkpointType.plugintypeid?.toLowerCase() !== specification.pluginTypeId)
    throw new Error(`Plug-in type readback failed: ${specification.type}`);
  const existing = await request(`/customapis?$select=customapiid,uniquename,executeprivilegename,_plugintypeid_value&$filter=uniquename eq '${specification.name}'`);
  if (existing.value.length > 1) throw new Error(`Duplicate checkpoint API ${specification.name}`);
  if (existing.value.length === 0) {
    await request('/customapis', 'POST', {
      uniquename: specification.name, name: specification.name, displayname: specification.display,
      description: 'PRD-only checkpoint projection or state mutation. Validates the exact consented receipt and team-owned Lead in system context; returns no inquiry content.',
      bindingtype: 0, isfunction: false, isprivate: false, allowedcustomprocessingsteptype: 0,
      executeprivilegename: 'prvWritejm1_ProductionsReviewPermit',
      'PluginTypeId@odata.bind': `plugintypes(${checkpointType.plugintypeid})`,
      CustomAPIRequestParameters: specification.requests.map(([name, value]) => ({
        name: `${specification.name}.${name}`, uniquename: name, displayname: name, type: value, isoptional: false,
      })),
      CustomAPIResponseProperties: specification.responses.map(([name, value]) => ({
        name: `${specification.name}.${name}`, uniquename: name, displayname: name, type: value,
      })),
    });
  }
  const readback = await request(`/customapis?$select=customapiid,uniquename,executeprivilegename,_plugintypeid_value&$filter=uniquename eq '${specification.name}'`);
  if (readback.value.length !== 1 || readback.value[0]._plugintypeid_value !== checkpointType.plugintypeid ||
      readback.value[0].executeprivilegename !== 'prvWritejm1_ProductionsReviewPermit')
    throw new Error(`Checkpoint API readback failed: ${specification.name}`);
  checkpointApiReadbacks.push({ name: specification.name, pluginTypeId: checkpointType.plugintypeid, apiId: readback.value[0].customapiid });
}
let published = { value: [] };
const webResourceName = 'jm1_prd_bp09_review.js';
if (!skipReviewerWebResource) {
  const resources = await request(`/webresourceset?$select=webresourceid,name&$filter=name eq '${webResourceName}'`);
  const script = readFileSync(new URL('../powerplatform/webresources/jm1_prd_bp09_review.js', import.meta.url)).toString('base64');
  if (resources.value.length === 0) {
    await request('/webresourceset', 'POST', {
      name: webResourceName, displayname: 'Productions BP-09 reviewer command',
      webresourcetype: 3, content: script,
    });
  } else if (resources.value.length === 1) {
    await request(`/webresourceset(${resources.value[0].webresourceid})`, 'PATCH', { content: script });
  } else throw new Error('Duplicate reviewer script web resources');
  published = await request(`/webresourceset?$select=webresourceid,name&$filter=name eq '${webResourceName}'`);
  if (published.value.length !== 1) throw new Error('Reviewer script readback failed');
  await request('/PublishXml', 'POST', { ParameterXml: `<importexportxml><webresources><webresource>${published.value[0].webresourceid}</webresource></webresources></importexportxml>` });
}
console.log(JSON.stringify({ assemblyId, pluginTypeId: type.plugintypeid, customApiId: result.value[0].customapiid,
  checkpointApis: checkpointApiReadbacks, webResourceId: published.value[0]?.webresourceid || null }));
