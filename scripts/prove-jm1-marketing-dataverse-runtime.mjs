import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const SOLUTION = process.env.JM1_DATAVERSE_SOLUTION || 'JMerrillOne';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '777_jm1_dedicated_dataverse_marketing_runtime_v1.json');
const GENERATED_AT = '2026-09-02T00:00:00-04:00';
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');

const TABLES = [
  {
    logicalName: 'jm1_marketingeligibility',
    schemaName: 'jm1_MarketingEligibility',
    primaryId: 'jm1_marketingeligibilityid',
    setName: 'jm1_marketingeligibilities',
    displayName: 'JM1 Marketing Eligibility',
    collectionName: 'JM1 Marketing Eligibilities',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_SourceEntity', 'Source Entity', 160),
      stringColumn('jm1_SourceRecord', 'Source Record', 200),
      stringColumn('jm1_SourceEvent', 'Source Event', 160),
      stringColumn('jm1_MarketingProgram', 'Marketing Program', 200),
      stringColumn('jm1_CampaignType', 'Campaign Type', 160),
      stringColumn('jm1_Subject', 'Subject / Title / Author', 300),
      stringColumn('jm1_Priority', 'Priority', 60),
      stringColumn('jm1_State', 'State', 120),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      stringColumn('jm1_AuthoritySource', 'Authority Source', 300),
      stringColumn('jm1_ExceptionState', 'Exception State', 200),
      dateColumn('jm1_EligibleAt', 'Eligible At'),
      dateColumn('jm1_ExpiresAt', 'Expires At')
    ]
  },
  {
    logicalName: 'jm1_campaignauthority',
    schemaName: 'jm1_CampaignAuthority',
    primaryId: 'jm1_campaignauthorityid',
    setName: 'jm1_campaignauthorities',
    displayName: 'JM1 Campaign Authority',
    collectionName: 'JM1 Campaign Authorities',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Program', 'Program', 200),
      stringColumn('jm1_CampaignType', 'Campaign Type', 160),
      stringColumn('jm1_Subject', 'Subject', 300),
      stringColumn('jm1_Audience', 'Audience', 300),
      stringColumn('jm1_CTA', 'CTA', 500),
      stringColumn('jm1_Cadence', 'Cadence', 300),
      stringColumn('jm1_Priority', 'Priority', 60),
      stringColumn('jm1_Supersession', 'Supersession', 300),
      stringColumn('jm1_JourneyRequirement', 'Journey Requirement', 300),
      stringColumn('jm1_SocialRequirement', 'Social Requirement', 300),
      stringColumn('jm1_CreativeRequirement', 'Creative Requirement', 300),
      stringColumn('jm1_AnalyticsRequirement', 'Analytics Requirement', 300),
      stringColumn('jm1_State', 'State', 120),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      dateColumn('jm1_Start', 'Start'),
      dateColumn('jm1_Stop', 'Stop')
    ]
  },
  {
    logicalName: 'jm1_contentwork',
    schemaName: 'jm1_ContentWork',
    primaryId: 'jm1_contentworkid',
    setName: 'jm1_contentworks',
    displayName: 'JM1 Content Work',
    collectionName: 'JM1 Content Work',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Stage', 'Campaign Stage', 160),
      stringColumn('jm1_Audience', 'Audience', 300),
      memoColumn('jm1_CopyBrief', 'Copy Brief'),
      memoColumn('jm1_DraftCopy', 'Draft Copy'),
      stringColumn('jm1_PublicReadyState', 'Public Ready State', 120),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300)
    ]
  },
  {
    logicalName: 'jm1_creativework',
    schemaName: 'jm1_CreativeWork',
    primaryId: 'jm1_creativeworkid',
    setName: 'jm1_creativeworks',
    displayName: 'JM1 Creative Work',
    collectionName: 'JM1 Creative Work',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Stage', 'Campaign Stage', 160),
      stringColumn('jm1_AssetPath', 'Asset Path', 500),
      stringColumn('jm1_AssetHash', 'Asset Hash', 160),
      stringColumn('jm1_LogoHash', 'Logo Hash', 160),
      stringColumn('jm1_Dimensions', 'Dimensions', 80),
      stringColumn('jm1_PublicReadyState', 'Public Ready State', 120),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300)
    ]
  },
  {
    logicalName: 'jm1_socialexecution',
    schemaName: 'jm1_SocialExecution',
    primaryId: 'jm1_socialexecutionid',
    setName: 'jm1_socialexecutions',
    displayName: 'JM1 Social Execution',
    collectionName: 'JM1 Social Executions',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Platform', 'Platform', 80),
      stringColumn('jm1_Executor', 'Executor', 80),
      stringColumn('jm1_RequestedDestination', 'Requested Destination', 300),
      stringColumn('jm1_ActualDestination', 'Actual Destination', 300),
      stringColumn('jm1_RequestedMediaHash', 'Requested Media Hash', 160),
      stringColumn('jm1_ActualMediaReference', 'Actual Media Reference', 300),
      stringColumn('jm1_CaptionVersion', 'Caption Version', 160),
      stringColumn('jm1_PlatformPostId', 'Platform Post ID', 200),
      stringColumn('jm1_Status', 'Status', 120),
      stringColumn('jm1_ErrorCode', 'Error Code', 120),
      memoColumn('jm1_ErrorMessage', 'Error Message'),
      stringColumn('jm1_ReadbackState', 'Readback State', 120),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      dateColumn('jm1_RequestedSchedule', 'Requested Schedule'),
      dateColumn('jm1_ActualSchedule', 'Actual Schedule'),
      dateColumn('jm1_VerifiedAt', 'Verified At')
    ]
  }
];

