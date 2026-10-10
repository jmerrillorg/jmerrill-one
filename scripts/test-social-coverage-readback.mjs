import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildDataverseReconciliationFindings, buildSocialCoverageReadback, classifyDataverseExecutionRow, mapDataverseSocialRows, nativeSocialApprovalProjection, reconcileNativeDataverseClaims, retainNativeEvidenceItems } from './lib/social-coverage-readback.mjs';
import { lifecycleSocialEligibilityForCampaignType } from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const channel = {
  brand: 'J Merrill Publishing', platform: 'facebook', destinationId: '307480763084670',
  executionOwner: 'AZURE_WORKER', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' }
};
const base = { asOf: '2026-10-02T16:00:00Z', channels: [channel], items: [] };

test('resolved destinations do not emit unresolved-authority alerts; missing authority does', () => {
  const resolved = buildSocialCoverageReadback(base).channels[0];
  assert.ok(!resolved.alertFindings.some((finding) => finding.state === 'DESTINATION_AUTHORITY_UNRESOLVED'));

  const unresolved = buildSocialCoverageReadback({ ...base, channels: [{
    ...channel, destinationId: null, executionOwner: 'UNRESOLVED'
  }] }).channels[0];
  assert.ok(unresolved.alertFindings.some((finding) => finding.state === 'DESTINATION_AUTHORITY_UNRESOLVED'));
});

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

test('rolling coverage uses a half-open 14-day Eastern window and two weekly cadence slots', () => {
  const datedChannel = { ...channel, executionOwner: 'META_NATIVE',
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08' } };
  const items = [
    { id: 'week-one', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
      nativeBookingId: 'meta-content-1', scheduledAt: '2026-10-14T14:00:00Z' },
    { id: 'week-two', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
      nativeBookingId: 'meta-content-2', scheduledAt: '2026-10-21T14:00:00Z' },
    { id: 'exclusive-end', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
      nativeBookingId: 'meta-content-3', scheduledAt: '2026-10-22T14:00:00Z' }
  ];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-08T16:00:00Z',
    channels: [datedChannel], items }).channels[0];
  assert.equal(result.nativeScheduled, 2);
  assert.equal(result.verifiedBookings, 2);
  assert.deepEqual(result.weeks.map((week) => week.verifiedBookings), [1, 1]);
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
  assert.equal(result.nativeScheduled, 1);
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
  assert.equal(result.nativeScheduled, 1);
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
  const snapshot = { ...base,
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-01' } }],
    items: [{ id: 'published-1', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'PUBLISHED', platformPostId: 'fb-1', publishedAt: '2026-10-01T16:00:00Z' }]
  };
  const report = buildSocialCoverageReadback(snapshot);
  const result = report.channels[0];
  assert.equal(result.verifiedBookings, null);
  assert.equal(result.nativeScheduled, null);
  assert.equal(result.coverageStatus, 'UNKNOWN');
  assert.deepEqual(result.weeks.map((week) => week.verifiedBookings), [null, null]);
  assert.equal(result.publishedWithPlatformId, 1);
  assert.equal(result.nativeReadbackFresh, false);
  assert.ok(result.states.includes('NATIVE_READBACK_STALE'));
  assert.ok(result.states.includes('COVERAGE_STATUS_UNKNOWN'));
  assert.ok(!result.states.includes('ROLLING_COVERAGE_GAP'));
});

