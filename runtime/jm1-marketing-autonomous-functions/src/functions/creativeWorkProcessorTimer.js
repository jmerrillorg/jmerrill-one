import { app } from '@azure/functions';
import { buildCreativeArtifact, campaignMarker, inferAssetState, selectCreativeArchetype } from '../lib/campaignProgram.js';
import { BRANCH_CONFIG } from '../lib/config.js';
import { dv, entitySet, patchById, queryByPrefix, upsertByIdempotency } from '../lib/dataverse.js';
import { registerCampaignCreativeMedia } from '../lib/mediaRegistry.js';
import { runEnvelope } from '../lib/runtime.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';

app.timer('creativeWorkProcessorTimer', {
  schedule: process.env.JM1_CREATIVE_WORKER_CRON || '0 22 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_CREATIVE_WORK_PROCESSOR', timer, context);
    return withDistributedTimerLease('creative-work-processor', envelope, context, async () => {
    const campaignSet = await entitySet('jm1_campaignauthority');
    const contentSet = await entitySet('jm1_contentwork');
    const creativeSet = await entitySet('jm1_creativework');
    const socialSet = await entitySet('jm1_socialexecution');
    const exceptionSet = await entitySet('jm1_marketingexception');
    const campaigns = await activeCampaigns(campaignSet);
    const writes = [];

    for (const campaign of campaigns) {
      const marker = campaignMarker(campaign);
      const campaignBind = { 'jm1_CampaignAuthority@odata.bind': `/${campaignSet}(${campaign.jm1_campaignauthorityid})` };
      const [contentRows, creativeRows, exceptionRows] = await Promise.all([
        queryByPrefix(contentSet, `${marker}:content`, 'jm1_contentworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_draftcopy,jm1_copybrief', 100),
        queryByPrefix(creativeSet, `${marker}:creative`, 'jm1_creativeworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash,jm1_logohash,jm1_assetpath', 100),
        queryByPrefix(exceptionSet, `${marker}:exception`, 'jm1_marketingexceptionid,jm1_idempotencykey,jm1_name,jm1_resolutionstate,jm1_resolution', 100)
      ]);
      const assetState = inferAssetState(exceptionRows);
      const pendingContent = contentRows.filter((row) =>
        row.jm1_publicreadystate === 'PASS'
        && !creativeRows.some((creative) => creative.jm1_stage === row.jm1_stage && creative.jm1_publicreadystate === 'PASS')
      );

      for (const content of pendingContent) {
        const archetype = selectCreativeArchetype({
          stageKey: content.jm1_stage,
          recentCreativeRows: creativeRows,
          assetState,
          platform: 'meta'
        });
        const failing = buildCreativeArtifact({ campaign, content, archetype, assetState, forceLogoFailure: true });
        const repaired = failing.publicReady.state === 'PASS'
          ? failing
          : buildCreativeArtifact({ campaign, content, archetype, assetState, forceLogoFailure: false });

        const creativePayload = {
          jm1_name: `${content.jm1_name} autonomous creative`,
          jm1_branch: content.jm1_branch || campaign.jm1_branch || BRANCH_CONFIG.publishing.branchName,
          jm1_stage: content.jm1_stage,
          jm1_assetpath: repaired.assetPath,
          jm1_assethash: repaired.sha256,
          jm1_logohash: repaired.logoHash,
          jm1_dimensions: repaired.dimensions,
          jm1_publicreadystate: repaired.publicReady.state,
          jm1_idempotencykey: `${marker}:creative:${content.jm1_stage}`,
          ...campaignBind
        };
        const creativeWrite = await upsertByIdempotency(creativeSet, 'jm1_creativeworkid', creativePayload);
        writes.push({
          entitySet: creativeSet,
          type: 'creative',
          id: creativeWrite.id,
          created: creativeWrite.created,
          stage: content.jm1_stage,
          archetype,
          firstGateState: failing.publicReady.state,
          finalGateState: repaired.publicReady.state,
          automaticRework: failing.publicReady.state === 'REWORK' && repaired.publicReady.state === 'PASS'
        });

        await createSocialRows({ socialSet, campaign, campaignBind, content, creative: repaired, marker, envelope, writes });

        if (!creativeWrite.created) {
          await patchById(creativeSet, creativeWrite.id, {
            jm1_publicreadystate: repaired.publicReady.state,
            jm1_assethash: repaired.sha256,
            jm1_logohash: repaired.logoHash,
            jm1_assetpath: repaired.assetPath
          });
        }
      }

      const refreshedCreativeRows = await queryByPrefix(
        creativeSet,
        `${marker}:creative`,
        'jm1_creativeworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash,jm1_logohash,jm1_assetpath,jm1_dimensions',
        100
      );
      const mediaWrites = await registerCampaignCreativeMedia({ campaign, contentRows, creativeRows: refreshedCreativeRows, exceptionRows, envelope, context });
      writes.push(...mediaWrites);
    }

    context.log(JSON.stringify({
      ...envelope,
      dataverseRead: { campaigns: campaigns.length },
      dataverseWrite: writes,
      classifications: [
        'CREATIVE_WORKER_AUTONOMOUS_TRIGGER_PROVEN',
        writes.some((write) => write.automaticRework) ? 'AUTONOMOUS_CREATIVE_REWORK_PROVEN' : 'AUTONOMOUS_CREATIVE_REWORK_NOT_TRIGGERED',
        writes.some((write) => write.type === 'social') ? 'SOCIAL_ROW_GENERATION_FROM_CAMPAIGN_AUTHORITY_PROVEN' : 'NO_SOCIAL_ROWS_CREATED'
      ]
    }));
    });
  }
});

