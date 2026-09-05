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

export const STRATEGIES_FOR_SUCCESS_RELEASE = {
  title: 'Strategies for Success in Educational Leadership',
  author: 'Sean A Crowley I',
  releaseDate: '2026-09-22',
  founderCta: 'https://amzn.to/4y4udRZ',
  priority: 'P0'
};

export const STRATEGIES_FOR_SUCCESS_LAUNCH_STAGES = [
  { key: 'pre_launch', label: 'Pre-launch authority', dueDate: '2026-09-14', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'reader_positioning', label: 'Reader positioning', dueDate: '2026-09-16', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'title_discovery', label: 'Title discovery', dueDate: '2026-09-18', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'countdown', label: 'Release countdown', dueDate: '2026-09-21', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'release_day', label: 'Release day', dueDate: '2026-09-22', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'post_launch', label: 'Post-launch reader proof', dueDate: '2026-09-23', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'plus_7', label: 'Plus 7 follow-up', dueDate: '2026-09-29', channelPolicy: 'META_ACTIVE_LINKEDIN_NATIVE_EXISTING' },
  { key: 'plus_30', label: 'Plus 30 follow-up', dueDate: '2026-10-22', channelPolicy: 'META_ACTIVE_LINKEDIN_API_DEPENDENT' },
  { key: 'plus_90_evergreen', label: 'Plus 90 evergreen evaluation', dueDate: '2026-12-21', channelPolicy: 'AUTONOMOUS_EVALUATION' }
];

const ROUTINE_EXCEPTION_TYPES = new Set([
  'NO_WORK_DUE',
  'WAITING_FOR_SCHEDULE',
  'FATIGUE_HELD',
  'LINKEDIN_EXTERNAL_REVIEW_ONLY',
  'LINKEDIN_API_EXTERNAL_DEPENDENCY',
  'NORMAL_CAMPAIGN_WAIT',
  'FUTURE_NEXT_MONTH_PRESTAGED'
]);

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

export function evaluateStrategiesLaunchGovernance(options = {}) {
  const nowIso = options.nowIso || new Date().toISOString();
  const now = new Date(nowIso);
  const scheduleObjects = options.scheduleObjects || [];
  const linkedInAuthority = options.linkedInAuthority || 'LINKEDIN_EXTERNAL_REVIEW_ONLY';
  const stages = STRATEGIES_FOR_SUCCESS_LAUNCH_STAGES.map((stage) => {
    const due = new Date(`${stage.dueDate}T23:59:59.999Z`);
    const matchingObjects = scheduleObjects.filter((object) => object.stage === stage.key);
    const metaState = platformStageState(matchingObjects, ['facebook', 'instagram']);
    const linkedInState = linkedInAuthority === 'LINKEDIN_EXTERNAL_REVIEW_ONLY'
      ? nativeOrHeldState(matchingObjects)
      : platformStageState(matchingObjects, ['linkedin']);
    return {
      ...stage,
      temporalState: now > due ? 'PAST_OR_ACTIVE_STAGE' : 'FUTURE_STAGE',
      metaState,
      linkedInState,
      manualBuildRequired: false
    };
  });
  return {
    title: STRATEGIES_FOR_SUCCESS_RELEASE.title,
    author: STRATEGIES_FOR_SUCCESS_RELEASE.author,
    releaseDate: STRATEGIES_FOR_SUCCESS_RELEASE.releaseDate,
    founderCta: STRATEGIES_FOR_SUCCESS_RELEASE.founderCta,
    priority: STRATEGIES_FOR_SUCCESS_RELEASE.priority,
    currentStage: currentStageForDate(stages, nowIso),
    stages,
    classifications: [
      'STRATEGIES_FOR_SUCCESS_SEP_22_PRIORITY_PRESERVED',
      linkedInAuthority === 'LINKEDIN_EXTERNAL_REVIEW_ONLY'
        ? 'LINKEDIN_EXTERNAL_REVIEW_ONLY_PRESERVED'
        : 'LINKEDIN_API_STAGE_ELIGIBLE'
    ]
  };
}