test('timestamp-required native readbacks expire within the same Eastern calendar day', () => {
  const linkedIn = { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T03:00:00Z' } };
  const item = { id: 'li-booking', brand: linkedIn.brand, platform: linkedIn.platform,
    destinationId: linkedIn.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
    scheduledAt: '2026-10-16T14:00:00Z', captionSha256: 'caption-hash',
    nativeEvidence: { source: 'LINKEDIN_NATIVE_UI', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T03:00:00Z',
      scheduledAt: '2026-10-16T14:00:00Z', captionSha256: 'caption-hash' } };
  const current = buildSocialCoverageReadback({ asOf: '2026-10-10T16:00:00Z', channels: [linkedIn], items: [item] }).channels[0];
  assert.equal(current.nativeReadbackStatus, 'STALE');
  assert.equal(current.nativeScheduled, null);
  assert.ok(current.states.includes('NATIVE_READBACK_STALE'));

  const freshChannel = { ...linkedIn, nativeReadback: { ...linkedIn.nativeReadback,
    observedAt: '2026-10-10T15:00:00Z' } };
  const freshItem = { ...item, nativeEvidence: { ...item.nativeEvidence, observedAt: '2026-10-10T15:00:00Z' } };
  const fresh = buildSocialCoverageReadback({ asOf: '2026-10-10T16:00:00Z',
    channels: [freshChannel], items: [freshItem] }).channels[0];
  assert.equal(fresh.nativeReadbackStatus, 'CURRENT');
  assert.equal(fresh.verifiedBookings, 1);
});

test('proven native bookings outside the current horizon are not misreported as reconciliation failures', () => {
  const channel = { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-10' } };
  const item = { id: 'li-oct26', brand: channel.brand, platform: channel.platform,
    destinationId: channel.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
    nativeBookingId: null, scheduledAt: '2026-10-26T14:00:00Z',
    captionText: 'Exact caption', nativeEvidence: { source: 'LINKEDIN_NATIVE_UI',
      observedDateET: '2026-10-10', scheduledAt: '2026-10-26T14:00:00Z',
      captionSha256: createHash('sha256').update('Exact caption').digest('hex') } };
  const result = buildSocialCoverageReadback({ asOf: '2026-10-10T18:00:00Z', channels: [channel], items: [item] }).channels[0];
  assert.equal(result.nativeScheduled, 0);
  assert.deepEqual(result.unverifiedBookingClaims, []);
  assert.deepEqual(result.verifiedBookingsBeyondHorizon, [{
    id: 'li-oct26', scheduledAt: '2026-10-26T14:00:00Z', destinationId: channel.destinationId
  }]);
  assert.ok(!result.states.includes('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION'));
});

test('stale readback is unknown, preserves live publication evidence, and emits stable dedupe keys', () => {
  const snapshot = { asOf: '2026-10-09T16:00:00Z', channels: [{ ...channel,
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-04' } }], items: [
    { id: 'live-publication', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'PUBLISHED', platformPostId: 'fb-live-1', publishedAt: '2026-10-08T16:00:00Z' }
  ] };
  const first = buildSocialCoverageReadback(snapshot);
  const later = buildSocialCoverageReadback({ ...snapshot, asOf: '2026-10-10T16:00:00Z' });
  assert.equal(first.channels[0].coverageStatus, 'UNKNOWN');
  assert.equal(first.channels[0].verifiedBookings, null);
  assert.equal(first.channels[0].publishedWithPlatformId, 1);
  assert.ok(first.alertFindings.some((finding) => finding.action === 'REFRESH_NATIVE_SCHEDULER_READBACK'));
  assert.equal(first.alertFindings[0].dedupeKey, later.alertFindings[0].dedupeKey);
  assert.equal(first.alertFindings[0].delivery, 'REPORT_ONLY');
});

test('fresh verified empty native readback is a real coverage gap, distinct from stale unknown', () => {
  const report = buildSocialCoverageReadback({ ...base,
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' } }], items: [] });
  const result = report.channels[0];
  assert.equal(result.nativeReadbackStatus, 'CURRENT');
  assert.equal(result.coverageStatus, 'VERIFIED_GAP');
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.weeks.map((week) => week.verifiedBookings), [0, 0]);
  assert.ok(result.states.includes('ROLLING_COVERAGE_GAP'));
  assert.ok(!result.states.includes('COVERAGE_STATUS_UNKNOWN'));
  const keys = report.alertFindings.filter((finding) => finding.state === 'ROLLING_COVERAGE_GAP').map((finding) => finding.dedupeKey);
  const nextDay = buildSocialCoverageReadback({ ...base, asOf: '2026-10-03T16:00:00Z',
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-03' } }], items: [] });
  assert.deepEqual(nextDay.alertFindings.filter((finding) => finding.state === 'ROLLING_COVERAGE_GAP')
    .map((finding) => finding.dedupeKey), keys);
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

test('timestamped LinkedIn author bookings contribute to the correct calendar week', () => {
  const captionText = 'October Author of the Month: Iyorwuese Hagher.';
  const linkedIn = { brand: 'J Merrill Publishing', platform: 'linkedin', destinationId: '13048648',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T18:22:07Z' } };
  const booking = { id: 'hagher-oct22', brand: linkedIn.brand, platform: 'linkedin',
    destinationId: linkedIn.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
    theme: 'AUTHOR_SPOTLIGHT', author: 'Iyorwuese Hagher', scheduledAt: '2026-10-22T15:00:00Z', captionText,
    nativeEvidence: { source: 'LINKEDIN_NATIVE_UI', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T18:22:07Z',
      scheduledAt: '2026-10-22T15:00:00Z', captionSha256: createHash('sha256').update(captionText).digest('hex') } };
  const result = buildSocialCoverageReadback({ asOf: '2026-10-10T19:00:00Z', channels: [linkedIn],
    authorPrograms: [{ brand: linkedIn.brand, author: 'Iyorwuese Hagher', month: '2026-10' }], items: [booking] }).authorCoverage[0];
  const targetWeek = result.weeks.find((week) => week.startMondayET === '2026-10-19');
  assert.deepEqual(targetWeek.proofIds, ['hagher-oct22']);
  assert.equal(result.coveredWeeks, 1);
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
  assert.equal(result.mapped[1].nativeBookingId, null);
  assert.equal(result.mapped[1].contentKey, 'J Merrill One:v1');
  assert.deepEqual(result.unclassified.map((row) => row.jm1_socialexecutionid), ['bad-branch']);
});

test('reconciliation findings include mapped past-due native claims and omit held or published rows', () => {
  const findings = buildDataverseReconciliationFindings([
    { jm1_socialexecutionid: 'past-due', jm1_branch: 'J Merrill One', jm1_platform: 'linkedin',
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: '2026-10-09T14:00:00Z',
      jm1_requesteddestination: '106683183' },
    { jm1_socialexecutionid: 'held', jm1_platform: 'linkedin', jm1_status: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED',
      jm1_requestedschedule: '2026-10-09T14:00:00Z', jm1_requesteddestination: '146207089' },
    { jm1_socialexecutionid: 'published', jm1_platform: 'linkedin', jm1_status: 'PUBLISHED_VERIFIED',
      jm1_requestedschedule: '2026-10-09T14:00:00Z', jm1_requesteddestination: '106683183',
      jm1_platformpostid: 'urn:li:share:1' },
    { jm1_socialexecutionid: 'future', jm1_platform: 'linkedin', jm1_status: 'NATIVE_BOOKED_VERIFIED',
      jm1_requestedschedule: '2026-10-11T14:00:00Z', jm1_requesteddestination: '106683183' }
  ], '2026-10-10T14:00:00Z');

  assert.equal(findings.length, 1);
  assert.equal(findings[0].id, 'past-due');
  assert.equal(findings[0].classification, 'PAST_DUE_NATIVE_BOOKING_CLAIM');
  assert.equal(findings[0].actionRequired, true);
});

test('lifecycle-ineligible social rows stay visible but do not become overdue social alerts', () => {
  assert.equal(lifecycleSocialEligibilityForCampaignType('author_inquiry_nurture'), false);
  assert.equal(lifecycleSocialEligibilityForCampaignType('reader_reengagement'), false);
  assert.equal(lifecycleSocialEligibilityForCampaignType('native_social'), true);

  const row = { id: 'inquiry-social-child', kind: 'API_REQUEST', brand: channel.brand,
    platform: channel.platform, destinationId: channel.destinationId,
    status: 'WAIT_CREATIVE_RUNTIME_REGISTRY_REQUIRED', scheduledAt: '2026-09-24T14:00:00Z',
    campaignType: 'author_inquiry_nurture', campaignSocialEligible: false,
    campaignSocialEligibilityReason: 'SOCIAL_INELIGIBLE_BY_LIFECYCLE_POLICY' };
  const result = buildSocialCoverageReadback({ ...base, asOf: '2026-10-10T14:00:00Z', items: [row] }).channels[0];
  assert.deepEqual(result.policyExcludedApiRequests, [{ id: row.id,
    campaignType: 'author_inquiry_nurture', reason: 'SOCIAL_INELIGIBLE_BY_LIFECYCLE_POLICY',
    disposition: 'PRESERVE_NO_PUBLISH', owner: 'JM1_MARKETING_RUNTIME_OWNER',
    action: 'CLASSIFY_LEGACY_NON_SOCIAL_CHILD' }]);
  assert.equal(result.apiRequestRows[0].pastDue, false);
  assert.ok(!result.states.includes('PAST_DUE_API_REQUEST'));
  assert.deepEqual(buildDataverseReconciliationFindings([{
    jm1_socialexecutionid: row.id, jm1_platform: 'facebook', jm1_status: row.status,
    jm1_requestedschedule: row.scheduledAt, campaignSocialEligible: false
  }], '2026-10-10T14:00:00Z'), []);
});

test('native reservation rows are distinct from API requests and do not count as verified bookings', () => {
  const reservation = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'native-reservation-1',
    jm1_name: 'J Merrill One instagram native reservation 2026-10-21 12:00 PM',
    jm1_branch: 'J Merrill One',
    jm1_platform: 'instagram',
    jm1_status: 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED',
    jm1_requesteddestination: 'jmerrillone',
    jm1_requestedschedule: null,
    jm1_captionversion: 'caption-sha256',
    jm1_requestedmediahash: 'media-sha256',
    jm1_readbackstate: 'NATIVE_POST_SCHEDULED;TZ_UNVERIFIED;NO_EXTERNAL_BOOKING_ID;NO_PUBLICATION_ID'
  }], [{ brand: 'J Merrill One', platform: 'instagram', destinationHandle: 'jmerrillone' }]).mapped[0];
  const result = buildSocialCoverageReadback({ ...base,
    channels: [{ brand: 'J Merrill One', platform: 'instagram', destinationHandle: 'jmerrillone',
      executionOwner: 'META_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' } }],
    items: [reservation]
  }).channels[0];
  assert.equal(reservation.kind, 'NATIVE_RESERVATION');
  assert.equal(reservation.nativeReservationLocalDate, '2026-10-21');
  assert.equal(reservation.nativeReservationTimeZone, 'UNVERIFIED');
  assert.equal(result.apiRequests, 0);
  assert.equal(result.nativeScheduled, 0);
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.nativeReservations.length, 1);
  assert.ok(result.states.includes('NATIVE_RESERVATION_TIMEZONE_UNVERIFIED'));
});

test('Dataverse native booking readback verifies exact UI observation without misusing publication ID', () => {
  const caption = 'An exact post caption';
  const captionSha256 = createHash('sha256').update(caption).digest('hex');
  const row = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'native-booked-1',
    jm1_branch: 'J Merrill Publishing',
    jm1_platform: 'instagram',
    jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: 'jmerrillpub',
    jm1_requestedschedule: '2026-10-20T16:00:00Z',
    jm1_captionversion: captionSha256,
    jm1_platformpostid: null,
    jm1_readbackstate: 'NATIVE_UI|META|AT=2026-10-08T16:00:00.000Z|BOOKING=NOT_EXPOSED'
  }], [{ brand: 'J Merrill Publishing', platform: 'instagram', destinationHandle: 'jmerrillpub' }]).mapped[0];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-08T16:00:00Z', channels: [{
    brand: 'J Merrill Publishing', platform: 'instagram', destinationHandle: 'jmerrillpub',
    executionOwner: 'META_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08' }
  }], items: [{ ...row, brand: 'J Merrill Publishing', platform: 'instagram', destinationHandle: 'jmerrillpub' }] }).channels[0];
  assert.equal(row.kind, 'NATIVE_BOOKING');
  assert.equal(row.platformPostId, null);
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.nativeBookingRows[0].proof, 'META_NATIVE_UI');
  assert.equal(result.nativeBookingRows[0].nativeBookingId, null);
});

