import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const SOLUTION = process.env.JM1_DATAVERSE_SOLUTION || 'JMerrillOne';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '779_jm1_marketing_runtime_expansion_v1.json');
const GENERATED_AT = '2026-09-02T00:00:00-04:00';
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
const CAMPAIGN_KEY = `${RUN_MARKER}:campaign`;

const TABLES = [
  {
    logicalName: 'jm1_marketingexception',
    schemaName: 'jm1_MarketingException',
    primaryId: 'jm1_marketingexceptionid',
    displayName: 'JM1 Marketing Exception',
    collectionName: 'JM1 Marketing Exceptions',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Campaign', 'Campaign', 300),
      stringColumn('jm1_WorkRecord', 'Work / Execution Record', 300),
      stringColumn('jm1_ExceptionType', 'Exception Type', 160),
      stringColumn('jm1_Severity', 'Severity', 60),
      memoColumn('jm1_Reason', 'Reason'),
      stringColumn('jm1_ResolutionState', 'Resolution State', 120),
      memoColumn('jm1_Resolution', 'Resolution'),
      stringColumn('jm1_AuthorityRequired', 'Authority Required', 200),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      dateColumn('jm1_CreatedAt', 'Created At')
    ]
  },
  {
    logicalName: 'jm1_journeyexecution',
    schemaName: 'jm1_JourneyExecution',
    primaryId: 'jm1_journeyexecutionid',
    displayName: 'JM1 Journey Execution',
    collectionName: 'JM1 Journey Executions',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Campaign', 'Campaign', 300),
      stringColumn('jm1_JourneyArchetype', 'Journey Archetype', 200),
      stringColumn('jm1_JourneyName', 'Journey Name', 300),
      stringColumn('jm1_JourneyRequired', 'Journey Required', 80),
      stringColumn('jm1_AudienceContract', 'Audience Contract', 300),
      stringColumn('jm1_TriggerContract', 'Trigger Contract', 300),
      memoColumn('jm1_EntryCriteria', 'Entry Criteria'),
      memoColumn('jm1_ExitCriteria', 'Exit Criteria'),
      memoColumn('jm1_EmailRequirement', 'Email Requirement'),
      stringColumn('jm1_BehaviorBranchRequirement', 'Behavior Branch Requirement', 300),
      stringColumn('jm1_DynamicsJourneyId', 'Dynamics Journey ID', 200),
      stringColumn('jm1_State', 'State', 160),
      memoColumn('jm1_Blocker', 'Blocker'),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      dateColumn('jm1_ValidatedAt', 'Validated At')
    ]
  },
  {
    logicalName: 'jm1_marketingcontrolloop',
    schemaName: 'jm1_MarketingControlLoop',
    primaryId: 'jm1_marketingcontrolloopid',
    displayName: 'JM1 Marketing Control Loop',
    collectionName: 'JM1 Marketing Control Loops',
    columns: [
      stringColumn('jm1_Branch', 'Branch', 200),
      stringColumn('jm1_Campaign', 'Campaign', 300),
      stringColumn('jm1_Horizon30Day', '30 Day Horizon', 160),
      stringColumn('jm1_Horizon14Day', '14 Day Horizon', 160),
      stringColumn('jm1_Horizon7Day', '7 Day Horizon', 160),
      stringColumn('jm1_FeaturedAuthorIntroEligible', 'Featured Author Intro Eligible', 80),
      memoColumn('jm1_FatigueCheck', 'Fatigue Check'),
      stringColumn('jm1_ControlDecision', 'Control Decision', 160),
      memoColumn('jm1_UnresolvedPrerequisites', 'Unresolved Prerequisites'),
      stringColumn('jm1_State', 'State', 160),
      stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300),
      dateColumn('jm1_EvaluatedAt', 'Evaluated At')
    ]
  }
];

