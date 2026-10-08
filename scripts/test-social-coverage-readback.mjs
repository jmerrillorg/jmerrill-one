import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildSocialCoverageReadback, classifyDataverseExecutionRow, mapDataverseSocialRows, retainNativeEvidenceItems } from './lib/social-coverage-readback.mjs';

const channel = {
  brand: 'J Merrill Publishing', platform: 'facebook', destinationId: '307480763084670',
  executionOwner: 'AZURE_WORKER', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' }
};
const base = { asOf: '2026-10-02T16:00:00Z', channels: [channel], items: [] };

test('API requests and approved content never count as native bookings', () => {
  const result = buildSocialCoverageReadback({ ...base, items: [
    { id: 'row-1', brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId,
      kind: 'API_REQUEST', status: 'HELD_CAMPAIGN', scheduledAt: '2026-10-03T14:00:00Z' },
    { id: 'content-1', brand: channel.brand, platform: channel.platform, kind: 'CONTENT', approvalState: 'APPROVED' }
  ] }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.apiRequests, 1);
  assert.equal(result.approvedContentNotBooked, 1);
  assert.deepEqual(result.heldItems, ['row-1']);
  assert.ok(result.states.includes('ROLLING_COVERAGE_GAP'));
});

test('only exact approved native bookings count and collide with matching API request', () => {
  const booking = { id: 'native-1', brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId,
    kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', nativeBookingId: 'meta-1',
    scheduledAt: '2026-10-03T14:00:00Z', contentKey: 'october:spotlight:1' };
  const result = buildSocialCoverageReadback({ ...base, channels: [{ ...channel, executionOwner: 'META_NATIVE' }], items: [booking,
    { ...booking, id: 'wrong-destination', destinationId: 'other' },
    { id: 'api-1', brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId,
      kind: 'API_REQUEST', status: 'HELD_CAMPAIGN', contentKey: booking.contentKey }
  ] }).channels[0];
  assert.equal(result.verifiedBookings, 1);
  assert.equal(result.nextVerifiedBooking, booking.scheduledAt);
  assert.deepEqual(result.duplicateRisk, ['native-1']);
});

test('native booking on worker-owned channel is counted but exposes mixed authority', () => {
  const result = buildSocialCoverageReadback({ ...base, items: [
    { id: 'native-2', brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId,
      kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', nativeBookingId: 'meta-2',
      scheduledAt: '2026-10-03T14:00:00Z', contentKey: 'other' }
  ] }).channels[0];
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 1);
  assert.deepEqual(result.duplicateRisk, []);
  assert.deepEqual(result.mixedChannelAuthority, ['native-2']);
  assert.ok(result.states.includes('MIXED_CHANNEL_EXECUTION_AUTHORITY'));
});

test('LinkedIn UI proof counts a schedule but not unapproved coverage', () => {
  const captionText = 'Exact observed caption';
  const item = { id: 'li-1', brand: channel.brand, platform: 'linkedin', destinationId: '13048648',
    kind: 'NATIVE_BOOKING', approvalState: 'HELD', scheduledAt: '2026-10-08T15:00:00Z', captionText,
    nativeEvidence: { source: 'LINKEDIN_NATIVE_UI', observedDateET: '2026-10-02',
      scheduledAt: '2026-10-08T15:00:00Z',
      captionSha256: createHash('sha256').update(captionText).digest('hex') } };
  const result = buildSocialCoverageReadback({ ...base, channels: [{ ...channel,
    platform: 'linkedin', destinationId: '13048648', executionOwner: 'LINKEDIN_NATIVE' }],
  items: [item, { ...item, id: 'draft', kind: 'NATIVE_DRAFT' },
    { ...item, id: 'missing-proof', nativeEvidence: null },
    { ...item, id: 'wrong-hash', captionText: 'Changed caption' }] }).channels[0];
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.unapprovedScheduled, ['li-1']);
  assert.equal(result.nativeBookingRows[0].nativeBookingId, null);
  assert.ok(result.states.includes('UNAPPROVED_NATIVE_SCHEDULE'));
});

test('same-day Meta UI proof counts only the exact destination, caption, and time', () => {
  const captionText = 'Exact scheduled Meta caption';
  const item = { id: 'meta-1', brand: channel.brand, platform: 'facebook', destinationId: channel.destinationId,
    kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', scheduledAt: '2026-10-03T14:00:00Z', captionText,
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-02',
      scheduledAt: '2026-10-03T14:00:00Z', captionSha256: createHash('sha256').update(captionText).digest('hex') } };
  const result = buildSocialCoverageReadback({ ...base, channels: [{ ...channel, executionOwner: 'META_NATIVE' }],
    items: [item, { ...item, id: 'wrong-caption', captionText: 'Different caption' },
      { ...item, id: 'stale-ui', nativeEvidence: { ...item.nativeEvidence, observedDateET: '2026-10-01' } }] }).channels[0];
  assert.equal(result.verifiedBookings, 1);
  assert.equal(result.nativeBookingRows[0].proof, 'META_NATIVE_UI');
});