const RELATIONSHIPS = [
  { parent: 'jm1_marketingeligibility', child: 'jm1_campaignauthority', lookupSchema: 'jm1_MarketingEligibility', relationshipSchema: 'jm1_marketingeligibility_campaignauthority' },
  { parent: 'jm1_campaignauthority', child: 'jm1_contentwork', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_contentwork' },
  { parent: 'jm1_campaignauthority', child: 'jm1_creativework', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_creativework' },
  { parent: 'jm1_campaignauthority', child: 'jm1_socialexecution', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_socialexecution' }
];

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const report = {
  packageId: 777,
  artifact: 'JM1-DEDICATED-DATAVERSE-MARKETING-RUNTIME-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  solution: SOLUTION,
  metadata: [],
  relationships: [],
  runtime: null,
  classification: 'DATAVERSE_MARKETING_TABLE_RUNTIME_NOT_PROVEN'
};

for (const table of TABLES) {
  report.metadata.push(await ensureTable(table));
}

await publishAll();

for (const relationship of RELATIONSHIPS) {
  report.relationships.push(await ensureRelationship(relationship));
}

await publishAll();

try {
  report.runtime = await runIyorwueseRuntime();
  report.classification = report.runtime.idempotency.result === 'PASS'
    ? 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN'
    : 'DATAVERSE_MARKETING_TABLE_RUNTIME_PARTIAL';
} catch (error) {
  report.runtime = {
    attempted: true,
    state: 'RUNTIME_WRITE_BLOCKED',
    error: String(error.message ?? error)
  };
  report.classification = 'DATAVERSE_MARKETING_TABLE_RUNTIME_PARTIAL_METADATA_ONLY';
}

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classification: report.classification,
  createdOrReusedTables: report.metadata.map((item) => ({ logicalName: item.logicalName, state: item.state })),
  rows: report.runtime?.readbackCounts ?? null,
  idempotency: report.runtime?.idempotency ?? null,
  runtimeError: report.runtime?.error ?? null
}, null, 2));

async function ensureTable(table) {
  const existing = await getEntity(table.logicalName);
  if (existing.ok) {
    const columns = [];
    for (const column of table.columns) {
      columns.push(await ensureColumn(table.logicalName, column));
    }
    return { logicalName: table.logicalName, entitySetName: existing.body.EntitySetName, state: 'REUSED', columns };
  }

  const entityPayload = {
    '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
    SchemaName: table.schemaName,
    DisplayName: label(table.displayName),
    DisplayCollectionName: label(table.collectionName),
    Description: label(`${table.displayName} for JM1 Enterprise Marketing Operating System.`),
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
  };

  const created = await dv('/EntityDefinitions', {
    method: 'POST',
    headers: solutionHeader(),
    body: JSON.stringify(entityPayload)
  });

  return {
    logicalName: table.logicalName,
    entitySetName: created.EntitySetName ?? table.setName,
    state: 'CREATED',
    columns: await ensureColumnsAfterCreate(table)
  };
}

async function ensureColumnsAfterCreate(table) {
  const columns = [];
  for (const column of table.columns) {
    columns.push(await ensureColumn(table.logicalName, column));
  }
  return columns;
}

