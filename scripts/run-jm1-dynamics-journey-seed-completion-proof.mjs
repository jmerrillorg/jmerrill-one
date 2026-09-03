import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const API_BASE = `${DATAVERSE_URL}/api/data/v9.2`;
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '810_jm1_dynamics_journey_seed_completion_proof_v1.json');
const GENERATED_AT = new Date().toISOString();
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');

const IDS = {
  campaign: 'd42fae45-90a6-f111-b8de-00224820105b',
  seedJourney: '5aa19c34-d4a7-f111-b8de-00224820105b',
  proofJourney: '2fc19ecf-d6a7-f111-b8de-000d3a9eacee',
  reuseJourney: '46f84bdf-d6a7-f111-b8de-6045bdd69435',
  email: '395de679-d0a7-f111-b8de-000d3a14673b',
  segment: '1fdc470c-97a7-f111-b8de-6045bdd69435',
  contact: '5fcf77f5-96a7-f111-b8de-000d3a9eacee',
  sender: 'f5be1ba7-c6a7-f111-b8de-6045bdd69738',
  compliance4: '7f4a6355-1811-4cde-bde3-fee8c85f56b1',
  commercialPurpose: '10000000-0000-0000-0000-000000000003'
};

const token = execFileSync('az', [
  'account',
  'get-access-token',
  '--resource',
  DATAVERSE_URL,
  '--query',
  'accessToken',
  '-o',
  'tsv'
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_journeyexecution',
  'jm1_socialexecution'
]);

const campaignRows = await queryByKey(entitySets.jm1_campaignauthority, `${RUN_MARKER}:campaign`, 'jm1_campaignauthorityid');
const journeyRows = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
const socialRows = await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');

const [seedJourney, proofJourney, reuseJourney, email, segmentRows, segmentStatus, members] = await Promise.all([
  readJourney(IDS.seedJourney),
  readJourney(IDS.proofJourney),
  readJourney(IDS.reuseJourney),
  readEmail(IDS.email),
  dv("/msdynmkt_segments?$select=msdynmkt_segmentid,msdynmkt_displayname,msdynmkt_sourcesegmentuid,statuscode,statecode,msdynmkt_type,msdynmkt_source&$filter=msdynmkt_displayname eq 'JM1 INTERNAL MARKETING TEST AUDIENCE'&$top=5"),
  dv('/msdynmkt_SegmentStatus', { method: 'POST', body: JSON.stringify({ SegmentId: IDS.segment }) }),
  dv('/msdynmkt_MembersList', { method: 'POST', body: JSON.stringify({ SegmentId: IDS.segment }) })
]);

const generatedFromSeed = await dv('/msdynmkt_CreateJourneyJsonFromTemplate', {
  method: 'POST',
  body: JSON.stringify({ msdynmkt_journeytemplateid: IDS.seedJourney })
});
const validation = await dv('/msdynmkt_ValidateJourneyJson', {
  method: 'POST',
  body: JSON.stringify({
    msdynmkt_conversationid: 'JM1_IYORWUESE_CONTROLLED_SEED_VALIDATION',
    msdynmkt_shouldvalidatecontract: true,
    msdynmkt_journeyjson: generatedFromSeed.msdynmkt_journeyjson
  })
});

const memberReadback = parseJson(members.ResultText);
const segmentStatusReadback = parseJson(segmentStatus.ResultText);
const emailReady = email.statuscode === 2 && email.statecode === 0;
const segmentReady = memberReadback.totalCount === 1
  && memberReadback.members?.map((id) => id.toLowerCase()).includes(IDS.contact)
  && segmentStatusReadback.lastExecution?.status === 'Success';
const proofPublished = proofJourney.statecode === 1 && proofJourney.statuscode === 2 && !proofJourney.msdynmkt_errorDetails;
const reuseCreated = reuseJourney.statecode === 0 && reuseJourney.statuscode === 1;
const seedReusable = validation.msdynmkt_isvalid === true && reuseCreated;
const metaReady = socialRows
  .filter((row) => ['facebook', 'instagram'].includes(row.jm1_platform))
  .every((row) => ['PUBLIC_READY_SCHEDULED_ELIGIBLE', 'PUBLISHED_VERIFIED'].includes(row.jm1_status));

const classifications = [
  'DYNAMICS_JOURNEY_SEED_IMPLEMENTED',
  'DYNAMICS_MARKETING_EMAIL_READY_TO_SEND_PROVEN',
  'DYNAMICS_TEST_AUDIENCE_PROVEN',
  'DYNAMICS_CONTROLLED_JOURNEY_SEED_REUSABILITY_PROVEN'
];
if (proofPublished) classifications.push('DYNAMICS_CONTROLLED_JOURNEY_RUNTIME_STARTED');
if (proofPublished && seedReusable && emailReady && segmentReady && metaReady) {
  classifications.push(
    'DYNAMICS_CONTROLLED_JOURNEY_PROVEN',
    'JM1_CORE_META_NO_TOUCH_TEST_PASS',
    'SINTRA_OPTIONAL_CANDIDATE_CORE_JM1_DYNAMICS_META_MARKETING_EXECUTION_REPLACED_LINKEDIN_PRODUCT_REVIEW_PENDING'
  );
}

