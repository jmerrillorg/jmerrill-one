import { app } from '@azure/functions';
import {
  AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED,
  AUTONOMOUS_META_EXECUTION_ENABLED,
  BRANCH_CONFIG,
  META_CAPTION_REGISTRY,
  META_MEDIA_URL_REGISTRY,
  SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES
} from '../lib/config.js';
import { entitySet, patchById, queryByPrefix, upsertByIdempotency } from '../lib/dataverse.js';
import { classifyFailure, deadLetterRecord } from '../lib/failurePolicy.js';
import { checkLinkedInAuthority, findRecentMatchingLinkedInPost, publishLinkedInOrganizationImagePost } from '../lib/linkedin.js';
import { lookupMediaUrlByHash } from '../lib/mediaRegistry.js';
import { findRecentMatchingMetaObject, publishFacebookPhoto, publishInstagramPhoto, verifyMetaAuthority } from '../lib/meta.js';
import { currentFeaturedAuthorMarker, runEnvelope } from '../lib/runtime.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';

app.timer('socialExecutionWorkerTimer', {
  schedule: process.env.JM1_SOCIAL_EXECUTION_WORKER_CRON || '0 */15 * * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_SOCIAL_EXECUTION_WORKER', timer, context);
    return withDistributedTimerLease('social-execution-worker', envelope, context, async () => {
    const socialSet = await entitySet('jm1_socialexecution');
    const marker = process.env.JM1_SOCIAL_EXECUTION_MARKER || currentFeaturedAuthorMarker(new Date(envelope.startedAt));
    if (!marker) {
      context.log(JSON.stringify({
        ...envelope,
        state: 'NO_CURRENT_FEATURED_AUTHOR_AUTHORITY',
        dataverseWrite: []
      }));
      return;
    }
    const publishing = BRANCH_CONFIG.publishing;
    const rows = await queryByPrefix(
      socialSet,
      `${marker}:social`,
      'jm1_socialexecutionid,jm1_name,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_requesteddestination,jm1_requestedmediahash,jm1_actualmediareference,jm1_captionversion,jm1_verifiedat,jm1_executor,jm1_attemptcount,jm1_lastattemptat,jm1_nextretryat,jm1_correlationid,jm1_failurecategory,jm1_exceptionowner',
      100
    );
    const contentRows = await queryByPrefix(
      await entitySet('jm1_contentwork'),
      `${marker}:content`,
      'jm1_contentworkid,jm1_idempotencykey,jm1_stage,jm1_draftcopy,jm1_publicreadystate',
      100
    );

    const metaAuthority = await verifyMetaAuthority(publishing);
    const linkedinAuthority = checkLinkedInAuthority(publishing);
    const eligibleMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && ['PUBLIC_READY_SCHEDULED_ELIGIBLE', 'RETRY_REQUIRED'].includes(row.jm1_status)
      && !row.jm1_platformpostid
      && retryIsDue(row.jm1_nextretryat, envelope.startedAt)
    );
    const reconciliationMetaRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && [
        'PUBLISHING_CLAIMED',
        'PLATFORM_ACCEPTED',
        'READBACK_PENDING',
        'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'
      ].includes(row.jm1_status)
      && !row.jm1_platformpostid
    );
    const platformIdRecoveryRows = rows.filter((row) =>
      ['facebook', 'instagram'].includes(row.jm1_platform)
      && ['PLATFORM_ACCEPTED', 'READBACK_PENDING', 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'].includes(row.jm1_status)
      && row.jm1_platformpostid
    );
    const linkedinRows = rows.filter((row) =>
      row.jm1_platform === 'linkedin'
      && !row.jm1_platformpostid
      && [
        'HELD_EXTERNAL_PLATFORM_AUTHORITY',
        'PUBLIC_READY_SCHEDULED_ELIGIBLE',
        'RETRY_REQUIRED',
        'PUBLISHING_CLAIMED',
        'PLATFORM_ACCEPTED',
        'READBACK_PENDING',
        'LINKEDIN_PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'
      ].includes(row.jm1_status)
    );

    const writes = [];
    for (const row of reconciliationMetaRows) {
      const freshClaim = row.jm1_status === 'PUBLISHING_CLAIMED'
        && isClaimLeaseActive(row.jm1_verifiedat, envelope.startedAt);
      if (freshClaim) {
        writes.push({
          id: row.jm1_socialexecutionid,
          platform: row.jm1_platform,
          state: 'PUBLISHING_CLAIMED_LEASE_ACTIVE',
          claimOwner: row.jm1_executor || null,
          claimTimestamp: row.jm1_verifiedat || null
        });
        continue;
      }

      const caption = resolveCaption(row, contentRows);
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
      } else if (row.jm1_status === 'PUBLISHING_CLAIMED') {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'RETRY_REQUIRED',
          jm1_readbackstate: 'STALE_CLAIM_NO_PLATFORM_OBJECT_FOUND_READY_FOR_SAFE_RECLAIM',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: 'STALE_CLAIM_RECOVERY',
          jm1_errormessage: 'Claim lease expired; no matching platform object found during reconciliation. Row is eligible for safe reclaim on a later worker tick.'
        });
        writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM' });
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

    for (const row of platformIdRecoveryRows) {
      await patchById(socialSet, row.jm1_socialexecutionid, {
        jm1_status: 'PUBLISHED_VERIFIED',
        jm1_readbackstate: 'PLATFORM_ID_PRESENT_PROMOTED_WITHOUT_REPUBLISH',
        jm1_verifiedat: envelope.startedAt,
        jm1_errorcode: '',
        jm1_errormessage: ''
      });
      writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'PLATFORM_ID_PRESENT_PROMOTED_WITHOUT_REPUBLISH', platformPostId: row.jm1_platformpostid });
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

      const mediaUrl = row.jm1_actualmediareference
        || META_MEDIA_URL_REGISTRY[row.jm1_requestedmediahash]
        || META_MEDIA_URL_REGISTRY[row.jm1_idempotencykey]
        || await lookupMediaUrlByHash(row.jm1_requestedmediahash);
      const caption = resolveCaption(row, contentRows);
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
        jm1_executor: claimOwner(envelope),
        jm1_attemptcount: Number(row.jm1_attemptcount || 0) + 1,
        jm1_lastattemptat: envelope.startedAt,
        jm1_correlationid: envelope.correlationId,
        jm1_readbackstate: 'PUBLISHING_CLAIMED',
        jm1_verifiedat: envelope.startedAt
      });

      const result = row.jm1_platform === 'facebook'
        ? await publishFacebookPhoto({ expected: publishing, caption, imageUrl: mediaUrl })
        : await publishInstagramPhoto({ expected: publishing, caption, imageUrl: mediaUrl });

      const failure = result.ok ? null : classifyFailure({
        attempts: Number(row.jm1_attemptcount || 0) + 1,
        maxAttempts: Number(process.env.JM1_SOCIAL_MAX_ATTEMPTS || 3),
        category: result.state,
        retryable: result.state !== 'READBACK_MISMATCH'
      });
      const patch = result.ok
        ? {
          jm1_status: 'PLATFORM_ACCEPTED',
          jm1_platformpostid: result.platformPostId,
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: mediaUrl,
          jm1_actualschedule: result.publishedAt || envelope.startedAt,
          jm1_readbackstate: 'PLATFORM_OBJECT_ID_PERSISTED_READBACK_PENDING',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: '',
          jm1_errormessage: ''
        }
        : {
          jm1_status: failure.state === 'DEAD_LETTERED' ? 'DEAD_LETTERED' : 'RETRY_REQUIRED',
          jm1_platformpostid: result.platformPostId || '',
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: mediaUrl,
          jm1_actualschedule: result.publishedAt || envelope.startedAt,
          jm1_readbackstate: result.readbackState || result.state,
          jm1_attemptcount: failure.attempts,
          jm1_lastattemptat: envelope.startedAt,
          jm1_nextretryat: failure.retryAfterMinutes ? addMinutes(envelope.startedAt, failure.retryAfterMinutes) : null,
          jm1_correlationid: envelope.correlationId,
          jm1_failurecategory: result.state,
          jm1_exceptionowner: 'JM1 marketing runtime operator',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: result.state,
          jm1_errormessage: result.message || ''
        };
      await patchById(socialSet, row.jm1_socialexecutionid, patch);
      if (failure?.state === 'DEAD_LETTERED') {
        const exceptionSet = await entitySet('jm1_marketingexception');
        const exception = deadLetterRecord({
          envelope,
          worker: 'social-execution-worker',
          branch: row.jm1_branch || BRANCH_CONFIG.publishing.branchName,
          campaign: row.jm1_name,
          category: result.state,
          attempts: failure.attempts,
          message: result.message || result.state,
          owner: 'JM1 marketing runtime operator'
        });
        exception.jm1_attemptcount = failure.attempts;
        exception.jm1_correlationid = envelope.correlationId;
        exception.jm1_worker = 'social-execution-worker';
        exception.jm1_lastfailureat = envelope.startedAt;
        exception.jm1_exceptionowner = 'JM1 marketing runtime operator';
        await upsertByIdempotency(exceptionSet, 'jm1_marketingexceptionid', exception);
      }
      if (result.ok) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'READBACK_PENDING',
          jm1_readbackstate: 'READBACK_PENDING_AFTER_PLATFORM_ACCEPTED',
          jm1_verifiedat: envelope.startedAt
        });
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
        continue;
      }

      const freshClaim = row.jm1_status === 'PUBLISHING_CLAIMED'
        && isClaimLeaseActive(row.jm1_verifiedat, envelope.startedAt);
      if (freshClaim) {
        writes.push({
          id: row.jm1_socialexecutionid,
          platform: row.jm1_platform,
          state: 'PUBLISHING_CLAIMED_LEASE_ACTIVE',
          claimOwner: row.jm1_executor || null,
          claimTimestamp: row.jm1_verifiedat || null
        });
        continue;
      }

      const caption = resolveCaption(row, contentRows);
      const captionPrefix = caption ? caption.slice(0, 72) : '';
      if (['PUBLISHING_CLAIMED', 'PLATFORM_ACCEPTED', 'READBACK_PENDING', 'LINKEDIN_PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'].includes(row.jm1_status)) {
        const existing = await findRecentMatchingLinkedInPost({
          organizationId: publishing.linkedinOrganizationId,
          captionPrefix
        });
        if (existing.ok && existing.duplicateCount === 0) {
          await patchById(socialSet, row.jm1_socialexecutionid, {
            jm1_status: 'PUBLISHED_VERIFIED',
            jm1_platformpostid: existing.platformPostId,
            jm1_actualdestination: existing.actualDestination || '',
            jm1_actualmediareference: existing.permalink || '',
            jm1_actualschedule: existing.publishedAt ? new Date(existing.publishedAt).toISOString() : envelope.startedAt,
            jm1_readbackstate: 'LINKEDIN_RECONCILED_PLATFORM_SUCCESS_READBACK_MATCH',
            jm1_verifiedat: envelope.startedAt,
            jm1_errorcode: '',
            jm1_errormessage: ''
          });
          writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'LINKEDIN_RECONCILED_PLATFORM_SUCCESS', platformPostId: existing.platformPostId });
        } else if (row.jm1_status === 'PUBLISHING_CLAIMED') {
          await patchById(socialSet, row.jm1_socialexecutionid, {
            jm1_status: 'RETRY_REQUIRED',
            jm1_readbackstate: 'LINKEDIN_STALE_CLAIM_NO_PLATFORM_OBJECT_FOUND_READY_FOR_SAFE_RECLAIM',
            jm1_verifiedat: envelope.startedAt,
            jm1_errorcode: 'LINKEDIN_STALE_CLAIM_RECOVERY',
            jm1_errormessage: 'Claim lease expired; no matching LinkedIn platform object found during reconciliation. Row is eligible for safe reclaim on a later worker tick.'
          });
          writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'LINKEDIN_STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM' });
        } else {
          await patchById(socialSet, row.jm1_socialexecutionid, {
            jm1_status: 'LINKEDIN_PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED',
            jm1_readbackstate: existing.state,
            jm1_verifiedat: envelope.startedAt,
            jm1_errorcode: existing.state,
            jm1_errormessage: existing.duplicateCount > 0 ? `Duplicate LinkedIn platform objects detected during reconciliation: ${existing.duplicateCount}` : existing.message || ''
          });
          writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: existing.state, duplicateCount: existing.duplicateCount || 0 });
        }
        continue;
      }

      const scheduledFor = new Date(row.jm1_requestedschedule);
      if (!Number.isNaN(scheduledFor.getTime()) && scheduledFor > new Date(envelope.startedAt)) {
        writes.push({ id: row.jm1_socialexecutionid, state: 'LINKEDIN_SCHEDULED_NOT_DUE', scheduledFor: row.jm1_requestedschedule });
        continue;
      }

      const mediaUrl = row.jm1_actualmediareference
        || await lookupMediaUrlByHash(row.jm1_requestedmediahash);
      if (!mediaUrl || !caption) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'HELD_CREATIVE_REFERENCE_REQUIRED',
          jm1_errorcode: 'LINKEDIN_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING',
          jm1_readbackstate: 'LINKEDIN_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING',
          jm1_verifiedat: envelope.startedAt
        });
        writes.push({ id: row.jm1_socialexecutionid, state: 'LINKEDIN_EXACT_MEDIA_OR_CAPTION_REGISTRY_MISSING' });
        continue;
      }

      await patchById(socialSet, row.jm1_socialexecutionid, {
        jm1_status: 'PUBLISHING_CLAIMED',
        jm1_actualmediareference: mediaUrl,
        jm1_actualschedule: envelope.startedAt,
        jm1_executor: claimOwner(envelope),
        jm1_readbackstate: 'LINKEDIN_PUBLISHING_CLAIMED',
        jm1_verifiedat: envelope.startedAt
      });

      const result = await publishLinkedInOrganizationImagePost({
        expected: publishing,
        caption,
        imageUrl: mediaUrl,
        altText: `J Merrill Publishing approved social creative for ${row.jm1_name || row.jm1_captionversion || 'campaign post'}.`
      });
      const patch = result.ok
        ? {
          jm1_status: 'PLATFORM_ACCEPTED',
          jm1_platformpostid: result.platformPostId,
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: result.actualMediaReference || mediaUrl,
          jm1_actualschedule: result.publishedAt ? new Date(result.publishedAt).toISOString() : envelope.startedAt,
          jm1_readbackstate: 'LINKEDIN_PLATFORM_OBJECT_ID_PERSISTED_READBACK_PENDING',
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: '',
          jm1_errormessage: ''
        }
        : {
          jm1_status: result.state === 'READBACK_MISMATCH' ? 'READBACK_MISMATCH' : 'HELD_PLATFORM_API_ERROR',
          jm1_platformpostid: result.platformPostId || '',
          jm1_actualdestination: result.actualDestination || '',
          jm1_actualmediareference: result.actualMediaReference || mediaUrl,
          jm1_actualschedule: result.publishedAt ? new Date(result.publishedAt).toISOString() : envelope.startedAt,
          jm1_readbackstate: result.readbackState || result.state,
          jm1_verifiedat: envelope.startedAt,
          jm1_errorcode: result.state,
          jm1_errormessage: result.message || ''
        };
      await patchById(socialSet, row.jm1_socialexecutionid, patch);
      if (result.ok) {
        await patchById(socialSet, row.jm1_socialexecutionid, {
          jm1_status: 'READBACK_PENDING',
          jm1_readbackstate: 'LINKEDIN_READBACK_PENDING_AFTER_PLATFORM_ACCEPTED',
          jm1_verifiedat: envelope.startedAt
        });
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

    const alreadyCertifiedLinkedInRows = rows.filter((row) =>
      row.jm1_platform === 'linkedin'
      && row.jm1_status === 'PUBLISHED_VERIFIED'
      && row.jm1_platformpostid
    );
    for (const row of alreadyCertifiedLinkedInRows) {
      writes.push({ id: row.jm1_socialexecutionid, platform: row.jm1_platform, state: 'LINKEDIN_IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: row.jm1_platformpostid });
    }

    const platformObjectsCreated = writes.filter((write) => write.createdPlatformObject).length;

    context.log(JSON.stringify({
      ...envelope,
      metaAuthority,
      linkedinAuthority,
      dataverseRead: {
        socialRows: rows.length,
        eligibleMetaRows: eligibleMetaRows.length,
        reconciliationMetaRows: reconciliationMetaRows.length,
        platformIdRecoveryRows: platformIdRecoveryRows.length,
        linkedinRows: linkedinRows.length
      },
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
    });
  }
});

function isClaimLeaseActive(claimTimestamp, nowIso) {
  const claimedAt = new Date(claimTimestamp);
  const now = new Date(nowIso);
  if (Number.isNaN(claimedAt.getTime()) || Number.isNaN(now.getTime())) return false;
  const ageMs = now.getTime() - claimedAt.getTime();
  return ageMs >= 0 && ageMs < SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES * 60 * 1000;
}

function claimOwner(envelope) {
  return `CLAIM:${envelope.correlationId}`;
}

function retryIsDue(nextRetryAt, nowIso) {
  if (!nextRetryAt) return true;
  const retryAt = new Date(nextRetryAt);
  const now = new Date(nowIso);
  return Number.isNaN(retryAt.getTime()) || retryAt <= now;
}

function addMinutes(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60 * 1000).toISOString();
}

function resolveCaption(row, contentRows) {
  const registered = META_CAPTION_REGISTRY[row.jm1_captionversion] || META_CAPTION_REGISTRY[row.jm1_idempotencykey];
  if (registered) return registered;
  const stage = String(row.jm1_idempotencykey || '').split(':social:')[1]?.split(':')[0] || '';
  const content = contentRows.find((item) => item.jm1_stage === stage && item.jm1_publicreadystate === 'PASS');
  return content?.jm1_draftcopy || '';
}