async function ensureColumn(entityLogicalName, column) {
  const existing = await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${schemaToLogical(column.SchemaName)}')`, {}, true);
  if (existing.ok) {
    return { schemaName: column.SchemaName, state: 'REUSED' };
  }

  try {
    await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`, {
      method: 'POST',
      headers: solutionHeader(),
      body: JSON.stringify(column)
    });
  } catch (error) {
    return {
      schemaName: column.SchemaName,
      state: 'CREATE_FAILED',
      error: String(error.message ?? error)
    };
  }

  return { schemaName: column.SchemaName, state: 'CREATED' };
}

async function ensureRelationship(relationship) {
  const child = await getEntity(relationship.child);
  if (!child.ok) return { ...relationship, state: 'CHILD_TABLE_MISSING' };

  const lookupLogical = schemaToLogical(relationship.lookupSchema);
  const existingLookup = await dv(`/EntityDefinitions(LogicalName='${relationship.child}')/Attributes(LogicalName='${lookupLogical}')`, {}, true);
  if (existingLookup.ok) return { ...relationship, state: 'REUSED' };

  const payload = {
    '@odata.type': 'Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata',
    SchemaName: relationship.relationshipSchema,
    ReferencedEntity: relationship.parent,
    ReferencingEntity: relationship.child,
    Lookup: {
      '@odata.type': 'Microsoft.Dynamics.CRM.LookupAttributeMetadata',
      SchemaName: relationship.lookupSchema,
      DisplayName: label(relationship.lookupSchema.replace('jm1_', '').replace(/([A-Z])/g, ' $1').trim()),
      RequiredLevel: required('None')
    }
  };

  try {
    await dv('/RelationshipDefinitions', {
      method: 'POST',
      headers: solutionHeader(),
      body: JSON.stringify(payload)
    });
    return { ...relationship, state: 'CREATED' };
  } catch (error) {
    return { ...relationship, state: 'CREATE_FAILED', error: String(error.message ?? error) };
  }
}

async function runIyorwueseRuntime() {
  const entitySets = {};
  const primaryIds = {};
  for (const table of TABLES) {
    const entity = await getEntity(table.logicalName);
    if (!entity.ok) throw new Error(`Missing table after create: ${table.logicalName}`);
    entitySets[table.logicalName] = entity.body.EntitySetName;
    primaryIds[entity.body.EntitySetName] = table.primaryId;
  }

  const creativeReport = readJson(join(ROOT, '776_jm1_marketing_owned_runtime_proof_v1.json'));
  const idempotency = {
    marker: RUN_MARKER,
    result: 'UNKNOWN',
    before: {},
    afterFirstRun: {},
    afterSecondRun: {}
  };

  idempotency.before = await countRuntimeRows(entitySets, primaryIds);
  const first = await upsertRuntimeRows(entitySets, creativeReport, primaryIds);
  idempotency.afterFirstRun = await countRuntimeRows(entitySets, primaryIds);
  const second = await upsertRuntimeRows(entitySets, creativeReport, primaryIds);
  idempotency.afterSecondRun = await countRuntimeRows(entitySets, primaryIds);

  const readback = {
    eligibility: await queryByKey(entitySets.jm1_marketingeligibility, RUN_MARKER, primaryIds),
    campaign: await queryByKey(entitySets.jm1_campaignauthority, RUN_MARKER, primaryIds),
    content: await queryByKey(entitySets.jm1_contentwork, RUN_MARKER, primaryIds),
    creative: await queryByKey(entitySets.jm1_creativework, RUN_MARKER, primaryIds),
    social: await queryByKey(entitySets.jm1_socialexecution, RUN_MARKER, primaryIds)
  };

  const expected = { eligibility: 1, campaign: 1, content: 5, creative: 1, social: 3 };
  const actual = Object.fromEntries(Object.entries(readback).map(([key, value]) => [key, value.length]));
  idempotency.result = Object.entries(expected).every(([key, value]) => actual[key] === value) ? 'PASS' : 'FAIL';

  return {
    trigger: 'FEATURED_AUTHOR_MONTH_ACTIVE',
    branch: 'J Merrill Publishing',
    featuredAuthor: 'Iyorwuese',
    campaign: 'October 2026 Featured Author - Iyorwuese',
    firstRun: first,
    secondRun: second,
    readbackCounts: actual,
    readback,
    idempotency,
    manualInterventionCount: 0
  };
}

async function upsertRuntimeRows(entitySets, creativeReport, primaryIds) {
  const eligibilityId = await upsertByIdempotency(entitySets.jm1_marketingeligibility, {
    jm1_name: 'October 2026 Featured Author - Iyorwuese Eligibility',
    jm1_branch: 'J Merrill Publishing',
    jm1_sourceentity: 'featured_author_authority',
    jm1_sourcerecord: '2026-10:iyrowuese'.replace('iyrowuese', 'iyorwuese'),
    jm1_sourceevent: 'FEATURED_AUTHOR_MONTH_ACTIVE',
    jm1_marketingprogram: 'Title/Author Marketing',
    jm1_campaigntype: 'featured_author_month',
    jm1_subject: 'Iyorwuese',
    jm1_priority: 'P1',
    jm1_state: 'ELIGIBLE_WITH_ASSET_EXCEPTIONS',
    jm1_idempotencykey: `${RUN_MARKER}:eligibility`,
    jm1_authoritysource: 'Founder supplied October Featured Author authority',
    jm1_exceptionstate: 'MISSING_AUTHORIZED_AUTHOR_IMAGE;MISSING_TITLE_COVER_FOR_TITLE_SPECIFIC_STAGE',
    jm1_eligibleat: '2026-10-01T00:00:00Z',
    jm1_expiresat: '2026-11-01T00:00:00Z'
  }, {}, primaryIds);

  const campaignId = await upsertByIdempotency(entitySets.jm1_campaignauthority, {
    jm1_name: 'October 2026 Featured Author - Iyorwuese',
    jm1_branch: 'J Merrill Publishing',
    jm1_program: 'Title/Author Marketing',
    jm1_campaigntype: 'featured_author_month',
    jm1_subject: 'Iyorwuese',
    jm1_audience: 'Readers and prospective authors',
    jm1_cta: 'Follow J Merrill Publishing for October Featured Author updates.',
    jm1_start: '2026-10-01T00:00:00Z',
    jm1_stop: '2026-11-01T00:00:00Z',
    jm1_cadence: 'stage-based October sequence, not a manually assembled 30-day calendar',
    jm1_priority: 'P1',
    jm1_supersession: 'Do not duplicate valid introduction; advance existing system-generated work.',
    jm1_journeyrequirement: 'Controlled Publishing Journey required',
    jm1_socialrequirement: 'Facebook, Instagram, LinkedIn execution rows required',
    jm1_creativerequirement: 'Official JMP logo; governed author/title assets when used',
    jm1_analyticsrequirement: 'Platform IDs/readback when adapters execute',
    jm1_state: 'SYSTEM_AUTHORITY_CREATED_HELD_FOR_DOWNSTREAM_PROOF',
    jm1_idempotencykey: `${RUN_MARKER}:campaign`
  }, {}, primaryIds);

  const stages = ['month_introduction', 'title_discovery', 'author_continuation', 'mid_month_engagement', 'month_close_continuation'];
  const contentIds = [];
  for (const stage of stages) {
    contentIds.push(await upsertByIdempotency(entitySets.jm1_contentwork, {
      jm1_name: `Iyorwuese ${stage.replaceAll('_', ' ')}`,
      jm1_branch: 'J Merrill Publishing',
      jm1_stage: stage,
      jm1_audience: 'Publishing audience',
      jm1_copybrief: 'People-First / Why-First October Featured Author stage copy. Approved public phrase: Helping Authors Help Themselves.',
      jm1_draftcopy: stage === 'month_introduction'
        ? 'October Featured Author: Iyorwuese. Helping Authors Help Themselves begins with showing up for the people behind the work.'
        : `Iyorwuese October Featured Author ${stage.replaceAll('_', ' ')} stage.`,
      jm1_publicreadystate: stage === 'month_introduction' ? 'PASS' : 'HELD_PENDING_ASSET_CONTEXT',
      jm1_idempotencykey: `${RUN_MARKER}:content:${stage}`
    }, {}, primaryIds));
  }

  const creative = creativeReport.creativeEngine.generatedArtifact;
  const creativeId = await upsertByIdempotency(entitySets.jm1_creativework, {
    jm1_name: 'Iyorwuese October Featured Author intro creative',
    jm1_branch: 'J Merrill Publishing',
    jm1_stage: 'month_introduction',
    jm1_assetpath: creative.path,
    jm1_assethash: creative.sha256,
    jm1_logohash: creative.logoAssetHash,
    jm1_dimensions: `${creative.dimensions.width}x${creative.dimensions.height}`,
    jm1_publicreadystate: creativeReport.publicReadyGate.result,
    jm1_idempotencykey: `${RUN_MARKER}:creative:month_introduction`
  }, {}, primaryIds);

  const socialIds = [];
  for (const [platform, executor, schedule] of [
    ['facebook', 'META_API', '2026-10-01T14:00:00Z'],
    ['instagram', 'META_API', '2026-10-01T16:00:00Z'],
    ['linkedin', 'LINKEDIN_API', '2026-10-01T18:00:00Z']
  ]) {
    socialIds.push(await upsertByIdempotency(entitySets.jm1_socialexecution, {
      jm1_name: `Iyorwuese October intro - ${platform}`,
      jm1_branch: 'J Merrill Publishing',
      jm1_platform: platform,
      jm1_executor: executor,
      jm1_requesteddestination: 'J Merrill Publishing, Inc.',
      jm1_actualdestination: '',
      jm1_requestedmediahash: creative.sha256,
      jm1_actualmediareference: '',
      jm1_captionversion: `${RUN_MARKER}:caption:v1`,
      jm1_platformpostid: '',
      jm1_status: 'HELD_FOR_ADAPTER',
      jm1_errorcode: '',
      jm1_errormessage: '',
      jm1_readbackstate: 'NOT_EXECUTED_NO_PLATFORM_API_AUTHORITY',
      jm1_idempotencykey: `${RUN_MARKER}:social:${platform}`,
      jm1_requestedschedule: schedule,
      jm1_verifiedat: GENERATED_AT
    }, {}, primaryIds));
  }

  return { eligibilityId, campaignId, contentIds, creativeId, socialIds };
}

async function upsertByIdempotency(entitySet, basePayload, relationships = {}, primaryIds = {}) {
  const key = basePayload.jm1_idempotencykey;
  const existing = await queryByKey(entitySet, key, primaryIds);
  if (existing.length > 0) return existing[0][primaryIds[entitySet]] ?? firstGuidValue(existing[0]);

  const created = await dv(`/${entitySet}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...basePayload, ...relationships })
  });
  return firstGuidValue(created);
}

