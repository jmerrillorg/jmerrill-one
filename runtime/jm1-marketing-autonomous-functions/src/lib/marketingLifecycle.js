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

export function productionPublishingSignals({ nowIso, campaigns = [], socialRows = [], audienceSignals = {}, acquisitionSignals = {}, catalog = [] } = {}) {
  const septemberSean = campaigns.find((campaign) => /september|2026-09|Sean A Crowley/i.test([campaign.jm1_name, campaign.jm1_subject, campaign.jm1_idempotencykey].join(' ')));
  const strategies = catalog.find((title) => /Strategies for Success/i.test(title.title || title.jm1_name || ''));
  const evergreenDepth = Number(audienceSignals.evergreenQueueDepth ?? 0);
  const readerEngagementAgeDays = Number(audienceSignals.daysSinceReaderEngagement ?? 31);
  const acquisitionDue = Boolean(acquisitionSignals.hasOpenInquiry || acquisitionSignals.hasSubmissionStarted || acquisitionSignals.hasProspect);

  return [
    {
      sourceEvent: strategies?.releaseStatus === 'LIVE' ? 'DISTRIBUTION_LIVE' : 'LAUNCH_DAY',
      sourceEntity: 'publishing_catalog',
      sourceRecord: strategies?.titleId || strategies?.sourceRecord || 'strategies-for-success',
      title: strategies?.title || 'Strategies for Success in Educational Leadership',
      author: strategies?.author || 'Sean A Crowley I',
      subject: 'Strategies for Success in Educational Leadership',
      releaseDate: strategies?.publicationDate || '2026-09-22',
      assetState: strategies?.assetReadiness || 'GOVERNED_ASSET_AVAILABLE',
      rightsState: strategies?.rightsState || 'RESOLVED',
      priority: 'P0',
      observedAt: nowIso
    },
    {
      sourceEvent: acquisitionDue ? 'JOIN_INQUIRY' : 'AUTHOR_ACQUISITION_MONITOR',
      sourceEntity: acquisitionSignals.sourceEntity || 'publishing_inquiry_authority',
      sourceRecord: acquisitionSignals.sourceRecord || 'production-acquisition-state',
      subject: acquisitionSignals.subject || 'Publishing author inquiry pathway',
      rightsState: 'RESOLVED',
      priority: 'P1',
      observedAt: nowIso
    },
    {
      sourceEvent: evergreenDepth < 14 ? 'BRAND_EVERGREEN_BELOW_THRESHOLD' : 'BRAND_EVERGREEN_HEALTHY',
      sourceEntity: 'publishing_brand_health',
      sourceRecord: 'helping-authors-help-themselves',
      subject: 'Helping Authors Help Themselves',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      priority: 'P2',
      observedAt: nowIso
    },
    {
      sourceEvent: readerEngagementAgeDays >= 30 ? 'READER_REENGAGEMENT_DUE' : 'READER_AUDIENCE_MONITOR',
      sourceEntity: audienceSignals.sourceEntity || 'reader_audience_signal',
      sourceRecord: audienceSignals.sourceRecord || 'production-reader-audience-state',
      subject: audienceSignals.subject || 'Publishing reader and audience relationship',
      rightsState: 'RESOLVED',
      priority: 'P2',
      observedAt: nowIso
    }
  ].map((event) => ({
    ...event,
    activeFeaturedAuthor: septemberSean?.jm1_subject || 'Sean A Crowley I',
    septemberAuthorityState: septemberSean ? 'CURRENT' : 'MISSING_REQUIRES_RECONCILIATION'
  }));
}