test('verified Instagram portfolio handle resolves a native booking without a duplicate ID', () => {
  const caption = 'An estate-readiness step for this week.';
  const captionSha256 = createHash('sha256').update(caption).digest('hex');
  const row = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'financial-instagram-booked',
    jm1_branch: 'J Merrill Financial',
    jm1_platform: 'instagram',
    jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: '@jmerrillfin',
    jm1_requestedschedule: '2026-10-10T16:00:00Z',
    jm1_captionversion: captionSha256,
    jm1_readbackstate: 'NATIVE_UI|META|AT=2026-10-09T00:44:31.000Z|BOOKING=NOT_EXPOSED'
  }], [{ brand: 'J Merrill Financial', platform: 'instagram', executionOwner: 'META_NATIVE',
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08', portfolioHandle: 'jmerrillfin' } }]).mapped[0];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-09T00:52:00Z', channels: [{
    brand: 'J Merrill Financial', platform: 'instagram', executionOwner: 'META_NATIVE',
    nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08', portfolioHandle: 'jmerrillfin' }
  }], items: [row] }).channels[0];
  assert.equal(row.kind, 'NATIVE_BOOKING');
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.nextVerifiedBooking, null);
  assert.deepEqual(result.unverifiedBookingClaims, []);
});

test('current MBS_BOOKED evidence verifies the observed content ID separately from publication ID', () => {
  const caption = 'A current Meta Business Suite post with an exact caption.';
  const captionSha256 = createHash('sha256').update(caption).digest('hex');
  const row = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'mbs-booked-1',
    jm1_branch: 'J Merrill One',
    jm1_platform: 'facebook',
    jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: '101196349506906',
    jm1_requestedschedule: '2026-10-13T14:00:00Z',
    jm1_captionversion: captionSha256,
    jm1_platformpostid: null,
    jm1_readbackstate: 'MBS_BOOKED|2026-10-08T15:30:57.000Z|CONTENT_ID=1094388950239342'
  }], [{ brand: 'J Merrill One', platform: 'facebook', destinationId: '101196349506906' }]).mapped[0];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-08T16:00:00Z', channels: [{
    brand: 'J Merrill One', platform: 'facebook', destinationId: '101196349506906',
    executionOwner: 'META_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-08' }
  }], items: [{ ...row, brand: 'J Merrill One', platform: 'facebook', destinationId: '101196349506906' }] }).channels[0];
  assert.equal(row.kind, 'NATIVE_BOOKING');
  assert.equal(row.platformPostId, null);
  assert.equal(row.nativeEvidence.source, 'META_NATIVE_UI');
  assert.equal(row.nativeEvidence.platformContentId, '1094388950239342');
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.nativeBookingRows[0].nativeBookingId, null);
});

