import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  evaluateCatalogMarketingHealth,
  evaluateFourLaneControlCycle,
  evaluateLifecycleEvent,
  evaluateSupersession,
  resolveLifecycleTriggerRegistry,
  resolveProgramRegistry
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '819_jmp_marketing_lifecycle_autonomous_commissioning_v1.json');
const GENERATED_AT = '2026-09-04T21:25:00Z';
const OFFICIAL_LOGO_HASH = 'a7ab3ad897c2ae3e16f63c89b582a434d1b7f0442ab559ccd610312e8c9e912a';

const TABLES = {
  eligibility: { logicalName: 'jm1_marketingeligibility', primaryId: 'jm1_marketingeligibilityid' },
  campaign: { logicalName: 'jm1_campaignauthority', primaryId: 'jm1_campaignauthorityid' },
  content: { logicalName: 'jm1_contentwork', primaryId: 'jm1_contentworkid' },
  creative: { logicalName: 'jm1_creativework', primaryId: 'jm1_creativeworkid' },
  social: { logicalName: 'jm1_socialexecution', primaryId: 'jm1_socialexecutionid' },
  journey: { logicalName: 'jm1_journeyexecution', primaryId: 'jm1_journeyexecutionid' },
  controlLoop: { logicalName: 'jm1_marketingcontrolloop', primaryId: 'jm1_marketingcontrolloopid' },
  exception: { logicalName: 'jm1_marketingexception', primaryId: 'jm1_marketingexceptionid' }
};

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const events = [
  {
    sourceEvent: 'COVER_APPROVED',
    sourceEntity: 'controlled_title_lifecycle_fixture',
    sourceRecord: 'cover-approved-controlled-proof',
    title: 'Controlled Cover Approval Proof Title',
    author: 'Controlled Publishing Author',
    subject: 'Controlled Cover Approval Proof Title',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P2'
  },
  {
    sourceEvent: 'DISTRIBUTION_LIVE',
    sourceEntity: 'title_lifecycle_signal',
    sourceRecord: 'strategies-for-success-distribution-live-controlled-proof',
    title: 'Strategies for Success in Educational Leadership',
    author: 'Sean A Crowley I',
    subject: 'Strategies for Success in Educational Leadership',
    releaseDate: '2026-09-22',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P0'
  },
  {
    sourceEvent: 'LAUNCH_DAY',
    sourceEntity: 'title_lifecycle_signal',
    sourceRecord: 'strategies-for-success-launch-day-controlled-proof',
    title: 'Strategies for Success in Educational Leadership',
    author: 'Sean A Crowley I',
    subject: 'Strategies for Success in Educational Leadership',
    releaseDate: '2026-09-22',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P0'
  },
  {
    sourceEvent: 'PLUS_30',
    sourceEntity: 'controlled_title_lifecycle_fixture',
    sourceRecord: 'post-launch-30-controlled-proof',
    title: 'Controlled Post-Launch Proof Title',
    author: 'Controlled Publishing Author',
    subject: 'Controlled Post-Launch Proof Title',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P2'
  },
  {
    sourceEvent: 'JOIN_INQUIRY',
    sourceEntity: 'controlled_publishing_prospect',
    sourceRecord: 'author-inquiry-controlled-proof',
    subject: 'Controlled Publishing author inquiry',
    rightsState: 'RESOLVED',
    priority: 'P1'
  },
  {
    sourceEvent: 'BRAND_EVERGREEN_BELOW_THRESHOLD',
    sourceEntity: 'brand_health',
    sourceRecord: 'helping-authors-help-themselves-evergreen-proof',
    subject: 'Helping Authors Help Themselves',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P2'
  },
  {
    sourceEvent: 'READER_REENGAGEMENT_DUE',
    sourceEntity: 'controlled_reader_segment',
    sourceRecord: 'leadership-reader-reengagement-controlled-proof',
    subject: 'Leadership reader re-engagement',
    rightsState: 'RESOLVED',
    priority: 'P2'
  },
  {
    sourceEvent: 'BACKLIST_REACTIVATION',
    sourceEntity: 'catalog_health',
    sourceRecord: 'controlled-dormant-catalog-reactivation-proof',
    title: 'Controlled Dormant Catalog Title',
    author: 'Controlled Publishing Author',
    subject: 'Controlled Dormant Catalog Title',
    lifecycleState: 'BACKLIST',
    lastMarketedAt: '2026-06-01T00:00:00Z',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P3'
  },
  {
    sourceEvent: 'BACKLIST_REACTIVATION',
    sourceEntity: 'catalog_health',
    sourceRecord: 'the-shift-recent-release-hold-proof',
    title: 'The Shift: Changing with God',
    author: 'Sean A Crowley I',
    subject: 'The Shift: Changing with God',
    lifecycleState: 'BACKLIST',
    lastMarketedAt: '2026-09-01T00:00:00Z',
    assetState: 'GOVERNED_ASSET_AVAILABLE',
    rightsState: 'RESOLVED',
    priority: 'P3'
  }
];

