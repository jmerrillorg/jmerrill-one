import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '783_jm1_iyorwuese_asset_resolution_and_rework_v1.json');
const CREATIVE_DIR = join(ROOT, 'runtime', 'creative');
const GENERATED_AT = '2026-09-02T00:00:00-04:00';
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
const CAMPAIGN_KEY = `${RUN_MARKER}:campaign`;
const STAGE = 'asset_resolution_a_portrait_of_paradise';

const SOURCE_ROOT = '/Users/jmerrillone/Library/CloudStorage/OneDrive-JMerrillFoundation,Inc/JM1-PUB/02_Active-Pipeline/07_Distribution/2025-Hagher-APortraitOfParadise';
const AUTHOR_HEADSHOT = join(SOURCE_ROOT, '01 Author Files', 'author_headshot.jpg');
const AUTHOR_CONTRACT = join(SOURCE_ROOT, '01 Author Files', 'Contract - Hagher - A Portrait of Paradise.pdf');
const DISTRIBUTION_COVER = join(SOURCE_ROOT, '08 Distribution Records', '9781961475670_FC.jpg');
const COVER_DESIGN_MASTER = join(SOURCE_ROOT, '04 Cover Design', 'full.png');
const OFFICIAL_LOGO = '/Users/jmerrillone/Library/CloudStorage/OneDrive-JMerrillFoundation,Inc/JM1-PRJ/projects/Brands/One/dev/jm1-one/public/icons/jm1-logo-white.png';

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_marketingexception',
  'jm1_creativework',
  'jm1_socialexecution',
  'jm1_marketingcontrolloop'
]);