test('fresh empty native readback contradicts an in-window Dataverse booking claim without counting it', () => {
  const row = { jm1_socialexecutionid: 'claim-1', jm1_branch: channel.brand,
    jm1_platform: 'facebook', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: channel.destinationId, jm1_requestedschedule: '2026-10-13T14:00:00Z' };
  const mapped = mapDataverseSocialRows([row], [channel]).mapped;
  const result = buildSocialCoverageReadback({ ...base, items: mapped }).channels[0];
  assert.equal(result.nativeBookingClaims, 1);
  assert.equal(result.nativeScheduled, 0);
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.unverifiedBookingClaims.map((claim) => claim.id), ['claim-1']);
  assert.deepEqual(result.contradictedBookingClaims.map((claim) => claim.id), ['claim-1']);
  assert.ok(result.states.includes('NATIVE_BOOKING_CONFLICT'));
  assert.ok(!result.states.includes('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION'));
});

test('native schedule-list presence is distinguished from an exact content match', () => {
  const financial = { brand: 'J Merrill Financial', platform: 'linkedin', destinationId: '146207089',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-10',
      visibleScheduledAtUtc: ['2026-10-12T14:00:00Z'] } };
  const row = { jm1_socialexecutionid: 'fin-li-12', jm1_branch: financial.brand,
    jm1_platform: 'linkedin', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: financial.destinationId, jm1_requestedschedule: '2026-10-12T14:00:00Z' };
  const mapped = mapDataverseSocialRows([row], [financial]).mapped;
  const result = buildSocialCoverageReadback({ asOf: '2026-10-10T18:00:00Z',
    channels: [financial], items: mapped }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.visibleCalendarSlots, ['2026-10-12T14:00:00Z']);
  assert.deepEqual(result.unmatchedVisibleScheduleTimes, ['2026-10-12T14:00:00Z']);
  assert.equal(result.unverifiedBookingClaims[0].scheduleVisibleInNativeList, true);
  assert.deepEqual(result.contradictedBookingClaims, []);
  assert.ok(result.states.includes('NATIVE_BOOKING_SOURCE_COPY_REVIEW'));
  assert.ok(!result.states.includes('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION'));
  assert.ok(!result.states.includes('NATIVE_BOOKING_CONFLICT'));
});

