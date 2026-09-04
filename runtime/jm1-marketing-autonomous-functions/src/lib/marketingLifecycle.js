import { deterministicId } from './runtime.js';

export const PUBLISHING_PROGRAM_REGISTRY = [
  {
    key: 'title_author',
    name: 'TITLE / AUTHOR MARKETING',
    purpose: 'Move governed titles and authors through lifecycle-appropriate reader and author-facing marketing.',
    routineTouchTarget: { founder: 0, cody: 0 }
  },
  {
    key: 'author_acquisition',
    name: 'AUTHOR ACQUISITION / INQUIRY MARKETING',
    purpose: 'Respond to inquiry and manuscript-intake state with useful publishing education and next-step nurture.',
    routineTouchTarget: { founder: 0, cody: 0 }
  },
  {
    key: 'publishing_brand',
    name: 'J MERRILL PUBLISHING BRAND MARKETING',
    purpose: 'Keep Helping Authors Help Themselves, publishing education, and imprint differentiation visible between title events.',
    routineTouchTarget: { founder: 0, cody: 0 }
  },
  {
    key: 'reader_audience',
    name: 'READER / AUDIENCE MARKETING',
    purpose: 'Use reader affinity and engagement state to drive discovery, re-engagement, and cross-title recommendations.',
    routineTouchTarget: { founder: 0, cody: 0 }
  }
];

export const TITLE_AUTHOR_LIFECYCLE_TRIGGERS = [
  'INTAKE_FIT',
  'IMPRINT_CONFIRMED',
  'POSITIONING_READY',
  'EDITING_UNDERWAY',
  'COVER_APPROVED',
  'INTERIOR_PRODUCTION_READY',
  'PRODUCTION_PROOF_APPROVED',
  'METADATA_CATALOG_READY',
  'DISTRIBUTION_LIVE',
  'LAUNCH_DATE_LOCKED',
  'LAUNCH_DAY',
  'PLUS_7',
  'PLUS_30',
  'PLUS_90',
  'ANNIVERSARY',
  'NEW_EDITION',
  'NEW_FORMAT',
  'AUDIOBOOK_RELEASED',
  'RELATED_NEW_TITLE',
  'BACKLIST_REACTIVATION'
];

const TRIGGER_POLICY = {
  COVER_APPROVED: {
    lane: 'title_author',
    campaignType: 'cover_reveal',
    stage: 'cover_reveal',
    journeyArchetype: 'title_lifecycle_cover_reveal',
    socialEligible: true,
    supersedes: []
  },
  DISTRIBUTION_LIVE: {
    lane: 'title_author',
    campaignType: 'release_availability',
    stage: 'distribution_live',
    journeyArchetype: 'title_lifecycle_release_availability',
    socialEligible: true,
    supersedes: ['coming_soon', 'pre_distribution_waitlist']
  },
  LAUNCH_DAY: {
    lane: 'title_author',
    campaignType: 'launch_day',
    stage: 'launch_day',
    journeyArchetype: 'title_lifecycle_launch_day',
    socialEligible: true,
    supersedes: ['coming_soon', 'pre_launch_countdown']
  },
  PLUS_30: {
    lane: 'title_author',
    campaignType: 'post_launch_engagement',
    stage: 'post_launch_30',
    journeyArchetype: 'title_lifecycle_post_launch_engagement',
    socialEligible: true,
    supersedes: []
  },
  JOIN_INQUIRY: {
    lane: 'author_acquisition',
    campaignType: 'author_inquiry_nurture',
    stage: 'inquiry_nurture',
    journeyArchetype: 'author_acquisition_inquiry_nurture',
    socialEligible: false,
    supersedes: []
  },
  BRAND_EVERGREEN_BELOW_THRESHOLD: {
    lane: 'publishing_brand',
    campaignType: 'publishing_brand_evergreen',
    stage: 'brand_education',
    journeyArchetype: 'brand_relationship_education',
    socialEligible: true,
    supersedes: []
  },
  READER_REENGAGEMENT_DUE: {
    lane: 'reader_audience',
    campaignType: 'reader_reengagement',
    stage: 'reader_reengagement',
    journeyArchetype: 'reader_audience_reengagement',
    socialEligible: false,
    supersedes: []
  },
  BACKLIST_REACTIVATION: {
    lane: 'title_author',
    campaignType: 'backlist_reactivation',
    stage: 'backlist_reactivation',
    journeyArchetype: 'reader_audience_backlist_reactivation',
    socialEligible: true,
    supersedes: []
  }
};