export function reconcileSeptemberExecution({ intents = [], scheduledObjects = [] } = {}) {
  const usedObjects = new Set();
  const decisions = intents.map((intent) => {
    const exact = scheduledObjects.find((object, index) => {
      if (usedObjects.has(index)) return false;
      return sameExecutionIdentity(intent, object) && mediaCompatible(intent, object);
    });
    if (exact) {
      usedObjects.add(scheduledObjects.indexOf(exact));
      return {
        intentId: intent.idempotencyKey || deterministicId('intent', intent.platform, intent.stage, intent.scheduledFor),
        platform: intent.platform,
        scheduledFor: intent.scheduledFor,
        state: exact.status === 'PUBLISHED_VERIFIED' ? 'ALREADY_PUBLISHED_PRESERVE' : 'ALREADY_SCHEDULED_PRESERVE',
        platformPostId: exact.platformPostId || '',
        objectId: exact.id || '',
        action: 'NO_NEW_OBJECT'
      };
    }
    const duplicate = scheduledObjects.find((object) => sameExecutionIdentity(intent, object) && !mediaCompatible(intent, object));
    if (duplicate) {
      return {
        intentId: intent.idempotencyKey || deterministicId('intent', intent.platform, intent.stage, intent.scheduledFor),
        platform: intent.platform,
        scheduledFor: intent.scheduledFor,
        state: 'READBACK_MISMATCH_HELD',
        objectId: duplicate.id || '',
        action: 'RAISE_EXCEPTION'
      };
    }
    return {
      intentId: intent.idempotencyKey || deterministicId('intent', intent.platform, intent.stage, intent.scheduledFor),
      platform: intent.platform,
      scheduledFor: intent.scheduledFor,
      state: 'MISSING_AUTONOMOUS_OBJECT',
      action: 'CREATE_VIA_OWNED_RUNTIME_WHEN_ELIGIBLE'
    };
  });
  const residualObjects = scheduledObjects
    .filter((_, index) => !usedObjects.has(index))
    .map((object) => ({
      objectId: object.id || '',
      platform: object.platform,
      scheduledFor: object.scheduledFor,
      state: object.superseded ? 'SUPERSEDED_RECONCILE' : 'UNMATCHED_EXISTING_OBJECT_REVIEW',
      action: object.superseded ? 'SUPPRESS_OR_REMOVE_AFTER_REPLACEMENT_VERIFIED' : 'PRESERVE_PENDING_REVIEW'
    }));
  const duplicates = residualObjects.filter((object) => object.state === 'SUPERSEDED_RECONCILE').length;
  return {
    decisions,
    residualObjects,
    accounting: {
      expectedPlatformItems: intents.length,
      preservedExistingObjects: decisions.filter((decision) => /PRESERVE$/.test(decision.state)).length,
      missingAutonomousObjects: decisions.filter((decision) => decision.state === 'MISSING_AUTONOMOUS_OBJECT').length,
      readbackMismatches: decisions.filter((decision) => decision.state === 'READBACK_MISMATCH_HELD').length,
      duplicates,
      wrongDestinations: scheduledObjects.filter((object) => object.destinationState === 'WRONG_DESTINATION').length,
      residualSintraPublishingExecutionItems: scheduledObjects.filter((object) => object.scheduler === 'Sintra/Soshie' && !object.superseded).length
    },
    classification: 'SEPTEMBER_EXECUTION_RECONCILED_WITH_AUTONOMOUS_AUTHORITY'
  };
}

export function filterActionableMarketingExceptions(exceptions = []) {
  return exceptions.filter((exception) => {
    const type = exception.type || exception.jm1_exceptiontype || exception.state || '';
    const resolved = exception.resolutionState || exception.jm1_resolutionstate || '';
    return !ROUTINE_EXCEPTION_TYPES.has(type) && !/RESOLVED|CLOSED|SUPPRESSED/i.test(resolved);
  });
}

export function resolveBranchMarketingConfigurations(config = {}) {
  const defaults = {
    one: { active: false, state: 'CONFIGURED_NOT_ACTIVE', audienceIsolation: 'ENTERPRISE_ONLY' },
    publishing: { active: true, state: 'ACTIVE_RUNTIME_CONSUMER', audienceIsolation: 'PUBLISHING_ONLY' },
    financial: { active: false, state: 'CONFIGURED_NOT_ACTIVATED', audienceIsolation: 'FINANCIAL_COMPLIANCE_HELD' },
    foundation: { active: false, state: 'CONFIGURED_NOT_ACTIVE', audienceIsolation: 'FOUNDATION_ONLY' }
  };
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [
    key,
    {
      ...value,
      ...(config[key] || {}),
      branchKey: key,
      engineForkRequired: false,
      sharedRuntimeOwner: 'J Merrill One'
    }
  ]));
}