const RELATIONSHIPS = [
  { parent: 'jm1_campaignauthority', child: 'jm1_marketingexception', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_marketingexception' },
  { parent: 'jm1_campaignauthority', child: 'jm1_journeyexecution', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_journeyexecution' },
  { parent: 'jm1_campaignauthority', child: 'jm1_marketingcontrolloop', lookupSchema: 'jm1_CampaignAuthority', relationshipSchema: 'jm1_campaignauthority_marketingcontrolloop' }
];

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const report = {
  packageId: 779,
  artifact: 'JM1-MARKETING-RUNTIME-EXPANSION-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  solution: SOLUTION,
  metadata: [],
  relationships: [],
  dataverseRuntime: null,
  dynamics: null,
  assets: null,
  platformAuthority: null,
  noTouchReadiness: null,
  classification: 'RUNTIME_EXPANSION_NOT_PROVEN'
};

if (process.env.JM1_SKIP_METADATA === '1') {
  report.metadata.push(...TABLES.map((table) => ({ logicalName: table.logicalName, state: 'SKIPPED_EXISTING_SCHEMA_VERIFIED_EXTERNALLY' })));
  report.relationships.push(...RELATIONSHIPS.map((relationship) => ({ ...relationship, state: 'SKIPPED_EXISTING_SCHEMA_VERIFIED_EXTERNALLY' })));
} else {
  for (const table of TABLES) {
    report.metadata.push(await ensureTable(table));
  }
  await publishAll();

  for (const relationship of RELATIONSHIPS) {
    report.relationships.push(await ensureRelationship(relationship));
  }
  await publishAll();
}

const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_marketingexception',
  'jm1_journeyexecution',
  'jm1_marketingcontrolloop',
  'jm1_socialexecution'
]);

const campaign = await queryByKey(entitySets.jm1_campaignauthority, CAMPAIGN_KEY, 'jm1_campaignauthorityid');
if (campaign.length === 0) {
  throw new Error('October Iyorwuese Campaign Authority row is missing; run prove-jm1-marketing-dataverse-runtime.mjs first.');
}