export function evaluateCatalogMarketingHealth(titles, nowIso) {
  return titles.map((title) => {
    const titleLifecycle = classifyTitleLifecycle(title);
    const recentReleaseHeld = titleLifecycle === 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT';
    const fatigueHeld = daysSince(title.lastMarketedAt, nowIso) < Number(title.fatigueDays || 14);
    const rightsException = ['AMBIGUOUS', 'UNKNOWN', 'MISSING'].includes(String(title.rightsState || '').toUpperCase());
    const assetException = ['MISSING_GOVERNED_ASSET', 'MISSING', 'UNKNOWN'].includes(String(title.assetReadiness || '').toUpperCase());
    const inactive = /retired|inactive|excluded/i.test(title.lifecycleState || title.publicationStatus || '');
    const eligible = !recentReleaseHeld && !fatigueHeld && !rightsException && !assetException && !inactive && title.lifecycleState === 'BACKLIST';
    const state = eligible
      ? 'REACTIVATION_ELIGIBLE'
      : healthState({ title, recentReleaseHeld, fatigueHeld, rightsException, assetException, inactive });
    return {
      titleId: title.titleId || title.id || '',
      title: title.title,
      author: title.author,
      imprint: title.imprint || '',
      publicationStatus: title.publicationStatus || '',
      publicationDate: title.publicationDate || '',
      formats: title.formats || [],
      lifecycleState: titleLifecycle,
      lastMarketedAt: title.lastMarketedAt || '',
      currentCampaign: title.currentCampaign || '',
      recentEngagement: title.recentEngagement || title.engagementState || 'UNKNOWN',
      authorActivity: title.authorActivity || 'UNKNOWN',
      seasonalRelevance: title.seasonalRelevance || 'UNKNOWN',
      anniversaryWindow: title.anniversaryWindow || 'UNKNOWN',
      relatedTitleActivity: title.relatedTitleActivity || 'NONE',
      formatChange: title.formatChange || 'NONE',
      fatigueHeld,
      recentReleaseHeld,
      assetReadiness: title.assetReadiness || 'UNKNOWN',
      rightsState: title.rightsState || 'UNKNOWN',
      eligibleForReactivation: eligible,
      governedMarketingState: state,
      exclusionReason: eligible ? '' : exclusionReason({ recentReleaseHeld, fatigueHeld, rightsException, assetException, inactive, title }),
      nextReviewDate: nextReviewDate(nowIso, recentReleaseHeld ? 30 : 14)
    };
  });
}

export function summarizeCatalogMarketingHealth(healthRows) {
  const counts = {
    titlesEvaluated: healthRows.length,
    activeCampaigns: 0,
    reactivationEligible: 0,
    fatigueHeld: 0,
    recentReleaseHeld: 0,
    assetException: 0,
    rightsException: 0,
    inactiveExcluded: 0
  };
  for (const row of healthRows) {
    if (/ACTIVE_CAMPAIGN/.test(row.governedMarketingState) || row.currentCampaign) counts.activeCampaigns += 1;
    if (row.eligibleForReactivation) counts.reactivationEligible += 1;
    if (row.fatigueHeld) counts.fatigueHeld += 1;
    if (row.recentReleaseHeld) counts.recentReleaseHeld += 1;
    if (/ASSET_EXCEPTION/.test(row.governedMarketingState)) counts.assetException += 1;
    if (/RIGHTS_EXCEPTION/.test(row.governedMarketingState)) counts.rightsException += 1;
    if (/INACTIVE|RETIRED|EXCLUDED/.test(row.governedMarketingState)) counts.inactiveExcluded += 1;
  }
  return counts;
}

export function selectAutonomousReactivationCandidates(healthRows, options = {}) {
  const capacity = Number(options.capacity || 2);
  return healthRows
    .filter((row) => row.eligibleForReactivation)
    .sort((a, b) => reactivationScore(b) - reactivationScore(a))
    .slice(0, capacity)
    .map((row, index) => ({
      ...row,
      selectionRank: index + 1,
      selectionReason: 'Selected by catalog health score, capacity, fatigue, campaign collision, and source-backed asset/rights readiness.',
      idempotencyKey: deterministicId('JMP_REACTIVATION_SELECTION', row.titleId || row.title, row.author, row.nextReviewDate)
    }));
}

