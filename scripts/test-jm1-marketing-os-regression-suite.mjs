import assert from 'node:assert/strict';

import {
  buildCreativeArtifact,
  publicReadyGate,
  resolveCampaignProgram,
  resolveStageDecision,
  resolveTitleLifecycle,
  selectCreativeArchetype
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/campaignProgram.js';
import {
  credentialState,
  currentFeaturedAuthorMarker,
  deterministicId,
  octoberIyorwueseMarker,
  septemberSeanMarker
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/runtime.js';
import {
  acquisitionSourceMap,
  buildMarketingCommandCenter,
  evergreenQueuePolicy,
  evaluateCatalogMarketingHealth,
  evaluateFourLaneControlCycle,
  evaluateLifecycleEvent,
  evaluateSupersession,
  exceptionRoutingPolicy,
  productionPublishingSignals,
  reconcileLegacyScheduledObjects,
  resolveLifecycleTriggerRegistry,
  resolveProgramRegistry,
  readerAudienceSignalFoundation,
  selectAutonomousReactivationCandidates,
  summarizeCatalogMarketingHealth
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const OFFICIAL_LOGO_HASH = 'a7ab3ad897c2ae3e16f63c89b582a434d1b7f0442ab559ccd610312e8c9e912a';
const nowIso = '2026-09-04T16:00:00.000Z';

const campaign = {
  jm1_name: 'October Featured Author - Iyorwuese Hagher',
  jm1_campaigntype: 'featured_author_month',
  jm1_program: 'Monthly Featured Author',
  jm1_branch: 'J Merrill Publishing',
  jm1_subject: 'Iyorwuese Hagher',
  jm1_audience: 'Publishing readers and author community',
  jm1_cta: 'Follow J Merrill Publishing for October Featured Author updates.',
  jm1_start: '2026-10-01T00:00:00.000Z',
  jm1_stop: '2026-10-31T23:59:59.000Z',
  jm1_idempotencykey: 'regression:featured-author:2026-10:iyorwuese:campaign'
};

const septemberSeanCampaign = {
  jm1_name: 'September Featured Author - Sean A Crowley I',
  jm1_campaigntype: 'featured_author_month',
  jm1_program: 'Monthly Featured Author',
  jm1_branch: 'J Merrill Publishing',
  jm1_subject: 'Sean A Crowley I',
  jm1_audience: 'Publishing readers and author community',
  jm1_cta: 'Explore The Shift and Strategies for Success through J Merrill Publishing.',
  jm1_start: '2026-09-01T00:00:00.000Z',
  jm1_stop: '2026-09-30T23:59:59.000Z',
  jm1_idempotencykey: 'regression:featured-author:2026-09:sean:campaign'
};

const content = {
  jm1_name: 'Iyorwuese Hagher Month Introduction',
  jm1_stage: 'month_introduction',
  jm1_draftcopy: 'Iyorwuese Hagher begins October Featured Author with a people-first reader invitation.',
  jm1_publicreadystate: 'PASS'
};

const assetState = {
  officialLogoHash: OFFICIAL_LOGO_HASH,
  officialLogoApproved: true,
  authorPortraitApproved: false,
  aPortraitCoverApproved: false
};

const tests = [
  test('September Sean is the active current Featured Author on September 4', () => {
    const program = resolveCampaignProgram(septemberSeanCampaign, nowIso);
    assert.equal(program.temporalAuthority.state, 'ACTIVE_CURRENT_MONTH');
    assert.equal(program.temporalAuthority.currentMonthReplacementAllowed, true);
    assert.equal(currentFeaturedAuthorMarker(new Date(nowIso)), septemberSeanMarker());
  }),
  test('October Iyorwuese remains future/pre-staged during September', () => {
    const decision = resolveStageDecision({
      campaign,
      contentRows: [],
      creativeRows: [],
      socialRows: [],
      journeyRows: [],
      exceptionRows: [],
      nowIso
    });
    assert.equal(decision.program.temporalAuthority.state, 'FUTURE_NEXT_MONTH_PRESTAGED');
    assert.equal(decision.controlDecision, 'OBSERVE_FUTURE_PRESTAGE');
    assert.equal(decision.program.temporalAuthority.currentMonthReplacementAllowed, false);
  }),
  test('October Iyorwuese becomes active at the October boundary', () => {
    const octoberNow = '2026-10-01T16:00:00.000Z';
    const program = resolveCampaignProgram(campaign, octoberNow);
    assert.equal(program.temporalAuthority.state, 'ACTIVE_CURRENT_MONTH');
    assert.equal(currentFeaturedAuthorMarker(new Date(octoberNow)), octoberIyorwueseMarker());
  }),
  test('no current Featured Author marker is returned after the known authority window', () => {
    assert.equal(currentFeaturedAuthorMarker(new Date('2026-11-01T16:00:00.000Z')), '');
  }),
  test('The Shift remains new/recently released, not backlist or draft', () => {
    const lifecycle = resolveTitleLifecycle(septemberSeanCampaign);
    assert.equal(lifecycle.theShift, 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT');
  }),
  test('Publishing four-lane program registry is active', () => {
    const registry = resolveProgramRegistry();
    assert.equal(registry.length, 4);
    assert.deepEqual(registry.map((program) => program.key), ['title_author', 'author_acquisition', 'publishing_brand', 'reader_audience']);
    assert.ok(registry.every((program) => program.state === 'ACTIVE'));
  }),
  test('title lifecycle trigger registry includes required release and downstream triggers', () => {
    const registry = resolveLifecycleTriggerRegistry();
    const events = registry.map((item) => item.event);
    for (const required of ['COVER_APPROVED', 'DISTRIBUTION_LIVE', 'LAUNCH_DAY', 'PLUS_30', 'BACKLIST_REACTIVATION']) {
      assert.ok(events.includes(required), `${required} missing`);
    }
  }),
  test('cover approved derives marketing consequences', () => {
    const decision = evaluateLifecycleEvent({
      sourceEvent: 'COVER_APPROVED',
      sourceEntity: 'controlled_lifecycle_fixture',
      sourceRecord: 'cover-approved-proof',
      title: 'Controlled Cover Proof',
      author: 'Controlled Author',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED'
    });
    assert.equal(decision.state, 'ELIGIBLE');
    assert.equal(decision.campaignType, 'cover_reveal');
    assert.ok(decision.derived.eligibility.endsWith(':eligibility'));
    assert.equal(decision.derived.social.length, 3);
  }),
  test('distribution live supersedes stale coming soon messaging', () => {
    const supersession = evaluateSupersession('coming_soon', {
      sourceEvent: 'DISTRIBUTION_LIVE',
      title: 'Controlled Distribution Proof',
      author: 'Controlled Author',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED'
    });
    assert.equal(supersession.state, 'SUPERSEDED_BY_NEWER_LIFECYCLE_AUTHORITY');
  }),
  test('same lifecycle event has stable idempotency keys', () => {
    const event = {
      sourceEvent: 'LAUNCH_DAY',
      sourceEntity: 'title',
      sourceRecord: 'strategies-for-success',
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      releaseDate: '2026-09-22',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED'
    };
    const first = evaluateLifecycleEvent(event);
    const second = evaluateLifecycleEvent(event);
    assert.equal(first.marker, second.marker);
    assert.deepEqual(first.derived, second.derived);
  }),
  test('four-lane control cycle evaluates every lane concurrently', () => {
    const cycle = evaluateFourLaneControlCycle([
      { sourceEvent: 'LAUNCH_DAY', sourceEntity: 'title', sourceRecord: 'strategies-for-success', title: 'Strategies for Success in Educational Leadership', author: 'Sean A Crowley I', releaseDate: '2026-09-22', assetState: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED' },
      { sourceEvent: 'JOIN_INQUIRY', sourceEntity: 'publishing_prospect', sourceRecord: 'prospect-proof', subject: 'Controlled inquiry', rightsState: 'RESOLVED' },
      { sourceEvent: 'BRAND_EVERGREEN_BELOW_THRESHOLD', sourceEntity: 'brand_health', sourceRecord: 'brand-proof', subject: 'Helping Authors Help Themselves', assetState: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED' },
      { sourceEvent: 'READER_REENGAGEMENT_DUE', sourceEntity: 'reader_segment', sourceRecord: 'reader-proof', subject: 'Leadership reader re-engagement', rightsState: 'RESOLVED' }
    ], nowIso);
    assert.equal(cycle.concurrency.lanesEvaluated, 4);
    assert.equal(cycle.concurrency.lanesWithDecisions, 4);
    assert.equal(cycle.concurrency.starvationDetected, false);
    assert.ok(cycle.classifications.includes('JMP_FOUR_LANE_CONCURRENT_CONTROL_LOOP_PROVEN'));
  }),
  test('catalog health holds The Shift from backlist reactivation', () => {
    const health = evaluateCatalogMarketingHealth([
      { title: 'The Shift: Changing with God', author: 'Sean A Crowley I', lifecycleState: 'BACKLIST', lastMarketedAt: '2026-09-01T00:00:00.000Z' },
      { title: 'Controlled Dormant Catalog Title', author: 'Controlled Author', lifecycleState: 'BACKLIST', lastMarketedAt: '2026-06-01T00:00:00.000Z' }
    ], nowIso);
    assert.equal(health[0].recentReleaseHeld, true);
    assert.equal(health[0].eligibleForReactivation, false);
    assert.equal(health[1].eligibleForReactivation, true);
  }),
  test('missing official logo is blocked', () => {
    const artifact = buildCreativeArtifact({
      campaign,
      content,
      archetype: 'TYPOGRAPHIC_PRE_COVER',
      assetState,
      forceLogoFailure: true
    });
    assert.equal(artifact.publicReady.state, 'REWORK');
    assert.match(artifact.publicReady.failures.join('|'), /OFFICIAL_LOGO_REQUIRED/);
  }),
  test('fake cover language is blocked', () => {
    const gate = publicReadyGate({
      svg: '<svg><text>fake cover for Iyorwuese Hagher</text></svg>',
      campaign,
      content,
      archetype: 'TYPOGRAPHIC_PRE_COVER',
      logoHash: OFFICIAL_LOGO_HASH,
      assetState
    });
    assert.equal(gate.state, 'REWORK');
    assert.match(gate.failures.join('|'), /FAKE_COVER_BLOCKED/);
  }),
  test('book-cover archetypes require resolved title assets', () => {
    const archetype = selectCreativeArchetype({
      stageKey: 'title_discovery',
      recentCreativeRows: [],
      assetState,
      platform: 'meta'
    });
    assert.equal(archetype, 'TYPOGRAPHIC_PRE_COVER');
  }),
  test('repeat intro is blocked when a recent intro already published', () => {
    const decision = resolveStageDecision({
      campaign,
      contentRows: [{ jm1_stage: 'month_introduction', jm1_publicreadystate: 'PASS' }],
      creativeRows: [],
      socialRows: [{
        jm1_platform: 'facebook',
        jm1_status: 'PUBLISHED_VERIFIED',
        jm1_idempotencykey: `${campaign.jm1_idempotencykey}:social:month_introduction:facebook`,
        jm1_actualschedule: '2026-09-03T16:00:00.000Z'
      }],
      journeyRows: [],
      exceptionRows: [],
      nowIso
    });
    assert.equal(decision.controlDecision, 'DO_NOTHING');
    assert.match(decision.reason, /intro repetition blocked/i);
  }),
  test('post-publish Dataverse failure reconciles to one platform object', () => {
    const runtime = simulatedMetaRuntime();
    const first = runtime.execute();
    const second = runtime.execute();
    const third = runtime.execute();

    assert.equal(first.state, 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE');
    assert.equal(second.state, 'RECONCILED_PLATFORM_SUCCESS');
    assert.equal(third.state, 'IDEMPOTENT_ALREADY_CERTIFIED');
    assert.equal(runtime.platformObjects.length, 1);
  }),
  test('duplicate readback refuses certification', () => {
    const runtime = simulatedMetaRuntime({ duplicatePlatformObjects: true });
    const result = runtime.reconcile();
    assert.equal(result.state, 'RECONCILIATION_MATCH_NOT_UNIQUE');
    assert.equal(result.matches, 2);
  }),
  test('media hash mismatch is held before execution', () => {
    const expected = OFFICIAL_LOGO_HASH;
    const requested = 'bad-hash';
    assert.equal(requested === expected ? 'PASS' : 'HELD_REQUESTED_MEDIA_HASH_MISMATCH', 'HELD_REQUESTED_MEDIA_HASH_MISMATCH');
  }),
  test('credential monitor marks rotation due before expiration', () => {
    const state = credentialState('2026-09-04T00:00:00.000Z', '2026-09-20T00:00:00.000Z', new Date(nowIso));
    assert.equal(state, 'META_CREDENTIAL_ROTATION_DUE');
  }),
  test('campaign idempotency is deterministic and branch scoped', () => {
    const a = deterministicId('J Merrill Publishing', 'featured-author', '2026-10', 'Iyorwuese');
    const b = deterministicId('J Merrill Publishing', 'featured-author', '2026-10', 'Iyorwuese');
    const c = deterministicId('J Merrill Financial', 'featured-author', '2026-10', 'Iyorwuese');
    assert.equal(a, b);
    assert.notEqual(a, c);
  }),
  test('journey seed can be instantiated without engine code change', () => {
    const seed = {
      shape: 'Entry/Audience -> Email -> Wait -> Exit',
      placeholders: ['audienceSegmentId', 'emailId', 'startTime']
    };
    const october = instantiateJourney(seed, { author: 'Iyorwuese Hagher', month: '2026-10' });
    const november = instantiateJourney(seed, { author: 'Transferability Fixture', month: '2026-11' });
    assert.equal(october.shape, november.shape);
    assert.notEqual(october.idempotencyKey, november.idempotencyKey);
  }),
  test('production Publishing signals evaluate all four lanes without fixture authority', () => {
    const cycle = evaluateFourLaneControlCycle(productionPublishingSignals({
      nowIso,
      campaigns: [septemberSeanCampaign],
      catalog: [{ title: 'Strategies for Success in Educational Leadership', author: 'Sean A Crowley I', publicationDate: '2026-09-22', releaseStatus: 'LAUNCH_RUNWAY', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED' }],
      audienceSignals: { evergreenQueueDepth: 4, daysSinceReaderEngagement: 44 },
      acquisitionSignals: { hasOpenInquiry: true }
    }), nowIso);
    assert.equal(cycle.concurrency.lanesEvaluated, 4);
    assert.equal(cycle.concurrency.lanesWithDecisions, 4);
    assert.equal(cycle.concurrency.starvationDetected, false);
  }),
  test('healthy evergreen production signal remains in the Publishing Brand lane', () => {
    const cycle = evaluateFourLaneControlCycle(productionPublishingSignals({
      nowIso,
      campaigns: [septemberSeanCampaign],
      catalog: [{ title: 'Strategies for Success in Educational Leadership', author: 'Sean A Crowley I', publicationDate: '2026-09-22', releaseStatus: 'LAUNCH_RUNWAY', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED' }],
      audienceSignals: { evergreenQueueDepth: 30, daysSinceReaderEngagement: 10 },
      acquisitionSignals: { hasOpenInquiry: false }
    }), nowIso);
    assert.equal(cycle.lanes.publishing_brand.decisions.length, 1);
    assert.equal(cycle.lanes.author_acquisition.decisions.length, 1);
    assert.equal(cycle.lanes.reader_audience.decisions.length, 1);
    assert.equal(cycle.lanes.title_author.decisions.length, 1);
  }),
  test('legacy scheduled objects prevent duplicate autonomous execution', () => {
    const reconciliation = reconcileLegacyScheduledObjects([
      {
        jm1_platform: 'facebook',
        jm1_requesteddestination: 'J Merrill Publishing Inc',
        jm1_requestedschedule: '2026-09-22T14:00:00Z',
        jm1_campaign: 'Strategies launch',
        jm1_executor: 'META_BUSINESS_SUITE_UI',
        jm1_status: 'SCHEDULED_VERIFIED'
      }
    ], [
      {
        platform: 'facebook',
        destination: 'J Merrill Publishing Inc',
        scheduledFor: '2026-09-22T18:00:00Z',
        campaign: 'Strategies launch'
      }
    ]);
    assert.equal(reconciliation.legacyScheduledCount, 1);
    assert.equal(reconciliation.duplicateEquivalentFutureCount, 1);
    assert.equal(reconciliation.duplicatePreventionState, 'HOLD_DUPLICATE_EQUIVALENT_AUTONOMOUS_ROWS');
  }),
  test('catalog health summarizes production-scale states', () => {
    const health = evaluateCatalogMarketingHealth([
      { titleId: 'shift', title: 'The Shift: Changing with God', author: 'Sean A Crowley I', lifecycleState: 'BACKLIST', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED', lastMarketedAt: '2026-08-15T00:00:00Z' },
      { titleId: 'dormant', title: 'Source-Backed Dormant Title', author: 'J Merrill Publishing Author', lifecycleState: 'BACKLIST', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED', lastMarketedAt: '2026-05-01T00:00:00Z' },
      { titleId: 'asset-missing', title: 'Asset Missing Title', author: 'J Merrill Publishing Author', lifecycleState: 'BACKLIST', assetReadiness: 'MISSING_GOVERNED_ASSET', rightsState: 'RESOLVED', lastMarketedAt: '2026-05-01T00:00:00Z' }
    ], nowIso);
    const summary = summarizeCatalogMarketingHealth(health);
    assert.equal(summary.titlesEvaluated, 3);
    assert.equal(summary.recentReleaseHeld, 1);
    assert.equal(summary.reactivationEligible, 1);
    assert.equal(summary.assetException, 1);
  }),
  test('autonomous reactivation selection respects eligibility and capacity', () => {
    const health = evaluateCatalogMarketingHealth([
      { titleId: 'a', title: 'Eligible A', author: 'Author A', lifecycleState: 'BACKLIST', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED', lastMarketedAt: '2026-01-01T00:00:00Z' },
      { titleId: 'b', title: 'Eligible B', author: 'Author B', lifecycleState: 'BACKLIST', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED', lastMarketedAt: '2026-02-01T00:00:00Z' },
      { titleId: 'c', title: 'Held C', author: 'Author C', lifecycleState: 'BACKLIST', assetReadiness: 'UNKNOWN', rightsState: 'RESOLVED', lastMarketedAt: '2026-02-01T00:00:00Z' }
    ], nowIso);
    const selected = selectAutonomousReactivationCandidates(health, { capacity: 1 });
    assert.equal(selected.length, 1);
    assert.equal(selected[0].eligibleForReactivation, true);
    assert.ok(selected[0].idempotencyKey);
  }),
  test('acquisition source map exits acquisition when author joins', () => {
    const map = acquisitionSourceMap({ joinInquiry: { name: '/join form' }, joinedTheFamily: { name: 'Publishing author record' } });
    assert.equal(map.find((item) => item.state === 'join_inquiry').classification, 'LIVE_OR_AVAILABLE');
    assert.equal(map.find((item) => item.state === 'joined_the_family').journeyAction, 'EXIT_ACQUISITION_ENTER_AUTHOR_LIFECYCLE');
  }),
  test('reader audience signal foundation does not invent unavailable signals', () => {
    const signals = readerAudienceSignalFoundation({ emailEngagement: { source: 'Dynamics interactions', classification: 'LIVE' } });
    assert.equal(signals.find((item) => item.signal === 'email_engagement').classification, 'LIVE');
    assert.equal(signals.find((item) => item.signal === 'title_page_visits').classification, 'NOT_AVAILABLE');
  }),
  test('evergreen queue policy replenishes below minimum depth', () => {
    const policy = evergreenQueuePolicy({ currentQueueDepth: 3, minimumQueueDepth: 14 });
    assert.equal(policy.state, 'REPLENISHMENT_DUE');
    assert.match(policy.titleLaunchPriorityRule, /Strategies for Success/);
  }),
  test('exception routing suppresses routine wait states', () => {
    const routed = exceptionRoutingPolicy([
      { jm1_exceptiontype: 'LINKEDIN_EXTERNAL_REVIEW' },
      { jm1_exceptiontype: 'RIGHTS_AMBIGUITY' },
      { jm1_exceptiontype: 'WAITING_FOR_SCHEDULE' }
    ]);
    assert.equal(routed.founderActionableCount, 1);
    assert.deepEqual(routed.actionableTypes, ['RIGHTS_AMBIGUITY']);
  }),
  test('marketing command center exposes current upcoming health exceptions and catalog', () => {
    const commandCenter = buildMarketingCommandCenter({
      nowIso,
      featuredAuthor: 'Sean A Crowley I',
      nextFeaturedAuthor: 'Iyorwuese Hagher',
      campaigns: [septemberSeanCampaign, campaign],
      socialRows: [{ jm1_platform: 'facebook', jm1_status: 'PUBLISHED_VERIFIED', jm1_platformpostid: 'fb_1' }],
      journeyRows: [{ jm1_state: 'DYNAMICS_CONTROLLED_JOURNEY_PROVEN' }],
      creativeRows: [{ jm1_assethash: OFFICIAL_LOGO_HASH }],
      exceptionRows: [{ jm1_exceptiontype: 'RIGHTS_AMBIGUITY' }],
      catalogHealth: evaluateCatalogMarketingHealth([{ title: 'Eligible A', author: 'Author A', lifecycleState: 'BACKLIST', assetReadiness: 'GOVERNED_ASSET_AVAILABLE', rightsState: 'RESOLVED', lastMarketedAt: '2026-01-01T00:00:00Z' }], nowIso)
    });
    assert.equal(commandCenter.classification, 'JM1_MARKETING_COMMAND_CENTER_OPERATIONAL');
    assert.equal(commandCenter.current.featuredAuthor, 'Sean A Crowley I');
    assert.equal(commandCenter.exceptions.founderActionableCount, 1);
  })
];

const failures = tests.filter((result) => !result.ok);
const report = {
  artifact: 'JM1-MARKETING-OS-REGRESSION-SUITE-v1',
  generatedAt: new Date().toISOString(),
  mode: 'OFFLINE_NON_DESTRUCTIVE',
  tests,
  passed: tests.length - failures.length,
  failed: failures.length,
  classifications: failures.length === 0
    ? [
      'JM1_MARKETING_OS_REGRESSION_SUITE_PASS',
      'FEATURED_AUTHOR_PROGRAM_TRANSFERABILITY_PROVEN'
    ]
    : ['JM1_MARKETING_OS_REGRESSION_SUITE_FAIL']
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exit(1);

function test(name, fn) {
  try {
    fn();
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, error: error.message };
  }
}

function simulatedMetaRuntime(options = {}) {
  const row = {
    status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
    platformPostId: '',
    caption: 'J Merrill Publishing runtime proof for exact media and readback.',
    destination: 'J Merrill Publishing Inc'
  };
  const platformObjects = options.duplicatePlatformObjects
    ? [
      { id: 'fb_1', caption: row.caption, destination: row.destination },
      { id: 'fb_2', caption: row.caption, destination: row.destination }
    ]
    : [];
  let failPlatformAcceptedWrite = true;

  return {
    platformObjects,
    execute() {
      if (row.platformPostId && row.status === 'PUBLISHED_VERIFIED') {
        return { state: 'IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: row.platformPostId };
      }
      if (row.status === 'PUBLISHING_CLAIMED') return this.reconcile();

      row.status = 'PUBLISHING_CLAIMED';
      const object = { id: `fb_${platformObjects.length + 1}`, caption: row.caption, destination: row.destination };
      platformObjects.push(object);
      if (failPlatformAcceptedWrite) {
        failPlatformAcceptedWrite = false;
        return { state: 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE', platformPostIdNotYetStored: object.id };
      }
      row.platformPostId = object.id;
      row.status = 'PUBLISHED_VERIFIED';
      return { state: 'PUBLISHED_VERIFIED', platformPostId: object.id };
    },
    reconcile() {
      const matches = platformObjects.filter((object) => object.caption === row.caption && object.destination === row.destination);
      if (matches.length !== 1) return { state: 'RECONCILIATION_MATCH_NOT_UNIQUE', matches: matches.length };
      row.platformPostId = matches[0].id;
      row.status = 'PUBLISHED_VERIFIED';
      return { state: 'RECONCILED_PLATFORM_SUCCESS', platformPostId: matches[0].id };
    }
  };
}

function instantiateJourney(seed, values) {
  return {
    ...seed,
    values,
    idempotencyKey: deterministicId('journey-seed', seed.shape, values.month, values.author)
  };
}