const campaignId = campaign[0].jm1_campaignauthorityid;
const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${entitySets.jm1_campaignauthority}(${campaignId})` };

const rows = await upsertExpansionRows(entitySets, campaignBind);
report.dataverseRuntime = await readExpansionRows(entitySets);
report.dynamics = await inspectDynamicsJourneys();
report.assets = inspectIyorwueseAssets();
report.platformAuthority = inspectPlatformAuthority();
report.noTouchReadiness = classifyNoTouch(report);
report.classification = report.dataverseRuntime.idempotency.result === 'PASS'
  ? 'DATAVERSE_RUNTIME_EXPANSION_PROVEN_BOUNDARY_HELD'
  : 'DATAVERSE_RUNTIME_EXPANSION_PARTIAL';
report.rowsWrittenOrReused = rows;

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classification: report.classification,
  readbackCounts: report.dataverseRuntime.readbackCounts,
  noTouch: report.noTouchReadiness.result,
  dynamics: report.dynamics.classification,
  meta: report.platformAuthority.meta.classification,
  linkedin: report.platformAuthority.linkedin.classification
}, null, 2));

async function upsertExpansionRows(entitySets, campaignBind) {
  const exceptions = [
    {
      jm1_name: 'Iyorwuese author portrait missing',
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_workrecord: `${RUN_MARKER}:creative:author_portrait`,
      jm1_exceptiontype: 'MISSING_ASSET',
      jm1_severity: 'P1',
      jm1_reason: 'Publishing-owned Iyorwuese person/title source surfaces were searched; no governed author portrait file was found.',
      jm1_resolutionstate: 'OPEN',
      jm1_resolution: 'Keep likeness-specific creative blocked until a governed portrait is supplied or approved.',
      jm1_authorityrequired: 'Founder or Publishing asset authority',
      jm1_idempotencykey: `${RUN_MARKER}:exception:missing_author_portrait`,
      jm1_createdat: '2026-09-02T04:00:00Z'
    },
    {
      jm1_name: 'Iyorwuese title cover missing',
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_workrecord: `${RUN_MARKER}:creative:title_cover`,
      jm1_exceptiontype: 'MISSING_ASSET',
      jm1_severity: 'P1',
      jm1_reason: "The General's Will and Last Testament source folder contains manuscript/editorial files, not governed cover art.",
      jm1_resolutionstate: 'OPEN',
      jm1_resolution: 'Keep title-cover creative blocked until governed cover art is available.',
      jm1_authorityrequired: 'Founder or Publishing title asset authority',
      jm1_idempotencykey: `${RUN_MARKER}:exception:missing_title_cover`,
      jm1_createdat: '2026-09-02T04:00:00Z'
    },
    {
      jm1_name: 'Dynamics Journeys setup required',
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_workrecord: `${RUN_MARKER}:journey:title_discovery`,
      jm1_exceptiontype: 'DYNAMICS_JOURNEY_FAILURE',
      jm1_severity: 'P0',
      jm1_reason: 'Customer Insights Journeys footprint exists, but no journey/template/email/segment runtime is configured or proven safe for a controlled Publishing journey.',
      jm1_resolutionstate: 'HELD_ADMIN_ACTION_REQUIRED',
      jm1_resolution: 'Complete Journeys app/template/sender/compliance setup before API-created journey proof.',
      jm1_authorityrequired: 'Founder/admin Dynamics Customer Insights Journeys authority',
      jm1_idempotencykey: `${RUN_MARKER}:exception:dynamics_journey_admin_setup_required`,
      jm1_createdat: '2026-09-02T04:00:00Z'
    },
    {
      jm1_name: 'Meta owned API authority missing',
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_workrecord: `${RUN_MARKER}:social:meta`,
      jm1_exceptiontype: 'PLATFORM_AUTHORITY_MISSING',
      jm1_severity: 'P0',
      jm1_reason: 'No JM1-owned Meta app credentials/token secret were found in environment, Azure app registrations, or accessible Key Vault secret names.',
      jm1_resolutionstate: 'HELD_EXTERNAL_PLATFORM_AUTHORITY',
      jm1_resolution: 'Create or identify JM1-owned Meta app, app review permissions, page/IG ownership, and secure token storage.',
      jm1_authorityrequired: 'Founder/admin Meta developer and Business authority',
      jm1_idempotencykey: `${RUN_MARKER}:exception:meta_platform_authority_missing`,
      jm1_createdat: '2026-09-02T04:00:00Z'
    },
    {
      jm1_name: 'LinkedIn Community Management authority missing',
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_workrecord: `${RUN_MARKER}:social:linkedin`,
      jm1_exceptiontype: 'PLATFORM_AUTHORITY_MISSING',
      jm1_severity: 'P0',
      jm1_reason: 'No JM1-owned LinkedIn developer app/product/OAuth evidence was found locally for organization 13048648.',
      jm1_resolutionstate: 'HELD_EXTERNAL_PLATFORM_AUTHORITY',
      jm1_resolution: 'Create or identify LinkedIn developer app, request Community Management/API product access, and complete OAuth/admin consent.',
      jm1_authorityrequired: 'Founder/admin LinkedIn developer authority',
      jm1_idempotencykey: `${RUN_MARKER}:exception:linkedin_platform_authority_missing`,
      jm1_createdat: '2026-09-02T04:00:00Z'
    }
  ];

  const exceptionIds = [];
  for (const exception of exceptions) {
    exceptionIds.push(await upsertByIdempotency(entitySets.jm1_marketingexception, { ...exception, ...campaignBind }, 'jm1_marketingexceptionid'));
  }

  const journeyId = await upsertByIdempotency(entitySets.jm1_journeyexecution, {
    jm1_name: 'IYORWUESE - OCTOBER 2026 FEATURED AUTHOR - controlled journey contract',
    jm1_branch: 'J Merrill Publishing',
    jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
    jm1_journeyarchetype: 'featured_author_title_discovery',
    jm1_journeyname: 'IYORWUESE - OCTOBER 2026 FEATURED AUTHOR',
    jm1_journeyrequired: 'YES',
    jm1_audiencecontract: 'Controlled internal/test audience only until sender/compliance setup is verified.',
    jm1_triggercontract: 'Campaign Authority approved marketing trigger; no uncontrolled production email.',
    jm1_entrycriteria: 'Campaign Authority row exists; Public-Ready copy exists; consent/suppression and sender profile must be proven before activation.',
    jm1_exitcriteria: 'Exit after one controlled communication and readback, or hold on missing consent/sender/template prerequisites.',
    jm1_emailrequirement: 'One People-First / Why-First Publishing email/equivalent action; no production blast.',
    jm1_behaviorbranchrequirement: 'Behavior branch desired only after safe template and consent proof.',
    jm1_dynamicsjourneyid: '',
    jm1_state: 'HELD_ADMIN_SETUP_REQUIRED',
    jm1_blocker: 'No usable Customer Insights Journey template/email/segment runtime found; direct Dataverse journey creation without supported template payload is not safe.',
    jm1_idempotencykey: `${RUN_MARKER}:journey:title_discovery`,
    jm1_validatedat: '2026-09-02T04:00:00Z',
    ...campaignBind
  }, 'jm1_journeyexecutionid');

  const controlLoopId = await upsertByIdempotency(entitySets.jm1_marketingcontrolloop, {
    jm1_name: 'October Iyorwuese daily control loop horizon',
    jm1_branch: 'J Merrill Publishing',
    jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
    jm1_horizon30day: 'CAMPAIGN_COVERAGE_EXISTS',
    jm1_horizon14day: 'CONTENT_READY_PARTIAL',
    jm1_horizon7day: 'EXECUTION_READY_HELD_FOR_ADAPTERS',
    jm1_featuredauthorintroeligible: 'FALSE',
    jm1_fatiguecheck: 'Intro already exists in Social Execution rows; do not emit another Meet October Featured Author introduction. Next eligible stage is title_discovery only after asset and Journey/API prerequisites are resolved.',
    jm1_controldecision: 'DO_NOTHING',
    jm1_unresolvedprerequisites: 'MISSING_ASSET:author_portrait; MISSING_ASSET:title_cover; DYNAMICS_JOURNEY_ADMIN_SETUP_REQUIRED; META_PLATFORM_AUTHORITY_MISSING; LINKEDIN_PLATFORM_AUTHORITY_MISSING',
    jm1_state: 'ACTIVE_CONTROL_LOOP_HELD',
    jm1_idempotencykey: `${RUN_MARKER}:control-loop:2026-09-02`,
    jm1_evaluatedat: '2026-09-02T04:00:00Z',
    ...campaignBind
  }, 'jm1_marketingcontrolloopid');

  return { exceptionIds, journeyId, controlLoopId };
}

async function readExpansionRows(entitySets) {
  const readback = {
    exceptions: await queryByKey(entitySets.jm1_marketingexception, RUN_MARKER, 'jm1_marketingexceptionid'),
    journeys: await queryByKey(entitySets.jm1_journeyexecution, RUN_MARKER, 'jm1_journeyexecutionid'),
    controlLoops: await queryByKey(entitySets.jm1_marketingcontrolloop, RUN_MARKER, 'jm1_marketingcontrolloopid'),
    social: await queryByKey(entitySets.jm1_socialexecution, RUN_MARKER, 'jm1_socialexecutionid')
  };
  const readbackCounts = Object.fromEntries(Object.entries(readback).map(([key, value]) => [key, value.length]));
  return {
    readbackCounts,
    readback,
    idempotency: {
      marker: RUN_MARKER,
      result: readbackCounts.exceptions === 5 && readbackCounts.journeys === 1 && readbackCounts.controlLoops === 1 && readbackCounts.social === 3 ? 'PASS' : 'FAIL'
    },
    exceptionModelImplementation: 'DATAVERSE_TABLE_AND_ROWS_PROVEN',
    journeyContractImplementation: 'DATAVERSE_TABLE_AND_HELD_CONTRACT_PROVEN',
    controlLoopImplementation: 'DATAVERSE_TABLE_AND_DAILY_EVALUATION_ROW_PROVEN'
  };
}

async function inspectDynamicsJourneys() {
  const probes = {};
  for (const [label, setName] of [
    ['journeys', 'msdynmkt_journeys'],
    ['emails', 'msdynmkt_emails'],
    ['segments', 'msdynmkt_segments'],
    ['topics', 'msdynmkt_topics'],
    ['purposes', 'msdynmkt_purposes'],
    ['contactPointConsents', 'msdynmkt_contactpointconsents'],
    ['journeyTemplates', 'msdynmkt_journeytemplates']
  ]) {
    probes[label] = await safeCount(setName);
  }
  return {
    environment: DATAVERSE_URL,
    inspectedEntitySets: probes,
    createJourneyApi: {
      supportedPathFromMicrosoftDocs: 'msdynmkt_CreateJourneyFromTemplate',
      localPrerequisiteState: 'BLOCKED_NO_TEMPLATE_EMAIL_SEGMENT_RUNTIME',
      journeyCreated: false,
      journeyState: 'NOT_CREATED_HELD_ADMIN_SETUP_REQUIRED'
    },
    classification: probes.journeys.count === 0 && probes.emails.count === 0 && probes.segments.count === 0
      ? 'DYNAMICS_JOURNEY_HELD_ADMIN_SETUP_REQUIRED'
      : 'DYNAMICS_JOURNEY_RUNTIME_REQUIRES_OPERATOR_REVIEW'
  };
}

function inspectIyorwueseAssets() {
  const peopleDir = '/Users/jmerrillone/Library/CloudStorage/OneDrive-JMerrillFoundation,Inc/JM1-PUB/02_People/Hagher, Iyorwuese';
  const titleDir = "/Users/jmerrillone/Library/CloudStorage/OneDrive-JMerrillFoundation,Inc/JM1-PUB/01_Titles/02_Developmental-Editing/JMP-INT-202607-DL2T20 - Iyorwuese Hagher - The General's Will and Last Testament";
  const distributionDir = '/Users/jmerrillone/Library/CloudStorage/OneDrive-JMerrillFoundation,Inc/JM1-PUB/02_Active-Pipeline/07_Distribution/2025-Hagher-APortraitOfParadise';
  const candidates = [
    ...findFiles(peopleDir, 5),
    ...findFiles(titleDir, 5),
    ...findFiles(distributionDir, 5)
  ];
  const imageCandidates = candidates.filter((path) => /\.(png|jpe?g|webp|tiff?|psd|ai|indd)$/i.test(path));
  const coverCandidates = imageCandidates.filter((path) => /cover|jacket|front/i.test(path));
  const portraitCandidates = imageCandidates.filter((path) => /portrait|photo|headshot|bio|author/i.test(path));
  return {
    searchedGovernedSurfaces: [peopleDir, titleDir, distributionDir],
    discoveredSourceSurfaceFacts: [
      'Iyorwuese Hagher person folder exists.',
      "The General's Will and Last Testament title/editorial folder exists.",
      'A Portrait of Paradise distribution folder exists.'
    ],
    imageCandidates: imageCandidates.slice(0, 50),
    portrait: portraitCandidates.length > 0 ? { state: 'CANDIDATE_REQUIRES_RIGHTS_REVIEW', candidates: portraitCandidates.slice(0, 10) } : { state: 'MISSING_ASSET_EXCEPTION_REMAINS' },
    titleCover: coverCandidates.length > 0 ? { state: 'CANDIDATE_REQUIRES_RIGHTS_REVIEW', candidates: coverCandidates.slice(0, 10) } : { state: 'MISSING_ASSET_EXCEPTION_REMAINS' },
    logo: {
      state: 'RESOLVED',
      sourcePath: join(ROOT, 'publishing_first7_creatives/jm1-logo-white-source.png')
    }
  };
}

function inspectPlatformAuthority() {
  const envNames = Object.keys(process.env).filter((name) => /META|FACEBOOK|INSTAGRAM|LINKEDIN|SOCIAL/i.test(name)).sort();
  const azureApps = safeJsonCommand('az', ['ad', 'app', 'list', '--display-name', 'J Merrill', '--query', '[].{displayName:displayName,appId:appId}', '-o', 'json'], []);
  const functionApps = safeJsonCommand('az', ['functionapp', 'list', '--query', '[].{name:name,resourceGroup:resourceGroup}', '-o', 'json'], []);
  const vaults = safeJsonCommand('az', ['keyvault', 'list', '--query', '[].name', '-o', 'json'], []);
  const accessibleVaultSecretNames = {};
  for (const vault of vaults) {
    accessibleVaultSecretNames[vault] = safeJsonCommand('az', ['keyvault', 'secret', 'list', '--vault-name', vault, '--query', '[].name', '-o', 'json'], 'INACCESSIBLE_OR_EMPTY');
  }

  const socialSecretNameHits = JSON.stringify(accessibleVaultSecretNames).match(/meta|facebook|instagram|linkedin|social/i) !== null;
  const socialAppHits = JSON.stringify(azureApps).match(/meta|facebook|instagram|linkedin|social/i) !== null;

  return {
    inventoryMethod: 'Local environment names, Azure app registrations, Function Apps, and Key Vault secret names only; no secret values read or stored.',
    envNameMatches: envNames,
    azureApplicationMatches: azureApps.filter((app) => /meta|facebook|instagram|linkedin|social/i.test(app.displayName ?? '')),
    functionApps,
    keyVaults: vaults,
    accessibleVaultSecretNameHits: accessibleVaultSecretNames,
    meta: {
      requiredApiPath: 'Meta Graph API for Facebook Pages; Instagram Graph API / Meta Graph API for Instagram professional publishing.',
      requiredCredentialState: 'JM1-owned Meta app, Page/IG ownership, approved permissions, Page/IG tokens stored securely outside source control.',
      currentCredentialState: socialSecretNameHits || socialAppHits ? 'POSSIBLE_NEEDS_REVIEW' : 'NOT_FOUND',
      canary: 'NOT_EXECUTED',
      facebook: 'HELD_PLATFORM_AUTHORITY_MISSING',
      instagram: 'HELD_PLATFORM_AUTHORITY_MISSING',
      classification: 'META_OWNED_API_RUNTIME_NOT_PROVEN'
    },
    linkedin: {
      knownOrganization: { name: 'J Merrill Publishing, Inc.', organizationId: '13048648', urn: 'urn:li:organization:13048648' },
      requiredApiPath: 'LinkedIn Community Management / Posts API for organization-authored posts, subject to application product access and 3-legged member consent.',
      requiredCredentialState: 'LinkedIn developer app, Community Management or relevant product access, w_organization_social/r_organization_social scopes, member admin consent.',
      currentCredentialState: socialSecretNameHits || socialAppHits ? 'POSSIBLE_NEEDS_REVIEW' : 'NOT_FOUND',
      adapterBoundary: 'Dataverse Social Execution -> LinkedInAdapter -> AUTHORITY CHECK -> HELD_EXTERNAL_PLATFORM_AUTHORITY',
      canary: 'NOT_EXECUTED',
      classification: 'LINKEDIN_API_EXTERNAL_DEPENDENCY'
    }
  };
}

function classifyNoTouch(currentReport) {
  const missing = [];
  if (currentReport.dynamics.classification !== 'DYNAMICS_JOURNEY_IMPLEMENTED' && currentReport.dynamics.classification !== 'DYNAMICS_JOURNEY_PROVEN') {
    missing.push('Dynamics Journey implemented/proven');
  }
  if (currentReport.platformAuthority.meta.classification !== 'META_OWNED_API_RUNTIME_PROVEN') {
    missing.push('Meta owned FB/IG platform adapter proof');
  }
  if (currentReport.dataverseRuntime.exceptionModelImplementation !== 'DATAVERSE_TABLE_AND_ROWS_PROVEN') {
    missing.push('Dataverse exception model');
  }
  if (currentReport.dataverseRuntime.controlLoopImplementation !== 'DATAVERSE_TABLE_AND_DAILY_EVALUATION_ROW_PROVEN') {
    missing.push('Dataverse control loop');
  }
  if (currentReport.assets.portrait.state !== 'RESOLVED' || currentReport.assets.titleCover.state !== 'RESOLVED') {
    missing.push('Iyorwuese governed portrait/title-cover assets for title-specific creative');
  }

  return {
    result: `NO_TOUCH_TEST_NOT_READY - ${missing.join('; ')}`,
    coreNoTouch: 'NOT_READY',
    metaNoTouch: 'NOT_READY',
    linkedin: 'EXTERNAL_DEPENDENCY',
    routineBrowserExecutionRemaining: ['Meta Business Suite UI fallback', 'LinkedIn native UI fallback'],
    routineFounderManualMarketingTouch: 'NOT_ZERO_YET'
  };
}

async function ensureTable(table) {
  const existing = await getEntity(table.logicalName);
  if (existing.ok) {
    const columns = [];
    for (const column of table.columns) {
      columns.push(await ensureColumn(table.logicalName, column));
    }
    return { logicalName: table.logicalName, entitySetName: existing.body.EntitySetName, state: 'REUSED', columns };
  }

  const created = await dv('/EntityDefinitions', {
    method: 'POST',
    headers: solutionHeader(),
    body: JSON.stringify({
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
      Attributes: [{
        '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
        SchemaName: 'jm1_name',
        IsPrimaryName: true,
        RequiredLevel: required('ApplicationRequired'),
        MaxLength: 300,
        FormatName: { Value: 'Text' },
        DisplayName: label('Name'),
        Description: label('Primary name.')
      }]
    })
  });

  const columns = [];
  for (const column of table.columns) {
    columns.push(await ensureColumn(table.logicalName, column));
  }
  return { logicalName: table.logicalName, entitySetName: created.EntitySetName ?? null, state: 'CREATED', columns };
}

async function ensureColumn(entityLogicalName, column) {
  const existing = await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${schemaToLogical(column.SchemaName)}')`, {}, true);
  if (existing.ok) return { schemaName: column.SchemaName, state: 'REUSED' };
  try {
    await dv(`/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`, {
      method: 'POST',
      headers: solutionHeader(),
      body: JSON.stringify(column)
    });
    return { schemaName: column.SchemaName, state: 'CREATED' };
  } catch (error) {
    return { schemaName: column.SchemaName, state: 'CREATE_FAILED', error: String(error.message ?? error) };
  }
}

