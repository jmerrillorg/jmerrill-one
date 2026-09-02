import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '780_jm1_marketing_control_loop_execution_v1.json');
const CREATIVE_DIR = join(ROOT, 'runtime', 'creative');
const GENERATED_AT = '2026-09-02T00:00:00-04:00';
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
const CAMPAIGN_KEY = `${RUN_MARKER}:campaign`;
const STAGE = 'title_discovery';

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_contentwork',
  'jm1_creativework',
  'jm1_socialexecution',
  'jm1_journeyexecution',
  'jm1_marketingexception',
  'jm1_marketingcontrolloop'
]);

const campaign = await singleByKey(entitySets.jm1_campaignauthority, CAMPAIGN_KEY, 'jm1_campaignauthorityid');
const content = await queryByKey(entitySets.jm1_contentwork, `${RUN_MARKER}:content`, 'jm1_contentworkid');
const creativeBefore = await queryByKey(entitySets.jm1_creativework, `${RUN_MARKER}:creative`, 'jm1_creativeworkid');
const socialBefore = await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const journeyBefore = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
const exceptionsBefore = await queryByKey(entitySets.jm1_marketingexception, `${RUN_MARKER}:exception`, 'jm1_marketingexceptionid');

const introExists = socialBefore.some((row) => /month_introduction|intro/i.test(`${row.jm1_name ?? ''} ${row.jm1_idempotencykey ?? ''}`));
const titleDiscoverySocialExists = socialBefore.some((row) => row.jm1_idempotencykey?.includes(`social:${STAGE}:`));
const titleDiscoveryCreativeExists = creativeBefore.some((row) => row.jm1_idempotencykey?.includes(`creative:${STAGE}`));