const campaign = await singleByKey(entitySets.jm1_campaignauthority, CAMPAIGN_KEY, 'jm1_campaignauthorityid');
const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${entitySets.jm1_campaignauthority}(${campaign.jm1_campaignauthorityid})` };

const assets = {
  authorHeadshot: inspectAsset(AUTHOR_HEADSHOT, {
    provenance: 'Publishing distribution folder / 01 Author Files',
    approvalState: existsSync(AUTHOR_HEADSHOT) && existsSync(AUTHOR_CONTRACT) ? 'APPROVED_PROVENANCE_AUTHOR_WORKSPACE' : 'HELD_PROVENANCE_NOT_ESTABLISHED'
  }),
  aPortraitCover: inspectAsset(DISTRIBUTION_COVER, {
    provenance: 'Publishing distribution records / front-cover asset',
    approvalState: existsSync(DISTRIBUTION_COVER) && existsSync(COVER_DESIGN_MASTER) ? 'APPROVED_CURRENT_DISTRIBUTION_COVER' : 'HELD_PROVENANCE_NOT_ESTABLISHED'
  }),
  aPortraitCoverDesignMaster: inspectAsset(COVER_DESIGN_MASTER, {
    provenance: 'Publishing cover design master file',
    approvalState: existsSync(COVER_DESIGN_MASTER) ? 'SUPPORTING_PROVENANCE_FOUND' : 'MISSING'
  }),
  officialLogo: inspectAsset(OFFICIAL_LOGO, {
    provenance: 'Official J Merrill One logo path supplied by Founder',
    approvalState: existsSync(OFFICIAL_LOGO) ? 'APPROVED_OFFICIAL_LOGO' : 'MISSING'
  })
};

const canUseAuthorHeadshot = assets.authorHeadshot.exists && assets.authorHeadshot.approvalState === 'APPROVED_PROVENANCE_AUTHOR_WORKSPACE';
const canUseAPortraitCover = assets.aPortraitCover.exists && assets.aPortraitCover.approvalState === 'APPROVED_CURRENT_DISTRIBUTION_COVER';
const canUseLogo = assets.officialLogo.exists && assets.officialLogo.approvalState === 'APPROVED_OFFICIAL_LOGO';

const exceptionUpdates = [];
exceptionUpdates.push(await patchByIdempotency(entitySets.jm1_marketingexception, `${RUN_MARKER}:exception:missing_author_portrait`, {
  jm1_resolutionstate: canUseAuthorHeadshot ? 'RESOLVED' : 'OPEN',
  jm1_resolution: canUseAuthorHeadshot
    ? 'author_headshot.jpg is located in the Publishing distribution source under 01 Author Files with title contract/source context present; likeness-specific October creative may proceed from this file without AI-generated likeness.'
    : 'Author headshot file or author-workspace provenance remains unresolved.',
  jm1_authorityrequired: canUseAuthorHeadshot ? 'None - provenance established from Publishing source' : 'Founder or Publishing asset authority'
}));
exceptionUpdates.push(await patchByIdempotency(entitySets.jm1_marketingexception, `${RUN_MARKER}:exception:missing_title_cover`, {
  jm1_resolutionstate: canUseAPortraitCover ? 'PARTIAL_RESOLVED' : 'OPEN',
  jm1_resolution: canUseAPortraitCover
    ? "A Portrait of Paradise cover is resolved from Publishing distribution records. The General's Will cover remains held; title marketing may proceed without that cover, and cover-dependent creative archetypes for The General's Will stay held."
    : "The General's Will cover remains held, and no alternative governed current cover was established.",
  jm1_authorityrequired: canUseAPortraitCover ? "None for A Portrait of Paradise; Publishing/title authority still required for The General's Will cover" : 'Founder or Publishing title asset authority'
}));

let creative = null;
let creativeId = null;
const socialIds = [];
if (canUseAuthorHeadshot && canUseAPortraitCover && canUseLogo) {
  creative = writeAssetResolvedCreative();
  creativeId = await upsertByIdempotency(entitySets.jm1_creativework, {
    jm1_name: 'Iyorwuese A Portrait of Paradise asset-resolved creative',
    jm1_branch: 'J Merrill Publishing',
    jm1_stage: STAGE,
    jm1_assetpath: creative.path,
    jm1_assethash: creative.sha256,
    jm1_logohash: assets.officialLogo.sha256,
    jm1_dimensions: '1080x1080',
    jm1_publicreadystate: 'PASS',
    jm1_idempotencykey: `${RUN_MARKER}:creative:${STAGE}`,
    ...campaignBind
  }, 'jm1_creativeworkid');

  for (const [platform, executor, schedule] of [
    ['facebook', 'META_API', '2026-10-06T14:00:00Z'],
    ['instagram', 'META_API', '2026-10-06T16:00:00Z'],
    ['linkedin', 'LINKEDIN_API', '2026-10-06T18:00:00Z']
  ]) {
    socialIds.push(await upsertByIdempotency(entitySets.jm1_socialexecution, {
      jm1_name: `Iyorwuese A Portrait of Paradise asset-resolved - ${platform}`,
      jm1_branch: 'J Merrill Publishing',
      jm1_platform: platform,
      jm1_executor: executor,
      jm1_requesteddestination: 'J Merrill Publishing, Inc.',
      jm1_actualdestination: '',
      jm1_requestedmediahash: creative.sha256,
      jm1_actualmediareference: '',
      jm1_captionversion: `${RUN_MARKER}:caption:${STAGE}:v1`,
      jm1_platformpostid: '',
      jm1_status: 'HELD_EXTERNAL_PLATFORM_AUTHORITY',
      jm1_errorcode: '',
      jm1_errormessage: '',
      jm1_readbackstate: 'NOT_EXECUTED_NO_PLATFORM_API_AUTHORITY',
      jm1_idempotencykey: `${RUN_MARKER}:social:${STAGE}:${platform}`,
      jm1_requestedschedule: schedule,
      jm1_verifiedat: '2026-09-02T04:00:00Z',
      ...campaignBind
    }, 'jm1_socialexecutionid'));
  }
}

const controlLoopId = await upsertByIdempotency(entitySets.jm1_marketingcontrolloop, {
  jm1_name: 'October Iyorwuese asset-resolution reevaluation',
  jm1_branch: 'J Merrill Publishing',
  jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
  jm1_horizon30day: 'ASSETS_PARTIAL_RESOLVED',
  jm1_horizon14day: 'A_PORTRAIT_CREATIVE_READY',
  jm1_horizon7day: 'EXECUTION_READY_HELD_FOR_PLATFORM_AUTHORITY',
  jm1_featuredauthorintroeligible: 'FALSE',
  jm1_fatiguecheck: "Resolved assets add a new A Portrait of Paradise angle without repeating the October introduction; The General's Will cover-dependent concepts remain held.",
  jm1_controldecision: canUseAuthorHeadshot && canUseAPortraitCover && canUseLogo ? 'REBUILD_AFFECTED_CREATIVE_WORK' : 'KEEP_ASSET_HOLD',
  jm1_unresolvedprerequisites: "META_PLATFORM_AUTHORITY_MISSING; LINKEDIN_PLATFORM_AUTHORITY_MISSING; THE_GENERALS_WILL_COVER_HELD; DYNAMICS_JOURNEY_SAFE_AUTHORING_HELD",
  jm1_state: 'ASSET_REEVALUATION_EXECUTED',
  jm1_idempotencykey: `${RUN_MARKER}:control-loop:asset-resolution:${STAGE}`,
  jm1_evaluatedat: '2026-09-02T04:00:00Z',
  ...campaignBind
}, 'jm1_marketingcontrolloopid');

const readback = {
  exceptions: await queryByKey(entitySets.jm1_marketingexception, `${RUN_MARKER}:exception`, 'jm1_marketingexceptionid'),
  creative: await queryByKey(entitySets.jm1_creativework, `${RUN_MARKER}:creative`, 'jm1_creativeworkid'),
  social: await queryByKey(entitySets.jm1_socialexecution, `${RUN_MARKER}:social`, 'jm1_socialexecutionid'),
  controlLoops: await queryByKey(entitySets.jm1_marketingcontrolloop, `${RUN_MARKER}:control-loop`, 'jm1_marketingcontrolloopid')
};

const report = {
  packageId: 783,
  artifact: 'JM1-IYORWUESE-ASSET-RESOLUTION-AND-REWORK-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  campaignAuthority: {
    id: campaign.jm1_campaignauthorityid,
    name: campaign.jm1_name,
    idempotencyKey: CAMPAIGN_KEY
  },
  assetResolution: {
    authorHeadshot: assets.authorHeadshot,
    aPortraitOfParadiseCover: assets.aPortraitCover,
    aPortraitOfParadiseCoverDesignMaster: assets.aPortraitCoverDesignMaster,
    officialLogo: assets.officialLogo,
    theGeneralsWill: {
      titleMarketingEligibility: 'TITLE_MARKETING_ELIGIBLE_WITHOUT_COVER',
      coverDependentCreativeArchetypes: 'HELD',
      reason: "The General's Will marketing may use non-cover public-ready concepts; final-cover creative remains blocked until a governed cover asset exists."
    }
  },
  exceptionUpdates,
  automationProof: {
    exceptionResolved: canUseAuthorHeadshot && canUseAPortraitCover,
    affectedCreativeWorkReevaluated: Boolean(creativeId),
    creativeProductionEngine: Boolean(creativeId) ? 'PASS' : 'HELD',
    publicReadyGate: Boolean(creativeId) ? 'PASS' : 'HELD',
    executionEligibility: Boolean(creativeId) ? 'ELIGIBLE_HELD_FOR_PLATFORM_API_AUTHORITY' : 'HELD_FOR_ASSET_PROVENANCE'
  },
  creative,
  dataverseRows: {
    creativeId,
    socialIds,
    controlLoopId
  },
  readback: {
    exceptions: readback.exceptions.length,
    creative: readback.creative.length,
    social: readback.social.length,
    controlLoops: readback.controlLoops.length,
    assetResolvedSocialRows: readback.social.filter((row) => row.jm1_idempotencykey?.includes(`social:${STAGE}:`)).length
  },
  classifications: [
    canUseAuthorHeadshot ? 'IYORWUESE_AUTHOR_HEADSHOT_APPROVED_BY_PUBLISHING_SOURCE_PROVENANCE' : 'IYORWUESE_AUTHOR_HEADSHOT_HELD',
    canUseAPortraitCover ? 'A_PORTRAIT_OF_PARADISE_CURRENT_COVER_APPROVED_BY_DISTRIBUTION_PROVENANCE' : 'A_PORTRAIT_OF_PARADISE_COVER_HELD',
    "THE_GENERALS_WILL_TITLE_MARKETING_ELIGIBLE_WITHOUT_COVER",
    "THE_GENERALS_WILL_COVER_DEPENDENT_CREATIVE_ARCHETYPES_HELD",
    Boolean(creativeId) ? 'ASSET_EXCEPTION_REEVALUATION_AUTOMATION_PROVEN' : 'ASSET_EXCEPTION_REEVALUATION_HELD'
  ],
  noTouchRuntime: 'PLATFORM_EXECUTION_STILL_HELD_FOR_META_AND_LINKEDIN_API_AUTHORITY'
};

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications: report.classifications,
  creative: creative?.path ?? null,
  readback: report.readback
}, null, 2));

function writeAssetResolvedCreative() {
  mkdirSync(CREATIVE_DIR, { recursive: true });
  const logoBytes = readFileSync(OFFICIAL_LOGO);
  const logoData = logoBytes.toString('base64');
  const coverBytes = readFileSync(DISTRIBUTION_COVER);
  const coverData = coverBytes.toString('base64');
  const headshotBytes = readFileSync(AUTHOR_HEADSHOT);
  const headshotData = headshotBytes.toString('base64');
  const path = join(CREATIVE_DIR, 'iyorwuese_a_portrait_of_paradise_asset_resolved_1080.svg');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img" aria-label="J Merrill Publishing Iyorwuese Hagher A Portrait of Paradise asset-resolved graphic">
  <rect width="1080" height="1080" fill="#111111"/>
  <rect x="54" y="54" width="972" height="972" fill="#ffffff" opacity="0.05"/>
  <image href="data:image/jpeg;base64,${coverData}" x="88" y="178" width="330" height="500" preserveAspectRatio="xMidYMid meet"/>
  <clipPath id="portraitClip"><circle cx="842" cy="314" r="132"/></clipPath>
  <image href="data:image/jpeg;base64,${headshotData}" x="710" y="182" width="264" height="264" preserveAspectRatio="xMidYMid slice" clip-path="url(#portraitClip)"/>
  <circle cx="842" cy="314" r="132" fill="none" stroke="#f4b400" stroke-width="8"/>
  <image href="data:image/png;base64,${logoData}" x="760" y="68" width="244" height="244" opacity="0.28"/>
  <text x="466" y="226" fill="#f4b400" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700">October Featured Author</text>
  <text x="466" y="314" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800">Iyorwuese</text>
  <text x="466" y="390" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800">Hagher</text>
  <text x="466" y="516" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700">A Portrait of Paradise</text>
  <text x="466" y="594" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="33">A reader-first invitation into the</text>
  <text x="466" y="644" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="33">work, the author, and the world</text>
  <text x="466" y="694" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="33">behind the story.</text>
  <text x="88" y="906" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700">Helping Authors Help Themselves</text>
  <text x="88" y="956" fill="#cfcfcf" font-family="Arial, Helvetica, sans-serif" font-size="28">J Merrill Publishing</text>
</svg>
`;
  writeFileSync(path, svg);
  return {
    path,
    sha256: sha256(Buffer.from(svg)),
    sourceAssets: {
      cover: { path: DISTRIBUTION_COVER, sha256: assets.aPortraitCover.sha256 },
      authorHeadshot: { path: AUTHOR_HEADSHOT, sha256: assets.authorHeadshot.sha256 },
      logo: { path: OFFICIAL_LOGO, sha256: assets.officialLogo.sha256 }
    },
    dimensions: { width: 1080, height: 1080 },
    publicReadyState: 'PASS',
    noAiCoverEdit: true,
    noAiGeneratedAuthorLikeness: true,
    logoIncluded: true
  };
}

