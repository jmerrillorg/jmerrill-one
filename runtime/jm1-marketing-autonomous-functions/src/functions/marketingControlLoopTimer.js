import { app } from '@azure/functions';
import { BRANCH_CONFIG } from '../lib/config.js';
import { entitySet, queryByPrefix, safeCount, upsertByIdempotency } from '../lib/dataverse.js';
import { activeBranches, isoNow, octoberIyorwueseMarker, runEnvelope } from '../lib/runtime.js';

app.timer('marketingControlLoopTimer', {
  schedule: process.env.JM1_MARKETING_CONTROL_LOOP_CRON || '0 17 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP', timer, context);
    const controlSet = await entitySet('jm1_marketingcontrolloop');
    const socialSet = await entitySet('jm1_socialexecution');
    const credentialSet = await entitySet('jm1_credentialmonitor');
    const journeySet = await entitySet('jm1_journeyexecution');
    const marker = octoberIyorwueseMarker();

    const dynamicsCounts = {
      journeys: await safeCount('msdynmkt_journeys'),
      journeyTemplates: await safeCount('msdynmkt_journeytemplates'),
      emails: await safeCount('msdynmkt_emails'),
      segments: await safeCount('msdynmkt_segments'),
      topics: await safeCount('msdynmkt_topics'),
      contactPointConsents: await safeCount('msdynmkt_contactpointconsents')
    };

    const socialRows = await queryByPrefix(
      socialSet,
      `${marker}:social`,
      'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule',
      100
    );
    const credentialRows = await queryByPrefix(
      credentialSet,
      `${marker}:credential`,
      'jm1_credentialmonitorid,jm1_idempotencykey,jm1_currentcredentialstate,jm1_rotationdueat,jm1_expiresat,jm1_exceptioncode',
      50
    );
    const journeyRows = await queryByPrefix(
      journeySet,
      `${marker}:journey`,
      'jm1_journeyexecutionid,jm1_idempotencykey,jm1_state,jm1_dynamicsjourneyid',
      50
    );

    const branches = activeBranches(BRANCH_CONFIG);
    const metaReady = socialRows.some((row) => ['facebook', 'instagram'].includes(row.jm1_platform) && row.jm1_platformpostid);
    const dynamicsReady = Object.values(dynamicsCounts).every((item) => item.available && item.count > 0);
    const decision = dynamicsReady ? 'CONTINUE_LIFECYCLE_RUNTIME' : 'HOLD_DYNAMICS_CONTROLLED_JOURNEY_REQUIRED';

    const payload = {
      jm1_name: 'Autonomous Marketing Control Loop - daily runtime',
      jm1_branch: branches.map((branch) => branch.branchName).join('; '),
      jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
      jm1_horizon30day: metaReady ? 'META_PROVEN_CONTINUE_OCTOBER_CONTROL_LOOP' : 'META_PROOF_NOT_FOUND',
      jm1_horizon14day: 'BRANCH_AWARE_ACTIVE_PUBLISHING_ONLY',
      jm1_horizon7day: dynamicsReady ? 'DYNAMICS_READY' : 'DYNAMICS_HELD_SAFE_RUNTIME_BOUNDARY',
      jm1_featuredauthorintroeligible: 'NO_ALREADY_PUBLISHED',
      jm1_fatiguecheck: 'Intro already exists; next stage must not repeat the Featured Author introduction.',
      jm1_controldecision: decision,
      jm1_unresolvedprerequisites: dynamicsReady ? 'LINKEDIN_API_EXTERNAL_DEPENDENCY' : 'DYNAMICS_JOURNEY_SAFE_RUNTIME_BOUNDARY; LINKEDIN_API_EXTERNAL_DEPENDENCY',
      jm1_state: 'AUTONOMOUS_TRIGGER_PROVEN_BOUNDARY_HELD',
      jm1_idempotencykey: `${marker}:autonomous:control-loop:daily`,
      jm1_evaluatedat: envelope.startedAt
    };

    const write = await upsertByIdempotency(controlSet, 'jm1_marketingcontrolloopid', payload);

    context.log(JSON.stringify({
      ...envelope,
      dataverseRead: { socialRows: socialRows.length, credentialRows: credentialRows.length, journeyRows: journeyRows.length, dynamicsCounts },
      dataverseWrite: { entitySet: controlSet, id: write.id, created: write.created },
      decision
    }));
  }
});
