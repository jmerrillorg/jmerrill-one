import { app } from '@azure/functions';
import { BRANCH_CONFIG } from '../lib/config.js';
import { buildContentWork, campaignMarker, resolveStageDecision } from '../lib/campaignProgram.js';
import { dv, entitySet, queryByPrefix, safeCount, upsertByIdempotency } from '../lib/dataverse.js';
import {
  buildBusinessOutcomeMeasurementBaseline,
  buildMarketingCommandCenter,
  evaluateCatalogMarketingHealth,
  evaluateEnterpriseBranchReuse,
  evaluateFourLaneControlCycle,
  evaluateStrategiesLaunchGovernance,
  reconcileSeptemberExecution,
  selectAutonomousReactivation
} from '../lib/marketingLifecycle.js';
import { activeBranches, runEnvelope } from '../lib/runtime.js';

app.timer('marketingControlLoopTimer', {
  schedule: process.env.JM1_MARKETING_CONTROL_LOOP_CRON || '0 17 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP', timer, context);
    const controlSet = await entitySet('jm1_marketingcontrolloop');
    const socialSet = await entitySet('jm1_socialexecution');
    const credentialSet = await entitySet('jm1_credentialmonitor');
    const journeySet = await entitySet('jm1_journeyexecution');
    const campaignSet = await entitySet('jm1_campaignauthority');
    const contentSet = await entitySet('jm1_contentwork');
    const creativeSet = await entitySet('jm1_creativework');
    const exceptionSet = await entitySet('jm1_marketingexception');
    const campaigns = await activeCampaigns(campaignSet);

    const dynamicsCounts = {
      journeys: await safeCount('msdynmkt_journeys'),
      journeyTemplates: await safeCount('msdynmkt_journeytemplates'),
      emails: await safeCount('msdynmkt_emails'),
      segments: await safeCount('msdynmkt_segments'),
      topics: await safeCount('msdynmkt_topics'),
      contactPointConsents: await safeCount('msdynmkt_contactpointconsent4s')
    };

    const branches = activeBranches(BRANCH_CONFIG);
    const dynamicsReady = Object.values(dynamicsCounts).every((item) => item.available && item.count > 0);
    const writes = [];
    const decisions = [];
    const fourLaneCycle = evaluateFourLaneControlCycle(defaultPublishingSignals(envelope.startedAt), envelope.startedAt);
    const catalogHealth = evaluateCatalogMarketingHealth(defaultCatalogSignals(), envelope.startedAt);
    const strategiesGovernance = evaluateStrategiesLaunchGovernance({
      nowIso: envelope.startedAt,
      scheduleObjects: defaultSeptemberScheduleObjects()
    });
    const septemberReconciliation = reconcileSeptemberExecution({
      intents: defaultSeptemberIntents(),
      scheduledObjects: defaultSeptemberScheduleObjects()
    });
    const branchReuse = evaluateEnterpriseBranchReuse(BRANCH_CONFIG);
    const reactivation = selectAutonomousReactivation({
      catalogHealth,
      capacity: 1,
      activeCampaignSubjects: ['Sean A Crowley I', 'Strategies for Success in Educational Leadership']
    });
    const outcomeBaseline = buildBusinessOutcomeMeasurementBaseline({
      generatedAt: envelope.startedAt,
      socialReach: null
    });
    const commandCenter = buildMarketingCommandCenter({
      nowIso: envelope.startedAt,
      strategiesGovernance,
      catalogHealth,
      fourLaneCycle,
      exceptions: [],
      linkedinState: 'LINKEDIN_EXTERNAL_REVIEW_ONLY'
    });

    for (const campaign of campaigns) {
      const marker = campaignMarker(campaign);
      const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${campaignSet}(${campaign.jm1_campaignauthorityid})` };
      const [contentRows, creativeRows, socialRows, credentialRows, journeyRows, exceptionRows] = await Promise.all([
        queryByPrefix(contentSet, `${marker}:content`, 'jm1_contentworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_draftcopy,jm1_copybrief', 100),
        queryByPrefix(creativeSet, `${marker}:creative`, 'jm1_creativeworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash,jm1_logohash,jm1_assetpath', 100),
        queryByPrefix(socialSet, `${marker}:social`, 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_actualschedule,jm1_verifiedat,jm1_requestedmediahash', 100),
        queryByPrefix(credentialSet, `${marker}:credential`, 'jm1_credentialmonitorid,jm1_idempotencykey,jm1_currentcredentialstate,jm1_rotationdueat,jm1_expiresat,jm1_exceptioncode', 50),
        queryByPrefix(journeySet, `${marker}:journey`, 'jm1_journeyexecutionid,jm1_idempotencykey,jm1_state,jm1_dynamicsjourneyid', 50),
        queryByPrefix(exceptionSet, `${marker}:exception`, 'jm1_marketingexceptionid,jm1_idempotencykey,jm1_name,jm1_exceptiontype,jm1_resolutionstate,jm1_resolution', 100)
      ]);

      const decision = resolveStageDecision({ campaign, contentRows, creativeRows, socialRows, journeyRows, exceptionRows, nowIso: envelope.startedAt });
      decisions.push({
        campaignId: campaign.jm1_campaignauthorityid,
        campaign: campaign.jm1_name,
        marker,
        currentStage: decision.currentStage,
        nextEligibleStage: decision.nextEligibleStage,
        temporalAuthority: decision.program.temporalAuthority,
        titleLifecycle: decision.program.titleLifecycle,
        controlDecision: decision.controlDecision,
        reason: decision.reason,
        introEligible: decision.introEligible,
        fatigue: decision.fatigue,
        readiness: decision.readiness
      });

      if (decision.controlDecision === 'GENERATE_NEXT_STAGE') {
        const contentPayload = buildContentWork({ campaign, decision, campaignBind });
        const contentWrite = await upsertByIdempotency(contentSet, 'jm1_contentworkid', contentPayload);
        writes.push({ entitySet: contentSet, type: 'content', id: contentWrite.id, created: contentWrite.created, stage: decision.nextStageKey });
      }

      const unresolved = [
        dynamicsReady ? '' : 'DYNAMICS_JOURNEY_SAFE_RUNTIME_BOUNDARY',
        'LINKEDIN_API_EXTERNAL_DEPENDENCY',
        decision.readiness.exceptionsOpen > 0 ? 'OPEN_MARKETING_EXCEPTIONS_PRESENT' : ''
      ].filter(Boolean).join('; ');

      const payload = {
        jm1_name: 'Autonomous Marketing Control Loop - program progression',
        jm1_branch: branches.map((branch) => branch.branchName).join('; ') || decision.program.branch,
        jm1_campaign: campaign.jm1_name,
        jm1_horizon30day: `PROGRAM=${decision.program.program}; MONTH=${decision.program.campaignMonth}; TEMPORAL_AUTHORITY=${decision.program.temporalAuthority.state}; CURRENT_STAGE=${decision.currentStage}`,
        jm1_horizon14day: `NEXT_ELIGIBLE_STAGE=${decision.nextEligibleStage}; EARLIEST_EXECUTION_AT=${decision.earliestExecutionAt || 'NONE'}`,
        jm1_horizon7day: dynamicsReady ? 'DYNAMICS_READY' : 'DYNAMICS_HELD_SAFE_RUNTIME_BOUNDARY',
        jm1_featuredauthorintroeligible: String(decision.introEligible).toUpperCase(),
        jm1_fatiguecheck: `${decision.fatigue.result}: ${decision.fatigue.reason}`,
        jm1_controldecision: decision.controlDecision,
        jm1_unresolvedprerequisites: unresolved,
        jm1_state: 'AUTONOMOUS_CAMPAIGN_STAGE_RESOLUTION_PROVEN',
        jm1_idempotencykey: `${marker}:autonomous:control-loop:program-progression`,
        jm1_evaluatedat: envelope.startedAt,
        ...campaignBind
      };
      const write = await upsertByIdempotency(controlSet, 'jm1_marketingcontrolloopid', payload);
      writes.push({ entitySet: controlSet, type: 'controlLoop', id: write.id, created: write.created });
    }

    context.log(JSON.stringify({
      ...envelope,
      dataverseRead: { campaigns: campaigns.length, dynamicsCounts },
      dataverseWrite: writes,
      fourLaneCycle,
      productionScale: {
        strategiesGovernance,
        septemberReconciliation,
        catalogHealth,
        reactivation,
        branchReuse,
        outcomeBaseline,
        commandCenter
      },
      decisions
    }));
  }
});

function defaultPublishingSignals(nowIso) {
  return [
    {
      sourceEvent: 'LAUNCH_DAY',
      sourceEntity: 'title',
      sourceRecord: 'strategies-for-success',
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      subject: 'Strategies for Success in Educational Leadership',
      releaseDate: '2026-09-22',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      observedAt: nowIso,
      priority: 'P0'
    },
    {
      sourceEvent: 'JOIN_INQUIRY',
      sourceEntity: 'publishing_prospect',
      sourceRecord: 'controlled-author-inquiry-signal',
      subject: 'Controlled Publishing author inquiry',
      rightsState: 'RESOLVED',
      observedAt: nowIso,
      priority: 'P1'
    },
    {
      sourceEvent: 'BRAND_EVERGREEN_BELOW_THRESHOLD',
      sourceEntity: 'brand_health',
      sourceRecord: 'helping-authors-help-themselves',
      subject: 'Helping Authors Help Themselves',
      assetState: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      observedAt: nowIso
    },
    {
      sourceEvent: 'READER_REENGAGEMENT_DUE',
      sourceEntity: 'reader_segment',
      sourceRecord: 'controlled-reader-affinity-signal',
      subject: 'Leadership reader re-engagement',
      rightsState: 'RESOLVED',
      observedAt: nowIso
    }
  ];
}

function defaultCatalogSignals() {
  return [
    {
      title: 'The Shift: Changing with God',
      author: 'Sean A Crowley I',
      lifecycleState: 'NEW_RECENTLY_RELEASED',
      releaseDate: '2026-08-01',
      lastMarketedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      lifecycleState: 'PRE_LAUNCH_TO_RELEASE',
      releaseDate: '2026-09-22',
      lastMarketedAt: '2026-09-04T00:00:00.000Z',
      currentCampaign: 'September launch runway'
    },
    {
      title: 'Controlled Dormant Catalog Title',
      author: 'Controlled Publishing Author',
      lifecycleState: 'BACKLIST',
      lastMarketedAt: '2026-06-01T00:00:00.000Z',
      engagementState: 'DORMANT'
    }
  ];
}

function defaultSeptemberIntents() {
  return [
    {
      idempotencyKey: 'september:strategies:release-day:facebook',
      platform: 'facebook',
      destinationId: 'j-merrill-publishing-inc',
      stage: 'release_day',
      scheduledFor: '2026-09-22T14:00:00.000Z',
      mediaHash: 'strategies-release-day-approved'
    },
    {
      idempotencyKey: 'september:strategies:release-day:instagram',
      platform: 'instagram',
      destinationId: 'jmerrillpub',
      stage: 'release_day',
      scheduledFor: '2026-09-22T16:00:00.000Z',
      mediaHash: 'strategies-release-day-approved'
    }
  ];
}

function defaultSeptemberScheduleObjects() {
  return [
    {
      id: 'existing-meta-fb-strategies-release-day',
      scheduler: 'Meta Business Suite UI',
      platform: 'facebook',
      destinationId: 'j-merrill-publishing-inc',
      stage: 'release_day',
      scheduledFor: '2026-09-22T14:00:00.000Z',
      mediaHash: 'strategies-release-day-approved',
      status: 'SCHEDULED_VERIFIED'
    },
    {
      id: 'existing-meta-ig-strategies-release-day',
      scheduler: 'Meta Business Suite UI',
      platform: 'instagram',
      destinationId: 'jmerrillpub',
      stage: 'release_day',
      scheduledFor: '2026-09-22T16:00:00.000Z',
      mediaHash: 'strategies-release-day-approved',
      status: 'SCHEDULED_VERIFIED'
    },
    {
      id: 'existing-linkedin-strategies-release-day',
      scheduler: 'LinkedIn native organization UI',
      platform: 'linkedin',
      destinationId: '13048648',
      stage: 'release_day',
      scheduledFor: '2026-09-22T18:00:00.000Z',
      mediaHash: 'strategies-release-day-approved',
      status: 'SCHEDULED_VERIFIED'
    }
  ];
}

async function activeCampaigns(campaignSet) {
  const filter = encodeURIComponent("jm1_campaigntype eq 'featured_author_month' or contains(jm1_program,'Author')");
  const response = await dv(`/${campaignSet}?$select=jm1_campaignauthorityid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_campaigntype,jm1_program,jm1_subject,jm1_audience,jm1_cta,jm1_journeyrequirement,jm1_start,jm1_stop,jm1_state&$filter=${filter}&$top=10`);
  return response.value || [];
}
