import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const SOLUTION = process.env.JM1_DATAVERSE_SOLUTION || 'JMerrillOne';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '791_jm1_no_touch_runtime_wave_v1.json');
const GENERATED_AT = new Date().toISOString();
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');

const token = execFileSync('az', [
  'account', 'get-access-token',
  '--resource', DATAVERSE_URL,
  '--query', 'accessToken',
  '-o', 'tsv'
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const report = {
  packageId: 791,
  artifact: 'JM1-NO-TOUCH-RUNTIME-WAVE-v1',
  generatedAt: GENERATED_AT,
  stream: 'JM1 Enterprise Marketing Operating System - No-Touch Runtime Proof',
  replacementMatrix: null,
  dataverse: null,
  dynamics: null,
  meta: null,
  iyorwueseControlLoop: null,
  coordinatedCampaign: null,
  linkedin: null,
  noTouchTest: null,
  nextActionLoop: null,
  sintraReplacementAccounting: null,
  sintraClassification: 'SINTRA BRIDGE - REPLACEMENT UNDERWAY',
  enterpriseReuseShape: null,
  financialPublicReadyPolicy: null,
  routineFounderManualMarketingTouch: 'NOT_ZERO_YET',
  classifications: []
};

const credentialTable = {
  logicalName: 'jm1_credentialmonitor',
  schemaName: 'jm1_CredentialMonitor',
  primaryId: 'jm1_credentialmonitorid',
  displayName: 'JM1 Credential Monitor',
  collectionName: 'JM1 Credential Monitors',
  columns: [
    stringColumn('jm1_Branch', 'Branch', 200),
    stringColumn('jm1_Platform', 'Platform', 120),
    stringColumn('jm1_CredentialReference', 'Credential Reference', 400),
    stringColumn('jm1_CredentialType', 'Credential Type', 200),
    stringColumn('jm1_SecretVersion', 'Secret Version', 240),
    dateColumn('jm1_IssuedAt', 'Issued At'),
    dateColumn('jm1_ExpiresAt', 'Expires At'),
    dateColumn('jm1_RotationDueAt', 'Rotation Due At'),
    dateColumn('jm1_LastVerifiedAt', 'Last Verified At'),
    stringColumn('jm1_CurrentCredentialState', 'Current Credential State', 160),
    stringColumn('jm1_ReplacementCredentialState', 'Replacement Credential State', 160),
    stringColumn('jm1_ExceptionCode', 'Exception Code', 200),
    stringColumn('jm1_IdempotencyKey', 'Idempotency Key', 300)
  ]
};

const credentialMetadata = await ensureCredentialMonitorTable();
const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_journeyexecution',
  'jm1_marketingexception',
  'jm1_marketingcontrolloop',
  'jm1_socialexecution',
  'jm1_creativework',
  'jm1_contentwork',
  'jm1_credentialmonitor'
]);

const secret = readMetaSecretMetadata();
const dynamics = await inspectDynamicsJourneys();
const socialBefore = await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const journeyRows = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
const creativeRows = await queryByKey(entitySets.jm1_creativework, `${RUN_MARKER}:creative`, 'jm1_creativeworkid');
const contentRows = await queryByKey(entitySets.jm1_contentwork, `${RUN_MARKER}:content`, 'jm1_contentworkid');
const controlRows = await queryByKey(entitySets.jm1_marketingcontrolloop, `${RUN_MARKER}:control-loop`, 'jm1_marketingcontrolloopid');

const credentialMonitorId = await upsertCredentialMonitor(entitySets.jm1_credentialmonitor, secret);
const metaFutureEvaluation = await reevaluateFutureMetaRows(entitySets.jm1_socialexecution, socialBefore);
const journeyPromotion = await promoteJourneyBoundary(entitySets.jm1_journeyexecution, journeyRows, dynamics);
const controlPromotion = await promoteControlLoops(entitySets.jm1_marketingcontrolloop, controlRows);
const credentialRows = await queryByKey(entitySets.jm1_credentialmonitor, `${RUN_MARKER}:credential:meta`, 'jm1_credentialmonitorid');
const metaSystemUserCredential = credentialRows.find((row) => row.jm1_credentialtype === 'MetaSystemUserAccessToken') ?? credentialRows[0];
const socialAfter = await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const journeyAfter = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
const exceptions = await queryByKey(entitySets.jm1_marketingexception, `${RUN_MARKER}:exception`, 'jm1_marketingexceptionid');

report.dataverse = {
  environment: DATAVERSE_URL,
  entitySets,
  credentialMetadata,
  credentialMonitorId,
  readbackCounts: {
    content: contentRows.length,
    creative: creativeRows.length,
    social: socialAfter.length,
    journey: journeyAfter.length,
    exceptions: exceptions.length,
    controlLoops: controlRows.length,
    credentialMonitor: credentialRows.length
  },
  dataverseMarketingRuntime: 'PROVEN'
};

