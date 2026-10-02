import { execFileSync } from 'node:child_process';

const url = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
if (url !== 'https://jm1hq.crm.dynamics.com') throw new Error('JM1-Core production environment required');
const apply = process.argv.includes('--apply');
const api = `${url}/api/data/v9.2`;
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const table = 'jm1_jsjinquiry';
const columns = [
  string('jm1_SubmissionKey', 'Submission key', 36),
  string('jm1_ContentHash', 'Content hash', 64),
  string('jm1_ClientHash', 'Client hash', 64),
  string('jm1_ContactName', 'Contact name', 120),
  string('jm1_Email', 'Email', 254),
  string('jm1_InquiryType', 'Inquiry type', 40),
  memo('jm1_Message', 'Message', 5000),
  string('jm1_DeliveryState', 'Delivery state', 40),
  integer('jm1_DeliveryAttempt', 'Delivery attempt'),
  string('jm1_ProviderResult', 'Provider result', 500),
  memo('jm1_LastFailure', 'Last failure', 2000),
  date('jm1_ReceivedAt', 'Received at'),
  date('jm1_LastUpdatedAt', 'Last updated at'),
  date('jm1_NextAttemptAt', 'Next attempt at'),
  date('jm1_ClosedAt', 'Closed at'),
  date('jm1_TransferredAt', 'Transferred at'),
  string('jm1_AuthoritativeRecord', 'Authoritative record reference', 300),
  string('jm1_RetentionHold', 'Retention hold reason', 300),
  date('jm1_RetentionDueAt', 'Retention due at')
];

const result = { table, environment: url, mode: apply ? 'APPLY' : 'READ_ONLY', columns: [], key: null };
let entity = await get(`/EntityDefinitions(LogicalName='${table}')?$select=LogicalName,EntitySetName`, true);
if (!entity && apply) {
  await request('/EntityDefinitions', {
    method: 'POST',
    body: JSON.stringify({
      '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
      SchemaName: 'jm1_JSJInquiry',
      DisplayName: label('JSJ Inquiry'),
      DisplayCollectionName: label('JSJ Inquiries'),
      Description: label('Jackie Smith Jr. inquiry receipts, one message body, delivery, retry, and retention state.'),
      OwnershipType: 'UserOwned',
      IsActivity: false,
      HasActivities: false,
      HasNotes: false,
      PrimaryNameAttribute: 'jm1_name',
      Attributes: [{
        '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
        SchemaName: 'jm1_name',
        IsPrimaryName: true,
        RequiredLevel: required('ApplicationRequired'),
        MaxLength: 80,
        FormatName: { Value: 'Text' },
        DisplayName: label('Inquiry reference')
      }]
    })
  });
  await publish();
  entity = await get(`/EntityDefinitions(LogicalName='${table}')?$select=LogicalName,EntitySetName`);
}
result.entitySetName = entity?.EntitySetName || null;
if (entity && entity.EntitySetName !== 'jm1_jsjinquiries') throw new Error(`Unexpected entity set ${entity.EntitySetName}`);
for (const column of columns) {
  const logical = column.SchemaName.toLowerCase();
  let existing = await get(`/EntityDefinitions(LogicalName='${table}')/Attributes(LogicalName='${logical}')?$select=LogicalName`, true);
  if (!existing && apply) {
    await request(`/EntityDefinitions(LogicalName='${table}')/Attributes`, { method: 'POST', body: JSON.stringify(column) });
    existing = await get(`/EntityDefinitions(LogicalName='${table}')/Attributes(LogicalName='${logical}')?$select=LogicalName`);
  }
  result.columns.push({ logical, status: existing ? 'PRESENT' : 'MISSING' });
}
if (apply) await publish();
if (entity) {
  const keys = await get(`/EntityDefinitions(LogicalName='${table}')/Keys?$select=SchemaName,EntityKeyIndexStatus,KeyAttributes`);
  let key = keys.value.find((item) => item.SchemaName === 'jm1_JSJInquirySubmissionKey');
  if (!key && apply) {
    await request(`/EntityDefinitions(LogicalName='${table}')/Keys`, {
      method: 'POST',
      body: JSON.stringify({ '@odata.type': 'Microsoft.Dynamics.CRM.EntityKeyMetadata', SchemaName: 'jm1_JSJInquirySubmissionKey', DisplayName: label('JSJ inquiry submission key'), KeyAttributes: ['jm1_submissionkey'] })
    });
    const updated = await get(`/EntityDefinitions(LogicalName='${table}')/Keys?$select=SchemaName,EntityKeyIndexStatus,KeyAttributes`);
    key = updated.value.find((item) => item.SchemaName === 'jm1_JSJInquirySubmissionKey');
  }
  result.key = key ? { schemaName: key.SchemaName, status: key.EntityKeyIndexStatus } : null;
}
result.ready = Boolean(entity && result.columns.every((item) => item.status === 'PRESENT') && result.key?.status === 'Active');
console.log(JSON.stringify(result, null, 2));
if (apply && !result.ready) process.exitCode = 1;

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', 'MSCRM.SolutionUniqueName': 'JMerrillOne', ...init.headers }
  });
  const body = await response.text();
  if (!response.ok) {
    const error = new Error(`Dataverse ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 600)}`);
    error.status = response.status;
    throw error;
  }
  return body ? JSON.parse(body) : {};
}

async function get(path, optional = false) {
  try { return await request(path); }
  catch (error) { if (optional && error.status === 404) return null; throw error; }
}

async function publish() {
  await request('/PublishAllXml', { method: 'POST', body: '{}' });
}

function label(text) { return { LocalizedLabels: [{ Label: text, LanguageCode: 1033 }] }; }
function required(value) { return { Value: value, CanBeChanged: true, ManagedPropertyLogicalName: 'canmodifyrequirementlevelsettings' }; }
function field(type, schema, name) { return { '@odata.type': `Microsoft.Dynamics.CRM.${type}AttributeMetadata`, SchemaName: schema, DisplayName: label(name), RequiredLevel: required('None') }; }
function string(schema, name, max) { return { ...field('String', schema, name), FormatName: { Value: 'Text' }, MaxLength: max }; }
function memo(schema, name, max) { return { ...field('Memo', schema, name), Format: 'TextArea', MaxLength: max }; }
function integer(schema, name) { return { ...field('Integer', schema, name), Format: 'None', MinValue: 0, MaxValue: 2147483647 }; }
function date(schema, name) { return { ...field('DateTime', schema, name), Format: 'DateAndTime', DateTimeBehavior: { Value: 'UserLocal' } }; }