test('native Instagram handle proof counts without equating two unresolved numeric IDs', () => {
  const instagram = { brand: 'J Merrill One', platform: 'instagram', destinationId: null,
    destinationHandle: 'jmerrillone', executionOwner: 'META_NATIVE',
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' } };
  const booking = { brand: instagram.brand, platform: instagram.platform, destinationId: null,
    destinationHandle: instagram.destinationHandle, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
    nativeBookingId: 'ig-1', scheduledAt: '2026-10-07T16:00:00Z' };
  const result = buildSocialCoverageReadback({ ...base, channels: [instagram], items: [booking,
    { ...booking, nativeBookingId: 'wrong-ig', destinationHandle: 'other' },
    { ...booking, nativeBookingId: 'no-handle', destinationHandle: null }] }).channels[0];
  assert.equal(result.verifiedBookings, 1);
  assert.equal(result.destinationHandle, 'jmerrillone');
  assert.ok(result.states.includes('NUMERIC_DESTINATION_ID_UNVERIFIED'));
  assert.ok(!result.states.includes('DESTINATION_AUTHORITY_UNRESOLVED'));
});

test('fresh Meta UI proof can verify Instagram by exact handle when numeric ID is hidden', () => {
  const instagram = { brand: 'J Merrill Financial', platform: 'instagram', destinationId: null,
    destinationHandle: 'jmerrillfin', executionOwner: 'META_NATIVE',
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08' } };
  const captionText = 'Exact Financial Instagram caption';
  const booking = { id: 'fin-ig-1', brand: instagram.brand, platform: instagram.platform,
    destinationId: null, destinationHandle: instagram.destinationHandle, kind: 'NATIVE_BOOKING',
    approvalState: 'APPROVED', scheduledAt: '2026-10-16T16:00:00Z', captionText,
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-08',
      scheduledAt: '2026-10-16T16:00:00Z', captionSha256: createHash('sha256').update(captionText).digest('hex') } };
  const result = buildSocialCoverageReadback({ ...base, asOf: '2026-10-08T16:00:00Z',
    channels: [instagram], items: [booking] }).channels[0];
  assert.equal(result.verifiedBookings, 1);
  assert.equal(result.nativeBookingRows[0].proof, 'META_NATIVE_UI');
  assert.ok(result.states.includes('NUMERIC_DESTINATION_ID_UNVERIFIED'));
});

test('stale native evidence and published platform IDs cannot prove future coverage', () => {
  const result = buildSocialCoverageReadback({ ...base,
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-01' } }],
    items: [{ id: 'published-1', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'PUBLISHED', platformPostId: 'fb-1', publishedAt: '2026-10-01T16:00:00Z' }]
  }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.publishedWithPlatformId, 1);
  assert.equal(result.nativeReadbackFresh, false);
  assert.ok(result.states.includes('NATIVE_READBACK_STALE'));
});

test('author weeks use Monday-Sunday calendar weeks and correct publication month', () => {
  const result = buildSocialCoverageReadback({ ...base,
    authorPrograms: [
      { brand: channel.brand, author: 'Iyorwuese Hagher', month: '2026-10' },
      { brand: channel.brand, author: 'Kimberly Reeder', month: '2026-11' }
    ],
    items: [{ id: 'sep-intro', brand: channel.brand, platform: 'facebook', destinationId: channel.destinationId,
      kind: 'PUBLISHED', theme: 'AUTHOR_SPOTLIGHT', author: 'Iyorwuese Hagher',
      platformPostId: 'fb-sep', publishedAt: '2026-09-02T14:00:00Z' }]
  }).authorCoverage;
  assert.equal(result[0].totalWeeks, 5);
  assert.equal(result[0].coveredWeeks, 0);
  assert.equal(result[1].totalWeeks, 6);
  assert.equal(result[1].coveredWeeks, 0);
});

test('failure readback exposes retry work without treating it as coverage', () => {
  const result = buildSocialCoverageReadback({ ...base, items: [
    { id: 'retry-1', brand: channel.brand, platform: channel.platform,
      kind: 'API_REQUEST', status: 'RETRY_REQUIRED', scheduledAt: '2026-10-03T14:00:00Z' }
  ] }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.failures, ['retry-1']);
  assert.ok(result.states.includes('EXECUTION_FAILURE'));
});

test('live Dataverse refresh preserves platform-proven native publications only', () => {
  const native = retainNativeEvidenceItems([
    { id: 'hagher', kind: 'PUBLISHED', platformPostId: 'urn:li:share:1' },
    { id: 'unproved', kind: 'PUBLISHED', platformPostId: null },
    { id: 'booked', kind: 'NATIVE_BOOKING' },
    { id: 'draft', kind: 'NATIVE_DRAFT' }
  ]);
  assert.deepEqual(native.map((item) => item.id), ['hagher', 'booked']);
});

test('live Dataverse rows map by exact branch and platform without inventing destination proof', () => {
  const result = mapDataverseSocialRows([
    { jm1_socialexecutionid: 'fb-published', jm1_branch: 'J Merrill Financial', jm1_platform: 'facebook',
      jm1_status: 'PUBLISHED_VERIFIED', jm1_requesteddestination: '1270611542802820',
      jm1_actualdestination: '1270611542802820', jm1_platformpostid: 'post-1', jm1_actualschedule: '2026-10-08T14:00:00Z' },
    { jm1_socialexecutionid: 'li-booked', jm1_branch: 'J Merrill One', jm1_platform: 'linkedin',
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: '106683183',
      jm1_requestedschedule: '2026-10-13T15:00:00Z', jm1_captionversion: 'v1' },
    { jm1_socialexecutionid: 'bad-branch', jm1_branch: 'Unknown', jm1_platform: 'facebook', jm1_status: 'FAILED' }
  ], [
    { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183' },
    { brand: 'J Merrill Financial', platform: 'facebook', destinationId: '1270611542802820' }
  ]);
  assert.equal(result.mapped.length, 2);
  assert.equal(result.mapped[0].kind, 'PUBLISHED');
  assert.equal(result.mapped[0].destinationId, '1270611542802820');
  assert.equal(result.mapped[1].kind, 'NATIVE_BOOKING');
  assert.equal(result.mapped[1].nativeBookingId, undefined);
  assert.equal(result.mapped[1].contentKey, 'J Merrill One:v1');
  assert.deepEqual(result.unclassified.map((row) => row.jm1_socialexecutionid), ['bad-branch']);
});

test('Dataverse native-booking claims are visible but never count as verified coverage alone', () => {
  const row = { jm1_socialexecutionid: 'claim-1', jm1_branch: channel.brand,
    jm1_platform: 'facebook', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: channel.destinationId, jm1_requestedschedule: '2026-10-13T14:00:00Z' };
  const mapped = mapDataverseSocialRows([row], [channel]).mapped;
  const result = buildSocialCoverageReadback({ ...base, items: mapped }).channels[0];
  assert.equal(result.nativeBookingClaims, 1);
  assert.equal(result.nativeScheduled, 0);
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.unverifiedBookingClaims.map((claim) => claim.id), ['claim-1']);
  assert.ok(result.states.includes('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION'));
});

test('Dataverse booking claims without publication proof are surfaced for reconciliation', () => {
  assert.deepEqual(classifyDataverseExecutionRow({
    status: 'NATIVE_BOOKED_VERIFIED', requestedSchedule: '2026-10-05T14:00:00Z', platformPostId: null
  }, '2026-10-08T16:00:00Z'), {
    classification: 'PAST_DUE_NATIVE_BOOKING_CLAIM', actionRequired: true
  });
  assert.deepEqual(classifyDataverseExecutionRow({
    status: 'NATIVE_BOOKED_VERIFIED', requestedSchedule: '2026-10-14T14:00:00Z', platformPostId: null
  }, '2026-10-08T16:00:00Z'), {
    classification: 'NATIVE_BOOKING_CLAIM_REQUIRES_FRESH_UI_PROOF', actionRequired: true
  });
  assert.deepEqual(classifyDataverseExecutionRow({
    status: 'FAILED_TO_PUBLISH', requestedSchedule: '2026-10-05T14:00:00Z', platformPostId: null
  }, '2026-10-08T16:00:00Z'), {
    classification: 'EXECUTION_FAILURE', actionRequired: true
  });
  assert.deepEqual(classifyDataverseExecutionRow({
    status: 'HELD_CAMPAIGN', requestedSchedule: '2026-10-21T14:00:00Z', platformPostId: null
  }, '2026-10-08T16:00:00Z'), {
    classification: 'HELD_NOT_BOOKED', actionRequired: false
  });
  assert.deepEqual(classifyDataverseExecutionRow({
    status: 'NATIVE_BOOKED_VERIFIED', requestedSchedule: '2026-10-08T15:00:00Z', platformPostId: null
  }, '2026-10-08T16:00:00Z'), {
    classification: 'PAST_DUE_NATIVE_BOOKING_CLAIM', actionRequired: true
  });
});