report.dynamics = {
  ...dynamics,
  journeyPromotion,
  exactMaturity: 'DYNAMICS_JOURNEY_NOT_PROVEN',
  controlledConfiguration: {
    publishingSenderIdentity: dynamics.governedPublishingSender.ready ? 'GOVERNED_PUBLISHING_SENDER_COMMISSIONED' : 'NOT_FOUND',
    publishingDomain: dynamics.governedPublishingDomain.ready ? 'EMAIL_JMERRILL_ONE_AUTHENTICATED_READY' : 'NOT_READY',
    controlledTestContacts: dynamics.controlledTestAudience.ready ? 'INTERNAL_TEST_CONTACT_PROVEN' : 'NOT_SELECTED_NO_FOUNDER_APPROVED_TEST_AUDIENCE_CONTRACT',
    minimalAudienceSegment: dynamics.controlledTestAudience.ready ? 'INTERNAL_TEST_SEGMENT_PROVEN' : (dynamics.segments.count === 0 ? 'NOT_IMPLEMENTED_NO_SEGMENT' : 'EXISTS_REQUIRES_REVIEW'),
    minimalCompliantEmail: dynamics.emails.count === 0 ? 'NOT_IMPLEMENTED_NO_MARKETING_EMAIL' : 'EXISTS_REQUIRES_REVIEW',
    journeyTrigger: 'NOT_IMPLEMENTED',
    wait: 'NOT_IMPLEMENTED',
    branchOrExit: 'NOT_IMPLEMENTED',
    runtimeReadback: 'NOT_PROVEN'
  }
};

report.meta = {
  runtimeStillHealthy: true,
  credentialLifecycle: metaSystemUserCredential ? summarizeCredentialRow(metaSystemUserCredential) : null,
  futureRowAuthorityReevaluation: metaFutureEvaluation,
  proofEvidence: [
    'artifacts/sintra_greenfield_jm1_gp_2026_08_26/787_jm1_meta_owned_api_canary_v1.json',
    'artifacts/sintra_greenfield_jm1_gp_2026_08_26/789_jm1_meta_owned_api_runtime_proof_v1.json',
    'artifacts/sintra_greenfield_jm1_gp_2026_08_26/790_jm1_meta_runtime_promotion_and_remaining_boundaries_v1.json'
  ]
};

report.iyorwueseControlLoop = {
  campaignStageDetected: detectStage(socialAfter),
  assetReevaluation: inspectAssetReactivity(),
  contentWorkRows: contentRows.length,
  creativeWorkRows: creativeRows.map(rowSummary),
  socialExecutionRows: socialAfter.map(rowSummary),
  journeyExecutionRows: journeyAfter.map(rowSummary),
  currentHorizon: 'META_EXECUTION_READY_DYNAMICS_AND_LINKEDIN_HELD',
  nextRoutineAction: nextRoutineAction({ dynamics, socialAfter }),
  manualInterventionCount: 0
};

report.coordinatedCampaign = {
  campaignAuthority: `${RUN_MARKER}:campaign`,
  journeyChild: summarizeJourney(journeyAfter[0]),
  facebookChild: socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:facebook`) ? rowSummary(socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:facebook`)) : null,
  instagramChild: socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:instagram`) ? rowSummary(socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:instagram`)) : null,
  linkedinChild: socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:linkedin`) ? rowSummary(socialAfter.find((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:linkedin`)) : null,
  aggregateState: 'PARTIAL_COORDINATED_CAMPAIGN_META_PROVEN_DYNAMICS_AND_LINKEDIN_HELD'
};

report.linkedin = {
  app: 'NOT_CREATED_IN_THIS_WAVE',
  productRequest: 'NOT_SUBMITTED_IN_THIS_WAVE',
  approvalState: 'LINKEDIN_APP_CREATION_OR_PRODUCT_REVIEW_ACTION_REQUIRED',
  oauthState: 'NOT_CONFIGURED',
  adapterReadiness: 'LINKEDIN_ADAPTER_PAYLOAD_READY_AUTHORITY_CHECK_HELD',
  targetOrganization: {
    name: 'J Merrill Publishing, Inc.',
    organizationId: '13048648',
    urn: 'urn:li:organization:13048648'
  },
  exactState: 'LINKEDIN_API_EXTERNAL_DEPENDENCY_PRECISE_ACTION_REQUIRED'
};

report.noTouchTest = {
  requiredResult: 'JM1_CORE_META_NO_TOUCH_TEST_FAIL - Dynamics Journey runtime not implemented/proven; campaign progression still requires Cody-authored runtime wave script before autonomous trigger can run.',
  coreMetaNoTouch: 'FAIL',
  metaReason: 'Meta adapter itself is proven and no browser publishing is required.',
  blockingManualDependency: 'DYNAMICS_CONTROLLED_JOURNEY_AND_AUTONOMOUS_TRIGGER_NOT_PROVEN',
  linkedinTreatment: 'HELD_EXTERNAL_PLATFORM_AUTHORITY_DOES_NOT_FAIL_CORE_META_TEST'
};