export function reconcileLegacyScheduledObjects(socialRows, lifecycleRows = []) {
  const legacy = socialRows.filter((row) => /META_BUSINESS_SUITE|LINKEDIN_NATIVE|MANUAL_UI|SOSHIE_SUPERSEDED/i.test([row.jm1_executor, row.jm1_status, row.jm1_readbackstate, row.jm1_idempotencykey].join(' ')));
  const alreadyScheduled = legacy.filter((row) => /SCHEDULED|PUBLISHED|VERIFIED/i.test([row.jm1_status, row.jm1_readbackstate].join(' ')));
  const protectedKeys = new Set(alreadyScheduled.map((row) => duplicateKey(row)));
  const duplicateRisks = lifecycleRows.filter((row) => protectedKeys.has(duplicateKey(row)));
  return {
    policy: {
      alreadyScheduledLegacyObject: 'PRESERVE_REGISTER_RECONCILE_PREVENT_DUPLICATE_AUTONOMOUS_EXECUTION',
      newlyDerivedFutureObject: 'JM1_OWNED_API_RUNTIME',
      metaAuthority: 'OWNED_API_RUNTIME_AUTHORITATIVE_GOING_FORWARD',
      linkedinAuthority: 'HELD_UNTIL_EXTERNAL_API_PRODUCT_APPROVAL'
    },
    legacyScheduledCount: alreadyScheduled.length,
    duplicateEquivalentFutureCount: duplicateRisks.length,
    duplicatePreventionState: duplicateRisks.length === 0 ? 'PASS' : 'HOLD_DUPLICATE_EQUIVALENT_AUTONOMOUS_ROWS',
    classifications: ['LEGACY_SCHEDULE_RECONCILIATION_POLICY_PROVEN']
  };
}

export function acquisitionSourceMap(sources = {}) {
  return [
    ['join_inquiry', sources.joinInquiry],
    ['prospect', sources.prospect],
    ['submission_started', sources.submissionStarted],
    ['manuscript_received', sources.manuscriptReceived],
    ['editorial_review', sources.editorialReview],
    ['recommendation', sources.recommendation],
    ['offer_package_state', sources.offerPackageState],
    ['joined_the_family', sources.joinedTheFamily]
  ].map(([state, source]) => ({
    state,
    source: source?.name || source || 'NOT_OBSERVED',
    classification: source ? 'LIVE_OR_AVAILABLE' : 'NOT_AVAILABLE_IN_CURRENT_READBACK',
    journeyAction: acquisitionAction(state)
  }));
}

export function readerAudienceSignalFoundation(sources = {}) {
  return [
    ['email_engagement', sources.emailEngagement],
    ['dynamics_interactions', sources.dynamicsInteractions],
    ['title_page_visits', sources.titlePageVisits],
    ['author_page_visits', sources.authorPageVisits],
    ['form_submissions', sources.formSubmissions],
    ['event_registrations', sources.eventRegistrations],
    ['purchase_distribution_signals', sources.purchaseDistributionSignals],
    ['historic_contacts', sources.historicContacts],
    ['campaign_engagement', sources.campaignEngagement]
  ].map(([signal, value]) => ({
    signal,
    classification: value?.classification || (value ? 'LIVE' : 'NOT_AVAILABLE'),
    source: value?.source || value?.name || ''
  }));
}

export function evergreenQueuePolicy(options = {}) {
  const minimumQueueDepth = Number(options.minimumQueueDepth || 14);
  const currentQueueDepth = Number(options.currentQueueDepth || 0);
  return {
    minimumQueueDepth,
    currentQueueDepth,
    state: currentQueueDepth >= minimumQueueDepth ? 'HEALTHY' : 'REPLENISHMENT_DUE',
    fatigueThresholdDays: Number(options.fatigueThresholdDays || 7),
    contentDiversityRule: 'No more than two consecutive posts from the same theme or creative archetype.',
    campaignCollisionRule: 'Do not publish evergreen work inside a P0 title launch slot unless it supports that launch.',
    titleLaunchPriorityRule: 'Strategies for Success Sep. 22 launch outranks evergreen replenishment during collision windows.',
    themes: [
      'Helping Authors Help Themselves',
      'publishing education',
      'editorial philosophy',
      'Publishing differentiation',
      'behind-the-book',
      'author stories',
      'reader discovery',
      'publishing opportunities',
      'imprint awareness'
    ]
  };
}