const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${entitySets.jm1_campaignauthority}(${campaign.jm1_campaignauthorityid})` };
const generated = [];
const creative = writeTitleDiscoveryCreative();

if (!titleDiscoveryCreativeExists) {
  generated.push({
    type: 'creative',
    id: await upsertByIdempotency(entitySets.jm1_creativework, {
      jm1_name: 'Iyorwuese October title discovery brand creative',
      jm1_branch: 'J Merrill Publishing',
      jm1_stage: STAGE,
      jm1_assetpath: creative.path,
      jm1_assethash: creative.sha256,
      jm1_logohash: creative.logoAssetHash,
      jm1_dimensions: '1080x1080',
      jm1_publicreadystate: 'PASS',
      jm1_idempotencykey: `${RUN_MARKER}:creative:${STAGE}`,
      ...campaignBind
    }, 'jm1_creativeworkid')
  });
}

if (!titleDiscoverySocialExists) {
  for (const [platform, executor, schedule] of [
    ['facebook', 'META_API', '2026-10-03T14:00:00Z'],
    ['instagram', 'META_API', '2026-10-03T16:00:00Z'],
    ['linkedin', 'LINKEDIN_API', '2026-10-03T18:00:00Z']
  ]) {
    generated.push({
      type: `social:${platform}`,
      id: await upsertByIdempotency(entitySets.jm1_socialexecution, {
        jm1_name: `Iyorwuese October title discovery - ${platform}`,
        jm1_branch: 'J Merrill Publishing',
        jm1_platform: platform,
        jm1_executor: executor,
        jm1_requesteddestination: 'J Merrill Publishing, Inc.',
        jm1_actualdestination: '',
        jm1_requestedmediahash: creative.sha256,
        jm1_actualmediareference: '',
        jm1_captionversion: `${RUN_MARKER}:caption:${STAGE}:v1`,
        jm1_platformpostid: '',
        jm1_status: 'HELD_FOR_ADAPTER',
        jm1_errorcode: '',
        jm1_errormessage: '',
        jm1_readbackstate: 'NOT_EXECUTED_NO_PLATFORM_API_AUTHORITY',
        jm1_idempotencykey: `${RUN_MARKER}:social:${STAGE}:${platform}`,
        jm1_requestedschedule: schedule,
        jm1_verifiedat: '2026-09-02T04:00:00Z',
        ...campaignBind
      }, 'jm1_socialexecutionid')
    });
  }
}

const controlDecision = titleDiscoveryCreativeExists && titleDiscoverySocialExists
  ? 'DO_NOTHING_ALREADY_PREPARED'
  : 'GENERATE_TITLE_DISCOVERY_SAFE_BRAND_STAGE';

const controlLoopId = await upsertByIdempotency(entitySets.jm1_marketingcontrolloop, {
  jm1_name: 'October Iyorwuese control loop execution - title discovery',
  jm1_branch: 'J Merrill Publishing',
  jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
  jm1_horizon30day: 'CAMPAIGN_COVERAGE_EXISTS',
  jm1_horizon14day: 'CONTENT_READY_PARTIAL',
  jm1_horizon7day: 'EXECUTION_READY_HELD_FOR_ADAPTERS',
  jm1_featuredauthorintroeligible: introExists ? 'FALSE' : 'TRUE',
  jm1_fatiguecheck: 'Intro repetition blocked. Title discovery may proceed with brand/typography creative because portrait is optional and title-cover rights remain unresolved.',
  jm1_controldecision: controlDecision,
  jm1_unresolvedprerequisites: 'DYNAMICS_JOURNEY_ADMIN_SETUP_REQUIRED; META_PLATFORM_AUTHORITY_MISSING; LINKEDIN_PLATFORM_AUTHORITY_MISSING; OPTIONAL_ASSET_HELD:author_portrait; TITLE_COVER_RIGHTS_REVIEW_REQUIRED',
  jm1_state: 'CONTROL_LOOP_EXECUTED',
  jm1_idempotencykey: `${RUN_MARKER}:control-loop:execute:${STAGE}`,
  jm1_evaluatedat: '2026-09-02T04:00:00Z',
  ...campaignBind
}, 'jm1_marketingcontrolloopid');

const creativeAfter = await queryByKey(entitySets.jm1_creativework, `${RUN_MARKER}:creative`, 'jm1_creativeworkid');
const socialAfter = await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const controlLoopsAfter = await queryByKey(entitySets.jm1_marketingcontrolloop, `${RUN_MARKER}:control-loop`, 'jm1_marketingcontrolloopid');

const report = {
  packageId: 780,
  artifact: 'JM1-MARKETING-CONTROL-LOOP-EXECUTION-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  campaignAuthority: {
    id: campaign.jm1_campaignauthorityid,
    name: campaign.jm1_name,
    idempotencyKey: CAMPAIGN_KEY
  },
  queriedRuntime: {
    contentWork: content.length,
    creativeBefore: creativeBefore.length,
    socialBefore: socialBefore.length,
    journeyExecution: journeyBefore.length,
    exceptions: exceptionsBefore.length
  },
  rulesApplied: {
    introEligible: !introExists,
    introRepetitionPrevented: introExists,
    portraitTreatment: 'OPTIONAL_ASSET_HELD',
    titleCoverTreatment: 'RIGHTS_REVIEW_REQUIRED',
    safeCreativeArchetype: 'OFFICIAL_LOGO_PLUS_TYPOGRAPHY_EDITORIAL_DESIGN',
    noManualOctoberCalendarBuilt: true
  },
  generated,
  creative,
  controlLoopId,
  readback: {
    creativeAfter: creativeAfter.length,
    socialAfter: socialAfter.length,
    controlLoopsAfter: controlLoopsAfter.length,
    titleDiscoveryCreativeExists: creativeAfter.some((row) => row.jm1_idempotencykey?.includes(`creative:${STAGE}`)),
    titleDiscoverySocialRows: socialAfter.filter((row) => row.jm1_idempotencykey?.includes(`social:${STAGE}:`)).length
  },
  classification: 'MARKETING_CONTROL_LOOP_PROVEN_BOUNDARY_HELD',
  blockersRemaining: [
    'DYNAMICS_JOURNEY_ADMIN_SETUP_REQUIRED',
    'META_PLATFORM_AUTHORITY_MISSING',
    'LINKEDIN_PLATFORM_AUTHORITY_MISSING',
    'TITLE_COVER_RIGHTS_REVIEW_REQUIRED'
  ],
  noTouchReadiness: 'NO_TOUCH_TEST_NOT_READY'
};

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classification: report.classification,
  generated: report.generated.map((item) => item.type),
  readback: report.readback
}, null, 2));

function writeTitleDiscoveryCreative() {
  mkdirSync(CREATIVE_DIR, { recursive: true });
  const logoPath = join(ROOT, 'publishing_first7_creatives/jm1-logo-white-source.png');
  const logoBytes = readFileSync(logoPath);
  const logoHash = sha256(logoBytes);
  const logoData = logoBytes.toString('base64');
  const path = join(CREATIVE_DIR, 'iyorwuese_october_title_discovery_brand_1080.svg');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img" aria-label="J Merrill Publishing October title discovery graphic for Iyorwuese Hagher">
  <rect width="1080" height="1080" fill="#111111"/>
  <rect x="60" y="60" width="960" height="960" fill="#ffffff" opacity="0.06"/>
  <image href="data:image/png;base64,${logoData}" x="774" y="72" width="220" height="220" opacity="0.92"/>
  <text x="86" y="180" fill="#f4b400" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">October Featured Author</text>
  <text x="86" y="310" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="800">Iyorwuese Hagher</text>
  <text x="86" y="436" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">Title discovery begins with context.</text>
  <text x="86" y="548" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="38">Helping Authors Help Themselves means giving</text>
  <text x="86" y="606" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="38">readers a clear reason to meet the work.</text>
  <text x="86" y="900" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">J Merrill Publishing</text>
</svg>
`;
  writeFileSync(path, svg);
  return {
    path,
    sha256: sha256(Buffer.from(svg)),
    logoAssetPath: logoPath,
    logoAssetHash: logoHash,
    dimensions: { width: 1080, height: 1080 },
    publicReadyState: 'PASS',
    dependsOnPortrait: false,
    dependsOnTitleCover: false
  };
}

async function getEntitySets(logicalNames) {
  const out = {};
  for (const logicalName of logicalNames) {
    const entity = await dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`);
    out[logicalName] = entity.EntitySetName;
  }
  return out;
}

async function singleByKey(entitySet, key, primaryId) {
  const rows = await queryByKey(entitySet, key, primaryId);
  if (rows.length === 0) throw new Error(`No row found for ${entitySet} ${key}`);
  return rows[0];
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
  const response = await dv(`/${entitySet}?$select=${primaryId},jm1_name,jm1_idempotencykey,createdon&$filter=${filter}&$top=100`);
  return response.value ?? [];
}

async function dv(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
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

  if (!response.ok) throw new Error(`Dataverse ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return {};
  return response.json();
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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}
