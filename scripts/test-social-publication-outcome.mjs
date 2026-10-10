import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ambiguousPublicationException,
  classifyProviderScheduleEvidence,
  isAmbiguousPublicationOutcome,
  reconcileProviderPublication
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/publicationOutcome.js';

const expected = {
  sourceRecordId: 'social-row-1',
  idempotencyKey: 'marketing:financial:facebook:oct-5',
  destinationId: '1270611542802820',
  scheduledAt: '2026-10-05T14:00:00.000Z',
  captionSha256: 'caption-sha-1'
};
const observed = {
  source: 'META_NATIVE_UI',
  observedAt: '2026-10-10T12:00:00.000Z',
  destinationId: expected.destinationId,
  captionSha256: expected.captionSha256
};

test('network and post-readback uncertainty are never auto-retryable', () => {
  assert.equal(isAmbiguousPublicationOutcome({ state: 'FACEBOOK_PUBLISH_OUTCOME_AMBIGUOUS' }), true);
  assert.equal(isAmbiguousPublicationOutcome({ state: 'FACEBOOK_READBACK_FAILED' }), true);
  assert.equal(isAmbiguousPublicationOutcome({ state: 'INSTAGRAM_PUBLISH_OUTCOME_AMBIGUOUS' }), true);
  assert.equal(isAmbiguousPublicationOutcome({ state: 'FACEBOOK_PUBLISH_FAILED' }), false);
  assert.equal(reconcileProviderPublication({ state: 'NO_RECENT_FACEBOOK_MATCH_FOUND' }).repostAllowed, false);
});

test('one exact provider post resolves without repost; duplicate matches stay ambiguous', () => {
  const exact = reconcileProviderPublication({ ok: true, duplicateCount: 0, platformPostId: 'fb-1' });
  assert.deepEqual(exact, { state: 'PUBLISHED_VERIFIED', repostAllowed: false, resolutionState: 'RESOLVED' });
  const duplicate = reconcileProviderPublication({ ok: true, duplicateCount: 1, platformPostId: 'fb-1' });
  assert.equal(duplicate.state, 'AMBIGUOUS_PUBLICATION_OUTCOME');
  assert.equal(duplicate.repostAllowed, false);
  assert.equal(duplicate.providerReadback, 'DUPLICATE_PROVIDER_MATCHES');
});

test('missing, moved, and recovered provider schedules create distinct non-reposting dispositions', () => {
  const missing = classifyProviderScheduleEvidence({ expected, observed: { ...observed, state: 'MISSING' } });
  assert.deepEqual(missing, { state: 'PROVIDER_SCHEDULE_MISSING', exceptionState: 'OPEN', repostAllowed: false });

  const moved = classifyProviderScheduleEvidence({ expected, observed: {
    ...observed, state: 'SCHEDULED', scheduledAt: '2026-10-08T14:00:00.000Z'
  } });
  assert.deepEqual(moved, { state: 'PROVIDER_SCHEDULE_MOVED', exceptionState: 'OPEN', repostAllowed: false });

  const recovered = classifyProviderScheduleEvidence({ expected, observed: {
    ...observed, state: 'PUBLISHED', platformPostId: '122120555949442868', publishedAt: '2026-10-08T14:01:00.000Z'
  } });
  assert.deepEqual(recovered, { state: 'PROVIDER_PUBLISHED_AFTER_SCHEDULE', exceptionState: 'RESOLVED', repostAllowed: false });
});

test('ambiguous exception keys are stable across replays and exclude caption content', () => {
  const row = {
    jm1_socialexecutionid: 'social-row-1',
    jm1_idempotencykey: expected.idempotencyKey,
    jm1_branch: 'J Merrill Financial',
    jm1_name: 'Financial Facebook October post',
    jm1_attemptcount: 2
  };
  const envelope = { startedAt: '2026-10-10T12:00:00.000Z', correlationId: 'corr-1' };
  const first = ambiguousPublicationException({ row, envelope, resultState: 'NO_RECENT_FACEBOOK_MATCH_FOUND' });
  const replay = ambiguousPublicationException({ row, envelope: { ...envelope, correlationId: 'corr-2' }, resultState: 'NO_RECENT_FACEBOOK_MATCH_FOUND' });
  assert.equal(first.jm1_idempotencykey, replay.jm1_idempotencykey);
  assert.equal(first.jm1_resolutionstate, 'OPEN');
  assert.equal(first.jm1_reason.includes(expected.captionSha256), false);
  assert.equal(first.jm1_reason.includes('caption text'), false);

  const resolved = ambiguousPublicationException({ row, envelope, resultState: 'EXACT_PROVIDER_POST_MATCH', resolutionState: 'RESOLVED' });
  assert.equal(resolved.jm1_idempotencykey, first.jm1_idempotencykey);
  assert.equal(resolved.jm1_resolutionstate, 'RESOLVED');
});

test('unverified destination or content never counts as provider recovery', () => {
  const mismatch = classifyProviderScheduleEvidence({ expected, observed: {
    ...observed, state: 'PUBLISHED', platformPostId: 'wrong-post', destinationId: 'other'
  } });
  assert.equal(mismatch.state, 'AMBIGUOUS_PUBLICATION_OUTCOME');
  assert.equal(mismatch.exceptionState, 'OPEN');
  assert.equal(mismatch.repostAllowed, false);
});

test('worker completion telemetry does not reference the removed platform-ID recovery counter', async () => {
  const { readFile } = await import('node:fs/promises');
  const worker = await readFile(new URL('../runtime/jm1-marketing-autonomous-functions/src/functions/socialExecutionWorkerTimer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(worker, /\bplatformIdRecoveryRows\b/);
});