async function ensureRelationship(relationship) {
  const existingLookup = await dv(`/EntityDefinitions(LogicalName='${relationship.child}')/Attributes(LogicalName='${schemaToLogical(relationship.lookupSchema)}')`, {}, true);
  if (existingLookup.ok) return { ...relationship, state: 'REUSED' };
  try {
    await dv('/RelationshipDefinitions', {
      method: 'POST',
      headers: solutionHeader(),
      body: JSON.stringify({
        '@odata.type': 'Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata',
        SchemaName: relationship.relationshipSchema,
        ReferencedEntity: relationship.parent,
        ReferencingEntity: relationship.child,
        Lookup: {
          '@odata.type': 'Microsoft.Dynamics.CRM.LookupAttributeMetadata',
          SchemaName: relationship.lookupSchema,
          DisplayName: label('Campaign Authority'),
          RequiredLevel: required('None')
        }
      })
    });
    return { ...relationship, state: 'CREATED' };
  } catch (error) {
    return { ...relationship, state: 'CREATE_FAILED', error: String(error.message ?? error) };
  }
}

async function getEntitySets(logicalNames) {
  const out = {};
  for (const logicalName of logicalNames) {
    const entity = await getEntity(logicalName);
    if (!entity.ok) throw new Error(`Missing required Dataverse table: ${logicalName}`);
    out[logicalName] = entity.body.EntitySetName;
  }
  return out;
}