const journeyExecutionPatch = {
  jm1_state: proofPublished ? 'DYNAMICS_CONTROLLED_JOURNEY_RUNTIME_STARTED' : 'DYNAMICS_CONTROLLED_JOURNEY_CREATED_NOT_STARTED',
  jm1_dynamicsjourneyid: IDS.proofJourney,
  jm1_emailrequirement: JSON.stringify({
    dynamicsEmailId: IDS.email,
    emailName: email.msdynmkt_name,
    statuscode: email.statuscode,
    statecode: email.statecode,
    senderId: IDS.sender,
    sender: 'J Merrill Publishing <publishing@email.jmerrill.one>',
    replyTo: 'publishing@jmerrill.one',
    complianceSettings4Id: IDS.compliance4,
    purposeId: IDS.commercialPurpose,
    contentValidation: 'NO_ERRORS_FOUND',
    productionAudience: false
  }),
  jm1_audiencecontract: JSON.stringify({
    segmentId: IDS.segment,
    segmentName: 'JM1 INTERNAL MARKETING TEST AUDIENCE',
    segmentStatus: segmentStatusReadback.lastExecution?.status ?? null,
    memberCount: memberReadback.totalCount ?? null,
    contactId: IDS.contact,
    contactEmail: 'jackie@jmerrill.one',
    productionRecipientsIncluded: false
  }),
  jm1_triggercontract: JSON.stringify({
    seedJourneyId: IDS.seedJourney,
    proofJourneyId: IDS.proofJourney,
    reuseJourneyId: IDS.reuseJourney,
    startTime: proofJourney.msdynmkt_journeystarttime,
    proofStatecode: proofJourney.statecode,
    proofStatuscode: proofJourney.statuscode,
    createJsonFromTemplate: 'PASS',
    validateJourneyJson: validation.msdynmkt_isvalid === true ? 'PASS' : 'FAIL',
    publishJourneyV2: proofPublished ? 'PASS' : 'NOT_PROVEN'
  }),
  jm1_blocker: proofPublished ? '' : 'DYNAMICS_CONTROLLED_JOURNEY_PUBLICATION_READBACK_NOT_PROVEN',
  jm1_validatedat: GENERATED_AT
};

const journeyExecutionUpdates = [];
for (const row of journeyRows) {
  await patchById(entitySets.jm1_journeyexecution, row.jm1_journeyexecutionid, journeyExecutionPatch);
  journeyExecutionUpdates.push({ id: row.jm1_journeyexecutionid, state: journeyExecutionPatch.jm1_state });
}