test('exact UI booking survives a source-copy mismatch without inventing approval or native IDs', () => {
  const slot = '2026-10-12T14:00:00Z';
  const captionText = 'Native LinkedIn caption differs from generated draft.';
  const captionSha256 = createHash('sha256').update(captionText).digest('hex');
  const financial = { brand: 'J Merrill Financial', platform: 'linkedin', destinationId: '146207089',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T20:01:34Z',
      visibleScheduledAtUtc: [slot] } };
  const native = { id: 'fin-li-12-native', dataverseRecordId: 'fin-li-12-dv',
    brand: financial.brand, platform: 'linkedin', destinationId: financial.destinationId,
    kind: 'NATIVE_BOOKING', scheduledAt: slot, approvalState: 'UNKNOWN',
    sourceCopyStatus: 'NATIVE_COPY_DIFFERS_FROM_CONTENTWORK', captionText, captionSha256,
    nativeEvidence: { source: 'LINKEDIN_NATIVE_UI', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T20:01:34Z',
      scheduledAt: slot, captionSha256, nativeBookingId: null } };
  const dataverse = [{ id: 'fin-li-12-dv', kind: 'NATIVE_BOOKING', brand: financial.brand,
    platform: 'linkedin', destinationId: financial.destinationId, scheduledAt: slot,
    contentKey: 'J Merrill Financial:generated-copy-hash', status: 'NATIVE_BOOKED_VERIFIED' }];
  const reconciled = reconcileNativeDataverseClaims([native], dataverse, '2026-10-10T20:02:00Z');
  const report = buildSocialCoverageReadback({ asOf: '2026-10-10T20:02:00Z', channels: [financial],
    items: reconciled.items }).channels[0];
  assert.equal(reconciled.items[0].dataverseEvidenceMatch, 'DESTINATION_SCHEDULE_RECORD_ID');
  assert.equal(reconciled.items[0].sourceCopyStatus, 'NATIVE_COPY_DIFFERS_FROM_CONTENTWORK');
  assert.equal(reconciled.items[0].approvalState, 'UNKNOWN');
  assert.equal(reconciled.items[0].nativeBookingId, null);
  assert.equal(report.nativeScheduled, 1);
  assert.equal(report.verifiedBookings, 0);
  assert.equal(report.coverageStatus, 'VERIFIED_GAP');
  assert.ok(report.states.includes('NATIVE_BOOKING_SOURCE_COPY_REVIEW'));
  assert.deepEqual(report.weeks.map((week) => week.scheduledBookings), [1, 0]);
});