export function evaluateEnterpriseBranchReuse(config = {}) {
  const branches = resolveBranchMarketingConfigurations(config);
  const activeBranches = Object.values(branches).filter((branch) => branch.active);
  return {
    branches,
    activeRuntimeConsumers: activeBranches.map((branch) => branch.branchKey),
    state: activeBranches.length === 1 && branches.publishing.active
      ? 'PUBLISHING_FIRST_CONSUMER_ENTERPRISE_REUSE_READY'
      : 'ENTERPRISE_REUSE_REQUIRES_BRANCH_ACTIVATION_REVIEW',
    classifications: [
      'JM1_MARKETING_OS_ENTERPRISE_BRANCH_REUSE_READY',
      branches.financial.state === 'CONFIGURED_NOT_ACTIVATED'
        ? 'FINANCIAL_CONFIGURED_NOT_ACTIVATED'
        : 'FINANCIAL_BRANCH_STATE_REVIEW'
    ]
  };
}

export function selectAutonomousReactivation({ catalogHealth = [], capacity = 1, activeCampaignSubjects = [] } = {}) {
  const active = new Set(activeCampaignSubjects);
  const candidates = catalogHealth
    .filter((title) => title.eligibleForReactivation)
    .filter((title) => !active.has(title.author) && !active.has(title.title))
    .sort((a, b) => {
      const aDays = daysSince(a.lastMarketedAt, new Date().toISOString());
      const bDays = daysSince(b.lastMarketedAt, new Date().toISOString());
      return bDays - aDays || String(a.title).localeCompare(String(b.title));
    });
  return {
    capacity,
    selected: candidates.slice(0, capacity).map((title) => ({
      title: title.title,
      author: title.author,
      action: 'CREATE_AUTONOMOUS_REACTIVATION_CANDIDATE'
    })),
    held: catalogHealth
      .filter((title) => !title.eligibleForReactivation)
      .map((title) => ({ title: title.title, reason: title.exclusionReason })),
    classification: candidates.length > 0
      ? 'CATALOG_REACTIVATION_CANDIDATE_SELECTED_BY_POLICY'
      : 'CATALOG_REACTIVATION_NO_ELIGIBLE_CANDIDATE'
  };
}

export function evaluateAcquisitionLifecycleSafety(signal = {}) {
  const blockers = [];
  if (signal.consentState !== 'OPTED_IN') blockers.push('CONSENT_REQUIRED');
  if (!signal.senderReady) blockers.push('DYNAMICS_SENDER_REQUIRED');
  if (signal.suppressed) blockers.push('SUPPRESSION_PRESENT');
  if (signal.duplicateCommunication) blockers.push('DUPLICATE_COMMUNICATION_BLOCKED');
  if (signal.lifecycleState === 'JOINED_THE_FAMILY') blockers.push('EXIT_JOINED_THE_FAMILY');
  return {
    subject: signal.subject || signal.prospectId || 'author_acquisition_signal',
    state: blockers.length === 0 ? 'ACQUISITION_NURTURE_ELIGIBLE' : 'ACQUISITION_NURTURE_HELD',
    blockers,
    exitCondition: signal.lifecycleState === 'JOINED_THE_FAMILY',
    routineTouch: { founder: 0, cody: 0 }
  };
}

export function evaluateReaderAudienceSignals(signals = []) {
  const eligible = signals.filter((signal) => signal.consentState === 'OPTED_IN' && !signal.fatigueHeld && !signal.suppressed);
  return {
    totalSignals: signals.length,
    eligibleSignals: eligible.length,
    state: eligible.length > 0 ? 'READER_AUDIENCE_PROGRAM_ELIGIBLE' : 'READER_AUDIENCE_PROGRAM_OBSERVE',
    nextActions: eligible.map((signal) => ({
      segment: signal.segment || signal.subject,
      action: 'CREATE_READER_AUDIENCE_JOURNEY_CANDIDATE'
    }))
  };
}