export function resolveProgramRegistry() {
  return PUBLISHING_PROGRAM_REGISTRY.map((program) => ({
    ...program,
    state: 'ACTIVE',
    branch: 'J Merrill Publishing'
  }));
}

export function resolveLifecycleTriggerRegistry() {
  return TITLE_AUTHOR_LIFECYCLE_TRIGGERS.map((event) => lifecycleTriggerContract(event));
}

export function lifecycleTriggerContract(event) {
  const policy = TRIGGER_POLICY[event] || {
    lane: 'title_author',
    campaignType: normalizeKey(event),
    stage: normalizeKey(event),
    journeyArchetype: 'title_lifecycle_relationship_journey',
    socialEligible: true,
    supersedes: []
  };
  return {
    event,
    businessEvent: event,
    marketingEligibility: `${policy.campaignType.toUpperCase()}_ELIGIBLE`,
    campaignProgram: laneName(policy.lane),
    campaignAuthority: policy.campaignType,
    journey: policy.journeyArchetype,
    content: `${policy.stage}_content_work`,
    creative: policy.socialEligible ? `${policy.stage}_creative_work` : 'DYNAMICS_CONTENT_ONLY',
    audience: audienceForLane(policy.lane),
    channels: channelsForPolicy(policy),
    cadence: cadenceForPolicy(policy),
    stopCondition: stopForPolicy(policy),
    readback: 'Dataverse child row readback plus platform/Journey state where execution is enabled.',
    nextAction: nextActionForPolicy(policy),
    supersedes: policy.supersedes
  };
}

export function evaluateLifecycleEvent(event, options = {}) {
  const policy = TRIGGER_POLICY[event.sourceEvent] || TRIGGER_POLICY[normalizeKey(event.sourceEvent)] || lifecyclePolicyForEvent(event.sourceEvent);
  const titleState = classifyTitleLifecycle(event);
  const blocked = [];
  if (event.title === 'The Shift: Changing with God' && policy.campaignType === 'backlist_reactivation') {
    blocked.push('RECENT_RELEASE_NOT_BACKLIST');
  }
  if (policy.socialEligible && event.assetState === 'MISSING_GOVERNED_ASSET') {
    blocked.push('MISSING_GOVERNED_ASSET');
  }
  if (event.rightsState === 'AMBIGUOUS') blocked.push('RIGHTS_AMBIGUITY');

  const marker = event.idempotencyKey || deterministicId(
    'JMP_MARKETING_LIFECYCLE',
    event.branch || 'J Merrill Publishing',
    event.sourceEntity || 'controlled_fixture',
    event.sourceRecord || event.subject || event.title || event.sourceEvent,
    event.sourceEvent
  );
  const state = blocked.length > 0 ? 'HELD_GOVERNED_EXCEPTION' : 'ELIGIBLE';
  return {
    marker,
    lane: policy.lane,
    laneName: laneName(policy.lane),
    sourceEvent: event.sourceEvent,
    sourceEntity: event.sourceEntity || 'controlled_lifecycle_fixture',
    sourceRecord: event.sourceRecord || marker,
    subject: event.subject || event.title || event.author || event.sourceEvent,
    title: event.title || '',
    author: event.author || '',
    titleLifecycle: titleState,
    campaignType: policy.campaignType,
    stage: policy.stage,
    priority: event.priority || defaultPriority(policy),
    state,
    blocked,
    supersedes: policy.supersedes,
    derived: {
      eligibility: `${marker}:eligibility`,
      campaign: `${marker}:campaign`,
      content: `${marker}:content:${policy.stage}`,
      creative: policy.socialEligible ? `${marker}:creative:${policy.stage}` : '',
      journey: `${marker}:journey:${policy.stage}`,
      social: policy.socialEligible ? ['facebook', 'instagram', 'linkedin'].map((platform) => `${marker}:social:${policy.stage}:${platform}`) : []
    },
    runtimeTouch: {
      founder: 0,
      cody: options.commissioning ? 1 : 0,
      browserPublishing: false,
      sintraPublishing: false
    }
  };
}