test('native reservation can reconcile by exact Dataverse record while preserving source-copy mismatch', () => {
  const slot = '2026-10-19T14:00:00Z';
  const liChannel = { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T18:46:00Z' } };
  const native = { id: 'li-one-19', kind: 'NATIVE_BOOKING', brand: liChannel.brand,
    platform: 'linkedin', destinationId: liChannel.destinationId, dataverseRecordId: 'dv-one-19',
    sourceCopyStatus: 'NO_EXACT_CONTENTWORK_MATCH', approvalState: 'APPROVED',
    scheduledAt: slot, captionText: 'Native text must be preserved',
    captionSha256: createHash('sha256').update('Native text must be preserved').digest('hex'),
    nativeEvidence: { source: 'LINKEDIN_NATIVE_UI', requireTimestamp: true,
      observedDateET: '2026-10-10', observedAt: '2026-10-10T18:46:00Z',
      scheduledAt: slot, captionSha256: createHash('sha256').update('Native text must be preserved').digest('hex') } };
  const sourceRow = { id: 'dv-one-19', kind: 'NATIVE_BOOKING', brand: liChannel.brand,
    platform: 'linkedin', destinationId: liChannel.destinationId, scheduledAt: slot,
    contentKey: 'J Merrill One:stage-marker', status: 'NATIVE_BOOKED_VERIFIED',
    readbackState: 'NATIVE_UI|LINKEDIN|BOOKING=NOT_EXPOSED' };
  const reconciled = reconcileNativeDataverseClaims([native], [sourceRow], '2026-10-10T18:53:00Z');
  assert.equal(reconciled.items[0].dataverseSocialExecutionId, 'dv-one-19');
  assert.equal(reconciled.items[0].dataverseEvidenceMatch, 'DESTINATION_SCHEDULE_RECORD_ID');
  assert.equal(reconciled.items[0].sourceCopyStatus, 'NO_EXACT_CONTENTWORK_MATCH');
  assert.equal(reconciled.items[0].captionText, 'Native text must be preserved');
  assert.deepEqual([...reconciled.matchedDataverseIds], ['dv-one-19']);
});

test('fresh verified empty LinkedIn queue contradicts in-window Dataverse booking claims without counting them', () => {
  const linkedIn = { brand: 'J Merrill Publishing', platform: 'linkedin', destinationId: '13048648',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-10' } };
  const claim = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'pub-li-oct10', jm1_branch: linkedIn.brand, jm1_platform: 'linkedin',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: linkedIn.destinationId,
    jm1_requestedschedule: '2026-10-10T15:00:00Z', jm1_captionversion: 'caption-sha',
    jm1_readbackstate: 'LINKEDIN_NATIVE_SCHEDULED_2026_10_10_1100'
  }], [linkedIn]).mapped[0];
  const report = buildSocialCoverageReadback({ asOf: '2026-10-10T05:50:00Z', channels: [linkedIn], items: [claim] });
  const result = report.channels[0];
  assert.equal(result.nativeReadbackStatus, 'CURRENT');
  assert.equal(result.nativeScheduled, 0);
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.contradictedBookingClaims.map((item) => item.id), ['pub-li-oct10']);
  assert.ok(result.states.includes('NATIVE_BOOKING_CONFLICT'));
  assert.ok(!result.states.includes('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION'));
  assert.ok(report.alertFindings.some((finding) => finding.action === 'RECONCILE_CONTRADICTED_NATIVE_BOOKING'
    && finding.evidence.recordIds.includes('pub-li-oct10')));
});

test('held native booking conflicts remain visible as actionable failures in Dataverse readback', () => {
  const conflict = { id: 'api-native-conflict', kind: 'API_REQUEST', brand: channel.brand,
    platform: channel.platform, destinationId: channel.destinationId,
    status: 'HELD_NATIVE_BOOKING_CONFLICT', scheduledAt: '2026-10-13T14:00:00Z' };
  const result = buildSocialCoverageReadback({ ...base, items: [conflict] }).channels[0];
  assert.ok(result.states.includes('HELD_ITEMS'));
  assert.ok(result.states.includes('EXECUTION_FAILURE'));
  assert.ok(result.alertFindings.some((finding) => finding.action === 'RECONCILE_EXECUTION_FAILURE'
    && finding.evidence.recordIds.includes('api-native-conflict')));
  assert.equal(classifyDataverseExecutionRow({ status: 'HELD_NATIVE_BOOKING_CONFLICT' }).actionRequired, true);
  assert.equal(classifyDataverseExecutionRow({ status: 'HELD_NATIVE_BOOKING_STALE' }).classification, 'NATIVE_BOOKING_STALE');
});