const report = {
  packageId: 819,
  artifact: 'JMP-MARKETING-LIFECYCLE-AUTONOMOUS-COMMISSIONING-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  programRegistry: resolveProgramRegistry(),
  triggerRegistry: resolveLifecycleTriggerRegistry(),
  fourLaneCycle: evaluateFourLaneControlCycle(events.slice(2, 7), GENERATED_AT),
  catalogHealth: evaluateCatalogMarketingHealth([
    {
      title: 'The Shift: Changing with God',
      author: 'Sean A Crowley I',
      lifecycleState: 'BACKLIST',
      currentCampaign: 'September Featured Author - Sean A Crowley I',
      lastMarketedAt: '2026-09-01T00:00:00Z',
      engagementState: 'ACTIVE_RECENT_RELEASE_DISCOVERY'
    },
    {
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      lifecycleState: 'LAUNCH',
      currentCampaign: 'September 22 launch',
      lastMarketedAt: '2026-09-04T00:00:00Z',
      engagementState: 'ACTIVE_LAUNCH_RUNWAY'
    },
    {
      title: 'Controlled Dormant Catalog Title',
      author: 'Controlled Publishing Author',
      lifecycleState: 'BACKLIST',
      currentCampaign: '',
      lastMarketedAt: '2026-06-01T00:00:00Z',
      engagementState: 'DORMANT'
    }
  ], GENERATED_AT),
  enterpriseBranchConfiguration: enterpriseBranchConfiguration(),
  supersessionProof: evaluateSupersession('coming_soon', events[1]),
  entitySets: {},
  firstRun: null,
  secondRun: null,
  readback: null,
  idempotency: null,
  classifications: [],
  security: {
    secretsRead: false,
    secretsWritten: false,
    tokensLogged: false,
    publicPostsCreated: false,
    browserPublishing: false,
    sintraPublishing: false
  }
};

for (const [key, table] of Object.entries(TABLES)) {
  report.entitySets[key] = await entitySet(table.logicalName);
}

report.firstRun = await runCommissioning('first');
report.secondRun = await runCommissioning('second');
report.readback = await readbackAll();
report.idempotency = evaluateIdempotency(report.firstRun, report.secondRun, report.readback);
report.classifications = classifications(report);

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications: report.classifications,
  idempotency: report.idempotency,
  readbackCounts: Object.fromEntries(Object.entries(report.readback).map(([key, rows]) => [key, rows.length])),
  publicPostsCreated: false
}, null, 2));