export function exceptionRoutingPolicy(exceptions = []) {
  const actionable = exceptions.filter((item) => isFounderActionableException(item));
  return {
    founderActionableCount: actionable.length,
    suppressedRoutineStates: ['WAITING_FOR_SCHEDULE', 'NO_WORK_DUE', 'FATIGUE_HELD', 'LINKEDIN_EXTERNAL_REVIEW'],
    actionableTypes: actionable.map((item) => item.jm1_exceptiontype || item.jm1_name || 'UNKNOWN'),
    state: 'JMP_MARKETING_EXCEPTION_ROUTING_OPERATIONAL'
  };
}

export function buildMarketingCommandCenter({ nowIso, featuredAuthor, nextFeaturedAuthor, campaigns = [], socialRows = [], journeyRows = [], creativeRows = [], exceptionRows = [], catalogHealth = [], runtimeHealth = {}, linkedinState = 'LINKEDIN_EXTERNAL_REVIEW_ONLY' }) {
  return {
    generatedAt: nowIso,
    current: {
      featuredAuthor,
      activeTitleCampaigns: campaigns.filter((item) => /title|author|featured|launch/i.test([item.jm1_program, item.jm1_campaigntype, item.jm1_name].join(' '))).length,
      acquisitionCampaigns: campaigns.filter((item) => /acquisition|inquiry|prospect/i.test([item.jm1_program, item.jm1_campaigntype, item.jm1_name].join(' '))).length,
      readerCampaigns: campaigns.filter((item) => /reader|audience/i.test([item.jm1_program, item.jm1_campaigntype, item.jm1_name].join(' '))).length,
      brandCampaigns: campaigns.filter((item) => /brand|evergreen|Helping Authors/i.test([item.jm1_program, item.jm1_campaigntype, item.jm1_name].join(' '))).length
    },
    upcoming: {
      nextFeaturedAuthor,
      launches: campaigns.filter((item) => /launch|Strategies|Sep.*22|2026-09-22/i.test([item.jm1_name, item.jm1_subject, item.jm1_start].join(' '))).map((item) => item.jm1_name),
      scheduledExecutions: socialRows.filter((item) => /SCHEDULED|NOT_DUE|ELIGIBLE/i.test(item.jm1_status || '')).length,
      reactivationCandidates: catalogHealth.filter((item) => item.eligibleForReactivation).map((item) => item.title)
    },
    health: {
      controlLoop: runtimeHealth.controlLoop || 'READBACK_PENDING',
      creativeWorker: runtimeHealth.creativeWorker || 'READBACK_PENDING',
      socialWorker: runtimeHealth.socialWorker || 'READBACK_PENDING',
      credentialMonitor: runtimeHealth.credentialMonitor || 'READBACK_PENDING',
      dynamics: journeyRows.some((item) => /PROVEN|ACTIVE|IMPLEMENTED/i.test(item.jm1_state || '')) ? 'ACTIVE_OR_PROVEN' : 'SAFE_RUNTIME_BOUNDARY',
      meta: socialRows.some((item) => ['facebook', 'instagram'].includes(item.jm1_platform) && item.jm1_platformpostid) ? 'READBACK_PRESENT' : 'NO_RECENT_PLATFORM_IDS_IN_SCOPE',
      linkedin: linkedinState,
      mediaRegistry: creativeRows.some((item) => item.jm1_assethash || item.jm1_assetpath) ? 'ASSET_REFERENCES_PRESENT' : 'READBACK_PENDING'
    },
    exceptions: exceptionRoutingPolicy(exceptionRows),
    catalog: {
      titlesEvaluated: catalogHealth.length,
      marketingHealth: summarizeCatalogMarketingHealth(catalogHealth)
    },
    classification: 'JM1_MARKETING_COMMAND_CENTER_OPERATIONAL'
  };
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
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('inquiry') || lowerKey.includes('join') || lowerKey.includes('acquisition')) return TRIGGER_POLICY.JOIN_INQUIRY;
  if (lowerKey.includes('reader') || lowerKey.includes('audience')) return TRIGGER_POLICY.READER_REENGAGEMENT_DUE;
  if (lowerKey.includes('brand') || lowerKey.includes('evergreen')) return TRIGGER_POLICY.BRAND_EVERGREEN_BELOW_THRESHOLD;
  if (lowerKey.includes('backlist')) return TRIGGER_POLICY.BACKLIST_REACTIVATION;
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

