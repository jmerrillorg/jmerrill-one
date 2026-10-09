import { app } from '@azure/functions';
import { BRANCH_CONFIG } from '../lib/config.js';
import { buildContentWork, campaignMarker, resolveStageDecision } from '../lib/campaignProgram.js';
import { dv, entitySet, queryByPrefix, safeCount, upsertByIdempotency } from '../lib/dataverse.js';
import { evaluateFourLaneControlCycle, productionPublishingSignals } from '../lib/marketingLifecycle.js';
import { activeBranches, runEnvelope } from '../lib/runtime.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';
import { buildReviewedNativeSocialContent, isApprovedNativeSocialCampaign, nativeSocialCampaignMarker, planNativeSocialGaps } from '../lib/nativeSocialProgram.js';

app.timer('marketingControlLoopTimer', {
  schedule: process.env.JM1_MARKETING_CONTROL_LOOP_CRON || '0 17 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP', timer, context);
    return withDistributedTimerLease('marketing-control-loop', envelope, context, async () => {
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
    const fourLaneCycle = evaluateFourLaneControlCycle(productionPublishingSignals({
      nowIso: envelope.startedAt,
      campaigns,
      audienceSignals: {
        evergreenQueueDepth: Number(process.env.JM1_PUBLISHING_EVERGREEN_QUEUE_DEPTH || 0),
        daysSinceReaderEngagement: Number(process.env.JM1_PUBLISHING_READER_ENGAGEMENT_AGE_DAYS || 31)
      },
      acquisitionSignals: {
        hasOpenInquiry: process.env.JM1_PUBLISHING_AUTHOR_ACQUISITION_SIGNAL === 'open_inquiry',
        sourceEntity: 'production_marketing_control_loop'
      },
      catalog: productionCatalogSignals()
    }), envelope.startedAt);

    for (const campaign of campaigns) {
      const marker = campaignMarker(campaign);
      const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${campaignSet}(${campaign.jm1_campaignauthorityid})` };
      const [contentRows, creativeRows, socialRows, credentialRows, journeyRows, exceptionRows] = await Promise.all([
        queryByPrefix(contentSet, `${marker}:content`, 'jm1_contentworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_draftcopy,jm1_copybrief', 100),
        queryByPrefix(creativeSet, `${marker}:creative`, 'jm1_creativeworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash,jm1_logohash,jm1_assetpath', 100),
        queryByPrefix(socialSet, `${marker}:social`, 'jm1_socialexecutionid,jm1_idempotencykey,jm1_branch,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_actualschedule,jm1_requesteddestination,jm1_verifiedat,jm1_requestedmediahash', 100),
        queryByPrefix(credentialSet, `${marker}:credential`, 'jm1_credentialmonitorid,jm1_idempotencykey,jm1_currentcredentialstate,jm1_rotationdueat,jm1_expiresat,jm1_exceptioncode', 50),
        queryByPrefix(journeySet, `${marker}:journey`, 'jm1_journeyexecutionid,jm1_idempotencykey,jm1_state,jm1_dynamicsjourneyid', 50),
        queryByPrefix(exceptionSet, `${marker}:exception`, 'jm1_marketingexceptionid,jm1_idempotencykey,jm1_name,jm1_exceptiontype,jm1_resolutionstate,jm1_resolution', 100)
      ]);

      if (isApprovedNativeSocialCampaign(campaign)) {
        const branch = Object.values(BRANCH_CONFIG).find((item) => item.active && item.branchName === campaign.jm1_branch);
        if (!branch) {
          decisions.push({ campaignId: campaign.jm1_campaignauthorityid, marker, controlDecision: 'HOLD_BRANCH_EXECUTION_DISABLED' });
          continue;
        }
        const destinations = {
          facebook: [branch.facebookPageId, branch.facebookPageName],
          instagram: [branch.instagramGraphId, branch.instagramHandle],
          linkedin: [branch.linkedinOrganizationId, branch.linkedinOrganizationName]
        };
        const branchFilter = encodeURIComponent(`jm1_branch eq '${campaign.jm1_branch.replaceAll("'", "''")}'`);
        const branchSocialResponse = await dv(`/${socialSet}?$select=jm1_socialexecutionid,jm1_idempotencykey,jm1_branch,jm1_platform,jm1_status,jm1_platformpostid,jm1_requestedschedule,jm1_actualschedule,jm1_requesteddestination&$filter=${branchFilter}&$top=5000`);
        const readbackComplete = !branchSocialResponse['@odata.nextLink'];
        const approvedRequestMarkers = campaigns
          .filter((item) => item.jm1_branch === campaign.jm1_branch && item.jm1_state === 'PUBLIC_EXECUTION_APPROVED')
          .map(campaignMarker);
        const plans = planNativeSocialGaps({ campaign, socialRows: branchSocialResponse.value, nowIso: envelope.startedAt, destinationByPlatform: destinations, approvedRequestMarkers, readbackComplete });
        const materialized = [];
        for (const plan of plans) {
          const prepared = buildReviewedNativeSocialContent({ campaign, weekKey: plan.weekKey, slot: plan.slot, nowIso: envelope.startedAt });
          if (!prepared.ok) {
            materialized.push({ slot: plan.slotKey, state: prepared.reason });
            continue;
          }
          const stage = prepared.stage;
          const contentKey = `${marker}:content:${stage}`;
          const contentPayload = {
            jm1_name: prepared.template.title,
            jm1_branch: campaign.jm1_branch,
            jm1_stage: stage,
            jm1_audience: campaign.jm1_audience || 'Public brand audience',
            jm1_copybrief: `${prepared.provenance}; platforms=${plan.platforms.join(',')}; destination links and executor are bound by the approved channel configuration. Theme=${prepared.template.theme}. Alt=${campaign.jm1_branch} graphic titled ${prepared.template.title}; the full educational copy accompanies the post.`,
            jm1_draftcopy: prepared.caption,
            jm1_publicreadystate: 'PASS',
            jm1_idempotencykey: contentKey,
            ...campaignBind
          };
          const contentWrite = await upsertByIdempotency(contentSet, 'jm1_contentworkid', contentPayload);
          writes.push({ entitySet: contentSet, type: 'nativeSocialContent', id: contentWrite.id, created: contentWrite.created, stage });
          materialized.push({ slot: plan.slotKey, state: 'CONTENT_READY', id: contentWrite.id, platforms: plan.platforms });
        }
        const payload = {
          jm1_name: `${campaign.jm1_branch} autonomous rolling social control loop`,
          jm1_branch: campaign.jm1_branch,
          jm1_campaign: campaign.jm1_name,
          jm1_horizon30day: 'APPROVED_TEMPLATE_SET:v1; source campaign authority read from Dataverse',
          jm1_horizon14day: `GENERATED_GAPS=${materialized.filter((item) => item.state === 'CONTENT_READY').length}; EASTERN_HALF_OPEN_HORIZON=${envelope.startedAt}`,
          jm1_horizon7day: `ACTIVE_CHANNELS=${branch.facebookPageId ? 'facebook;' : ''}${branch.instagramGraphId ? 'instagram;' : ''}linkedin=native-authority-required`,
          jm1_featuredauthorintroeligible: 'NOT_APPLICABLE',
          jm1_fatiguecheck: 'Exact campaign, branch, and per-channel booking rows checked before materialization.',
          jm1_controldecision: !readbackComplete ? 'HOLD_INCOMPLETE_BRANCH_SOCIAL_READBACK' : plans.length ? 'MATERIALIZED_APPROVED_TEMPLATE_GAPS' : 'WAIT_COVERAGE_OR_NO_ELIGIBLE_GAP',
          jm1_unresolvedprerequisites: branch.linkedinOrganizationId ? 'LINKEDIN_NATIVE_SCHEDULING_REQUIRED_WHILE_API_PRODUCT_PENDING' : '',
          jm1_state: 'AUTONOMOUS_NATIVE_SOCIAL_GAP_PLANNING',
          jm1_idempotencykey: `${nativeSocialCampaignMarker(campaign)}:autonomous:control-loop:rolling-coverage`,
          jm1_evaluatedat: envelope.startedAt,
          ...campaignBind
        };
        const controlWrite = await upsertByIdempotency(controlSet, 'jm1_marketingcontrolloopid', payload);
        writes.push({ entitySet: controlSet, type: 'nativeSocialControlLoop', id: controlWrite.id, created: controlWrite.created, materialized });
        decisions.push({ campaignId: campaign.jm1_campaignauthorityid, marker, controlDecision: payload.jm1_controldecision, materialized });
        continue;
      }

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
      decisions
    }));
    });
  }
});

function productionCatalogSignals() {
  return [
    {
      titleId: 'strategies-for-success-educational-leadership',
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      publicationDate: '2026-09-22',
      releaseStatus: 'LAUNCH_RUNWAY',
      assetReadiness: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      currentCampaign: 'September 22 launch'
    }
  ];
}

async function activeCampaigns(campaignSet) {
  const filter = encodeURIComponent("(jm1_campaigntype eq 'featured_author_month' or jm1_campaigntype eq 'native_social') and jm1_state eq 'PUBLIC_EXECUTION_APPROVED'");
  const response = await dv(`/${campaignSet}?$select=jm1_campaignauthorityid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_campaigntype,jm1_program,jm1_subject,jm1_audience,jm1_cta,jm1_journeyrequirement,jm1_cadence,jm1_start,jm1_stop,jm1_state&$filter=${filter}&$top=50`);
  return response.value || [];
}
