import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const API_BASE = `${DATAVERSE_URL}/api/data/v9.2`;
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '803_jm1_durable_media_registry_schema_v1.json');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const table = {
  logicalName: 'jm1_mediaasset',
  schemaName: 'jm1_MediaAsset',
  displayName: 'JM1 Media Asset',
  collectionName: 'JM1 Media Assets',
  columns: [
    stringColumn('jm1_MediaBranch', 'Branch', 200),
    stringColumn('jm1_AssetType', 'Asset Type', 120),
    stringColumn('jm1_FileName', 'File Name', 300),
    stringColumn('jm1_MimeType', 'MIME Type', 120),
    stringColumn('jm1_Dimensions', 'Dimensions', 80),
    stringColumn('jm1_Sha256Local', 'SHA-256 Local', 160),
    stringColumn('jm1_Sha256Remote', 'SHA-256 Remote', 160),
    stringColumn('jm1_StorageProvider', 'Storage Provider', 160),
    stringColumn('jm1_StorageContainer', 'Storage Container', 160),
    stringColumn('jm1_StoragePath', 'Storage Path', 500),
    stringColumn('jm1_DurableUrl', 'Durable HTTPS URL', 500),
    stringColumn('jm1_PublicAccessibilityState', 'Public Accessibility State', 160),
    stringColumn('jm1_RightsProvenanceState', 'Rights / Provenance State', 200),
    stringColumn('jm1_PublicReadyState', 'Public Ready State', 120),
    stringColumn('jm1_SupersededState', 'Superseded State', 120),
    stringColumn('jm1_CreativeWorkIdText', 'Creative Work Reference', 120),
    stringColumn('jm1_CampaignAuthorityIdText', 'Campaign Authority Reference', 120),
    stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
    dateColumn('jm1_Expiration', 'Expiration'),
    dateColumn('jm1_CreatedAt', 'Created At')
  ]
};

const report = {
  packageId: 803,
  artifact: 'JM1-DURABLE-MEDIA-REGISTRY-SCHEMA-v1',
  generatedAt: new Date().toISOString(),
  environment: DATAVERSE_URL,
  table: null,
  classification: 'MEDIA_REGISTRY_SCHEMA_NOT_PROVEN'
};

const existing = await getEntity(table.logicalName);
if (!existing.ok) {
  await dv('/EntityDefinitions', {
    method: 'POST',
    body: JSON.stringify({
      '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
      SchemaName: table.schemaName,
      DisplayName: label(table.displayName),
      DisplayCollectionName: label(table.collectionName),
      Description: label('Durable public media registry for JM1 Enterprise Marketing Operating System.'),
      OwnershipType: 'UserOwned',
      IsActivity: false,
      HasActivities: false,
      HasNotes: false,
      PrimaryNameAttribute: 'jm1_name',
      Attributes: [
        {
          '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
          SchemaName: 'jm1_name',
          IsPrimaryName: true,
          RequiredLevel: required('ApplicationRequired'),
          MaxLength: 300,
          FormatName: { Value: 'Text' },
          DisplayName: label('Name'),
          Description: label('Primary name.')
        }
      ]
    })
  });
  await publishAll();
}

const afterEntity = await getEntity(table.logicalName);
const columns = [];
for (const column of table.columns) {
  columns.push(await ensureColumn(table.logicalName, column));
}
await publishAll();

report.table = {
  logicalName: table.logicalName,
  entitySetName: afterEntity.body?.EntitySetName || 'jm1_mediaassets',
  state: existing.ok ? 'REUSED' : 'CREATED',
  columns
};
report.classification = columns.every((column) => ['REUSED', 'CREATED'].includes(column.state))
  ? 'MEDIA_REGISTRY_SCHEMA_PROVEN'
  : 'MEDIA_REGISTRY_SCHEMA_PARTIAL';

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classification: report.classification,
  table: report.table.logicalName,
  entitySetName: report.table.entitySetName,
  columns: columns.map((column) => ({ schemaName: column.schemaName, state: column.state }))
}, null, 2));

async function ensureColumn(entityLogicalName, column) {
  const existing = await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${schemaToLogical(column.SchemaName)}')`, {}, true);
  if (existing.ok) return { schemaName: column.SchemaName, state: 'REUSED' };
  const created = await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`, {
    method: 'POST',
    body: JSON.stringify(column)
  }, true);
  return created.ok
    ? { schemaName: column.SchemaName, state: 'CREATED' }
    : { schemaName: column.SchemaName, state: 'CREATE_FAILED', status: created.status, error: created.body?.error?.message || '' };
}

async function getEntity(logicalName) {
  return dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`, {}, true);
}

async function publishAll() {
  await dv('/PublishAllXml', { method: 'POST', body: JSON.stringify({ ParameterXml: '<importexportxml />' }) }, true);
}

async function dv(path, init = {}, allowFailure = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok && allowFailure) return { ok: false, status: response.status, body };
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path} failed: ${response.status} ${body.error?.message || text}`);
  return allowFailure ? { ok: true, status: response.status, body } : body;
}

function stringColumn(schemaName, displayName, maxLength) {
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
    SchemaName: schemaName,
    RequiredLevel: required('None'),
    MaxLength: maxLength,
    FormatName: { Value: 'Text' },
    DisplayName: label(displayName),
    Description: label(displayName)
  };
}

function dateColumn(schemaName, displayName) {
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata',
    SchemaName: schemaName,
    RequiredLevel: required('None'),
    Format: 'DateAndTime',
    DateTimeBehavior: { Value: 'UserLocal' },
    DisplayName: label(displayName),
    Description: label(displayName)
  };
}

function label(text) {
  return { LocalizedLabels: [{ Label: text, LanguageCode: 1033 }] };
}

function required(value) {
  return { Value: value, CanBeChanged: true, ManagedPropertyLogicalName: 'canmodifyrequirementlevelsettings' };
}

function schemaToLogical(schemaName) {
  return schemaName.replace(/^jm1_/, 'jm1_').toLowerCase();
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