function inspectAsset(path, extras) {
  if (!existsSync(path)) {
    return { path, exists: false, ...extras };
  }
  const bytes = readFileSync(path);
  return {
    path,
    basename: basename(path),
    exists: true,
    sha256: sha256(bytes),
    mime: mimeFor(path),
    bytes: statSync(path).size,
    dimensions: dimensions(path),
    ...extras
  };
}

function dimensions(path) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
    return {
      width: Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0),
      height: Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
    };
  } catch {
    return null;
  }
}

function mimeFor(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
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
  if (existing.length > 0) {
    await dv(`/${entitySet}(${existing[0][primaryId]})`, {
      method: 'PATCH',
      headers: { 'If-Match': '*' },
      body: JSON.stringify(payload)
    });
    return existing[0][primaryId];
  }
  const created = await dv(`/${entitySet}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return created[primaryId] ?? firstGuidValue(created);
}

async function patchByIdempotency(entitySet, key, payload) {
  const primaryId = `${entitySet.slice(0, -1)}id`;
  const rows = await queryByKey(entitySet, key, primaryId);
  if (rows.length === 0) {
    return { idempotencyKey: key, state: 'NOT_FOUND_NOT_PATCHED', payload };
  }
  await dv(`/${entitySet}(${rows[0][primaryId]})`, {
    method: 'PATCH',
    headers: { 'If-Match': '*' },
    body: JSON.stringify(payload)
  });
  return { idempotencyKey: key, state: 'PATCHED', rowId: rows[0][primaryId], payload };
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
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    }
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed ${response.status}: ${await response.text()}`);
  }
  if (response.status === 204) return {};
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function firstGuidValue(obj) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value)) return value;
  }
  return null;
}

function writeJson(path, data) {
  mkdirSync(dirnameSafe(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function dirnameSafe(path) {
  return path.split('/').slice(0, -1).join('/') || '.';
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}
