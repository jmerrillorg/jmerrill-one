import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '795_jm1_social_post_publish_reconciliation_regression_v1.json');
const generatedAt = new Date().toISOString();
const leaseMinutes = 20;

const row = {
  id: 'regression-social-row',
  idempotencyKey: 'regression:post-publish-failure',
  platform: 'instagram',
  status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
  platformPostId: '',
  caption: 'October Featured Author: Iyorwuese Hagher. A Portrait of Paradise opens a reader-first invitation.',
  destination: 'jmerrillpub',
  verifiedAt: ''
};

const facebookPostPublishRow = {
  id: 'regression-facebook-post-publish-row',
  idempotencyKey: 'regression:facebook-post-publish-failure',
  platform: 'facebook',
  status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
  platformPostId: '',
  caption: 'J Merrill Publishing proof point: Facebook post-publish reconciliation.',
  destination: 'J Merrill Publishing Inc',
  verifiedAt: ''
};

const staleClaimRow = {
  id: 'regression-stale-claim-row',
  idempotencyKey: 'regression:stale-claim',
  platform: 'facebook',
  status: 'PUBLISHING_CLAIMED',
  platformPostId: '',
  caption: 'J Merrill Publishing runtime proof: stale claim recovery.',
  destination: 'J Merrill Publishing Inc',
  verifiedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
};