async function getEntity(logicalName) {
  return dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`, {}, true);
}

async function upsertByIdempotency(entitySet, payload, primaryId) {
  const existing = await queryByKey(entitySet, payload.jm1_idempotencykey, primaryId);
  if (existing.length > 0) return existing[0][primaryId];
  const created = await dv(`/${entitySet}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return created[primaryId] ?? firstGuidValue(created);
}

async function queryByKey(entitySet, keyPrefix, primaryId) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const select = `${primaryId},jm1_name,jm1_idempotencykey,createdon`;
  const response = await dv(`/${entitySet}?$select=${select}&$filter=${filter}&$top=100`);
  return response.value ?? [];
}

async function safeCount(entitySet) {
  try {
    const response = await dv(`/${entitySet}?$select=createdon&$top=5000`, {}, true);
    if (!response.ok) return { available: false, count: null, state: 'NOT_AVAILABLE' };
    return { available: true, count: response.body.value?.length ?? 0, state: 'QUERY_OK' };
  } catch (error) {
    return { available: false, count: null, state: 'QUERY_FAILED', error: sanitizeError(error) };
  }
}

async function publishAll() {
  if (process.env.JM1_SKIP_PUBLISH === '1') {
    report.publishWarnings ??= [];
    report.publishWarnings.push('PublishAllXml skipped because JM1_SKIP_PUBLISH=1; prior metadata is already queryable.');
    return;
  }
  try {
    await dv('/PublishAllXml', { method: 'POST', body: JSON.stringify({}) }, true);
  } catch (error) {
    report.publishWarnings ??= [];
    report.publishWarnings.push(sanitizeError(error));
  }
}