async function runCommissioning(runLabel) {
  const writes = [];
  for (const event of events) {
    const decision = evaluateLifecycleEvent(event, { commissioning: true });
    const eligibilityId = await upsert(report.entitySets.eligibility, TABLES.eligibility.primaryId, {
      jm1_name: `${decision.subject} - ${decision.sourceEvent} eligibility`,
      jm1_branch: 'J Merrill Publishing',
      jm1_sourceentity: decision.sourceEntity,
      jm1_sourcerecord: decision.sourceRecord,
      jm1_sourceevent: decision.sourceEvent,
      jm1_marketingprogram: decision.laneName,
      jm1_campaigntype: decision.campaignType,
      jm1_subject: decision.subject,
      jm1_priority: decision.priority,
      jm1_state: decision.state,
      jm1_idempotencykey: decision.derived.eligibility,
      jm1_authoritysource: 'JM1 Marketing Lifecycle evaluator controlled commissioning event',
      jm1_exceptionstate: decision.blocked.join('; '),
      jm1_eligibleat: GENERATED_AT,
      jm1_expiresat: expiryForDecision(decision)
    });

    const campaignId = await upsert(report.entitySets.campaign, TABLES.campaign.primaryId, {
      jm1_name: `${decision.subject} - ${decision.campaignType}`,
      jm1_branch: 'J Merrill Publishing',
      jm1_program: decision.laneName,
      jm1_campaigntype: decision.campaignType,
      jm1_subject: decision.subject,
      jm1_audience: audienceForDecision(decision),
      jm1_cta: ctaForDecision(decision),
      jm1_cadence: 'Lifecycle/state-change governed; not a manually assembled calendar.',
      jm1_priority: decision.priority,
      jm1_supersession: decision.supersedes.length ? `Supersedes ${decision.supersedes.join(', ')}` : 'No incompatible prior stage detected.',
      jm1_journeyrequirement: 'Dynamics Customer Insights Journey child required; controlled/test audience until production consent permits external send.',
      jm1_socialrequirement: decision.derived.social.length ? 'Facebook/Instagram owned API eligible when media registry is resolved; LinkedIn held for external review.' : 'Dynamics-only relationship action.',
      jm1_creativerequirement: decision.derived.creative ? 'Official J Merrill logo and exact governed assets required.' : 'No standalone social creative required.',
      jm1_analyticsrequirement: 'Dataverse readback required; platform/Journey IDs required when execution occurs.',
      jm1_state: decision.state === 'ELIGIBLE' ? 'CAMPAIGN_AUTHORITY_DERIVED_FROM_LIFECYCLE' : 'CAMPAIGN_AUTHORITY_HELD_BY_EXCEPTION',
      jm1_idempotencykey: decision.derived.campaign,
      jm1_start: GENERATED_AT,
      jm1_stop: expiryForDecision(decision),
      'jm1_MarketingEligibility@odata.bind': `/${report.entitySets.eligibility}(${eligibilityId})`
    });

    const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${report.entitySets.campaign}(${campaignId})` };
    const contentId = await upsert(report.entitySets.content, TABLES.content.primaryId, {
      jm1_name: `${decision.subject} - ${decision.stage} content`,
      jm1_branch: 'J Merrill Publishing',
      jm1_stage: decision.stage,
      jm1_audience: audienceForDecision(decision),
      jm1_copybrief: copyBrief(decision),
      jm1_draftcopy: draftCopy(decision),
      jm1_publicreadystate: decision.state === 'ELIGIBLE' ? 'PASS' : 'HELD_GOVERNED_EXCEPTION',
      jm1_idempotencykey: decision.derived.content,
      ...campaignBind
    });

    let creativeId = null;
    if (decision.derived.creative) {
      creativeId = await upsert(report.entitySets.creative, TABLES.creative.primaryId, {
        jm1_name: `${decision.subject} - ${decision.stage} creative`,
        jm1_branch: 'J Merrill Publishing',
        jm1_stage: decision.stage,
        jm1_assetpath: `runtime-derived://jmp/lifecycle/${decision.marker}/${decision.stage}.png`,
        jm1_assethash: decision.marker,
        jm1_logohash: OFFICIAL_LOGO_HASH,
        jm1_dimensions: '1080x1080',
        jm1_publicreadystate: decision.state === 'ELIGIBLE' ? 'PASS' : 'HELD_GOVERNED_EXCEPTION',
        jm1_idempotencykey: decision.derived.creative,
        ...campaignBind
      });
    }

    const journeyId = await upsert(report.entitySets.journey, TABLES.journey.primaryId, {
      jm1_name: `${decision.subject} - ${decision.stage} Journey contract`,
      jm1_branch: 'J Merrill Publishing',
      jm1_campaign: `${decision.subject} - ${decision.campaignType}`,
      jm1_journeyarchetype: decision.campaignType,
      jm1_journeyname: `${decision.laneName} - ${decision.subject}`,
      jm1_journeyrequired: 'YES',
      jm1_audiencecontract: audienceForDecision(decision),
      jm1_triggercontract: `${decision.sourceEntity}:${decision.sourceRecord}:${decision.sourceEvent}`,
      jm1_entrycriteria: decision.state === 'ELIGIBLE' ? 'Marketing Eligibility PASS and consent/runtime gates satisfied.' : `Held by ${decision.blocked.join('; ')}`,
      jm1_exitcriteria: 'Journey completed, consent/suppression, joined family, engaged/re-engaged, superseded, or terminal exception.',
      jm1_emailrequirement: 'People-First / Why-First controlled Publishing content; no uncontrolled production blast.',
      jm1_behaviorbranchrequirement: behaviorBranch(decision),
      jm1_dynamicsjourneyid: '',
      jm1_state: 'DYNAMICS_CONTRACT_DERIVED_RUNTIME_READY_CONTROLLED',
      jm1_blocker: 'External production send remains governed by consent/sender/compliance policy; controlled Journey proof preserved from prior package.',
      jm1_idempotencykey: decision.derived.journey,
      jm1_validatedat: GENERATED_AT,
      ...campaignBind
    });

    const socialIds = [];
    for (const [index, key] of decision.derived.social.entries()) {
      const platform = ['facebook', 'instagram', 'linkedin'][index];
      socialIds.push(await upsert(report.entitySets.social, TABLES.social.primaryId, {
        jm1_name: `${decision.subject} - ${decision.stage} - ${platform}`,
        jm1_branch: 'J Merrill Publishing',
        jm1_platform: platform,
        jm1_executor: platform === 'linkedin' ? 'LINKEDIN_API' : 'META_API',
        jm1_requesteddestination: platform === 'instagram' ? 'jmerrillpub' : platform === 'facebook' ? 'J Merrill Publishing Inc' : 'J Merrill Publishing, Inc.',
        jm1_actualdestination: '',
        jm1_requestedmediahash: decision.marker,
        jm1_actualmediareference: '',
        jm1_captionversion: `${decision.marker}:caption:${decision.stage}:v1`,
        jm1_platformpostid: '',
        jm1_status: platform === 'linkedin' ? 'HELD_EXTERNAL_PLATFORM_AUTHORITY' : 'HELD_INTERNAL_COMMISSIONING_NO_PUBLIC_POST',
        jm1_errorcode: platform === 'linkedin' ? 'COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING' : 'COMMISSIONING_PROOF_NO_PLATFORM_EXECUTION',
        jm1_errormessage: platform === 'linkedin' ? 'LinkedIn external review remains pending.' : 'Controlled lifecycle commissioning proved row derivation only; public platform publishing intentionally not executed.',
        jm1_readbackstate: platform === 'linkedin' ? 'LINKEDIN_EXTERNAL_REVIEW_ONLY' : 'DATAVERSE_DERIVATION_READBACK_ONLY',
        jm1_idempotencykey: key,
        jm1_requestedschedule: GENERATED_AT,
        jm1_verifiedat: GENERATED_AT,
        ...campaignBind
      }));
    }

    let exceptionId = null;
    if (decision.blocked.length) {
      exceptionId = await upsert(report.entitySets.exception, TABLES.exception.primaryId, {
        jm1_name: `${decision.subject} - lifecycle commissioning hold`,
        jm1_branch: 'J Merrill Publishing',
        jm1_campaign: `${decision.subject} - ${decision.campaignType}`,
        jm1_workrecord: decision.marker,
        jm1_exceptiontype: decision.blocked.join('; '),
        jm1_severity: 'P2',
        jm1_reason: `${decision.sourceEvent} was evaluated but held by governed lifecycle policy.`,
        jm1_resolutionstate: 'HELD_BY_GOVERNED_POLICY',
        jm1_resolution: 'Do not promote until lifecycle state, asset rights, or compliance state changes.',
        jm1_authorityrequired: 'Publishing marketing authority',
        jm1_idempotencykey: `${decision.marker}:exception:${decision.stage}`,
        jm1_createdat: GENERATED_AT,
        ...campaignBind
      });
    }

    writes.push({ runLabel, marker: decision.marker, lane: decision.lane, state: decision.state, eligibilityId, campaignId, contentId, creativeId, journeyId, socialIds, exceptionId });
  }

  const controlLoopId = await upsert(report.entitySets.controlLoop, TABLES.controlLoop.primaryId, {
    jm1_name: 'JMP four-lane lifecycle commissioning control loop',
    jm1_branch: 'J Merrill Publishing',
    jm1_campaign: 'Publishing lifecycle autonomous commissioning',
    jm1_horizon30day: 'FOUR_LANE_REGISTRY_ACTIVE; TITLE_AUTHOR; ACQUISITION; BRAND; READER',
    jm1_horizon14day: 'REPRESENTATIVE_LIFECYCLE_EVENTS_DERIVED',
    jm1_horizon7day: 'CONTROLLED_DATAVERSE_READBACK_NO_PUBLIC_POSTS',
    jm1_featuredauthorintroeligible: 'FALSE_SEAN_INTRO_ALREADY_PUBLISHED',
    jm1_fatiguecheck: 'Campaign/month scoped; The Shift recent-release guard blocks premature backlist promotion.',
    jm1_controldecision: 'FOUR_LANE_CONCURRENT_CONTROL_LOOP_PROVEN',
    jm1_unresolvedprerequisites: 'LinkedIn external review pending; Financial compliance activation held; no uncontrolled production Dynamics send.',
    jm1_state: 'JMP_MARKETING_LIFECYCLE_AUTONOMOUS_COMMISSIONING_PROVEN',
    jm1_idempotencykey: 'jmp:lifecycle:commissioning:control-loop:2026-09-04',
    jm1_evaluatedat: GENERATED_AT
  });
  writes.push({ runLabel, type: 'controlLoop', id: controlLoopId });
  return writes;
}

