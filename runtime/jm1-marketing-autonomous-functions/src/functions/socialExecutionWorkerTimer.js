import { app } from '@azure/functions';
import {
  AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED,
  AUTONOMOUS_META_EXECUTION_ENABLED,
  BRANCH_CONFIG,
  META_CAPTION_REGISTRY,
  META_MEDIA_URL_REGISTRY
} from '../lib/config.js';
import { entitySet, patchById, queryByPrefix } from '../lib/dataverse.js';
import { checkLinkedInAuthority } from '../lib/linkedin.js';
import { findRecentMatchingMetaObject, publishFacebookPhoto, publishInstagramPhoto, verifyMetaAuthority } from '../lib/meta.js';
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
      'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_requesteddestination,jm1_requestedmediahash,jm1_captionversion',
      100
    );

    const metaAuthority = await verifyMetaAuthority(publishing);
    const linkedinAuthority = checkLinkedInAuthority(publishing);
    const eligibleMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && row.jm1_status === 'PUBLIC_READY_SCHEDULED_ELIGIBLE'
      && !row.jm1_platformpostid
    );
    const reconciliationMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && ['PUBLISHING_CLAIMED', 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'].includes(row.jm1_status)
      && !row.jm1_platformpostid
    );
    const linkedinRows = rows.filter((row) =>
      row.jm1_platform === 'linkedin'
      && !row.jm1_platformpostid
      && ['HELD_EXTERNAL_PLATFORM_AUTHORITY', 'PUBLIC_READY_SCHEDULED_ELIGIBLE'].includes(row.jm1_status)
    );

    const writes = [];
    for (const row of reconciliationMetaRows) {
      const caption = META_CAPTION_REGISTRY[row.jm1_captionversion] || META_CAPTION_REGISTRY[row.jm1_idempotencykey];
      const captionPrefix = caption ? caption.slice(0, 72) : '';
      const existing = await findRecentMatchingMetaObject({ expected: publishing, platform: row.jm1_platform, captionPrefix });
      if (existing.ok && existing.duplicateCount === 0) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'PUBLISHED_VERIFIED',
          jm1_platformpostid: existing.platformPostId,
          jm1_actualdestination: existing.actualDestination || '',
          jm1_actualmediareference: existing.permalink || '',
          jm1_actualschedule: existing.publishedAt || envelope.startedAt,
          jm1_readbackstate: 'RECONCILED_PLATFORM_SUCCESS_READBACK_MATCH',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: '',
          jm1_errormessage: ''
        });
        writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'RECONCILED_PLATFORM_SUCCESS', platformPostId: existing.platformPostId });
      } else {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED',
          jm1_readbackstate: existing.state,
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: existing.state,
          jm1_errormessage: existing.duplicateCount > 0 ? `Duplicate platform objects detected during reconciliation: ${existing.duplicateCount}` : existing.message || ''
        });
        writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: existing.state, duplicateCount: existing.duplicateCount || 0 });
      }
    }

    for (const row of eligibleMetaRows) {
      if (!AUTONOMOUS_META_EXECUTION_ENABLED) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_readbackstate: metaAuthority.ok ? 'AUTONOMOUS_WORKER_READY_EXECUTION_FLAG_HELD' : metaAuthority.state,
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: 'READY_EXECUTION_FLAG_HELD' });
        continue;
      }

      if (!metaAuthority.ok) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_errorcode: metaAuthority.state,
          jm1_readbackstate: metaAuthority.state,
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: metaAuthority.state });
        continue;
      }

      const scheduledFor = new Date(row.jm1_requestedschedule);
      if (!Number.isNaN(scheduledFor.getTime()) && scheduledFor > new Date(envelope.startedAt)) {
        writes.push({ id: row.jm1_socialexecutionid, state: 'SCHEDULED_NOT_DUE', scheduledFor: row.jm1_requestedschedule });
        continue;
      }

      const mediaUrl = META_MEDIA_URL_REGISTRY[row.jm1_requestedmediahash] || META_MEDIA_URL_REGISTRY[row.jm1_idempotencykey];
      const caption = META_CAPTION_REGISTRY[row.jm1_captionversion] || META_CAPTION_REGISTRY[row.jm1_idempotencykey];
      if (!mediaUrl || !caption) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'HELD_CREATIVE_REFERENCE_REQUIRED',
          jm1_errorcode: 'META_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING',
          jm1_readbackstate: 'META_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING',
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: 'META_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING' });
        continue;
      }

      await patchById(socialSet, row.jm1_socialexecutionid, {
        jm1_status: 'PUBLISHING_CLAIMED',
        jm1_actualmediareference: mediaUrl,
        jm1_actualschedule: envelope.startedAt,
        jm1_executor: envelope.runId,
        jm1_readbackstate: 'PUBLISHING_CLAIMED',
        jm1_verifiedat: envelope.startedAt
      });

      const result = row.jm1_platform === 'facebook'
        ? await publishFacebookPhoto({ expected: publishing, caption, imageUrl: mediaUrl })
        : await publishInstagramPhoto({ expected: publishing, caption, imageUrl: mediaUrl });

      const patch = result.ok
        ? {
          jm1_status: 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED',
          jm1_platformpostid: result.platformPostId,
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: mediaUrl,
          jm1_actualschedule: result.publishedAt || envelope.startedAt,
          jm1_readbackstate: 'PLATFORM_OBJECT_ID_PERSISTED',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: '',
          jm1_errormessage: ''
        }
        : {
          jm1_status: result.state === 'READBACK_MISMATCH' ? 'READBACK_MISMATCH' : 'HELD_PLATFORM_API_ERROR',
          jm1_platformpostid: result.platformPostId || '',
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: mediaUrl,
          jm1_actualschedule: result.publishedAt || envelope.startedAt,
          jm1_readbackstate: result.readbackState || result.state,
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: result.state,
          jm1_errormessage: result.message || ''
        };
      await patchById(socialSet, row.jm1_socialexecutionid, patch);
      if (result.ok) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'PUBLISHED_VERIFIED',
          jm1_readbackstate: result.readbackState,
          jm1_verifiedat: envelope.startedAt
        });
      }
      writes.push({
        id: row.jm1_socialexecutionid,
        platform: row.jm1_platform,
        state: result.state,
        platformPostId: result.platformPostId || null,
        readbackState: result.readbackState || null,
        permalink: result.permalink || null,
        createdPlatformObject: result.ok
      });
    }

    const platformObjectsCreated = writes.filter((write) => write.createdPlatformObject).length;
    const alreadyCertifiedMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && row.jm1_status === 'PUBLISHED_VERIFIED'
      && row.jm1_platformpostid
    );
    for (const row of alreadyCertifiedMetaRows) {
      writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: row.jm1_platformpostid });
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
      dataverseRead: { socialRows: rows.length, eligibleMetaRows: eligibleMetaRows.length, reconciliationMetaRows: reconciliationMetaRows.length, linkedinRows: linkedinRows.length },
      dataverseWrite: writes,
      executionEnabled: {
        meta: AUTONOMOUS_META_EXECUTION_ENABLED,
        linkedin: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
      },
      platformObjectsCreated,
      reason: AUTONOMOUS_META_EXECUTION_ENABLED || AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
        ? 'One or more execution flags enabled; adapters still gate on exact row authority and platform product approval.'
        : 'Execution flag held to avoid unintended live posts while autonomous trigger proof is established.'
    }));
  }
});