async function queryByKey(entitySet, keyPrefix = RUN_MARKER, primaryIds = {}) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const primaryId = primaryIds[entitySet] ?? `${entitySet.slice(0, -1)}id`;
  const response = await dv(`/${entitySet}?$select=${primaryId},jm1_name,jm1_idempotencykey,createdon&$filter=${filter}&$top=50`);
  return response.value ?? [];
}

async function countRuntimeRows(entitySets, primaryIds) {
  const result = {};
  for (const [logicalName, entitySet] of Object.entries(entitySets)) {
    result[logicalName] = (await queryByKey(entitySet, RUN_MARKER, primaryIds)).length;
  }
  return result;
}

async function getEntity(logicalName) {
  return dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`, {}, true);
}

async function publishAll() {
  try {
    await dv('/PublishAllXml', { method: 'POST', body: JSON.stringify({}) }, true);
  } catch (error) {
    report.publishWarnings ??= [];
    report.publishWarnings.push(String(error.message ?? error));
  }
}

async function dv(path, init = {}, allowNotFound = false) {
  const response = await fetch(`${DATAVERSE_URL}/api/data/v9.2${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  if (allowNotFound && response.status === 404) {
    return { ok: false, status: 404, body: null };
  }

  if (!response.ok) {
    throw new Error(`Dataverse ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) return { ok: true, status: 204, body: {} };
  const body = await response.json();
  if (allowNotFound) return { ok: true, status: response.status, body };
  return body;
}

function stringColumn(schemaName, displayName, maxLength) {
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
    SchemaName: schemaName,
    RequiredLevel: required('None'),
    MaxLength: maxLength,
    DisplayName: label(displayName),
    Description: label(displayName)
  };
}

function memoColumn(schemaName, displayName) {
  return {
    '@odata.type': 'Microsoft.Dynamics.CRM.MemoAttributeMetadata',
    SchemaName: schemaName,
    RequiredLevel: required('None'),
    MaxLength: 4000,
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
    DisplayName: label(displayName),
    Description: label(displayName)
  };
}

function required(value) {
  return { Value: value };
}

function label(value) {
  return {
    LocalizedLabels: [{ Label: value, LanguageCode: 1033 }],
    UserLocalizedLabel: { Label: value, LanguageCode: 1033 }
  };
}

function solutionHeader() {
  return SOLUTION ? { 'MSCRM.SolutionUniqueName': SOLUTION } : {};
}

function schemaToLogical(schemaName) {
  return schemaName.replace(/^jm1_/, 'jm1_').toLowerCase();
}

function firstGuidValue(row) {
  for (const value of Object.values(row)) {
    if (typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value)) return value;
  }
  return null;
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}