export function buildBusinessOutcomeMeasurementBaseline(signals = {}) {
  const metric = (value) => value === undefined || value === null
    ? { state: 'NOT_AVAILABLE', value: null }
    : { state: 'LIVE', value };
  return {
    generatedAt: signals.generatedAt || new Date().toISOString(),
    bookDiscovery: metric(signals.bookDiscovery),
    authorInquiry: metric(signals.authorInquiry),
    readerEngagement: metric(signals.readerEngagement),
    socialReach: metric(signals.socialReach),
    revenueAttribution: {
      state: signals.revenueAttribution === undefined ? 'NOT_AVAILABLE_DO_NOT_FABRICATE' : 'LIVE',
      value: signals.revenueAttribution ?? null
    },
    classification: 'BUSINESS_OUTCOME_MEASUREMENT_BASELINE_CREATED'
  };
}

export function buildMarketingCommandCenter({
  nowIso = new Date().toISOString(),
  currentFeaturedAuthor = 'Sean A Crowley I',
  nextFeaturedAuthor = 'Iyorwuese Hagher',
  strategiesGovernance = evaluateStrategiesLaunchGovernance({ nowIso }),
  catalogHealth = [],
  fourLaneCycle,
  exceptions = [],
  linkedinState = 'LINKEDIN_EXTERNAL_REVIEW_ONLY'
} = {}) {
  const actionableExceptions = filterActionableMarketingExceptions(exceptions);
  return {
    generatedAt: nowIso,
    state: actionableExceptions.length === 0
      ? 'PRODUCTION_OBSERVATION_NO_ACTION_REQUIRED'
      : 'PRODUCTION_OBSERVATION_ACTION_REQUIRED',
    currentFeaturedAuthor,
    nextFeaturedAuthor,
    octoberManualStartBlocked: true,
    strategiesGovernance,
    catalog: {
      titlesObserved: catalogHealth.length,
      eligibleForReactivation: catalogHealth.filter((title) => title.eligibleForReactivation).length,
      recentReleaseHeld: catalogHealth.filter((title) => title.recentReleaseHeld).map((title) => title.title)
    },
    fourLaneCycle,
    linkedinState,
    actionableExceptions,
    routineTouch: { founder: 0, cody: 0 },
    classifications: [
      'JMP_MARKETING_COMMAND_CENTER_OBSERVATION_SURFACE_READY',
      actionableExceptions.length === 0
        ? 'JMP_EXCEPTION_ONLY_GOVERNANCE_NO_ACTION_REQUIRED'
        : 'JMP_EXCEPTION_ONLY_GOVERNANCE_ACTION_REQUIRED'
    ]
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

function currentStageForDate(stages, nowIso) {
  const now = new Date(nowIso);
  const past = stages.filter((stage) => now >= new Date(`${stage.dueDate}T00:00:00.000Z`));
  return past.at(-1)?.key || stages[0]?.key || '';
}

function platformStageState(objects, platforms) {
  const relevant = objects.filter((object) => platforms.includes(object.platform));
  if (relevant.length === 0) return 'MISSING_OR_NOT_YET_DUE';
  if (relevant.every((object) => /PUBLISHED_VERIFIED|SCHEDULED_VERIFIED|PUBLISHED|SCHEDULED/.test(object.status || ''))) {
    return 'VERIFIED_OR_SCHEDULED';
  }
  return 'REVIEW_REQUIRED';
}

function nativeOrHeldState(objects) {
  const linkedIn = objects.filter((object) => object.platform === 'linkedin');
  if (linkedIn.some((object) => /PUBLISHED_VERIFIED|SCHEDULED_VERIFIED|PUBLISHED|SCHEDULED/.test(object.status || ''))) {
    return 'LINKEDIN_NATIVE_EXISTING_PRESERVED';
  }
  return 'LINKEDIN_API_EXTERNAL_REVIEW_HELD';
}

function sameExecutionIdentity(intent, object) {
  return intent.platform === object.platform
    && intent.destinationId === object.destinationId
    && intent.stage === object.stage
    && intent.scheduledFor === object.scheduledFor;
}

function mediaCompatible(intent, object) {
  if (!intent.mediaHash || !object.mediaHash) return true;
  return intent.mediaHash === object.mediaHash;
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