test('past-due held API requests stay held and are not reported as overdue work', () => {
  const held = { id: 'held-past-due', kind: 'API_REQUEST', brand: channel.brand,
    platform: channel.platform, destinationId: channel.destinationId,
    status: 'HELD_CAMPAIGN_AUTHORITY', approvalState: 'HELD',
    scheduledAt: '2026-10-01T14:00:00Z' };
  const result = buildSocialCoverageReadback({
    ...base,
    asOf: '2026-10-10T16:00:00Z',
    items: [held]
  }).channels[0];
  assert.deepEqual(result.heldItems, ['held-past-due']);
  assert.equal(result.apiRequestRows[0].pastDue, false);
  assert.ok(!result.states.includes('PAST_DUE_API_REQUEST'));
  assert.ok(!result.alertFindings.some((finding) => finding.action === 'RECONCILE_PAST_DUE_REQUEST'));
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

test('fresh exact native card reconciles a matching Dataverse booking despite its older UI observation timestamp', () => {
  const brand = 'J Merrill One';
  const captionText = 'Different needs. One place to start.';
  const captionSha256 = createHash('sha256').update(captionText).digest('hex');
  const native = {
    id: 'fresh-mbs-card', kind: 'NATIVE_BOOKING', brand, platform: 'instagram',
    destinationHandle: 'jmerrillone', scheduledAt: '2026-10-15T14:00:00Z',
    approvalState: 'APPROVED', captionSha256,
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-10',
      scheduledAt: '2026-10-15T14:00:00Z', captionSha256, nativeBookingId: null }
  };
  const dataverse = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'dv-row', jm1_branch: brand, jm1_platform: 'instagram',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: '@jmerrillone',
    jm1_requestedschedule: '2026-10-15T14:00:00Z', jm1_captionversion: captionSha256,
    jm1_readbackstate: 'NATIVE_UI|META|AT=2026-10-08T15:30:57.000Z|BOOKING=NOT_EXPOSED'
  }], [{ brand, platform: 'instagram', destinationId: '17841456905118441', destinationHandle: 'jmerrillone' }]).mapped;
  const result = reconcileNativeDataverseClaims([native], dataverse, '2026-10-10T07:24:00Z');
  assert.deepEqual([...result.matchedDataverseIds], ['dv-row']);
  assert.equal(result.items[0].dataverseSocialExecutionId, 'dv-row');
  assert.equal(result.items[0].dataverseEvidenceMatch, 'DESTINATION_SCHEDULE_CAPTION_SHA256');
  assert.equal(result.items[0].approvalState, 'APPROVED');
  assert.equal(result.items[0].dataverseBookingEvidence, 'NATIVE_BOOKED_VERIFIED');
  assert.equal(result.items[0].approvalState, 'APPROVED');
});

test('exact Dataverse source approval replaces stale UNKNOWN but never overrides an explicit hold', () => {
  const brand = 'J Merrill One';
  const captionSha256 = createHash('sha256').update('Approved native copy').digest('hex');
  const slot = '2026-10-15T14:00:00Z';
  const native = {
    id: 'mbs-one-ig-2026-10-15', kind: 'NATIVE_BOOKING', brand, platform: 'instagram',
    destinationId: '17841456905118441', dataverseRecordId: 'dv-native-approved',
    scheduledAt: slot, approvalState: 'UNKNOWN', captionSha256,
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-10',
      scheduledAt: slot, captionSha256 }
  };
  const approvedSource = { id: 'dv-native-approved', kind: 'NATIVE_BOOKING', brand,
    platform: 'instagram', destinationId: '17841456905118441', scheduledAt: slot,
    approvalState: 'APPROVED', status: 'NATIVE_BOOKED_VERIFIED' };
  const approved = reconcileNativeDataverseClaims([native], [approvedSource], '2026-10-10T22:00:00Z');
  assert.equal(approved.items[0].approvalState, 'APPROVED');
  assert.deepEqual([...approved.matchedDataverseIds], ['dv-native-approved']);

  const held = reconcileNativeDataverseClaims([{ ...native, approvalState: 'HELD' }],
    [approvedSource], '2026-10-10T22:00:00Z');
  assert.equal(held.items[0].approvalState, 'HELD');

  const unmatched = reconcileNativeDataverseClaims([native], [{ ...approvedSource,
    id: 'different-record', scheduledAt: '2026-10-16T14:00:00Z' }], '2026-10-10T22:00:00Z');
  assert.equal(unmatched.items[0].approvalState, 'UNKNOWN');
  assert.deepEqual([...unmatched.matchedDataverseIds], []);
});

test('native-to-Dataverse reconciliation fails closed on destination, time, or caption mismatch', () => {
  const brand = 'J Merrill One';
  const captionText = 'Different needs. One place to start.';
  const captionSha256 = createHash('sha256').update(captionText).digest('hex');
  const native = {
    id: 'fresh-mbs-card', kind: 'NATIVE_BOOKING', brand, platform: 'instagram',
    destinationHandle: 'jmerrillone', scheduledAt: '2026-10-15T14:00:00Z',
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-10',
      scheduledAt: '2026-10-15T14:00:00Z', captionSha256 }
  };
  const rows = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'dv-row', jm1_branch: brand, jm1_platform: 'instagram',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: '@different-account',
    jm1_requestedschedule: '2026-10-15T14:00:00Z', jm1_captionversion: captionSha256
  }], [{ brand, platform: 'instagram', destinationId: '17841456905118441', destinationHandle: 'jmerrillone' }]).mapped;
  const result = reconcileNativeDataverseClaims([native], rows, '2026-10-10T07:24:00Z');
  assert.deepEqual([...result.matchedDataverseIds], []);
});