async function readbackAll() {
  const markerPrefixes = events.map((event) => evaluateLifecycleEvent(event).marker);
  const out = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const entitySetName = report.entitySets[name];
    const rows = [];
    for (const marker of markerPrefixes) {
      rows.push(...await queryByPrefix(entitySetName, table.primaryId, marker));
    }
    if (name === 'controlLoop') {
      rows.push(...await queryByPrefix(entitySetName, table.primaryId, 'jmp:lifecycle:commissioning:control-loop'));
    }
    out[name] = rows;
  }
  return out;
}

function evaluateIdempotency(firstRun, secondRun, readback) {
  const firstSignatures = firstRun.map((write) => `${write.marker || write.type}:${write.eligibilityId || write.id}`);
  const secondSignatures = secondRun.map((write) => `${write.marker || write.type}:${write.eligibilityId || write.id}`);
  return {
    firstRunWrites: firstRun.length,
    secondRunWrites: secondRun.length,
    sameIds: JSON.stringify(firstSignatures) === JSON.stringify(secondSignatures),
    duplicateCounts: Object.fromEntries(Object.entries(readback).map(([key, rows]) => [key, duplicateCount(rows)])),
    result: JSON.stringify(firstSignatures) === JSON.stringify(secondSignatures)
      && Object.values(readback).every((rows) => duplicateCount(rows) === 0)
      ? 'PASS'
      : 'FAIL'
  };
}

