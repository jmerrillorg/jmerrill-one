import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dataverseUrl = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const solution = process.env.JM1_DATAVERSE_SOLUTION || 'JMerrillOne';
const migrationDir = 'runtime/dataverse-migrations';
const token = execFileSync('az', ['account', 'get-access-token', '--resource', dataverseUrl, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const api = `${dataverseUrl}/api/data/v9.2`;

const files = readdirSync(migrationDir).filter((name) => /^\d{3}_.+\.json$/.test(name)).sort();
assertOrdered(files);
const report = { artifact: 'JM1-MARKETING-DATAVERSE-SCHEMA-MIGRATIONS-v1', environment: dataverseUrl, generatedAt: new Date().toISOString(), migrations: [] };

for (const file of files) {
  const raw = readFileSync(join(migrationDir, file), 'utf8');
  const migration = JSON.parse(raw);
  if (!migration.environmentAllowlist.includes(dataverseUrl)) throw new Error(`${migration.migrationId}: environment not allowed`);
  const operations = [];
  for (const operation of migration.operations) operations.push(await ensureColumn(operation));
  report.migrations.push({
    migrationId: migration.migrationId,
    checksum: createHash('sha256').update(raw).digest('hex'),
    strategy: migration.strategy,
    state: operations.every((item) => ['CREATED', 'REUSED'].includes(item.state)) ? 'APPLIED_OR_ALREADY_CURRENT' : 'FAILED',
    operations
  });
}

report.classification = report.migrations.every((item) => item.state === 'APPLIED_OR_ALREADY_CURRENT')
  ? 'JM1_MARKETING_DATAVERSE_SCHEMA_MIGRATION_STANDARD_PROVEN'
  : 'JM1_MARKETING_DATAVERSE_SCHEMA_MIGRATION_FAILED';
console.log(JSON.stringify(report, null, 2));
if (report.classification.endsWith('_FAILED')) process.exit(1);

async function ensureColumn(operation) {
  const logicalName = operation.schemaName.toLowerCase();
  const existing = await request(`/EntityDefinitions(LogicalName='${operation.table}')/Attributes(LogicalName='${logicalName}')`, { allow404: true });
  if (existing.ok) return { table: operation.table, schemaName: operation.schemaName, state: 'REUSED' };
  const payload = attributePayload(operation);
  const created = await request(`/EntityDefinitions(LogicalName='${operation.table}')/Attributes`, { method: 'POST', body: payload, allowAlreadyExists: true });
  if (!created.ok && !created.alreadyExists) throw new Error(`${operation.schemaName}: ${created.status} ${created.text}`);
  const verified = await request(`/EntityDefinitions(LogicalName='${operation.table}')/Attributes(LogicalName='${logicalName}')`, { allow404: true });
  return {
    table: operation.table,
    schemaName: operation.schemaName,
    state: verified.ok ? (created.alreadyExists ? 'REUSED' : 'CREATED') : 'POSTCONDITION_FAILED'
  };
}

function attributePayload(operation) {
  const base = {
    SchemaName: operation.schemaName,
    DisplayName: label(operation.displayName),
    RequiredLevel: { Value: 'None', CanBeChanged: true, ManagedPropertyLogicalName: 'canmodifyrequirementlevelsettings' }
  };
  if (operation.type === 'String') return { '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata', ...base, FormatName: { Value: 'Text' }, MaxLength: operation.maxLength || 200 };
  if (operation.type === 'Integer') return { '@odata.type': 'Microsoft.Dynamics.CRM.IntegerAttributeMetadata', ...base, Format: 'None', MinValue: 0, MaxValue: 2147483647 };
  if (operation.type === 'DateTime') return { '@odata.type': 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata', ...base, Format: 'DateAndTime', DateTimeBehavior: { Value: 'UserLocal' } };
  throw new Error(`Unsupported operation type ${operation.type}`);
}

function label(text) {
  return { LocalizedLabels: [{ Label: text, LanguageCode: 1033 }] };
}

async function request(path, options = {}) {
  const response = await fetch(`${api}${path}`, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'MSCRM.SolutionUniqueName': solution },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const alreadyExists = options.allowAlreadyExists && response.status === 400 && /already exists/i.test(text);
  if (!response.ok && !alreadyExists && !(options.allow404 && response.status === 404)) throw new Error(`${response.status} ${text}`);
  return { ok: response.ok, alreadyExists, status: response.status, text };
}

function assertOrdered(names) {
  const ids = names.map((name) => Number(name.slice(0, 3)));
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate migration order detected.');
  if (!ids.every((id, index) => index === 0 || id > ids[index - 1])) throw new Error('Migration order is not strictly increasing.');
}