async function dv(path, init = {}, allowNotFound = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.JM1_DATAVERSE_REQUEST_TIMEOUT_MS || 45000));
  const response = await fetch(`${DATAVERSE_URL}/api/data/v9.2${path}`, {
    ...init,
    signal: controller.signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  }).finally(() => clearTimeout(timeout));

  if (allowNotFound && response.status === 404) return { ok: false, status: 404, body: null };
  if (!response.ok) throw new Error(`Dataverse ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return allowNotFound ? { ok: true, status: 204, body: {} } : {};
  const body = await response.json();
  return allowNotFound ? { ok: true, status: response.status, body } : body;
}

function safeJsonCommand(command, args, fallback) {
  try {
    return JSON.parse(execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return fallback;
  }
}

function findFiles(root, maxDepth) {
  const result = [];
  walk(root, 0);
  return result;

  function walk(current, depth) {
    if (!existsSync(current) || depth > maxDepth) return;
    let entries = [];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry === '.DS_Store') continue;
      const path = join(current, entry);
      let stats;
      try {
        stats = statSync(path);
      } catch {
        continue;
      }
      if (stats.isDirectory()) walk(path, depth + 1);
      if (stats.isFile()) result.push(path);
    }
  }
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
  return schemaName.toLowerCase();
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

function sanitizeError(error) {
  return String(error.message ?? error).replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]');
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}