test('native approval projection exact-matches source slot when rolling weeks reuse the same caption', () => {
  const brand = 'J Merrill One';
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const caption = 'Approved One copy';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'a'.repeat(64);
  const booking = { jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'linkedin',
    jm1_requesteddestination: '106683183', jm1_requestedschedule: '2026-10-13T16:00:00Z',
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign-1', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const contentRow = (stage, id) => ({ jm1_contentworkid: id, jm1_idempotencykey: `${marker}:content:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: 'APPROVED_TEMPLATE_SET:v1' });
  const creativeRow = (stage, id) => ({ jm1_creativeworkid: id, jm1_idempotencykey: `${marker}:creative:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash });
  const socialRow = (stage, schedule, id) => ({ jm1_socialexecutionid: id,
    jm1_idempotencykey: `${marker}:social:${stage}:linkedin`, jm1_branch: brand, jm1_platform: 'linkedin',
    jm1_status: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED', jm1_requesteddestination: '106683183',
    jm1_requestedschedule: schedule, jm1_captionversion: `${marker}:caption:${stage}:v1`,
    jm1_requestedmediahash: mediaHash });
  const proof = nativeSocialApprovalProjection(booking, {
    campaigns: [campaign],
    content: [contentRow('rolling-2026-10-12-1', 'content-current'), contentRow('rolling-2026-10-19-1', 'content-next')],
    creatives: [creativeRow('rolling-2026-10-12-1', 'creative-current'), creativeRow('rolling-2026-10-19-1', 'creative-next')],
    socialRows: [socialRow('rolling-2026-10-12-1', '2026-10-13T16:00:00Z', 'social-current'),
      socialRow('rolling-2026-10-19-1', '2026-10-20T16:00:00Z', 'social-next')]
  }, (authority, content) => authority === campaign && content.jm1_copybrief.includes('APPROVED_TEMPLATE_SET:v1'));
  assert.equal(proof.state, 'APPROVED');
  assert.deepEqual(proof.evidence, { campaignId: 'campaign-1', contentId: 'content-current',
    creativeId: 'creative-current', socialExecutionId: 'social-current',
    sourceStatus: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED', stage: 'rolling-2026-10-12-1' });
  const templateMismatch = nativeSocialApprovalProjection(booking, {
    campaigns: [campaign], content: [contentRow('rolling-2026-10-12-1', 'content-current')],
    creatives: [creativeRow('rolling-2026-10-12-1', 'creative-current')],
    socialRows: [socialRow('rolling-2026-10-12-1', booking.jm1_requestedschedule, 'social-current')]
  }, () => false);
  assert.equal(templateMismatch.state, 'UNKNOWN');
  assert.equal(templateMismatch.reason, 'REVIEWED_TEMPLATE_VALIDATION_MISMATCH');

  const mapped = mapDataverseSocialRows([{ ...booking, jm1_socialexecutionid: 'booking-1',
    nativeApprovalState: proof.state, nativeApprovalEvidence: proof.evidence }],
  [{ brand, platform: 'linkedin', destinationId: '106683183' }]).mapped[0];
  assert.equal(mapped.approvalState, 'APPROVED');
  assert.equal(mapped.nativeApprovalEvidence.socialExecutionId, 'social-current');
});

test('native approval projection fails closed for unapproved, mismatched, missing, or ambiguous source authority', () => {
  const brand = 'J Merrill One';
  const marker = 'native-one';
  const stage = 'rolling-2026-10-12-1';
  const caption = 'Approved copy';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'b'.repeat(64);
  const booking = { jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'linkedin',
    jm1_requesteddestination: '106683183', jm1_requestedschedule: '2026-10-13T16:00:00Z',
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'c1', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const content = { jm1_contentworkid: 'ct1', jm1_idempotencykey: `${marker}:content:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: 'APPROVED_TEMPLATE_SET:v1' };
  const creative = { jm1_creativeworkid: 'cr1', jm1_idempotencykey: `${marker}:creative:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const source = { jm1_socialexecutionid: 's1', jm1_idempotencykey: `${marker}:social:${stage}:linkedin`,
    jm1_branch: brand, jm1_platform: 'linkedin', jm1_status: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED',
    jm1_requesteddestination: '106683183', jm1_requestedschedule: booking.jm1_requestedschedule,
    jm1_captionversion: `${marker}:caption:${stage}:v1`, jm1_requestedmediahash: mediaHash };
  const baseline = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [source] };
  const validate = (authority, copy) => authority.jm1_state === 'PUBLIC_EXECUTION_APPROVED'
    && copy.jm1_copybrief.includes('APPROVED_TEMPLATE_SET:v1');
  assert.equal(nativeSocialApprovalProjection(booking, { ...baseline,
    campaigns: [{ ...campaign, jm1_state: 'DRAFT' }] }, validate).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...baseline,
    content: [{ ...content, jm1_publicreadystate: 'HELD' }] }, validate).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...baseline,
    creatives: [{ ...creative, jm1_assethash: 'c'.repeat(64) }] }, validate).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...baseline, socialRows: [] }, validate).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...baseline,
    socialRows: [source, { ...source, jm1_socialexecutionid: 's2' }] }, validate).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection({ ...booking, jm1_status: 'DRAFT' }, baseline, validate).state, 'UNKNOWN');
});