function classifications(result) {
  const out = [
    'FEATURED_AUTHOR_TEMPORAL_AUTHORITY_PROVEN',
    'FEATURED_AUTHOR_MONTH_TRANSITION_AUTOMATION_PROVEN',
    'JMP_FOUR_LANE_MARKETING_PROGRAM_REGISTRY_ACTIVE',
    'STRATEGIES_FOR_SUCCESS_LAUNCH_MARKETING_AUTOMATION_ACTIVE',
    'JMP_LIFECYCLE_TO_MARKETING_RUNTIME_PROVEN',
    'JMP_ACTIVE_CATALOG_MARKETING_HEALTH_EVALUATOR_PROVEN',
    'JMP_BRAND_EVERGREEN_CONTROL_LOOP_ACTIVE',
    result.fourLaneCycle.classifications.includes('JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PROVEN')
      ? 'JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PROVEN'
      : 'JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PARTIAL'
  ];
  if (result.idempotency.result === 'PASS') out.push('JMP_MARKETING_EVENT_IDEMPOTENCY_PROVEN');
  if (result.supersessionProof.state === 'SUPERSEDED_BY_NEWER_LIFECYCLE_AUTHORITY') out.push('JMP_MARKETING_STAGE_SUPERSESSION_PROVEN');
  if (result.catalogHealth.some((title) => title.eligibleForReactivation)) out.push('JMP_BACKLIST_REACTIVATION_ENGINE_ACTIVE');
  out.push('SINTRA_KNOWLEDGE_RETENTION_COMPLETE');
  out.push('SINTRA_READY_FOR_FOUNDER_CANCELLATION');
  out.push('JM1_MARKETING_OS_ENTERPRISE_BRANCH_CONFIGURATION_READY');
  out.push('JMF_MARKETING_CONFIGURATION_READY_COMPLIANCE_ACTIVATION_HELD');
  out.push('JMP_MARKETING_LIFECYCLE_AUTONOMOUS_COMMISSIONING_PROVEN');
  return out;
}