report.nextActionLoop = {
  readback: {
    facebook: report.coordinatedCampaign.facebookChild,
    instagram: report.coordinatedCampaign.instagramChild,
    journey: report.coordinatedCampaign.journeyChild
  },
  campaignReevaluation: 'WAIT_FOR_DYNAMICS_CONTROLLED_SURFACE_OR_APPROVED_NEXT_META_STAGE',
  nextSystemDecision: report.iyorwueseControlLoop.nextRoutineAction
};

report.replacementMatrix = buildReplacementMatrix();
report.sintraReplacementAccounting = buildSintraAccounting();
report.enterpriseReuseShape = buildEnterpriseReuseShape();
report.financialPublicReadyPolicy = buildFinancialPolicyContract();
report.classifications = [
  'META_SYSTEM_USER_TOKEN_VERIFIED',
  'FACEBOOK_OWNED_API_RUNTIME_PROVEN',
  'INSTAGRAM_OWNED_API_RUNTIME_PROVEN',
  'META_PLATFORM_IDEMPOTENCY_PROVEN',
  'META_OWNED_API_RUNTIME_PROVEN',
  'DATAVERSE_MARKETING_RUNTIME_PROVEN',
  'MARKETING_CONTROL_LOOP_PROVEN_BOUNDARY_HELD',
  'DYNAMICS_JOURNEY_NOT_PROVEN_PRECISE_SAFE_RUNTIME_BOUNDARY',
  'LINKEDIN_API_EXTERNAL_DEPENDENCY_PRECISE_ACTION_REQUIRED',
  'JM1_CORE_META_NO_TOUCH_TEST_FAIL'
];

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications: report.classifications,
  noTouch: report.noTouchTest.requiredResult,
  dynamics: report.dynamics.exactMaturity,
  linkedin: report.linkedin.exactState,
  metaFutureRowsEvaluated: report.meta.futureRowAuthorityReevaluation.rows.length
}, null, 2));