export function evaluateFourLaneControlCycle(events, nowIso) {
  const decisions = events.map((event) => evaluateLifecycleEvent(event, { nowIso }));
  const lanes = Object.fromEntries(resolveProgramRegistry().map((program) => [
    program.key,
    {
      name: program.name,
      decisions: decisions.filter((decision) => decision.lane === program.key),
      state: 'EVALUATED'
    }
  ]));
  return {
    evaluatedAt: nowIso,
    lanes,
    concurrency: {
      lanesEvaluated: Object.keys(lanes).length,
      lanesWithDecisions: Object.values(lanes).filter((lane) => lane.decisions.length > 0).length,
      starvationDetected: Object.values(lanes).some((lane) => lane.decisions.length === 0)
    },
    classifications: [
      'JMP_FOUR_LANE_MARKETING_PROGRAM_REGISTRY_ACTIVE',
      Object.values(lanes).every((lane) => lane.decisions.length > 0)
        ? 'JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PROVEN'
        : 'JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PARTIAL'
    ]
  };
}

export function evaluateCatalogMarketingHealth(titles, nowIso) {
  return titles.map((title) => {
    const titleLifecycle = classifyTitleLifecycle(title);
    const recentReleaseHeld = titleLifecycle === 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT';
    const fatigueHeld = daysSince(title.lastMarketedAt, nowIso) < 14;
    const eligible = !recentReleaseHeld && !fatigueHeld && title.lifecycleState === 'BACKLIST';
    return {
      title: title.title,
      author: title.author,
      lifecycleState: titleLifecycle,
      lastMarketedAt: title.lastMarketedAt || '',
      currentCampaign: title.currentCampaign || '',
      engagementState: title.engagementState || 'UNKNOWN',
      seasonalRelevance: title.seasonalRelevance || 'UNKNOWN',
      relatedTitleActivity: title.relatedTitleActivity || 'NONE',
      fatigueHeld,
      recentReleaseHeld,
      eligibleForReactivation: eligible,
      exclusionReason: eligible ? '' : exclusionReason({ recentReleaseHeld, fatigueHeld, title }),
      nextReviewDate: nextReviewDate(nowIso, recentReleaseHeld ? 30 : 14)
    };
  });
}

export function evaluateSupersession(previousStage, event) {
  const decision = evaluateLifecycleEvent(event);
  const superseded = decision.supersedes.includes(previousStage);
  return {
    previousStage,
    sourceEvent: event.sourceEvent,
    superseded,
    state: superseded ? 'SUPERSEDED_BY_NEWER_LIFECYCLE_AUTHORITY' : 'REMAINS_COMPATIBLE',
    reason: superseded
      ? `${event.sourceEvent} supersedes ${previousStage} messaging.`
      : `${event.sourceEvent} does not conflict with ${previousStage}.`
  };
}