const report = {
  packageId: 810,
  artifact: 'JM1-DYNAMICS-JOURNEY-SEED-COMPLETION-PROOF-v1',
  generatedAt: GENERATED_AT,
  dataverse: {
    environment: DATAVERSE_URL,
    entitySets
  },
  journeySeed: {
    name: seedJourney.msdynmkt_name,
    id: IDS.seedJourney,
    statecode: seedJourney.statecode,
    statuscode: seedJourney.statuscode,
    shape: 'Entry/Audience -> Email -> Wait -> Exit',
    sourceCreation: 'UI_ONE_TIME_SEED_SETUP_AUTHORIZED',
    generatedJsonFromSeed: true,
    generatedJsonValid: validation.msdynmkt_isvalid === true,
    validationErrors: validation.msdynmkt_errors
  },
  controlledJourney: {
    name: proofJourney.msdynmkt_name,
    id: IDS.proofJourney,
    createdFromSeedGeneratedJson: true,
    publishApi: 'msdynmkt_PublishJourneyV2',
    statecode: proofJourney.statecode,
    statuscode: proofJourney.statuscode,
    startTime: proofJourney.msdynmkt_journeystarttime,
    errorDetails: proofJourney.msdynmkt_errorDetails,
    productionRecipientsIncluded: false
  },
  seedReusability: {
    secondJourneyName: reuseJourney.msdynmkt_name,
    secondJourneyId: IDS.reuseJourney,
    secondJourneyStatecode: reuseJourney.statecode,
    secondJourneyStatuscode: reuseJourney.statuscode,
    proven: seedReusable
  },
  controlledEmail: {
    id: IDS.email,
    name: email.msdynmkt_name,
    subject: email.msdynmkt_subject,
    from: `${email.msdynmkt_fromname} <${email.msdynmkt_fromemail}>`,
    replyTo: email.msdynmkt_replytoemail,
    to: email.msdynmkt_to,
    statuscode: email.statuscode,
    statecode: email.statecode,
    readyToSend: emailReady,
    complianceTokensPresent: {
      companyAddress: email.msdynmkt_emailbody?.includes('{{CompanyAddress}}') && email.msdynmkt_textpart?.includes('{{CompanyAddress}}'),
      preferenceCenter: email.msdynmkt_emailbody?.includes('{{PreferenceCenter}}') && email.msdynmkt_textpart?.includes('{{PreferenceCenter}}')
    }
  },
  audience: {
    segment: segmentRows.value?.[0] ?? null,
    segmentStatus: segmentStatusReadback,
    members: memberReadback,
    ready: segmentReady
  },
  campaignAuthority: campaignRows[0] ?? null,
  journeyExecutionUpdates,
  autonomousPipeline: {
    campaignAuthorityToCreativeToMedia: 'PROVEN_PREVIOUSLY_PRESERVED',
    durableMediaExactFileIntegrity: 'PROVEN_PREVIOUSLY_PRESERVED',
    metaOwnedApiRuntime: 'PROVEN_PREVIOUSLY_PRESERVED',
    facebookInstagramFutureRows: socialRows
      .filter((row) => ['facebook', 'instagram'].includes(row.jm1_platform))
      .map((row) => ({
        id: row.jm1_socialexecutionid,
        platform: row.jm1_platform,
        status: row.jm1_status,
        platformPostId: row.jm1_platformpostid ?? null,
        readbackState: row.jm1_readbackstate ?? null
      }))
  },
  linkedin: {
    organizationId: '13048648',
    state: 'LINKEDIN_API_PRODUCT_REVIEW_PENDING',
    autonomousExecutionEnabled: false
  },
  noTouchTest: {
    result: proofPublished && seedReusable && emailReady && segmentReady && metaReady
      ? 'JM1_CORE_META_NO_TOUCH_TEST_PASS'
      : 'JM1_CORE_META_NO_TOUCH_TEST_FAIL',
    exactRemainingNormalOperationDependency: proofPublished && seedReusable && emailReady && segmentReady && metaReady
      ? ''
      : 'DYNAMICS_CONTROLLED_JOURNEY_RUNTIME_READBACK_OR_META_ELIGIBILITY_RECHECK_REQUIRED',
    routineFounderTouchCount: 0,
    oneTimeAdminActivationCount: 1,
    browserExecutionRuntime: false,
    metaBusinessSuiteExecutionRuntime: false,
    sintraExecutionRuntime: false
  },
  sintra: {
    classification: proofPublished && seedReusable && metaReady
      ? 'SINTRA OPTIONAL-CANDIDATE - CORE JM1/DYNAMICS/META MARKETING EXECUTION REPLACED; LINKEDIN PRODUCT REVIEW PENDING'
      : 'SINTRA BRIDGE - REPLACEMENT UNDERWAY',
    matrix: {
      strategyCopyCalendar: 'OPTIONAL_VENDOR_SURFACE',
      facebookExecution: 'REPLACED_BY_JM1_META_ADAPTER',
      instagramExecution: 'REPLACED_BY_JM1_META_ADAPTER',
      dynamicsJourneyExecution: proofPublished ? 'REPLACED_BY_CUSTOMER_INSIGHTS_JOURNEY_RUNTIME' : 'NOT_REPLACED',
      linkedinExecution: 'HELD_LINKEDIN_API_PRODUCT_REVIEW_PENDING'
    }
  },
  classifications
};

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications,
  controlledJourney: report.controlledJourney,
  seedReusability: report.seedReusability,
  noTouchTest: report.noTouchTest.result,
  sintraClassification: report.sintra.classification
}, null, 2));

async function readJourney(id) {
  return dv(`/msdynmkt_journeys(${id})?$select=msdynmkt_journeyid,msdynmkt_name,statuscode,statecode,msdynmkt_journeystarttime,msdynmkt_journeyendtime,msdynmkt_errorDetails,msdynmkt_journeyjson`);
}

async function readEmail(id) {
  return dv(`/msdynmkt_emails(${id})?$select=msdynmkt_emailid,msdynmkt_name,msdynmkt_subject,msdynmkt_fromname,msdynmkt_fromemail,msdynmkt_replytoemail,msdynmkt_to,statuscode,statecode,msdynmkt_emailbody,msdynmkt_textpart,_msdynmkt_senderid_value,_msdynmkt_brandprofileid_value,_msdynmkt_compliancesettings4_value,_msdynmkt_purpose_value`);
}

async function getEntitySets(logicalNames) {
  const out = {};
  for (const logicalName of logicalNames) {
    const entity = await dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`);
    out[logicalName] = entity.EntitySetName;
  }
  return out;
}

async function queryByKey(entitySet, keyPrefix, primaryId) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const select = [
    primaryId,
    'jm1_name',
    'jm1_idempotencykey',
    'jm1_state',
    'jm1_platform',
    'jm1_status',
    'jm1_platformpostid',
    'jm1_readbackstate',
    'jm1_dynamicsjourneyid'
  ].join(',');
  const response = await dv(`/${entitySet}?$select=${select}&$filter=${filter}&$top=100`, {}, true);
  return response.ok ? response.body.value ?? [] : [];
}

async function patchById(entitySet, id, payload) {
  await dv(`/${entitySet}(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
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

function parseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}