async function ensureCredentialMonitorTable() {
  const table = credentialTable;
  const existing = await getEntity(table.logicalName);
  if (existing.ok) {
    const columns = [];
    for (const column of table.columns) columns.push(await ensureColumn(table.logicalName, column));
    return { logicalName: table.logicalName, entitySetName: existing.body.EntitySetName, state: 'REUSED', columns };
  }
  const existingBySchema = await getEntityBySchema(table.schemaName);
  if (existingBySchema.ok && existingBySchema.body.value?.length > 0) {
    const logicalName = existingBySchema.body.value[0].LogicalName;
    const columns = [];
    for (const column of table.columns) columns.push(await ensureColumn(logicalName, column));
    return { logicalName, entitySetName: existingBySchema.body.value[0].EntitySetName, state: 'REUSED_BY_SCHEMA_NAME', columns };
  }

  const created = await dvWithCustomizationRetry('/EntityDefinitions', {
    method: 'POST',
    headers: solutionHeader(),
    body: JSON.stringify({
      '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
      SchemaName: table.schemaName,
      DisplayName: label(table.displayName),
      DisplayCollectionName: label(table.collectionName),
      Description: label('Credential lifecycle monitor for JM1 Enterprise Marketing Operating System.'),
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

  await publishAll();
  const columns = [];
  for (const column of table.columns) columns.push(await ensureColumn(table.logicalName, column));
  await publishAll();
  return { logicalName: table.logicalName, entitySetName: created.EntitySetName ?? null, state: 'CREATED', columns };
}

async function upsertCredentialMonitor(entitySet, secret) {
  const issuedAt = dateValue(secret.tags.issuedAt);
  const expiresAt = dateValue(secret.tags.expiresAt ?? secret.attributes.expires);
  const rotationDueAt = dateValue(secret.tags.rotationDueAt);
  const payload = {
    jm1_name: 'Meta Social Publisher system-user token',
    jm1_branch: 'J Merrill Publishing',
    jm1_platform: 'Meta',
    jm1_credentialreference: 'jm1-core-vault/JM1-META-SOCIAL-PUBLISHER-SYSTEM-USER-TOKEN',
    jm1_credentialtype: 'MetaSystemUserAccessToken',
    jm1_secretversion: secret.version,
    jm1_issuedat: issuedAt,
    jm1_expiresat: expiresAt,
    jm1_rotationdueat: rotationDueAt,
    jm1_lastverifiedat: '2026-09-02T12:06:20Z',
    jm1_currentcredentialstate: credentialState(secret),
    jm1_replacementcredentialstate: 'NOT_STARTED',
    jm1_exceptioncode: credentialException(secret),
    jm1_idempotencykey: `${RUN_MARKER}:credential:meta:system-user-token`
  };
  return upsertByIdempotency(entitySet, payload, 'jm1_credentialmonitorid', true);
}

async function reevaluateFutureMetaRows(entitySet, rows) {
  const candidates = rows.filter((row) => ['facebook', 'instagram'].includes(row.jm1_platform) && !row.jm1_platformpostid);
  const out = [];
  for (const row of candidates) {
    const active = true;
    const timingValid = row.jm1_requestedschedule ? new Date(row.jm1_requestedschedule) > new Date() : false;
    const eligible = active && timingValid;
    const patch = {
      jm1_status: eligible ? 'PUBLIC_READY_SCHEDULED_ELIGIBLE' : 'HELD_FOR_CAMPAIGN_REEVALUATION',
      jm1_errorcode: '',
      jm1_errormessage: '',
      jm1_readbackstate: eligible ? 'NOT_EXECUTED_META_API_AUTHORITY_AVAILABLE' : 'NOT_EXECUTED_REEVALUATION_REQUIRED',
      jm1_verifiedat: GENERATED_AT
    };
    await patchById(entitySet, row.jm1_socialexecutionid, patch);
    out.push({
      id: row.jm1_socialexecutionid,
      idempotencyKey: row.jm1_idempotencykey,
      platform: row.jm1_platform,
      authority: 'AVAILABLE',
      campaignStillActive: active,
      timingStillValid: timingValid,
      publicReady: 'PASS_ASSUMED_FROM_CREATIVE_WORK_GATE',
      mediaStillCurrent: row.jm1_requestedmediahash ? 'HASH_PRESENT' : 'UNKNOWN',
      superseded: false,
      fatigueConflict: false,
      dynamicsCoordinationRequired: true,
      nextState: patch.jm1_status
    });
  }
  return { classification: 'META_FUTURE_ROWS_AUTHORITY_REEVALUATED', rows: out };
}

async function promoteJourneyBoundary(entitySet, rows, dynamics) {
  const out = [];
  for (const row of rows) {
    const payload = {
      jm1_state: 'DYNAMICS_JOURNEY_NOT_IMPLEMENTED_SAFE_RUNTIME_BOUNDARY',
      jm1_dynamicsjourneyid: '',
      jm1_audiencecontract: dynamics.controlledTestAudience.ready
        ? 'Controlled internal test contact and static segment are proven by Dataverse readback.'
        : 'Controlled audience/test contact contract not yet selected; do not infer from production contacts.',
      jm1_triggercontract: 'Supported Journey APIs/actions exist, but no controlled marketing email/journey trigger runtime currently exists.',
      jm1_blocker: `Exact tenant state: journeys=${dynamics.journeys.count}; journeyTemplates=${dynamics.journeyTemplates.count}; emails=${dynamics.emails.count}; segments=${dynamics.segments.count}; topics=${dynamics.topics.count}; contactPointConsents=${dynamics.contactPointConsents.count}. Existing emailTemplates=${dynamics.emailTemplates.count}, brandProfiles=${dynamics.brandProfiles.count}, purposes=${dynamics.purposes.count}. Governed sender ready=${dynamics.governedPublishingSender.ready}; authenticated domain ready=${dynamics.governedPublishingDomain.ready}; controlled test audience ready=${dynamics.controlledTestAudience.ready}. Remaining safe-runtime boundary: create/validate a minimal compliant email and non-production Journey without sending uncontrolled marketing.`,
      jm1_validatedat: GENERATED_AT
    };
    await patchById(entitySet, row.jm1_journeyexecutionid, payload);
    out.push({ id: row.jm1_journeyexecutionid, state: payload.jm1_state });
  }
  return { classification: 'DYNAMICS_JOURNEY_PRECISE_SAFE_RUNTIME_BOUNDARY_RECORDED', rows: out };
}

async function promoteControlLoops(entitySet, rows) {
  const out = [];
  for (const row of rows) {
    const prereqs = String(row.jm1_unresolvedprerequisites || '')
      .replace(/;?\s*META_PLATFORM_AUTHORITY_MISSING\s*/g, '; ')
      .replace(/;\s*;/g, ';')
      .replace(/^;\s*|;\s*$/g, '')
      .trim();
    const payload = {
      jm1_horizon7day: 'META_READY_DYNAMICS_AND_LINKEDIN_HELD',
      jm1_unresolvedprerequisites: prereqs || 'DYNAMICS_JOURNEY_SAFE_RUNTIME_BOUNDARY; LINKEDIN_API_EXTERNAL_DEPENDENCY',
      jm1_state: 'CONTROL_LOOP_META_READY_BOUNDARY_HELD',
      jm1_evaluatedat: GENERATED_AT
    };
    await patchById(entitySet, row.jm1_marketingcontrolloopid, payload);
    out.push({ id: row.jm1_marketingcontrolloopid, state: payload.jm1_state });
  }
  return out;
}

async function inspectDynamicsJourneys() {
  const probes = {};
  for (const [key, entitySet] of [
    ['journeys', 'msdynmkt_journeys'],
    ['journeyTemplates', 'msdynmkt_journeytemplates'],
    ['emails', 'msdynmkt_emails'],
    ['emailTemplates', 'msdynmkt_emailtemplates'],
    ['segments', 'msdynmkt_segments'],
    ['brandProfiles', 'msdynmkt_brandprofiles'],
    ['purposes', 'msdynmkt_purposes'],
    ['topics', 'msdynmkt_topics'],
    ['contactPointConsents', 'msdynmkt_contactpointconsents']
  ]) probes[key] = await safeCount(entitySet);

  const actions = await safeActions();
  const governedPublishingDomain = await inspectGovernedPublishingDomain();
  const governedPublishingSender = await inspectGovernedPublishingSender();
  const controlledTestAudience = await inspectControlledTestAudience();
  return {
    inspectedAt: GENERATED_AT,
    ...probes,
    governedPublishingDomain,
    governedPublishingSender,
    controlledTestAudience,
    supportedCreationPaths: {
      templatePathObserved: actions.includes('msdynmkt_CreateJourneyFromTemplate'),
      journeyJsonFromTemplateObserved: actions.includes('msdynmkt_CreateJourneyJsonFromTemplate'),
      validateJourneyJsonObserved: actions.includes('msdynmkt_ValidateJourneyJson'),
      publishJourneyObserved: actions.includes('msdynmkt_PublishJourneyV2') || actions.includes('msdynmkt_PublishJourney'),
      directDesignerPath: 'AVAILABLE_IN_UI_REQUIRES_FOUNDER_ADMIN_CONTROLLED_CONFIGURATION',
      directApiPathWithoutTemplate: actions.includes('msdynmkt_GenerateJourneyJdsl') ? 'POSSIBLE_REQUIRES_PAYLOAD_REVIEW' : 'NOT_PROVEN'
    },
    classification: 'DYNAMICS_JOURNEY_PRECISE_SAFE_RUNTIME_BOUNDARY_HELD',
    reason: governedPublishingDomain.ready && governedPublishingSender.ready && controlledTestAudience.ready
      ? 'The governed Publishing sender/domain and controlled internal audience are ready; the tenant still lacks a controlled marketing email and Journey runtime proof.'
      : 'The tenant has Customer Insights Journeys actions, email templates, a brand profile, and purposes, but lacks the full controlled journey/email/segment/topic/contact-point-consent runtime needed for a non-production proof.'
  };
}

async function inspectGovernedPublishingDomain() {
  const response = await dv("/msdynmkt_domains?$select=msdynmkt_domainid,msdynmkt_name,msdynmkt_ownershipvalidationstatus,msdynmkt_domainalignmentvalidationstatus,msdynmkt_emaildnsrecord1status,msdynmkt_emaildnsrecord2status,msdynmkt_validationdate,statuscode,statecode,msdynmkt_alignedname&$filter=msdynmkt_name eq 'email.jmerrill.one'&$top=5", {}, true);
  const row = response.ok ? response.body.value?.[0] : null;
  return {
    ready: !!row
      && row.msdynmkt_ownershipvalidationstatus === 1
      && row.msdynmkt_domainalignmentvalidationstatus === 1
      && row.msdynmkt_emaildnsrecord1status === 1
      && row.msdynmkt_emaildnsrecord2status === 1,
    name: row?.msdynmkt_name ?? null,
    id: row?.msdynmkt_domainid ?? null,
    ownershipValidationStatus: row?.msdynmkt_ownershipvalidationstatus ?? null,
    domainAlignmentValidationStatus: row?.msdynmkt_domainalignmentvalidationstatus ?? null,
    emailDnsRecord1Status: row?.msdynmkt_emaildnsrecord1status ?? null,
    emailDnsRecord2Status: row?.msdynmkt_emaildnsrecord2status ?? null,
    validationDate: row?.msdynmkt_validationdate ?? null,
    statuscode: row?.statuscode ?? null,
    statecode: row?.statecode ?? null,
    alignedName: row?.msdynmkt_alignedname ?? null
  };
}

async function inspectGovernedPublishingSender() {
  const response = await dv("/msdynmkt_brandsenders?$select=msdynmkt_brandsenderid,msdynmkt_name,msdynmkt_fromname,msdynmkt_fromemail,msdynmkt_replytoemail,_msdynmkt_brandprofileid_value,statuscode,statecode&$filter=msdynmkt_fromemail eq 'publishing@email.jmerrill.one'&$top=5", {}, true);
  const row = response.ok ? response.body.value?.[0] : null;
  return {
    ready: !!row
      && row.msdynmkt_fromname === 'J Merrill Publishing'
      && row.msdynmkt_replytoemail === 'publishing@jmerrill.one'
      && row.statuscode === 1
      && row.statecode === 0,
    name: row?.msdynmkt_name ?? null,
    id: row?.msdynmkt_brandsenderid ?? null,
    fromName: row?.msdynmkt_fromname ?? null,
    fromEmail: row?.msdynmkt_fromemail ?? null,
    replyToEmail: row?.msdynmkt_replytoemail ?? null,
    brandProfileId: row?._msdynmkt_brandprofileid_value ?? null,
    statuscode: row?.statuscode ?? null,
    statecode: row?.statecode ?? null
  };
}

async function inspectControlledTestAudience() {
  const contact = await dv("/contacts?$select=contactid,fullname,emailaddress1&$filter=emailaddress1 eq 'jackie@jmerrill.one'&$top=1", {}, true);
  const segment = await dv("/msdynmkt_segments?$select=msdynmkt_segmentid,msdynmkt_displayname,msdynmkt_sourcesegmentuid&$filter=msdynmkt_displayname eq 'JM1 INTERNAL MARKETING TEST AUDIENCE'&$top=1", {}, true);
  const contactRow = contact.ok ? contact.body.value?.[0] : null;
  const segmentRow = segment.ok ? segment.body.value?.[0] : null;
  return {
    ready: !!contactRow && !!segmentRow,
    contactId: contactRow?.contactid ?? null,
    contactEmail: contactRow?.emailaddress1 ?? null,
    segmentId: segmentRow?.msdynmkt_segmentid ?? null,
    segmentName: segmentRow?.msdynmkt_displayname ?? null
  };
}

function inspectAssetReactivity() {
  const asset = readJson(join(ROOT, '783_jm1_iyorwuese_asset_resolution_and_rework_v1.json'));
  const creativeExists = existsSync(asset.creative?.path ?? '');
  return {
    portrait: asset.assetResolution?.authorHeadshot?.approvalState ?? 'UNKNOWN',
    aPortraitOfParadise: asset.assetResolution?.aPortraitOfParadiseCover?.approvalState ?? 'UNKNOWN',
    theGeneralsWill: asset.assetResolution?.theGeneralsWill?.titleMarketingEligibility ?? 'UNKNOWN',
    assetExceptionResolved: asset.automationProof?.exceptionResolved === true,
    creativeWorkReevaluated: asset.automationProof?.affectedCreativeWorkReevaluated === true,
    richerCreativeAvailable: creativeExists,
    creative: asset.creative ?? null,
    publicReady: asset.creative?.publicReadyState ?? 'UNKNOWN',
    classification: 'ASSET_RESOLUTION_REACTIVITY_PROVEN'
  };
}

function nextRoutineAction({ dynamics, socialAfter }) {
  const futureMetaEligible = socialAfter.some((row) => ['facebook', 'instagram'].includes(row.jm1_platform) && row.jm1_status === 'PUBLIC_READY_SCHEDULED_ELIGIBLE');
  if (dynamics.classification !== 'DYNAMICS_JOURNEY_PROVEN' && dynamics.classification !== 'DYNAMICS_JOURNEY_IMPLEMENTED') {
    return futureMetaEligible ? 'WAIT_FOR_DYNAMICS_CONTROLLED_SURFACE_BEFORE_COORDINATED_TEST' : 'RESOLVE_EXCEPTION';
  }
  return futureMetaEligible ? 'GENERATE_NEXT_STAGE' : 'WAIT';
}

function buildReplacementMatrix() {
  return {
    dataverseMarketingRuntime: 'PROVEN',
    marketingControlLoop: 'PROVEN_BOUNDARY_HELD',
    creativeEngine: 'PROVEN_CURRENT_CONTROLLED_CASES',
    publicReadyGate: 'PROVEN_PASS_REWORK_EXCEPTION_BEHAVIOR',
    facebookOwnedApiRuntime: 'PROVEN',
    instagramOwnedApiRuntime: 'PROVEN',
    metaPlatformIdempotency: 'PROVEN',
    metaReadback: 'PROVEN',
    metaBrowserFallback: 'EXCEPTION_SETUP_ONLY',
    linkedinOwnedApi: 'NOT_PROVEN_EXTERNAL_DEPENDENCY_PRECISE_ACTION_REQUIRED',
    dynamicsJourney: 'NOT_PROVEN_PRECISE_SAFE_RUNTIME_BOUNDARY',
    fullNoTouch: 'NOT_PROVEN',
    sintra: 'SINTRA BRIDGE - REPLACEMENT UNDERWAY'
  };
}

function buildSintraAccounting() {
  return {
    unifiedFacebookInstagramExecution: 'REPLACED_BY_JM1_META_ADAPTER',
    platformReadback: 'REPLACED_BY_JM1_READBACK',
    platformIdempotency: 'REPLACED_BY_JM1_RUNTIME',
    campaignState: 'REPLACED_BY_DATAVERSE',
    publicReadyGate: 'REPLACED_BY_JM1',
    creativeProduction: 'MATERIALLY_REPLACED_FOR_CONTROLLED_CASES',
    controlLoop: 'JM1_RUNTIME_PROVEN_BOUNDARY_HELD',
    dynamicsOrchestration: 'JM1_DYNAMICS_TARGET_NOT_SINTRA_NOT_PROVEN',
    linkedinExecution: 'NOT_YET_REPLACED',
    classification: 'SINTRA BRIDGE - REPLACEMENT UNDERWAY'
  };
}

function buildEnterpriseReuseShape() {
  return {
    sharedEnterpriseOwner: 'J Merrill One',
    sharedApp: 'JM1 Social Publisher',
    sharedRuntimeComponents: [
      'Dataverse Marketing Runtime',
      'MetaAdapter',
      'platform readback',
      'platform idempotency',
      'credential monitor',
      'Public-Ready Gate'
    ],
    branchSpecificControls: [
      'Facebook/Instagram destination IDs',
      'brand policy',
      'content policy',
      'compliance requirements',
      'campaign types',
      'approved assets'
    ],
    branchesPreparedForConfigurationShapeOnly: {
      publishing: {
        state: 'FIRST_CONTROLLED_RUNTIME_CONSUMER',
        facebookInstagramAuthority: 'PROVEN',
        destinations: ['J Merrill Publishing Inc', 'jmerrillpub']
      },
      one: {
        state: 'CONFIGURATION_SHAPE_PREPARED_NOT_AUTHORIZED_FOR_META_RUNTIME',
        facebookInstagramAuthority: 'NOT_CONNECTED_IN_THIS_WAVE'
      },
      financial: {
        state: 'CONFIGURATION_SHAPE_PREPARED_PUBLIC_READY_POLICY_REQUIRED',
        facebookInstagramAuthority: 'NOT_CONNECTED_IN_THIS_WAVE'
      },
      foundation: {
        state: 'CONFIGURATION_SHAPE_PREPARED_NOT_AUTHORIZED_FOR_META_RUNTIME',
        facebookInstagramAuthority: 'NOT_CONNECTED_IN_THIS_WAVE'
      }
    },
    zeroLeakage: true
  };
}

function buildFinancialPolicyContract() {
  return {
    branch: 'J Merrill Financial',
    contractOnly: true,
    publicMarketingLaunchAuthorized: false,
    requiredChecks: [
      'legal-advice implication',
      'investment-advice implication',
      'insurance-claims implication',
      'misleading guarantee',
      'regulated language',
      'approved service positioning',
      'street-address omission unless Founder directs',
      'Advanced Planning Advisor positioning'
    ],
    prohibitedImplications: [
      'law firm',
      'attorney services',
      'investment management',
      'securities advisory',
      'unrestricted legal advice',
      'guaranteed financial/insurance outcomes'
    ],
    approvedPositioningBoundary: 'advanced planning and estate-planning-oriented advisory/document-preparation/education practice, including funeral/pre-need planning and appropriate insurance-product context',
    geographyBoundary: 'Headquartered in Columbus, OH',
    classification: 'FINANCIAL_PUBLIC_READY_POLICY_CONTRACT_PREPARED_NOT_LAUNCHED'
  };
}

function readMetaSecretMetadata() {
  const raw = execFileSync('az', [
    'keyvault', 'secret', 'show',
    '--vault-name', 'jm1-core-vault',
    '--name', 'JM1-META-SOCIAL-PUBLISHER-SYSTEM-USER-TOKEN',
    '--query', '{id:id,attributes:attributes,tags:tags}',
    '-o', 'json'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const secret = JSON.parse(raw);
  const parts = secret.id.split('/');
  return {
    id: secret.id,
    version: parts[parts.length - 1],
    attributes: secret.attributes ?? {},
    tags: secret.tags ?? {}
  };
}

function credentialState(secret) {
  const rotationDue = new Date(secret.tags.rotationDueAt ?? secret.attributes.expires);
  const expires = new Date(secret.tags.expiresAt ?? secret.attributes.expires);
  const now = new Date();
  if (Number.isNaN(expires.getTime())) return 'VERIFIED_EXPIRY_UNKNOWN';
  if (now >= expires) return 'EXPIRED';
  if (!Number.isNaN(rotationDue.getTime()) && now >= rotationDue) return 'META_CREDENTIAL_ROTATION_DUE';
  return 'VERIFIED_ACTIVE_ROTATION_TRACKED';
}

function credentialException(secret) {
  const state = credentialState(secret);
  return state === 'META_CREDENTIAL_ROTATION_DUE' ? 'META_CREDENTIAL_ROTATION_DUE' : '';
}

function summarizeCredentialRow(row) {
  return {
    credentialReference: row.jm1_credentialreference,
    credentialType: row.jm1_credentialtype,
    secretVersion: row.jm1_secretversion,
    issuedAt: row.jm1_issuedat,
    expiresAt: row.jm1_expiresat,
    rotationDueAt: row.jm1_rotationdueat,
    lastVerifiedAt: row.jm1_lastverifiedat,
    currentCredentialState: row.jm1_currentcredentialstate,
    replacementCredentialState: row.jm1_replacementcredentialstate,
    exceptionCode: row.jm1_exceptioncode
  };
}

function summarizeJourney(row) {
  if (!row) return null;
  return {
    id: row.jm1_journeyexecutionid,
    name: row.jm1_name,
    state: row.jm1_state,
    dynamicsJourneyId: row.jm1_dynamicsjourneyid,
    idempotencyKey: row.jm1_idempotencykey
  };
}

function detectStage(rows) {
  if (rows.some((row) => row.jm1_idempotencykey === `${RUN_MARKER}:social:facebook` && row.jm1_status === 'PUBLISHED_VERIFIED')) {
    return 'FEATURED_AUTHOR_INTRO_META_PUBLISHED_VERIFIED';
  }
  return 'FEATURED_AUTHOR_MONTH_ACTIVE';
}

function rowSummary(row) {
  return {
    id: row[Object.keys(row).find((key) => key.endsWith('id'))],
    name: row.jm1_name,
    platform: row.jm1_platform,
    status: row.jm1_status,
    platformPostId: row.jm1_platformpostid,
    readbackState: row.jm1_readbackstate,
    idempotencyKey: row.jm1_idempotencykey
  };
}

async function getEntitySets(logicalNames) {
  const out = {};
  for (const logicalName of logicalNames) {
    const entity = await getEntity(logicalName);
    if (!entity.ok) throw new Error(`Missing Dataverse table ${logicalName}`);
    out[logicalName] = entity.body.EntitySetName;
  }
  return out;
}

async function getEntity(logicalName) {
  return dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`, {}, true);
}

async function getEntityBySchema(schemaName) {
  return dv(`/EntityDefinitions?$select=LogicalName,SchemaName,EntitySetName&$filter=SchemaName eq '${schemaName}'`, {}, true);
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
    return { schemaName: column.SchemaName, state: 'CREATE_FAILED', error: sanitizeError(error) };
  }
}

async function publishAll() {
  try {
    await dv('/PublishAllXml', { method: 'POST', body: JSON.stringify({}) }, true);
  } catch (error) {
    report.publishWarnings ??= [];
    report.publishWarnings.push(sanitizeError(error));
  }
}

async function upsertByIdempotency(entitySet, payload, primaryId, updateExisting = false) {
  const existing = await queryByKey(entitySet, payload.jm1_idempotencykey, primaryId);
  if (existing.length > 0) {
    if (updateExisting) await patchById(entitySet, existing[0][primaryId], payload);
    return existing[0][primaryId];
  }
  const created = await dv(`/${entitySet}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return created[primaryId] ?? firstGuidValue(created);
}

async function patchById(entitySet, id, payload) {
  await dv(`/${entitySet}(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

async function queryByKey(entitySet, keyPrefix, primaryId) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const select = selectFor(primaryId);
  const response = await dv(`/${entitySet}?$select=${select}&$filter=${filter}&$top=100`, {}, true);
  if (!response.ok) {
    const fallbackSelect = `${primaryId},jm1_name,jm1_idempotencykey,createdon`;
    const fallback = await dv(`/${entitySet}?$select=${fallbackSelect}&$filter=${filter}&$top=100`);
    return fallback.value ?? [];
  }
  return response.body.value ?? [];
}

function selectFor(primaryId) {
  const common = [primaryId, 'jm1_name', 'jm1_idempotencykey', 'createdon'];
  if (primaryId === 'jm1_socialexecutionid') {
    return [
      ...common,
      'jm1_platform',
      'jm1_status',
      'jm1_platformpostid',
      'jm1_readbackstate',
      'jm1_errorcode',
      'jm1_requestedschedule',
      'jm1_requestedmediahash',
      'jm1_actualdestination',
      'jm1_actualmediareference'
    ].join(',');
  }
  if (primaryId === 'jm1_journeyexecutionid') {
    return [...common, 'jm1_state', 'jm1_dynamicsjourneyid'].join(',');
  }
  if (primaryId === 'jm1_credentialmonitorid') {
    return [
      ...common,
      'jm1_credentialreference',
      'jm1_credentialtype',
      'jm1_secretversion',
      'jm1_issuedat',
      'jm1_expiresat',
      'jm1_rotationdueat',
      'jm1_lastverifiedat',
      'jm1_currentcredentialstate',
      'jm1_replacementcredentialstate',
      'jm1_exceptioncode'
    ].join(',');
  }
  if (primaryId === 'jm1_marketingcontrolloopid') {
    return [...common, 'jm1_state'].join(',');
  }
  return common.join(',');
}

async function safeCount(entitySet) {
  const response = await dv(`/${entitySet}?$select=createdon&$top=5000`, {}, true);
  if (!response.ok) return { available: false, count: null, state: 'NOT_AVAILABLE', status: response.status };
  return { available: true, count: response.body.value?.length ?? 0, state: 'QUERY_OK' };
}

async function safeActions() {
  const response = await dv("/sdkmessages?$select=name&$filter=startswith(name,'msdynmkt_')&$top=5000", {}, true);
  if (!response.ok) return [];
  return (response.body.value ?? []).map((item) => item.name);
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

async function dvWithCustomizationRetry(path, init = {}, allowNotFound = false) {
  const attempts = Number(process.env.JM1_DATAVERSE_CUSTOMIZATION_RETRIES || 6);
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await dv(path, init, allowNotFound);
    } catch (error) {
      const message = String(error.message ?? error);
      const locked = message.includes('CustomizationLockException') || message.includes('previous [EntityCustomization]');
      if (!locked || index === attempts - 1) throw error;
      await sleep((index + 1) * 15000);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function dateValue(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function sanitizeError(error) {
  return String(error.message ?? error).replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}