export function classifyTitleLifecycle(event) {
  if (event.title === 'The Shift: Changing with God') return 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT';
  if (event.releaseDate && event.releaseDate === '2026-09-22') return 'SEPTEMBER_22_2026_RELEASE_LIFECYCLE_PRIORITY';
  if (event.lifecycleState === 'BACKLIST') return 'BACKLIST';
  if (/DISTRIBUTION_LIVE|LAUNCH_DAY|PLUS_7|PLUS_30|PLUS_90/i.test(event.sourceEvent || '')) return 'ACTIVE_RELEASE_LIFECYCLE';
  return event.lifecycleState || 'ACTIVE_MARKETING_LIFECYCLE';
}

function lifecyclePolicyForEvent(sourceEvent) {
  const key = normalizeKey(sourceEvent);
  if (key.includes('inquiry') || key.includes('join')) return TRIGGER_POLICY.JOIN_INQUIRY;
  if (key.includes('reader')) return TRIGGER_POLICY.READER_REENGAGEMENT_DUE;
  if (key.includes('brand')) return TRIGGER_POLICY.BRAND_EVERGREEN_BELOW_THRESHOLD;
  if (key.includes('backlist')) return TRIGGER_POLICY.BACKLIST_REACTIVATION;
  return {
    lane: 'title_author',
    campaignType: key,
    stage: key,
    journeyArchetype: 'title_lifecycle_relationship_journey',
    socialEligible: true,
    supersedes: []
  };
}

function laneName(key) {
  return PUBLISHING_PROGRAM_REGISTRY.find((program) => program.key === key)?.name || 'TITLE / AUTHOR MARKETING';
}

function audienceForLane(lane) {
  if (lane === 'author_acquisition') return 'Publishing prospects and manuscript inquiries';
  if (lane === 'reader_audience') return 'Readers segmented by affinity and engagement';
  if (lane === 'publishing_brand') return 'Publishing audience, authors, and readers';
  return 'Publishing readers and author community';
}

function channelsForPolicy(policy) {
  if (!policy.socialEligible) return ['Dynamics Customer Insights - Journeys'];
  return ['Dynamics Customer Insights - Journeys', 'Facebook', 'Instagram', 'LinkedIn held until external authority arrives'];
}

function cadenceForPolicy(policy) {
  if (policy.lane === 'publishing_brand') return 'Evergreen threshold and fatigue governed';
  if (policy.lane === 'author_acquisition') return 'State-change and consent governed';
  if (policy.lane === 'reader_audience') return 'Behavior and engagement governed';
  return 'Lifecycle-stage governed';
}

function stopForPolicy(policy) {
  if (policy.lane === 'author_acquisition') return 'Joined the family, disqualified, opted out, or terminal exception';
  if (policy.lane === 'reader_audience') return 'Engaged, suppressed, fatigue-held, or journey completed';
  return 'Next authoritative lifecycle state, fatigue guard, campaign end, or exception';
}

function nextActionForPolicy(policy) {
  if (policy.socialEligible) return 'Create campaign, content, creative, Journey, and held/executable social children.';
  return 'Create campaign, content, and Dynamics Journey children.';
}

function defaultPriority(policy) {
  if (policy.campaignType === 'launch_day') return 'P0';
  if (policy.lane === 'author_acquisition') return 'P1';
  return 'P2';
}

function exclusionReason({ recentReleaseHeld, fatigueHeld, title }) {
  if (recentReleaseHeld) return 'RECENT_RELEASE_HELD_FROM_BACKLIST_REACTIVATION';
  if (fatigueHeld) return 'MARKETING_FATIGUE_HELD';
  if (title.lifecycleState !== 'BACKLIST') return 'NOT_BACKLIST';
  return 'NOT_ELIGIBLE';
}

function daysSince(value, nowIso) {
  const then = new Date(value);
  const now = new Date(nowIso);
  if (Number.isNaN(then.getTime()) || Number.isNaN(now.getTime())) return Infinity;
  return (now - then) / 86400000;
}

function nextReviewDate(nowIso, days) {
  const date = new Date(nowIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeKey(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}