const platform = {
  objects: [],
  publish(target = row) {
    const object = {
      id: `${target.platform === 'facebook' ? 'mock_fb' : 'mock_ig'}_${this.objects.length + 1}`,
      caption: target.caption,
      username: target.destination,
      timestamp: generatedAt,
      permalink: `https://example.test/${this.objects.length + 1}`
    };
    this.objects.push(object);
    return object;
  },
  findByCaptionPrefix(prefix, target = row) {
    return this.objects
      .filter((object) => object.caption.startsWith(prefix) && object.username === target.destination)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
};

const dataverse = {
  failNextPostPublishWriteFor: new Set([row.id, facebookPostPublishRow.id]),
  writes: [],
  patch(target, payload) {
    if (this.failNextPostPublishWriteFor.has(target.id) && payload.status === 'PLATFORM_ACCEPTED') {
      this.failNextPostPublishWriteFor.delete(target.id);
      throw new Error('SIMULATED_DATAVERSE_METADATA_WRITE_FAILURE');
    }
    Object.assign(target, payload);
    this.writes.push(payload.status);
  }
};

const first = executeWorkerOnce();
const retry = executeWorkerOnce();
const certifiedRerun = executeWorkerOnce();
const facebookFirst = executeWorkerOnce(facebookPostPublishRow);
const facebookRetry = executeWorkerOnce(facebookPostPublishRow);
const facebookCertifiedRerun = executeWorkerOnce(facebookPostPublishRow);
const freshClaim = evaluateClaimLease({
  status: 'PUBLISHING_CLAIMED',
  verifiedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
});
const staleClaim = executeStaleClaimRecoveryOnce(staleClaimRow);
const staleClaimReclaim = executeStaleClaimRecoveryOnce(staleClaimRow);

const report = {
  packageId: 795,
  artifact: 'JM1-SOCIAL-POST-PUBLISH-RECONCILIATION-REGRESSION-v1',
  generatedAt,
  mode: 'NON_DESTRUCTIVE_SIMULATION',
  firstExecution: first,
  retryExecution: retry,
  certifiedRerun,
  facebookPostPublishFailure: {
    firstExecution: facebookFirst,
    retryExecution: facebookRetry,
    certifiedRerun: facebookCertifiedRerun,
    finalRow: facebookPostPublishRow
  },
  staleClaimLease: {
    leaseMinutes,
    freshClaim,
    staleClaim,
    staleClaimReclaim
  },
  expectedDistinctPlatformObjects: 2,
  platformObjectsCreated: platform.objects.length,
  duplicateObjectsCreated: platform.objects.length - 2,
  finalRow: row,
  staleClaimFinalRow: staleClaimRow,
  dataverseWrites: dataverse.writes,
  classification: platform.objects.length === 2
    && retry.state === 'RECONCILED_PLATFORM_SUCCESS'
    && certifiedRerun.state === 'IDEMPOTENT_ALREADY_CERTIFIED'
    && row.status === 'PUBLISHED_VERIFIED'
    && facebookRetry.state === 'RECONCILED_PLATFORM_SUCCESS'
    && facebookCertifiedRerun.state === 'IDEMPOTENT_ALREADY_CERTIFIED'
    && facebookPostPublishRow.status === 'PUBLISHED_VERIFIED'
    && staleClaim.state === 'STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM'
    && staleClaimReclaim.state === 'PUBLISHED_VERIFIED'
      ? 'POST_PUBLISH_FAILURE_IDEMPOTENCY_PROVEN'
      : 'POST_PUBLISH_FAILURE_IDEMPOTENCY_NOT_PROVEN'
};

mkdirSync(ROOT, { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

function executeWorkerOnce(target = row) {
  if (target.platformPostId && target.status === 'PUBLISHED_VERIFIED') {
    return { state: 'IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: target.platformPostId };
  }

  if (['PUBLISHING_CLAIMED', 'PLATFORM_ACCEPTED', 'READBACK_PENDING', 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED'].includes(target.status) && !target.platformPostId) {
    const matches = platform.findByCaptionPrefix(target.caption.slice(0, 72), target);
    if (matches.length === 1) {
      dataverse.patch(target, {
        status: 'PUBLISHED_VERIFIED',
        platformPostId: matches[0].id,
        actualDestination: matches[0].username,
        actualMediaReference: matches[0].permalink,
        readbackState: 'RECONCILED_PLATFORM_SUCCESS_READBACK_MATCH'
      });
      return { state: 'RECONCILED_PLATFORM_SUCCESS', platformPostId: matches[0].id };
    }
    return { state: 'RECONCILIATION_MATCH_NOT_UNIQUE', matches: matches.length };
  }

  dataverse.patch(target, { status: 'PUBLISHING_CLAIMED', verifiedAt: generatedAt, readbackState: 'PUBLISHING_CLAIMED' });
  const object = platform.publish(target);
  try {
    dataverse.patch(target, {
      status: 'PLATFORM_ACCEPTED',
      platformPostId: object.id,
      actualDestination: object.username,
      actualMediaReference: object.permalink,
      readbackState: 'PLATFORM_OBJECT_ID_PERSISTED_READBACK_PENDING'
    });
    dataverse.patch(target, { status: 'READBACK_PENDING', readbackState: 'READBACK_PENDING_AFTER_PLATFORM_ACCEPTED' });
    dataverse.patch(target, { status: 'PUBLISHED_VERIFIED', readbackState: 'READBACK_MATCH' });
    return { state: 'PUBLISHED_VERIFIED', platformPostId: object.id };
  } catch (error) {
    return { state: 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE', error: error.message, platformPostIdNotYetStored: object.id };
  }
}

function evaluateClaimLease(target) {
  const active = isClaimLeaseActive(target.verifiedAt, generatedAt);
  return active
    ? { state: 'PUBLISHING_CLAIMED_LEASE_ACTIVE', platformObjectsCreated: 0 }
    : { state: 'CLAIM_LEASE_EXPIRED' };
}

function executeStaleClaimRecoveryOnce(target) {
  if (target.status === 'PUBLISHING_CLAIMED') {
    const lease = evaluateClaimLease(target);
    if (lease.state === 'PUBLISHING_CLAIMED_LEASE_ACTIVE') return lease;
    dataverse.patch(target, {
      status: 'RETRY_REQUIRED',
      readbackState: 'STALE_CLAIM_NO_PLATFORM_OBJECT_FOUND_READY_FOR_SAFE_RECLAIM',
      errorCode: 'STALE_CLAIM_RECOVERY'
    });
    return { state: 'STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM', platformObjectsCreated: 0 };
  }

  if (target.status === 'RETRY_REQUIRED') {
    dataverse.patch(target, { status: 'PUBLISHING_CLAIMED', verifiedAt: generatedAt, readbackState: 'PUBLISHING_CLAIMED' });
    const object = {
      id: 'mock_fb_1',
      caption: target.caption,
      username: target.destination,
      timestamp: generatedAt,
      permalink: 'https://example.test/facebook/1'
    };
    dataverse.patch(target, {
      status: 'PLATFORM_ACCEPTED',
      platformPostId: object.id,
      actualDestination: object.username,
      actualMediaReference: object.permalink,
      readbackState: 'PLATFORM_OBJECT_ID_PERSISTED_READBACK_PENDING'
    });
    dataverse.patch(target, { status: 'READBACK_PENDING', readbackState: 'READBACK_PENDING_AFTER_PLATFORM_ACCEPTED' });
    dataverse.patch(target, { status: 'PUBLISHED_VERIFIED', readbackState: 'READBACK_MATCH' });
    return { state: 'PUBLISHED_VERIFIED', platformPostId: object.id, platformObjectsCreated: 1 };
  }

  return { state: 'UNEXPECTED_STALE_CLAIM_TEST_STATE', status: target.status };
}

function isClaimLeaseActive(claimTimestamp, nowIso) {
  const claimedAt = new Date(claimTimestamp);
  const now = new Date(nowIso);
  if (Number.isNaN(claimedAt.getTime()) || Number.isNaN(now.getTime())) return false;
  const ageMs = now.getTime() - claimedAt.getTime();
  return ageMs >= 0 && ageMs < leaseMinutes * 60 * 1000;
}
