import { app } from '@azure/functions';
import { AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED, AUTONOMOUS_META_EXECUTION_ENABLED, BRANCH_CONFIG } from '../lib/config.js';
import { entitySet, patchById, queryByPrefix } from '../lib/dataverse.js';
import { checkLinkedInAuthority } from '../lib/linkedin.js';
import { verifyMetaAuthority } from '../lib/meta.js';
import { octoberIyorwueseMarker, runEnvelope } from '../lib/runtime.js';

app.timer('socialExecutionWorkerTimer', {
  schedule: process.env.JM1_SOCIAL_EXECUTION_WORKER_CRON || '0 */15 * * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_SOCIAL_EXECUTION_WORKER', timer, context);
    const socialSet = await entitySet('jm1_socialexecution');
    const marker = octoberIyorwueseMarker();
    const publishing = BRANCH_CONFIG.publishing;
    const rows = await queryByPrefix(
      socialSet,
      `${marker}:social`,
      'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_requesteddestination',
      100
    );

    const metaAuthority = await verifyMetaAuthority(publishing);
    const linkedinAuthority = checkLinkedInAuthority(publishing);
    const eligibleMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && row.jm1_status === 'PUBLIC_READY_SCHEDULED_ELIGIBLE'
      && !row.jm1_platformpostid
    );
    const linkedinRows = rows.filter((row) =>
      row.jm1_platform === 'linkedin'
      && !row.jm1_platformpostid
      && ['HELD_EXTERNAL_PLATFORM_AUTHORITY', 'PUBLIC_READY_SCHEDULED_ELIGIBLE'].includes(row.jm1_status)
    );

    const writes = [];
    for (const row of eligibleMetaRows) {
      if (!AUTONOMOUS_META_EXECUTION_ENABLED) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_readbackstate: metaAuthority.ok ? 'AUTONOMOUS_WORKER_READY_EXECUTION_FLAG_HELD' : metaAuthority.state,
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: 'READY_EXECUTION_FLAG_HELD' });
      }
    }
    for (const row of linkedinRows) {
      if (!AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED || !linkedinAuthority.ok) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'HELD_EXTERNAL_PLATFORM_AUTHORITY',
          jm1_errorcode: linkedinAuthority.state,
          jm1_readbackstate: 'LINKEDIN_ADAPTER_AUTHORITY_CHECK_HELD',
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: linkedinAuthority.state });
      }
    }

    context.log(JSON.stringify({
      ...envelope,
      metaAuthority,
      linkedinAuthority,
      dataverseRead: { socialRows: rows.length, eligibleMetaRows: eligibleMetaRows.length, linkedinRows: linkedinRows.length },
      dataverseWrite: writes,
      executionEnabled: {
        meta: AUTONOMOUS_META_EXECUTION_ENABLED,
        linkedin: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
      },
      platformObjectsCreated: 0,
      reason: AUTONOMOUS_META_EXECUTION_ENABLED || AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
        ? 'One or more execution flags enabled; adapters still gate on exact row authority and platform product approval.'
        : 'Execution flag held to avoid unintended live posts while autonomous trigger proof is established.'
    }));
  }
});