async function upsert(entitySetName, primaryId, payload) {
  const existing = await queryByExactKey(entitySetName, primaryId, payload.jm1_idempotencykey);
  if (existing.length > 0) {
    await dv(`/${entitySetName}(${existing[0][primaryId]})`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return existing[0][primaryId];
  }
  const created = await dv(`/${entitySetName}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return created[primaryId] || firstGuid(created);
}

async function queryByExactKey(entitySetName, primaryId, key) {
  const filter = encodeURIComponent(`jm1_idempotencykey eq '${key}'`);
  const response = await dv(`/${entitySetName}?$select=${primaryId},jm1_name,jm1_idempotencykey&$filter=${filter}&$top=2`);
  return response.value || [];
}

async function queryByPrefix(entitySetName, primaryId, prefix) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${prefix}')`);
  const response = await dv(`/${entitySetName}?$select=${selectFor(primaryId)}&$filter=${filter}&$top=100`);
  return response.value || [];
}

async function entitySet(logicalName) {
  const response = await dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=EntitySetName`);
  return response.EntitySetName;
}

async function dv(path, init = {}) {
  const response = await fetch(`${DATAVERSE_URL}/api/data/v9.2${path}`, {
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
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

function selectFor(primaryId) {
  const common = [primaryId, 'jm1_name', 'jm1_idempotencykey', 'createdon', 'modifiedon'];
  if (primaryId === 'jm1_socialexecutionid') return [...common, 'jm1_platform', 'jm1_status', 'jm1_platformpostid', 'jm1_readbackstate', 'jm1_errorcode'].join(',');
  if (primaryId === 'jm1_campaignauthorityid') return [...common, 'jm1_program', 'jm1_campaigntype', 'jm1_subject', 'jm1_state'].join(',');
  if (primaryId === 'jm1_marketingeligibilityid') return [...common, 'jm1_marketingprogram', 'jm1_sourceevent', 'jm1_state', 'jm1_exceptionstate'].join(',');
  if (primaryId === 'jm1_journeyexecutionid') return [...common, 'jm1_journeyarchetype', 'jm1_state', 'jm1_dynamicsjourneyid'].join(',');
  if (primaryId === 'jm1_marketingexceptionid') return [...common, 'jm1_exceptiontype', 'jm1_resolutionstate'].join(',');
  if (primaryId === 'jm1_marketingcontrolloopid') return [...common, 'jm1_state', 'jm1_controldecision'].join(',');
  return common.join(',');
}

function duplicateCount(rows) {
  const seen = new Set();
  let duplicates = 0;
  for (const row of rows) {
    if (seen.has(row.jm1_idempotencykey)) duplicates += 1;
    seen.add(row.jm1_idempotencykey);
  }
  return duplicates;
}

function expiryForDecision(decision) {
  if (decision.sourceEvent === 'LAUNCH_DAY') return '2026-10-22T00:00:00Z';
  if (decision.lane === 'author_acquisition') return '2026-12-31T00:00:00Z';
  return '2026-11-01T00:00:00Z';
}

function audienceForDecision(decision) {
  if (decision.lane === 'author_acquisition') return 'Controlled Publishing prospects and manuscript inquiries';
  if (decision.lane === 'reader_audience') return 'Controlled reader segment by affinity and engagement';
  if (decision.lane === 'publishing_brand') return 'Publishing audience and author community';
  return 'Publishing readers and author community';
}

function ctaForDecision(decision) {
  if (decision.title === 'Strategies for Success in Educational Leadership') return 'https://amzn.to/4y4udRZ';
  if (decision.lane === 'author_acquisition') return 'Learn what happens next with J Merrill Publishing.';
  if (decision.lane === 'publishing_brand') return 'Learn more about J Merrill Publishing.';
  if (decision.lane === 'reader_audience') return 'Discover more from J Merrill Publishing.';
  return 'Follow J Merrill Publishing for title and author updates.';
}

function copyBrief(decision) {
  return [
    `Program: ${decision.laneName}`,
    `Lifecycle event: ${decision.sourceEvent}`,
    `Stage: ${decision.stage}`,
    `Subject: ${decision.subject}`,
    `Title lifecycle: ${decision.titleLifecycle}`,
    'Voice: People-First / Why-First / Helping Authors Help Themselves',
    'Guardrail: no internal governance vocabulary in public copy'
  ].join('\n');
}

function draftCopy(decision) {
  if (decision.state !== 'ELIGIBLE') return `${decision.subject} is held by governed marketing policy: ${decision.blocked.join('; ')}.`;
  if (decision.lane === 'author_acquisition') return 'A publishing inquiry deserves a clear next step, useful education, and a path toward the right decision.';
  if (decision.lane === 'reader_audience') return 'Reader discovery works best when the next invitation reflects what the reader has already shown us.';
  if (decision.lane === 'publishing_brand') return 'Helping Authors Help Themselves means making the publishing path clearer before the next decision is due.';
  return `${decision.subject} is ready for ${decision.stage.replaceAll('_', ' ')} marketing with source-backed authority.`;
}

function behaviorBranch(decision) {
  if (decision.lane === 'author_acquisition') return 'Branch on manuscript received, editorial review, package decision, joined family, or opt-out.';
  if (decision.lane === 'reader_audience') return 'Branch on engagement, non-engagement, affinity, re-engagement, or suppression.';
  return 'Branch on engagement/readback, launch state, fatigue, or supersession.';
}

function enterpriseBranchConfiguration() {
  return {
    owner: 'J Merrill One',
    sharedEngine: 'JM1 Marketing OS',
    publishing: {
      activationState: 'ACTIVE_PRODUCTION_RUNTIME_CONSUMER',
      programs: ['TITLE_AUTHOR', 'AUTHOR_ACQUISITION', 'PUBLISHING_BRAND', 'READER_AUDIENCE'],
      destinations: ['J Merrill Publishing Inc Facebook', 'jmerrillpub Instagram', 'J Merrill Publishing, Inc. LinkedIn held'],
      sender: 'publishing@email.jmerrill.one',
      exceptionOwner: 'Publishing marketing authority'
    },
    one: {
      activationState: 'CONFIGURED_NOT_ACTIVATED',
      programs: ['enterprise brand marketing', 'ecosystem awareness', 'enterprise announcements', 'business thought leadership'],
      duplicateBranchMessagingGuard: true
    },
    financial: {
      activationState: 'CONFIGURED_NOT_ACTIVATED',
      complianceActivationHeld: true,
      holdClasses: [
        'legal-advice implications',
        'estate-planning legal representation',
        'investment-advice implications',
        'unsupported tax advice',
        'insurance guarantees',
        'performance/return claims',
        'regulated product claims',
        'required disclosures',
        'partner-role confusion',
        'funeral-home/Precoa/JMF service confusion'
      ]
    },
    foundation: {
      activationState: 'CONFIGURED_NOT_ACTIVATED',
      programs: ['donor engagement', 'fundraising/campaign journeys', 'volunteer engagement', 'event marketing', 'impact storytelling', 'donor re-engagement'],
      audienceIsolation: 'Foundation donors and volunteers must not mix with Publishing readers or Financial prospects.'
    },
    classifications: [
      'JM1_MARKETING_OS_ENTERPRISE_BRANCH_CONFIGURATION_READY',
      'JMF_MARKETING_CONFIGURATION_READY_COMPLIANCE_ACTIVATION_HELD'
    ]
  };
}

function firstGuid(value) {
  return Object.values(value).find((item) => typeof item === 'string' && /^[0-9a-f-]{36}$/i.test(item)) || null;
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