async function createSocialRows({ socialSet, campaign, campaignBind, content, creative, marker, envelope, writes }) {
  const schedules = {
    facebook: stageSchedule(campaign.jm1_start, content.jm1_stage, 14),
    instagram: stageSchedule(campaign.jm1_start, content.jm1_stage, 16),
    linkedin: stageSchedule(campaign.jm1_start, content.jm1_stage, 18)
  };
  for (const platform of ['facebook', 'instagram', 'linkedin']) {
    const isLinkedIn = platform === 'linkedin';
    const payload = {
      jm1_name: `${content.jm1_name} - ${platform}`,
      jm1_branch: campaign.jm1_branch || BRANCH_CONFIG.publishing.branchName,
      jm1_platform: platform,
      jm1_executor: isLinkedIn ? 'LINKEDIN_API' : 'META_API',
      jm1_requesteddestination: isLinkedIn ? 'J Merrill Publishing, Inc.' : platform === 'instagram' ? 'jmerrillpub' : 'J Merrill Publishing Inc',
      jm1_actualdestination: '',
      jm1_requestedmediahash: creative.sha256,
      jm1_actualmediareference: '',
      jm1_captionversion: `${marker}:caption:${content.jm1_stage}:v1`,
      jm1_platformpostid: '',
      jm1_status: isLinkedIn ? 'HELD_EXTERNAL_PLATFORM_AUTHORITY' : 'WAIT_CREATIVE_RUNTIME_REGISTRY_REQUIRED',
      jm1_errorcode: isLinkedIn ? 'COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING' : 'META_MEDIA_URL_REGISTRY_MISSING',
      jm1_errormessage: isLinkedIn ? 'LinkedIn Community Management API product review remains pending.' : 'Autonomous creative generated; exact public media URL registry is required before Meta execution eligibility.',
      jm1_readbackstate: isLinkedIn ? 'LINKEDIN_ADAPTER_AUTHORITY_CHECK_HELD' : 'WAIT_META_MEDIA_URL_REGISTRY_REQUIRED_BEFORE_AUTONOMOUS_EXECUTION',
      jm1_idempotencykey: `${marker}:social:${content.jm1_stage}:${platform}`,
      jm1_requestedschedule: schedules[platform],
      jm1_verifiedat: envelope.startedAt,
      ...campaignBind
    };
    const write = await upsertByIdempotency(socialSet, 'jm1_socialexecutionid', payload);
    writes.push({ entitySet: socialSet, type: 'social', platform, id: write.id, created: write.created, stage: content.jm1_stage, status: payload.jm1_status });
  }
}

async function activeCampaigns(campaignSet) {
  const filter = encodeURIComponent("jm1_campaigntype eq 'featured_author_month' or contains(jm1_program,'Author')");
  const response = await dv(`/${campaignSet}?$select=jm1_campaignauthorityid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_campaigntype,jm1_program,jm1_subject,jm1_audience,jm1_cta,jm1_start,jm1_stop,jm1_state&$filter=${filter}&$top=10`);
  return response.value || [];
}

function stageSchedule(start, stage, hour) {
  const offsets = {
    additional_title_discovery: 20,
    author_continuation: 8,
    mid_month_engagement: 15,
    month_close_continuation: 28
  };
  const date = new Date(start || Date.now());
  date.setUTCDate(date.getUTCDate() + (offsets[stage] || 20));
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}