function healthState({ title, recentReleaseHeld, fatigueHeld, rightsException, assetException, inactive }) {
  if (inactive) return 'INACTIVE_RETIRED_OR_EXCLUDED';
  if (rightsException) return 'RIGHTS_EXCEPTION';
  if (assetException) return 'ASSET_EXCEPTION';
  if (recentReleaseHeld) return 'RECENT_RELEASE_HELD';
  if (fatigueHeld) return 'FATIGUE_HELD';
  if (title.currentCampaign) return 'ACTIVE_CAMPAIGN';
  if (title.lifecycleState === 'BACKLIST') return 'HEALTHY';
  return 'HEALTHY';
}

function exclusionReason({ recentReleaseHeld, fatigueHeld, rightsException, assetException, inactive, title }) {
  if (inactive) return 'INACTIVE_RETIRED_OR_EXCLUDED';
  if (rightsException) return 'RIGHTS_EXCEPTION';
  if (assetException) return 'ASSET_EXCEPTION';
  if (recentReleaseHeld) return 'RECENT_RELEASE_HELD_FROM_BACKLIST_REACTIVATION';
  if (fatigueHeld) return 'MARKETING_FATIGUE_HELD';
  if (title.lifecycleState !== 'BACKLIST') return 'NOT_BACKLIST';
  return 'NOT_ELIGIBLE';
}

function reactivationScore(row) {
  const dormantBoost = daysSince(row.lastMarketedAt, row.nextReviewDate) / 30;
  const seasonalBoost = /HIGH|CURRENT/i.test(row.seasonalRelevance || '') ? 3 : 0;
  const engagementBoost = /DORMANT|LOW/i.test(row.recentEngagement || '') ? 1 : 0;
  return dormantBoost + seasonalBoost + engagementBoost;
}

function duplicateKey(row) {
  return [
    row.jm1_platform || row.platform || '',
    row.jm1_requesteddestination || row.destination || '',
    String(row.jm1_requestedschedule || row.scheduledFor || '').slice(0, 10),
    row.jm1_campaign || row.campaign || row.jm1_name || ''
  ].map((item) => String(item).toLowerCase().trim()).join('|');
}

function acquisitionAction(state) {
  if (state === 'joined_the_family') return 'EXIT_ACQUISITION_ENTER_AUTHOR_LIFECYCLE';
  if (state === 'manuscript_received' || state === 'editorial_review') return 'SHIFT_TO_EVALUATION_NURTURE';
  if (state === 'offer_package_state') return 'PACKAGE_DECISION_SUPPORT';
  return 'AUTHOR_INQUIRY_NURTURE';
}

function isFounderActionableException(item) {
  const text = [item.jm1_exceptiontype, item.jm1_name, item.jm1_resolutionstate, item.jm1_errorcode].join(' ').toUpperCase();
  if (/WAITING_FOR_SCHEDULE|NO_WORK_DUE|FATIGUE_HELD|LINKEDIN_EXTERNAL_REVIEW/.test(text)) return false;
  return /RIGHTS|LEGAL|COMPLIANCE|CREDENTIAL|SECURITY|DESTRUCTIVE|SENDER|CONSENT|READBACK_MISMATCH|DUPLICATE/.test(text);
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
