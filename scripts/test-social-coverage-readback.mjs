import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildSocialCoverageReadback } from './lib/social-coverage-readback.mjs';

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

test('stale native evidence and published platform IDs cannot prove future coverage', () => {
  const result = buildSocialCoverageReadback({ ...base,
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-01' } }],
    items: [{ id: 'published-1', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'PUBLISHED', platformPostId: 'fb-1', publishedAt: '2026-10-01T16:00:00Z' }]
  }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.publishedWithPlatformId, 1);
  assert.ok(result.states.includes('NATIVE_READBACK_UNVERIFIED'));
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
