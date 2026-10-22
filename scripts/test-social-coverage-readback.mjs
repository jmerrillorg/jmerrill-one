import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { applyCurrentFinancialProductionDestinations, buildCoverageDateChannelMatrix, buildDataverseReconciliationFindings, buildPreparationDateMatrix, buildSocialCoverageReadback, classifyDataverseExecutionRow, hasVerifiedFinancialProductionDestinations, mapDataverseSocialRows, mapNativePublicationEvidencePackets, mapUnlinkedNativePublicationEvidencePackets, matchesApprovedLegacyNativeSocialContent, mergeNativeBookingObservations, mergeNativeScheduleEvidence, nativeSocialApprovalProjection, partitionCurrentFinancialDestinationRows, queryDataversePages, reconcileNativeDataverseClaims, reconcilePastDueClaimsToPublishedEvidence, retainNativeEvidenceItems, selectLatestCoverageSnapshot } from './lib/social-coverage-readback.mjs';
import { lifecycleSocialEligibilityForCampaignType } from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const channel = {
  brand: 'J Merrill Publishing', platform: 'facebook', destinationId: '307480763084670',
  executionOwner: 'AZURE_WORKER', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' }
};
const base = { asOf: '2026-10-02T16:00:00Z', channels: [channel], items: [] };

test('default snapshot selection uses embedded native observation time, not filename order', () => {
  const channels = (observedAt) => Array.from({ length: 9 }, (_, index) => ({
    brand: `Brand ${Math.floor(index / 3)}`, platform: ['facebook', 'instagram', 'linkedin'][index % 3],
    nativeReadback: { observedAt }
  }));
  const selected = selectLatestCoverageSnapshot([
    { path: 'social-coverage-native-audit-2026-10-14.json', snapshot: { channels: channels('2026-10-10T20:00:00Z') } },
    { path: 'social-coverage-native-audit-2026-10-12.json', snapshot: { channels: channels('2026-10-12T17:45:37Z') } }
  ]);
  assert.equal(selected.path, 'social-coverage-native-audit-2026-10-12.json');
  assert.equal(selected.latestNativeObservationAt, '2026-10-12T17:45:37Z');
  assert.throws(() => selectLatestCoverageSnapshot([{ path: 'partial.json', snapshot: { asOf: '2026-10-14', channels: channels('2026-10-14T12:00:00Z').slice(0, 8) } }]),
    /embedded native observation timestamp/);
});

test('date-channel matrix preserves state and evidence identity per channel-date cell', () => {
  const result = buildSocialCoverageReadback({
    asOf: '2026-10-14T12:00:00Z',
    channels: Array.from({ length: 9 }, (_, index) => ({
      brand: `Brand ${Math.floor(index / 3)}`, platform: ['facebook', 'instagram', 'linkedin'][index % 3],
      destinationId: `destination-${index}`, executionOwner: 'LINKEDIN_NATIVE',
      nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
        observedAt: '2026-10-14T11:59:00Z', observedDateET: '2026-10-14' }
    })),
    items: []
  });
  const matrix = buildCoverageDateChannelMatrix(result);
  assert.equal(matrix.length, 126);
  assert.equal(new Set(matrix.map((cell) => `${cell.dateET}|${cell.brand}|${cell.platform}`)).size, 126);
  assert.ok(matrix.every((cell) => cell.evidenceSource === null && cell.qualifiesForDailyCoverage === false));
  assert.ok(matrix.every((cell) => cell.state === 'MISSING'));
});

test('date-channel matrix includes exact native detail without inventing scheduler or publication IDs', () => {
  const report = buildSocialCoverageReadback({
    asOf: '2026-10-16T13:00:00Z',
    channels: [{ ...channel, executionOwner: 'META_NATIVE', destinationId: 'page-1',
      nativeReadback: { state: 'VERIFIED', requireTimestamp: true, observedAt: '2026-10-16T12:00:00Z',
        observedDateET: '2026-10-16', visibleScheduledAtUtc: ['2026-10-29T14:00:00Z'],
        scheduleDetails: [{ scheduledAt: '2026-10-29T14:00:00Z', captionSha256: 'a'.repeat(64),
          mediaSha256: 'b'.repeat(64), destination: 'page-1', observedAt: '2026-10-15T17:00:00Z',
          nativeItemId: null, nativeBookingId: null, publicationId: null, sourceEvidenceFile: 'receipt.json' }] } }],
    items: []
  });
  const cell = buildCoverageDateChannelMatrix(report).find((item) => item.dateET === '2026-10-29');
  assert.equal(cell.nativeScheduleDetails.length, 1);
  assert.equal(cell.nativeScheduleDetails[0].nativeItemId, null);
  assert.equal(cell.nativeScheduleDetails[0].nativeBookingId, null);
  assert.equal(cell.nativeScheduleDetails[0].publicationId, null);
});

test('native publication packets preserve exact source, observed time, destination, and single platform identity', () => {
  const [item] = mapNativePublicationEvidencePackets([{ publications: [{
    dataverseRecordId: 'record-1', brand: 'J Merrill Publishing', platform: 'linkedin',
    requestedDestination: '13048648', actualDestination: '13048648', scheduledAt: '2026-10-15T15:00:00Z',
    publishedDateET: '2026-10-15', publishedAt: null, platformPostId: 'urn:li:share:post-1',
    captionSha256: 'c'.repeat(64), mediaSha256: null, observedAt: '2026-10-16T13:23:03.753Z',
    evidenceUrl: 'https://www.linkedin.com/feed/update/urn:li:share:post-1/',
    source: 'LINKEDIN_NATIVE_PUBLISHED_LIST_AND_EXACT_CAPTION_MATCH',
    reconciliationNote: 'One actual post; another claim has different content hashes.'
  }] }]);
  assert.equal(item.dataverseRecordId, 'record-1');
  assert.equal(item.destinationId, '13048648');
  assert.equal(item.platformPostId, 'urn:li:share:post-1');
  assert.equal(item.publishedAt, null);
  assert.equal(item.nativeEvidence.observedAt, '2026-10-16T13:23:03.753Z');
  assert.equal(item.nativeEvidence.source, 'LINKEDIN_NATIVE_PUBLISHED_LIST_AND_EXACT_CAPTION_MATCH');
  assert.equal(item.nativeEvidence.reconciliationNote, 'One actual post; another claim has different content hashes.');
  const reconciled = reconcilePastDueClaimsToPublishedEvidence([{
    jm1_socialexecutionid: 'record-1', jm1_status: 'PUBLISHED_VERIFIED',
    jm1_requestedschedule: '2026-10-15T15:00:00Z', jm1_requesteddestination: '13048648', jm1_platform: 'linkedin'
  }], [item], '2026-10-16T14:00:00Z');
  assert.equal(reconciled.reconciled[0].reconciliationNote, 'One actual post; another claim has different content hashes.');
});

test('unlinked observed posts and mismatched claims remain explicit and never count as publications', () => {
  const [observed, claim] = mapUnlinkedNativePublicationEvidencePackets([{
    observedAt: '2026-10-16T13:23:03.753Z', _sourceEvidenceFile: 'oct15.json',
    unlinkedObservedPost: { platformPostId: 'post-1', disposition: 'NOT_LINKED_CONTENT_HASH_MISMATCH' },
    unlinkedClaims: [{ dataverseRecordId: 'claim-2', comparedPublicationId: 'post-1',
      disposition: 'NOT_LINKED_CONTENT_HASH_MISMATCH', note: 'Content hashes differ.' }]
  }]);
  assert.equal(observed.evidenceKind, 'OBSERVED_POST_NOT_LINKED_TO_SOURCE');
  assert.equal(observed.platformPostId, 'post-1');
  assert.equal(claim.evidenceKind, 'CLAIM_NOT_MATCHED_TO_OBSERVED_POST');
  assert.equal(claim.dataverseRecordId, 'claim-2');
  assert.equal(claim.observedAt, '2026-10-16T13:23:03.753Z');
  assert.equal(mapNativePublicationEvidencePackets([{ unlinkedObservedPost: { platformPostId: 'post-1' } }]).length, 0);
});

test('schedule evidence links only to the exact observed production date and leaves unavailable IDs null', () => {
  const target = { ...channel, executionOwner: 'META_NATIVE', destinationId: 'page-1',
    nativeReadback: { state: 'VERIFIED', visibleScheduledAtUtc: ['2026-10-29T14:00:00Z'], scheduleDetails: [] } };
  const detail = { brand: channel.brand, platform: channel.platform, destination: 'page-1',
    scheduledAt: '2026-10-29T14:00:00Z', observedAt: '2026-10-16T12:00:00Z',
    captionSha256: 'a'.repeat(64), mediaSha256: 'b'.repeat(64), nativeItemId: null,
    nativeBookingId: null, publicationId: null, sourceEvidenceFile: 'receipt.json' };
  const merged = mergeNativeScheduleEvidence([target], [{ details: [detail] }]);
  assert.equal(merged[0].nativeReadback.scheduleDetails[0].nativeItemId, null);
  assert.throws(() => mergeNativeScheduleEvidence([target], [{ details: [{ ...detail,
    scheduledAt: '2026-10-30T14:00:00Z' }] }]), /not present in the observed scheduled list/);
  assert.throws(() => mergeNativeScheduleEvidence([target], [{ details: [detail, detail] }]), /Duplicate native schedule evidence/);
});

test('exact fresh native schedule-list observations satisfy date slots without inventing booking IDs', () => {
  const visibleScheduledAtUtc = Array.from({ length: 14 }, (_, offset) =>
    new Date(Date.parse('2026-10-14T14:00:00Z') + offset * 86400000).toISOString());
  const report = buildSocialCoverageReadback({
    asOf: '2026-10-14T12:00:00Z',
    channels: [{ ...channel, executionOwner: 'META_NATIVE', destinationId: 'page-1',
      nativeReadback: { state: 'VERIFIED', requireTimestamp: true,
        observedAt: '2026-10-14T11:59:00Z', observedDateET: '2026-10-14', visibleScheduledAtUtc,
        view: 'Meta Business Suite scheduled posts list' } }],
    items: []
  });
  const days = report.channels[0].dailyCoverage;
  assert.equal(days.length, 14);
  assert.ok(days.every((day) => day.status === 'SCHEDULED' && day.qualifiesForDailyCoverage));
  assert.ok(days.every((day) => day.scheduledReceiptIds.length === 0));
  assert.ok(days.every((day) => day.nativeObservedScheduledAtUtc.length === 1));
});

test('an overdue native claim reconciles to publication only through an exact linked destination and date', () => {
  const row = { jm1_socialexecutionid: 'claim-1', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requestedschedule: '2026-10-13T14:00:00Z', jm1_requesteddestination: 'page-1', jm1_platform: 'facebook' };
  const published = { id: 'claim-1', dataverseRecordId: 'claim-1', kind: 'PUBLISHED', platform: 'facebook',
    destinationId: 'page-1', platformPostId: 'post-1', publishedDateET: '2026-10-13',
    nativeEvidence: { source: 'META_PUBLISHED_POSTS', observedAt: '2026-10-14T12:00:00Z' } };
  const result = reconcilePastDueClaimsToPublishedEvidence([row], [published], '2026-10-14T12:00:00Z');
  assert.equal(result.reconciled.length, 1);
  assert.equal(result.reconciled[0].platformPostId, 'post-1');
  assert.ok(result.reconciledIds.has('claim-1'));
  assert.equal(reconcilePastDueClaimsToPublishedEvidence([row], [{ ...published, destinationId: 'other-page' }],
    '2026-10-14T12:00:00Z').reconciled.length, 0);
});

test('native publication dates without a verified minute remain reconcilable without inventing actual time', () => {
  const mapped = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'published-linkedin-date-only', jm1_branch: 'J Merrill Publishing',
    jm1_platform: 'linkedin', jm1_status: 'PUBLISHED_VERIFIED', jm1_requestedschedule: '2026-10-15T15:00:00Z',
    jm1_requesteddestination: '13048648', jm1_actualdestination: '13048648', jm1_actualschedule: null,
    jm1_platformpostid: 'urn:li:share:7512653230255017984',
    jm1_verifiedat: '2026-10-16T13:23:03Z',
    jm1_readbackstate: 'NATIVE_PUBLICATION|PUBLISHED_DATE_ET=2026-10-15|OBSERVED_AT=2026-10-16T13:23:03Z|ACTUAL_PUBLICATION_TIME=UNKNOWN'
  }], [{ brand: 'J Merrill Publishing', platform: 'linkedin', destinationId: '13048648' }]).mapped[0];
  assert.equal(mapped.publishedAt, null);
  assert.equal(mapped.publishedDateET, '2026-10-15');
  assert.equal(mapped.destinationId, '13048648');
  assert.equal(mapped.nativeEvidence.source, 'NATIVE_PLATFORM_PUBLICATION');
  assert.equal(mapped.nativeEvidence.observedAt, '2026-10-16T13:23:03.000Z');
  const result = reconcilePastDueClaimsToPublishedEvidence([{
    jm1_socialexecutionid: mapped.id, jm1_status: 'PUBLISHED_VERIFIED',
    jm1_requestedschedule: mapped.scheduledAt, jm1_requesteddestination: '13048648', jm1_platform: 'linkedin'
  }], [mapped], '2026-10-16T14:00:00Z');
  assert.equal(result.reconciled.length, 1);
  assert.equal(result.reconciled[0].actualPublishedAt, null);
  assert.equal(result.reconciled[0].publishedDateET, '2026-10-15');
});

test('a date-only publication already persisted as PUBLISHED_VERIFIED remains visible in reconciliation', () => {
  const row = { jm1_socialexecutionid: 'published-linkedin-date-only', jm1_status: 'PUBLISHED_VERIFIED',
    jm1_requestedschedule: '2026-10-15T15:00:00Z', jm1_requesteddestination: '13048648', jm1_platform: 'linkedin' };
  const item = { dataverseRecordId: row.jm1_socialexecutionid, kind: 'PUBLISHED', platform: 'linkedin',
    destinationId: '13048648', platformPostId: 'urn:li:share:7512653230255017984',
    publishedDateET: '2026-10-15', publishedAt: null };
  const result = reconcilePastDueClaimsToPublishedEvidence([row], [item], '2026-10-16T14:00:00Z');
  assert.equal(result.reconciled.length, 1);
  assert.equal(result.reconciled[0].actualPublishedAt, null);
  assert.equal(result.reconciled[0].platformPostId, item.platformPostId);
});

test('current Financial destination correction is scoped and leaves historical source intact', () => {
  const historical = { ...base, channels: [
    { brand: 'J Merrill Financial', platform: 'facebook', destinationId: '1270611542802820' },
    { brand: 'J Merrill Financial', platform: 'instagram', destinationId: '17841438473100276', destinationHandle: 'jmerrillfin' },
    { brand: 'J Merrill Financial', platform: 'linkedin', destinationId: '146207089' }, channel
  ], items: [
    { id: 'legacy-fb', kind: 'NATIVE_BOOKING', brand: 'J Merrill Financial', platform: 'facebook', destinationId: '1270611542802820' },
    { id: 'test-ig', kind: 'NATIVE_BOOKING', brand: 'J Merrill Financial', platform: 'instagram', destinationId: '17841438473100276', destinationHandle: 'jmerrillfin' },
    { id: 'other-brand', kind: 'NATIVE_BOOKING', brand: 'J Merrill One', platform: 'facebook', destinationId: 'other' }
  ] };
  const current = applyCurrentFinancialProductionDestinations(historical);
  assert.equal(historical.channels[0].destinationId, '1270611542802820');
  assert.equal(historical.channels[1].destinationHandle, 'jmerrillfin');
  assert.equal(historical.items.length, 3);
  assert.deepEqual(current.items.map((item) => item.id), ['other-brand']);
  assert.deepEqual(current.preservedHistoricalFinancialEvidence.map((item) => [item.id, item.currentDisposition]), [
    ['legacy-fb', 'EXCLUDED_LEGACY_PAGE'], ['test-ig', 'EXCLUDED_TEST_ACCOUNT']
  ]);
  assert.equal(current.channels[0].destinationId, '104395329284856');
  assert.equal(current.channels[1].destinationId, null);
  assert.equal(current.channels[1].destinationHandle, 'jmerrillfinancial');
  assert.equal(current.channels[1].nativeReadback.excludedTestHandle, 'jmerrillfin');
  assert.equal(current.channels[2].destinationId, '146207089');
  assert.equal(current.channels[3].destinationId, channel.destinationId);
});

test('current Financial Meta readback requires exact production identities and records fresh observed slots', () => {
  const historical = { channels: [
    { brand: 'J Merrill Financial', platform: 'facebook', destinationId: '1270611542802820', nativeReadback: { observedDateET: '2026-10-10' } },
    { brand: 'J Merrill Financial', platform: 'instagram', destinationHandle: 'jmerrillfin', nativeReadback: { observedDateET: '2026-10-10' } },
    { brand: 'J Merrill Financial', platform: 'linkedin', destinationId: '146207089', nativeReadback: { observedDateET: '2026-10-10' } }
  ] };
  const observedAt = '2026-10-12T11:55:00.000Z';
  const readback = { facebookPageId: '104395329284856', instagramHandle: 'jmerrillfinancial', observedAt,
    facebookScheduledAtUtc: ['2026-10-16T18:00:00Z', '2026-10-21T14:00:00Z'],
    instagramScheduledAtUtc: ['2026-10-13T15:00:00Z', '2026-10-23T19:00:00Z'],
    linkedinPageId: '146207089', linkedinObservedAt: '2026-10-12T12:10:00.000Z',
    linkedinScheduledAtUtc: ['2026-10-12T14:00:00Z', '2026-10-16T15:00:00Z', '2026-10-19T14:00:00Z', '2026-10-23T20:00:00Z'] };
  const current = applyCurrentFinancialProductionDestinations(historical, readback);
  assert.equal(historical.channels[0].nativeReadback.observedDateET, '2026-10-10');
  assert.equal(current.channels[0].nativeReadback.observedDateET, '2026-10-12');
  assert.deepEqual(current.channels[0].nativeReadback.visibleScheduledAtUtc, readback.facebookScheduledAtUtc);
  assert.deepEqual(current.channels[1].nativeReadback.visibleScheduledAtUtc, readback.instagramScheduledAtUtc);
  assert.equal(current.channels[2].nativeReadback.observedAt, readback.linkedinObservedAt);
  assert.deepEqual(current.channels[2].nativeReadback.visibleScheduledAtUtc, readback.linkedinScheduledAtUtc);
  assert.throws(() => applyCurrentFinancialProductionDestinations(historical, { ...readback, facebookPageId: '1270611542802820' }), /must bind/);
  assert.throws(() => applyCurrentFinancialProductionDestinations(historical, { ...readback, linkedinPageId: '1270611542802820' }), /LinkedIn readback/);
});

test('current Financial readback excludes legacy Page and test Instagram rows without deleting their evidence', () => {
  const rows = [
    { jm1_socialexecutionid: 'legacy-fb', jm1_branch: 'J Merrill Financial', jm1_platform: 'facebook', jm1_requesteddestination: '1270611542802820', jm1_status: 'HELD_DESTINATION_IDENTITY_MISMATCH' },
    { jm1_socialexecutionid: 'test-ig', jm1_branch: 'J Merrill Financial', jm1_platform: 'instagram', jm1_requesteddestination: '@jmerrillfin', jm1_status: 'NATIVE_BOOKING_MOVED_TO_DRAFT' },
    { jm1_socialexecutionid: 'production-fb', jm1_branch: 'J Merrill Financial', jm1_platform: 'facebook', jm1_requesteddestination: '104395329284856' },
    { jm1_socialexecutionid: 'one-fb', jm1_branch: 'J Merrill One', jm1_platform: 'facebook', jm1_requesteddestination: '1270611542802820' }
  ];
  const { currentRows, preservedHistoricalFinancialRows } = partitionCurrentFinancialDestinationRows(rows);
  assert.deepEqual(currentRows.map((row) => row.jm1_socialexecutionid), ['production-fb', 'one-fb']);
  assert.deepEqual(preservedHistoricalFinancialRows.map((row) => [row.jm1_socialexecutionid, row.currentDisposition]), [
    ['legacy-fb', 'EXCLUDED_LEGACY_PAGE'], ['test-ig', 'EXCLUDED_TEST_ACCOUNT']
  ]);
  assert.equal(rows[0].jm1_status, 'HELD_DESTINATION_IDENTITY_MISMATCH');
  assert.equal(rows[1].jm1_status, 'NATIVE_BOOKING_MOVED_TO_DRAFT');
});

test('current dated production identities authorize default exclusion of Financial legacy and test destinations', () => {
  const channels = [
    { brand: 'J Merrill Financial', platform: 'facebook', destinationId: '104395329284856', nativeReadback: { businessPortfolioId: '1306466683241061' } },
    { brand: 'J Merrill Financial', platform: 'instagram', destinationHandle: 'jmerrillfinancial', nativeReadback: { businessPortfolioId: '1306466683241061' } },
    { brand: 'J Merrill Financial', platform: 'linkedin', destinationId: '146207089' }
  ];
  assert.equal(hasVerifiedFinancialProductionDestinations(channels), true);
  assert.equal(hasVerifiedFinancialProductionDestinations(channels.map((entry) => entry.platform === 'instagram'
    ? { ...entry, destinationHandle: 'jmerrillfin' } : entry)), false);
  assert.equal(hasVerifiedFinancialProductionDestinations(channels.map((entry) => entry.platform === 'facebook'
    ? { ...entry, destinationId: '1270611542802820' } : entry)), false);
});

test('held worker request on a natively covered Eastern date is a suppression, while an explicit hold stays unresolved', () => {
  const scheduledAt = '2026-10-03T14:00:00Z';
  const nativeChannel = { ...channel, executionOwner: 'META_NATIVE', nativeReadback: {
    state: 'VERIFIED', observedDateET: '2026-10-02', visibleScheduledAtUtc: [scheduledAt]
  } };
  const heldRequest = { id: 'held-api', brand: channel.brand, platform: channel.platform,
    destinationId: channel.destinationId, kind: 'API_REQUEST', status: 'HELD_NATIVE_BOOKING_CONFLICT',
    scheduledAt: '2026-10-03T15:00:00Z' };
  const explicitHold = { ...heldRequest, id: 'explicit-hold', scheduledAt };
  const result = buildSocialCoverageReadback({ ...base, channels: [nativeChannel], items: [heldRequest, explicitHold],
    heldConflicts: [{ id: 'explicit-hold' }] }).channels[0];
  assert.deepEqual(result.heldNativeConflicts, ['explicit-hold']);
  assert.deepEqual(result.heldNativeCoverageSuppressions, ['held-api']);
  assert.ok(result.alertFindings.some((finding) => finding.state === 'NATIVE_BOOKING_CONFLICT'
    && finding.evidence.recordIds.includes('explicit-hold')));
  assert.ok(result.states.includes('HELD_ITEMS'));
});

test('resolved destinations do not emit unresolved-authority alerts; missing authority does', () => {
  const resolved = buildSocialCoverageReadback(base).channels[0];
  assert.ok(!resolved.alertFindings.some((finding) => finding.state === 'DESTINATION_AUTHORITY_UNRESOLVED'));

  const unresolved = buildSocialCoverageReadback({ ...base, channels: [{
    ...channel, destinationId: null, executionOwner: 'UNRESOLVED'
  }] }).channels[0];
  assert.ok(unresolved.alertFindings.some((finding) => finding.state === 'DESTINATION_AUTHORITY_UNRESOLVED'));
});

test('Dataverse readback follows every OData page and requests bounded pages', async () => {
  const calls = [];
  const pages = [
    { value: [{ id: 'first' }], '@odata.nextLink': 'https://example.test/next?$skiptoken=2' },
    { value: [{ id: 'second' }] }
  ];
  const rows = await queryDataversePages('https://example.test/rows?$select=id', 'test-token', async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => pages.shift() };
  });
  assert.deepEqual(rows.map((row) => row.id), ['first', 'second']);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
  assert.equal(calls[0].options.headers.Prefer, 'odata.maxpagesize=1000');
  assert.equal(calls[1].url, 'https://example.test/next?$skiptoken=2');
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
  assert.ok(result.states.includes('DAILY_COVERAGE_GAP'));
});

test('daily coverage scores fourteen inclusive Eastern dates and reports the next date separately', () => {
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
      nativeBookingId: 'meta-content-3', scheduledAt: '2026-10-22T14:00:00Z' },
    { id: 'preparation-unlinked', brand: channel.brand, platform: channel.platform,
      destinationId: channel.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'UNKNOWN',
      nativeBookingId: 'meta-content-4', scheduledAt: '2026-10-22T16:00:00Z' }
  ];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-08T16:00:00Z',
    channels: [datedChannel], items }).channels[0];
  assert.equal(result.nativeScheduled, 2);
  assert.equal(result.verifiedBookings, 2);
  assert.deepEqual(result.weeks.map((week) => week.verifiedBookings), [1, 1]);
  assert.equal(result.requiredDailyPlacements, 14);
  assert.equal(result.coveredDailyDates, 2);
  assert.equal(result.dailyCoverage.length, 14);
  assert.equal(result.dailyCoverage[0].dateET, '2026-10-08');
  assert.equal(result.dailyCoverage.at(-1).dateET, '2026-10-21');
  assert.equal(result.preparationDate.dateET, '2026-10-22');
  assert.equal(result.preparationDate.classification, 'PREPARATION_ONLY_NOT_IN_COMMITTED_COVERAGE');
  assert.equal(result.preparationDate.scheduledPlacementCount, 2);
  assert.equal(result.preparationDate.approvedScheduledPlacementCount, 1);
  assert.deepEqual(result.preparationDate.approvalUnverifiedReceiptIds, ['preparation-unlinked']);
  assert.equal(result.coverageStatus, 'VERIFIED_DAILY_GAP');
  assert.equal(result.missingDates.length, 12);
});

test('surplus placements on one day cannot cover a different missing date', () => {
  const datedChannel = { ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' } };
  const items = ['a', 'b', 'c'].map((id, index) => ({
    id, brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId,
    kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', nativeBookingId: `booking-${id}`,
    scheduledAt: index < 2 ? '2026-10-03T14:00:00Z' : '2026-10-04T14:00:00Z'
  }));
  const result = buildSocialCoverageReadback({ ...base, channels: [datedChannel], items }).channels[0];
  const oct3 = result.dailyCoverage.find((day) => day.dateET === '2026-10-03');
  const oct4 = result.dailyCoverage.find((day) => day.dateET === '2026-10-04');
  const oct5 = result.dailyCoverage.find((day) => day.dateET === '2026-10-05');
  assert.equal(oct3.scheduledPlacementCount, 2);
  assert.equal(oct3.qualifiesForDailyCoverage, true);
  assert.equal(oct4.scheduledPlacementCount, 1);
  assert.equal(oct4.qualifiesForDailyCoverage, true);
  assert.equal(oct5.status, 'MISSING');
  assert.ok(result.missingDates.includes('2026-10-05'));
  assert.equal(result.coveredDailyDates, 2);
});

test('pending, failed, held, and same-day overdue requests remain distinct and never count as booked', () => {
  const requests = [
    { id: 'pending-tomorrow', kind: 'API_REQUEST', status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE', scheduledAt: '2026-10-03T14:00:00Z' },
    { id: 'retryable-failure', kind: 'API_REQUEST', status: 'RETRY_REQUIRED', scheduledAt: '2026-10-04T14:00:00Z' },
    { id: 'ambiguous-result', kind: 'API_REQUEST', status: 'AMBIGUOUS_PUBLICATION_OUTCOME', scheduledAt: '2026-10-05T14:00:00Z' },
    { id: 'overdue-today', kind: 'API_REQUEST', status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE', scheduledAt: '2026-10-02T15:00:00Z' },
    { id: 'held-old', kind: 'API_REQUEST', status: 'HELD_BUSINESS', approvalState: 'HELD', scheduledAt: '2026-10-01T14:00:00Z' },
    { id: 'moved-to-draft', kind: 'API_REQUEST', status: 'NATIVE_BOOKING_MOVED_TO_DRAFT', scheduledAt: '2026-10-01T14:00:00Z' }
  ].map((item) => ({ ...item, brand: channel.brand, platform: channel.platform, destinationId: channel.destinationId }));
  const result = buildSocialCoverageReadback({ ...base, asOf: '2026-10-02T16:00:00Z', items: requests }).channels[0];
  assert.equal(result.verifiedBookings, 0);
  assert.equal(result.coveredDailyDates, 0);
  assert.ok(result.dailyCoverage.find((day) => day.dateET === '2026-10-03').pendingRequestIds.includes('pending-tomorrow'));
  assert.ok(result.dailyCoverage.find((day) => day.dateET === '2026-10-04').failedItemIds.includes('retryable-failure'));
  assert.ok(result.dailyCoverage.find((day) => day.dateET === '2026-10-05').failedItemIds.includes('ambiguous-result'));
  assert.ok(result.dailyCoverage.find((day) => day.dateET === '2026-10-02').overdueRequestIds.includes('overdue-today'));
  assert.ok(result.pastDueRequests.includes('overdue-today'));
  assert.ok(!result.pastDueRequests.includes('held-old'));
  assert.ok(!result.pastDueRequests.includes('moved-to-draft'));
  assert.ok(!result.apiRequestRows.find((item) => item.id === 'moved-to-draft').pastDue);
  assert.ok(result.states.includes('EXECUTION_FAILURE'));
  assert.ok(result.states.includes('PAST_DUE_API_REQUEST'));
  assert.ok(result.missingDates.includes('2026-10-02'));
  assert.deepEqual(result.dailyCoverage.find((day) => day.dateET === '2026-10-04').failedItemIds,
    ['retryable-failure']);
  assert.deepEqual(result.dailyCoverage.find((day) => day.dateET === '2026-10-05').failedItemIds,
    ['ambiguous-result']);
});

test('Eastern midnight boundaries assign schedule slots to the correct local dates', () => {
  const linkedIn = { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183',
    executionOwner: 'LINKEDIN_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-07' } };
  const items = [
    { id: 'before-midnight', brand: linkedIn.brand, platform: linkedIn.platform, destinationId: linkedIn.destinationId,
      kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', nativeBookingId: 'before', scheduledAt: '2026-10-08T03:30:00Z' },
    { id: 'after-midnight', brand: linkedIn.brand, platform: linkedIn.platform, destinationId: linkedIn.destinationId,
      kind: 'NATIVE_BOOKING', approvalState: 'APPROVED', nativeBookingId: 'after', scheduledAt: '2026-10-08T04:30:00Z' }
  ];
  const result = buildSocialCoverageReadback({ asOf: '2026-10-08T02:00:00Z', channels: [linkedIn], items }).channels[0];
  assert.equal(result.dailyCoverage[0].dateET, '2026-10-07');
  assert.deepEqual(result.dailyCoverage[0].scheduledReceiptIds, ['before-midnight']);
  assert.deepEqual(result.dailyCoverage[1].scheduledReceiptIds, ['after-midnight']);
  assert.equal(result.requiredDailyPlacements, 14);
  assert.equal(result.preparationDate.dateET, '2026-10-21');
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

test('duplicate audit receipts for one exact native content slot count once but both remain visible', () => {
  const captionText = 'One approved post, one native slot.';
  const captionSha256 = createHash('sha256').update(captionText).digest('hex');
  const financialPage = { brand: 'J Merrill Financial', platform: 'facebook', destinationId: '104395329284856',
    executionOwner: 'META_NATIVE', nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-02' } };
  const receipt = { brand: financialPage.brand, platform: financialPage.platform,
    destinationId: financialPage.destinationId, kind: 'NATIVE_BOOKING', approvalState: 'APPROVED',
    scheduledAt: '2026-10-03T14:00:00Z', captionText, captionSha256, mediaSha256: 'a'.repeat(64),
    nativeEvidence: { source: 'META_NATIVE_UI', observedDateET: '2026-10-02',
      scheduledAt: '2026-10-03T14:00:00Z', captionSha256 } };
  const result = buildSocialCoverageReadback({ ...base, channels: [financialPage],
    items: [{ ...receipt, id: 'receipt-original' }, { ...receipt, id: 'receipt-duplicate' }] }).channels[0];
  assert.equal(result.nativeScheduled, 1);
  assert.equal(result.verifiedBookings, 1);
  assert.equal(result.nativeBookingClaims, 2);
  assert.equal(result.nativeBookingRows.length, 2);
  assert.equal(result.nativeBookingRows.filter((row) => row.countedSlot).length, 1);
  assert.deepEqual(result.nativeBookingRows[0].sameSlotReceiptIds, ['receipt-original', 'receipt-duplicate']);
  const dailySlot = result.dailyCoverage.find((day) => day.dateET === '2026-10-03');
  assert.equal(dailySlot.scheduledPlacementCount, 1);
  assert.deepEqual(dailySlot.scheduledReceiptIds, ['receipt-original']);
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
  assert.equal(result.unverifiedDates.length, 14);
  assert.deepEqual(result.missingDates, []);
  assert.ok(result.states.includes('DAILY_COVERAGE_UNVERIFIED'));
  assert.ok(!result.states.includes('DAILY_COVERAGE_GAP'));
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
  assert.equal(result.coverageStatus, 'VERIFIED_DAILY_GAP');
  assert.equal(result.verifiedBookings, 0);
  assert.deepEqual(result.weeks.map((week) => week.verifiedBookings), [0, 0]);
  assert.ok(result.states.includes('DAILY_COVERAGE_GAP'));
  assert.ok(!result.states.includes('DAILY_COVERAGE_UNVERIFIED'));
  const alerts = report.alertFindings.filter((finding) => finding.state === 'DAILY_COVERAGE_GAP');
  const nextDay = buildSocialCoverageReadback({ ...base, asOf: '2026-10-03T16:00:00Z',
    channels: [{ ...channel, nativeReadback: { state: 'VERIFIED', observedDateET: '2026-10-03' } }], items: [] });
  const nextAlerts = nextDay.alertFindings.filter((finding) => finding.state === 'DAILY_COVERAGE_GAP');
  assert.equal(alerts.find((finding) => finding.evidence.dateET === '2026-10-03').dedupeKey,
    nextAlerts.find((finding) => finding.evidence.dateET === '2026-10-03').dedupeKey);
  assert.ok(!nextAlerts.some((finding) => finding.evidence.dateET === '2026-10-02'));
  assert.ok(nextAlerts.some((finding) => finding.evidence.dateET === '2026-10-16'));
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

test('native scheduler item identity remains distinct from booking and publication IDs', () => {
  const [row] = mapDataverseSocialRows([{
    jm1_socialexecutionid: 'native-item-distinct-1', jm1_branch: 'J Merrill Publishing',
    jm1_platform: 'facebook', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: '307480763084670', jm1_requestedschedule: '2026-10-28T14:00:00Z',
    jm1_captionversion: 'a'.repeat(64), jm1_requestedmediahash: 'b'.repeat(64),
    jm1_platformpostid: null,
    jm1_readbackstate: 'NATIVE_UI|META|AT=2026-10-14T14:00:00.000Z|NATIVE_ITEM=meta_item_123|BOOKING=NOT_EXPOSED'
  }], [{ brand: 'J Merrill Publishing', platform: 'facebook', destinationId: '307480763084670' }]).mapped;
  assert.equal(row.nativeItemId, 'meta_item_123');
  assert.equal(row.nativeBookingId, null);
  assert.equal(row.platformPostId, null);
  assert.equal(row.nativeEvidence.nativeItemId, 'meta_item_123');
  assert.equal(row.nativeEvidence.nativeBookingId, null);
});

test('fresh native receipt flows into readback without refreshing older channel-list evidence', () => {
  const oldListObservation = '2026-10-14T12:00:00.000Z';
  const receiptObservedAt = '2026-10-14T14:42:59.000Z';
  const asOf = '2026-10-14T15:00:00.000Z';
  const channel = { brand: 'J Merrill One', platform: 'facebook', destinationId: '101196349506906',
    nativeReadback: { state: 'VERIFIED', requireTimestamp: true, observedAt: oldListObservation,
      visibleScheduledAtUtc: ['2026-10-14T14:00:00Z'] } };
  const row = { jm1_socialexecutionid: 'receipt-one-fb', jm1_branch: channel.brand, jm1_platform: 'facebook',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: channel.destinationId,
    jm1_actualdestination: channel.destinationId, jm1_requestedschedule: '2026-10-28T14:00:00Z',
    jm1_actualschedule: '2026-10-28T14:00:00Z', jm1_verifiedat: receiptObservedAt,
    jm1_readbackstate: `NATIVE_UI|META|AT=${receiptObservedAt}|NATIVE_ITEM=2505453816627808|BOOKING=NOT_EXPOSED` };
  const stale = { ...row, jm1_socialexecutionid: 'receipt-stale', jm1_verifiedat: '2026-10-13T14:00:00Z',
    jm1_readbackstate: 'NATIVE_UI|META|AT=2026-10-13T14:00:00Z|NATIVE_ITEM=old_item|BOOKING=NOT_EXPOSED' };
  const wrongDestination = { ...row, jm1_socialexecutionid: 'receipt-other-page', jm1_requesteddestination: 'other-page',
    jm1_actualdestination: 'other-page' };
  const [updated] = mergeNativeBookingObservations([channel], [row, stale, wrongDestination], asOf);
  assert.equal(updated.nativeReadback.observedAt, oldListObservation);
  assert.deepEqual(updated.nativeReadback.visibleScheduledAtUtc, channel.nativeReadback.visibleScheduledAtUtc);
  assert.deepEqual(updated.nativeReadback.bookingObservations, [{ receiptId: 'receipt-one-fb',
    source: 'META_NATIVE_UI', destination: channel.destinationId, scheduledAt: '2026-10-28T14:00:00Z',
    observedAt: receiptObservedAt, nativeItemId: '2505453816627808', nativeBookingId: null,
    platformPublicationId: null }]);
});

test('LinkedIn receipt survives Dataverse whole-second timestamp storage and proves its own native detail', () => {
  const observedAt = '2026-10-14T19:19:12.989Z';
  const asOf = '2026-10-14T19:31:11.748Z';
  const destination = '106683183';
  const channel = { brand: 'J Merrill One', platform: 'linkedin', destinationId: destination,
    nativeReadback: { state: 'UNVERIFIED', observedAt: '2026-10-10T12:00:00Z', bookingObservations: [] } };
  const row = { jm1_socialexecutionid: 'one-linkedin-oct28', jm1_branch: channel.brand,
    jm1_platform: 'linkedin', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_executor: 'LINKEDIN_NATIVE',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'a'.repeat(64)}`,
    jm1_requesteddestination: destination, jm1_actualdestination: destination,
    jm1_requestedschedule: '2026-10-28T16:00:00Z', jm1_actualschedule: '2026-10-28T16:00:00Z',
    jm1_captionversion: 'b'.repeat(64), jm1_requestedmediahash: null,
    jm1_verifiedat: '2026-10-14T19:19:12Z',
    jm1_readbackstate: `NATIVE_UI|LINKEDIN|AT=${observedAt}|NATIVE_ITEM=NOT_EXPOSED|BOOKING=NOT_EXPOSED` };
  const [updated] = mergeNativeBookingObservations([channel], [row], asOf);
  assert.equal(updated.nativeReadback.observedAt, channel.nativeReadback.observedAt);
  assert.equal(updated.nativeReadback.bookingObservations[0].observedAt, observedAt);
});

test('preparation matrix reports receipt-level freshness and leaves absent channels explicit', () => {
  const channels = [
    { brand: 'J Merrill One', platform: 'facebook', destinationId: 'page-1',
      preparationDate: { scheduledReceiptIds: ['receipt-1'] },
      nativeReadback: { observedAt: '2026-10-14T12:00:00Z', bookingObservations: [
        { receiptId: 'receipt-1', source: 'META_NATIVE_UI', destination: 'page-1',
          scheduledAt: '2026-10-28T14:00:00Z', observedAt: '2026-10-14T14:42:59Z',
          nativeItemId: 'item-123', nativeBookingId: null, platformPublicationId: null },
        { receiptId: 'receipt-duplicate', source: 'META_NATIVE_UI', destination: 'page-1',
          scheduledAt: '2026-10-28T14:00:00Z', observedAt: '2026-10-14T14:43:00Z',
          nativeItemId: 'item-123', nativeBookingId: null, platformPublicationId: null }
      ] } },
    { brand: 'J Merrill One', platform: 'linkedin', destinationId: 'org-1',
      nativeReadback: { observedAt: '2026-10-14T12:20:00Z', bookingObservations: [] },
      preparationDate: { scheduledReceiptIds: [] } }
  ];
  const items = [
    { id: 'receipt-1', status: 'NATIVE_BOOKED_VERIFIED', destinationId: 'page-1',
      scheduledAt: '2026-10-28T14:00:00Z', nativeItemId: 'item-123', nativeBookingId: null, platformPostId: null,
      approvalState: 'UNKNOWN', nativeApprovalReason: 'SOURCE_COPY_NOT_PROVEN',
      nativeEvidence: { source: 'META_NATIVE_UI', observedAt: '2026-10-14T14:42:59Z' } },
    { id: 'linkedin-pending', status: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED', brand: 'J Merrill One', platform: 'linkedin',
      destinationId: 'org-1', scheduledAt: '2026-10-28T16:00:00Z' }
  ];
  const result = buildPreparationDateMatrix(channels, items, '2026-10-28');
  assert.equal(result[0].scheduledPlacementCount, 1);
  assert.equal(result[0].approvedScheduledPlacementCount, 0);
  assert.deepEqual(result[0].approvalUnverifiedReceiptIds, ['receipt-1']);
  assert.equal(result[0].evidence[0].nativeItemId, 'item-123');
  assert.equal(result[0].evidence[0].nativeBookingId, null);
  assert.equal(result[0].evidence[0].platformPublicationId, null);
  assert.equal(result[0].channelListObservedAt, '2026-10-14T12:00:00Z');
  assert.equal(result[1].scheduledPlacementCount, 0);
  assert.deepEqual(result[1].workerHolds, [{ receiptId: 'linkedin-pending',
    status: 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED', destination: 'org-1', scheduledAt: '2026-10-28T16:00:00Z' }]);
});

test('LinkedIn exact scheduled-list slot proves occupancy without inventing caption or booking IDs', () => {
  const observedAt = new Date().toISOString();
  const schedule = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const channel = { brand: 'J Merrill One', platform: 'linkedin', destinationId: '106683183',
    nativeReadback: { state: 'VERIFIED', requireTimestamp: true, observedAt,
      visibleScheduledAtUtc: [schedule] } };
  const row = { jm1_socialexecutionid: 'legacy-li-booking', jm1_branch: channel.brand,
    jm1_platform: 'linkedin', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_executor: 'LINKEDIN_NATIVE',
    jm1_requesteddestination: channel.destinationId, jm1_actualdestination: channel.destinationId,
    jm1_requestedschedule: schedule, jm1_actualschedule: null, jm1_captionversion: 'a'.repeat(64),
    jm1_readbackstate: 'MBS_BOOKED|2026-10-08T15:55:00.000Z|CONTENT_ID=NOT_EXPOSED' };
  const mapped = mapDataverseSocialRows([row], [channel]).mapped[0];
  assert.equal(mapped.nativeEvidence.source, 'LINKEDIN_NATIVE_UI');
  assert.equal(mapped.nativeEvidence.scheduleListOnly, true);
  assert.equal(mapped.nativeEvidence.scheduledAt, schedule);
  assert.equal(mapped.nativeEvidence.captionSha256, null);
  assert.equal(mapped.nativeBookingId, null);
  const result = buildSocialCoverageReadback({ asOf: observedAt, channels: [channel], items: [mapped] }).channels[0];
  assert.equal(result.observedScheduledBookings, 1);
  assert.equal(result.verifiedBookings, 0);
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
  assert.equal(report.coverageStatus, 'VERIFIED_DAILY_GAP');
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

test('held native booking conflicts remain actionable but distinct from failed executions', () => {
  const conflict = { id: 'api-native-conflict', kind: 'API_REQUEST', brand: channel.brand,
    platform: channel.platform, destinationId: channel.destinationId,
    status: 'HELD_NATIVE_BOOKING_CONFLICT', scheduledAt: '2026-10-13T14:00:00Z' };
  const result = buildSocialCoverageReadback({ ...base, items: [conflict] }).channels[0];
  assert.ok(result.states.includes('HELD_ITEMS'));
  assert.ok(result.states.includes('NATIVE_BOOKING_CONFLICT'));
  assert.ok(!result.states.includes('EXECUTION_FAILURE'));
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.heldNativeConflicts, ['api-native-conflict']);
  assert.ok(result.alertFindings.some((finding) => finding.action === 'RECONCILE_NATIVE_BOOKING_CONFLICT'
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
    approvalState: 'APPROVED', status: 'NATIVE_BOOKED_VERIFIED',
    nativeApprovalEvidence: { contentId: 'content-live', creativeId: 'creative-live' },
    nativeApprovalReason: 'EXACT_AUTHORITY_LINKAGE_PASS' };
  const approved = reconcileNativeDataverseClaims([native], [approvedSource], '2026-10-10T22:00:00Z');
  assert.equal(approved.items[0].approvalState, 'APPROVED');
  assert.deepEqual(approved.items[0].nativeApprovalEvidence, approvedSource.nativeApprovalEvidence);
  assert.equal(approved.items[0].nativeApprovalReason, 'EXACT_AUTHORITY_LINKAGE_PASS');
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

  const persistedBooking = socialRow('rolling-2026-10-12-1', booking.jm1_requestedschedule, 'social-current');
  persistedBooking.jm1_status = 'NATIVE_BOOKED_VERIFIED';
  const persistedProof = nativeSocialApprovalProjection(booking, {
    campaigns: [campaign], content: [contentRow('rolling-2026-10-12-1', 'content-current')],
    creatives: [creativeRow('rolling-2026-10-12-1', 'creative-current')], socialRows: [persistedBooking]
  }, (authority, content) => authority === campaign && content.jm1_copybrief.includes('APPROVED_TEMPLATE_SET:v1'));
  assert.equal(persistedProof.state, 'APPROVED');

  const mapped = mapDataverseSocialRows([{ ...booking, jm1_socialexecutionid: 'booking-1',
    nativeApprovalState: proof.state, nativeApprovalEvidence: proof.evidence }],
  [{ brand, platform: 'linkedin', destinationId: '106683183' }]).mapped[0];
  assert.equal(mapped.approvalState, 'APPROVED');
  assert.equal(mapped.nativeApprovalEvidence.socialExecutionId, 'social-current');
});

test('caption-version pointers reconcile only after the exact approved template validates', () => {
  const brand = 'J Merrill Publishing';
  const marker = 'jm1-native-social-2026-10:j-merrill-publishing';
  const stage = 'rolling-2026-10-12-1';
  const caption = 'Exact template copy';
  const version = `${marker}:caption:${stage}:v1`;
  const booking = { jm1_socialexecutionid: 'booking-pointer', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_branch: brand, jm1_platform: 'linkedin', jm1_requesteddestination: '13048648',
    jm1_requestedschedule: '2026-10-13T16:00:00Z', jm1_captionversion: version,
    jm1_requestedmediahash: 'f'.repeat(64) };
  const campaign = { jm1_campaignauthorityid: 'campaign-pointer', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const content = { jm1_contentworkid: 'content-pointer', jm1_idempotencykey: `${marker}:content:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: 'APPROVED_TEMPLATE_SET:v1' };
  const creative = { jm1_creativeworkid: 'creative-pointer', jm1_idempotencykey: `${marker}:creative:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: 'f'.repeat(64) };
  const source = { jm1_socialexecutionid: booking.jm1_socialexecutionid,
    jm1_idempotencykey: `${marker}:social:${stage}:linkedin`, jm1_branch: brand, jm1_platform: 'linkedin',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requesteddestination: booking.jm1_requesteddestination,
    jm1_requestedschedule: booking.jm1_requestedschedule, jm1_captionversion: version,
    jm1_requestedmediahash: 'f'.repeat(64) };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [source] };
  const exactTemplate = (_authority, item) => item.jm1_draftcopy === caption
    && item.jm1_copybrief === 'APPROVED_TEMPLATE_SET:v1';
  assert.equal(nativeSocialApprovalProjection(booking, rows, exactTemplate).state, 'APPROVED');
  const changed = nativeSocialApprovalProjection(booking, { ...rows,
    content: [{ ...content, jm1_draftcopy: 'Different copy' }] }, exactTemplate);
  assert.equal(changed.state, 'UNKNOWN');
});

test('hash-keyed native reservations link only to one approved stage with exact destination, time, and creative', () => {
  const brand = 'J Merrill One';
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const stage = 'rolling-2026-10-12-1';
  const caption = 'A practical starting question can clarify the next step.';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'a'.repeat(64);
  const observedAt = new Date().toISOString();
  const scheduledAt = '2026-10-13T16:00:00Z';
  const booking = { jm1_socialexecutionid: 'reservation-one-li',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'b'.repeat(64)}`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'linkedin',
    jm1_requesteddestination: '106683183', jm1_actualdestination: '106683183',
    jm1_requestedschedule: scheduledAt, jm1_actualschedule: scheduledAt, jm1_verifiedat: observedAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign-reservation',
    jm1_idempotencykey: `${marker}:campaign`, jm1_branch: brand,
    jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const content = { jm1_contentworkid: 'content-reservation',
    jm1_idempotencykey: `${marker}:content:${stage}`, jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `APPROVED_TEMPLATE_SET:v1; campaign=${marker}:campaign; theme=UMBRELLA_GUIDANCE; platforms=linkedin` };
  const creative = { jm1_creativeworkid: 'creative-reservation',
    jm1_idempotencykey: `${marker}:creative:${stage}`, jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [] };
  const approved = (_campaign, item) => item.jm1_copybrief.includes('APPROVED_TEMPLATE_SET:v1')
    && item.jm1_copybrief.includes('theme=UMBRELLA_GUIDANCE');
  const scheduleForStage = (candidate, platform) => candidate === stage && platform === 'linkedin'
    ? `${booking.jm1_requestedschedule.replace(/Z$/, '.000Z')}` : null;
  const nativeReadback = { state: 'VERIFIED', observedAt, visibleScheduledAtUtc: [scheduledAt] };

  assert.equal(nativeSocialApprovalProjection(booking, rows, approved, scheduleForStage, '106683183', nativeReadback).state, 'APPROVED');
  for (const change of [
    { jm1_requesteddestination: '13048648' },
    { jm1_requestedschedule: '2026-10-14T16:00:00Z' },
    { jm1_captionversion: 'c'.repeat(64) },
    { jm1_requestedmediahash: 'd'.repeat(64) }
  ]) {
    assert.equal(nativeSocialApprovalProjection({ ...booking, ...change }, rows, approved, scheduleForStage, '106683183', nativeReadback).state, 'UNKNOWN');
  }
  assert.equal(nativeSocialApprovalProjection(booking, { ...rows,
    campaigns: [{ ...campaign, jm1_state: 'HELD' }] }, approved, scheduleForStage, '106683183', nativeReadback).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...rows,
    content: [{ ...content, jm1_copybrief: content.jm1_copybrief.replace('platforms=linkedin', 'platforms=facebook') }] },
    approved, scheduleForStage, '106683183', nativeReadback).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, { ...rows,
    content: [content, { ...content, jm1_contentworkid: 'ambiguous-content' }] }, approved, scheduleForStage, '106683183', nativeReadback).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, rows, approved, scheduleForStage).state, 'UNKNOWN');
});

test('native reservations link batch-approved exact content by its source key and verified current slot', () => {
  const brand = 'J Merrill Financial';
  const marker = 'jm1-native-social-2026-10:j-merrill-financial';
  const stage = 'f-fb2';
  const schedule = '2026-10-14T14:00:00.000Z';
  const observedAt = new Date().toISOString();
  const caption = 'One folder can make a difficult conversation easier. Start with three lists. https://www.jmerrill.financial/services';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'a'.repeat(64);
  const booking = { jm1_socialexecutionid: 'native-fb-receipt',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'b'.repeat(64)}`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'facebook',
    jm1_executor: 'META_NATIVE',
    jm1_requesteddestination: '104395329284856', jm1_actualdestination: '104395329284856',
    jm1_requestedschedule: schedule, jm1_actualschedule: schedule, jm1_verifiedat: observedAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash,
    jm1_readbackstate: `NATIVE_UI|META|AT=${observedAt}|BOOKING=NOT_EXPOSED` };
  const campaign = { jm1_campaignauthorityid: 'approved-financial-campaign',
    jm1_idempotencykey: `${marker}:campaign`, jm1_branch: brand, jm1_campaigntype: 'native_social',
    jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'approved-fb-content', jm1_idempotencykey: `${marker}:content:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Standing founder marketing authority; source https://www.jmerrill.financial/services; caption SHA-256 ${captionHash}; batch JM1-THREE-BRAND-NATIVE-BATCH-2026-10` };
  const creative = { jm1_creativeworkid: 'approved-fb-creative', jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const nativeReadback = { state: 'VERIFIED', observedAt, visibleScheduledAtUtc: [schedule] };
  const result = nativeSocialApprovalProjection(booking, {
    campaigns: [campaign], content: [content], creatives: [creative], socialRows: []
  }, () => false, () => null, ['104395329284856'], nativeReadback);
  assert.equal(result.state, 'APPROVED', result.reason);
  assert.deepEqual(result.evidence, {
    campaignId: 'approved-financial-campaign', contentId: 'approved-fb-content',
    creativeId: 'approved-fb-creative', socialExecutionId: 'native-fb-receipt',
    sourceStatus: 'NATIVE_BOOKED_VERIFIED', stage
  });
  const heldPlatformContent = { ...content, jm1_copybrief: `${content.jm1_copybrief}; platforms=instagram` };
  assert.equal(nativeSocialApprovalProjection(booking, {
    campaigns: [campaign], content: [heldPlatformContent], creatives: [creative], socialRows: []
  }, () => false, () => null, ['104395329284856'], nativeReadback).state, 'UNKNOWN');
});

test('native reservation links an exact-caption approval whose source URL lives in its approval record', () => {
  const brand = 'J Merrill Financial';
  const marker = 'jm1-native-social-2026-10:j-merrill-financial';
  const stage = 'financial-facebook-oct-21';
  const schedule = '2026-10-21T14:00:00Z';
  const observedAt = new Date().toISOString();
  const caption = 'Before a planning conversation, make a short list: what matters most to you, which people should be included, and what questions need answers. Keep important records together and let someone you trust know where they are. A qualified professional can explain options that fit your circumstances. Educational information only; this is not legal or insurance advice.';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const booking = { jm1_socialexecutionid: 'financial-fb-oct21',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'c'.repeat(64)}`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'facebook', jm1_executor: 'META_NATIVE',
    jm1_requesteddestination: '104395329284856', jm1_actualdestination: '104395329284856',
    jm1_requestedschedule: schedule, jm1_actualschedule: schedule, jm1_verifiedat: observedAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: null,
    jm1_readbackstate: `NATIVE_UI|META|AT=${observedAt}|BOOKING=NOT_EXPOSED` };
  const campaign = { jm1_campaignauthorityid: 'financial-approved-campaign',
    jm1_idempotencykey: `${marker}:campaign`, jm1_branch: brand, jm1_campaigntype: 'native_social',
    jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'financial-fb-oct21-content',
    jm1_idempotencykey: `${marker}:${stage}:content`, jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Standing founder marketing authority; source https://www.jmerrill.financial/services; caption SHA-256 ${captionHash}; exact native booking readback 1100798145981063.` };
  const nativeReadback = { state: 'VERIFIED', observedAt, visibleScheduledAtUtc: [schedule] };
  const result = nativeSocialApprovalProjection(booking, {
    campaigns: [campaign], content: [content], creatives: [], socialRows: []
  }, () => false, () => null, ['104395329284856'], nativeReadback);
  assert.equal(result.state, 'APPROVED', result.reason);
  assert.equal(result.evidence.contentId, 'financial-fb-oct21-content');
  const legacyReceipt = { ...booking, jm1_actualdestination: null, jm1_actualschedule: null,
    jm1_verifiedat: null,
    jm1_readbackstate: `NATIVE_UI|META|AT=${observedAt}|BOOKING=NOT_EXPOSED` };
  assert.equal(nativeSocialApprovalProjection(legacyReceipt, {
    campaigns: [campaign], content: [content], creatives: [], socialRows: []
  }, () => false, () => null, ['104395329284856'], nativeReadback).state, 'APPROVED');
  assert.equal(nativeSocialApprovalProjection({ ...legacyReceipt, jm1_requesteddestination: '1270611542802820' }, {
    campaigns: [campaign], content: [content], creatives: [], socialRows: []
  }, () => false, () => null, ['104395329284856'], nativeReadback).state, 'UNKNOWN');
});

test('Financial Instagram adaptation links current provenance by its colon-qualified stage and item receipt', () => {
  const brand = 'J Merrill Financial';
  const marker = 'jm1-native-social-2026-10:j-merrill-financial';
  const stage = 'daily-2026-10-28:instagram-adaptation';
  const schedule = '2026-10-28T15:00:00Z';
  const observedAt = new Date().toISOString();
  const destination = '@jmerrillfinancial';
  const caption = 'For an estate-planning conversation, start with three notes: the questions you want to ask, where important records are kept, and who should be included. A qualified professional can explain options for your circumstances. Educational information only; not legal, tax, or insurance advice.\n\nhttps://jmerrill.financial/';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = '8434350433980461cb4ef66bf755b0509b4410358fa6df0ee6fb9adee5522b2c';
  const booking = { jm1_socialexecutionid: 'financial-ig-oct28',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'d'.repeat(64)}`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'instagram', jm1_executor: 'META_NATIVE',
    jm1_requesteddestination: destination, jm1_actualdestination: destination,
    jm1_requestedschedule: schedule, jm1_actualschedule: schedule, jm1_verifiedat: observedAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash,
    jm1_readbackstate: `NATIVE_UI|META|AT=${observedAt}|NATIVE_ITEM=1639799244268167|BOOKING=NOT_EXPOSED` };
  const campaign = { jm1_campaignauthorityid: 'financial-campaign', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const provenance = { version: 1,
    authorizationBasis: 'Founder standing authorization for ordinary compliant social content on the nine approved brand channels',
    reconciledAt: observedAt, brand, platform: 'instagram', destination,
    scheduledAt: schedule, captionSha256: captionHash, mediaSha256: mediaHash,
    sourceUrl: 'https://jmerrill.financial/',
    validation: { sourceHost: 'jmerrill.financial', brandAndClaims: 'PASS', rightsAndCreative: 'PASS',
      creativeAltText: 'J Merrill Financial estate-readiness editorial card; full educational caption accompanies the post.' } };
  const content = { jm1_contentworkid: 'financial-ig-content',
    jm1_idempotencykey: `${marker}:content:${stage}`, jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `NATIVE_SOCIAL_PROVENANCE_V1\n${JSON.stringify(provenance)}` };
  const creative = { jm1_creativeworkid: 'financial-ig-creative', jm1_branch: brand,
    jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const nativeReadback = { state: 'VERIFIED', observedAt,
    visibleScheduledAtUtc: [], bookingObservations: [{ receiptId: booking.jm1_socialexecutionid,
      source: 'META_NATIVE_UI', destination, scheduledAt: schedule, observedAt,
      nativeItemId: '1639799244268167', nativeBookingId: null }] };
  const result = nativeSocialApprovalProjection(booking, { campaigns: [campaign], content: [content],
    creatives: [creative], socialRows: [] }, () => false, () => null, [destination], nativeReadback);
  assert.equal(result.state, 'APPROVED', result.reason);
  assert.equal(result.evidence.contentId, 'financial-ig-content');
  assert.equal(result.evidence.creativeId, 'financial-ig-creative');
});

test('native reservation remains the sole authority when its colliding worker request is held', () => {
  const brand = 'J Merrill Publishing';
  const marker = 'jm1-native-social-2026-10:j-merrill-publishing';
  const stage = 'rolling-2026-10-12-1';
  const caption = 'J Merrill Publishing works with books and the people who create them.\n\nhttps://jmerrill.pub/books';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'a'.repeat(64);
  const schedule = '2026-10-13T15:00:00Z';
  const observedAt = new Date().toISOString();
  const reservation = { jm1_socialexecutionid: 'native-reservation',
    jm1_idempotencykey: `jm1-native-reservation-v1:${'b'.repeat(64)}`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'instagram',
    jm1_executor: 'META_NATIVE', jm1_requesteddestination: '17841410046020869', jm1_actualdestination: '17841410046020869',
    jm1_requestedschedule: schedule, jm1_actualschedule: schedule, jm1_verifiedat: observedAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const content = { jm1_contentworkid: 'content', jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `APPROVED_TEMPLATE_SET:v1; campaign=${marker}:campaign; theme=PUBLISHER_IDENTITY; platforms=instagram` };
  const creative = { jm1_creativeworkid: 'creative', jm1_branch: brand, jm1_stage: stage,
    jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const heldWorkerRequest = { jm1_socialexecutionid: 'held-api-request',
    jm1_idempotencykey: `${marker}:social:${stage}:instagram`, jm1_status: 'HELD_NATIVE_BOOKING_CONFLICT',
    jm1_branch: brand, jm1_platform: 'instagram', jm1_requesteddestination: reservation.jm1_requesteddestination,
    jm1_requestedschedule: schedule, jm1_captionversion: `${marker}:caption:${stage}:v1`,
    jm1_requestedmediahash: mediaHash };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [heldWorkerRequest] };
  const scheduleForStage = (candidate, platform) => candidate === stage && platform === 'instagram'
    ? '2026-10-13T15:00:00.000Z' : null;
  const nativeReadback = { state: 'VERIFIED', observedAt, visibleScheduledAtUtc: [schedule] };
  const result = nativeSocialApprovalProjection(reservation, rows, () => true, scheduleForStage,
    ['17841410046020869', 'jmerrillpub'], nativeReadback);
  assert.equal(result.state, 'APPROVED');
  assert.equal(result.evidence.socialExecutionId, 'native-reservation');
});

test('legacy LinkedIn booking authority carries through only with a fresh exact scheduled-list slot', () => {
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const stage = 'one-linkedin-2026-10-16';
  const schedule = '2026-10-16T14:00:00Z';
  const caption = 'Useful organizations make the next step clearer. J Merrill One brings distinct divisions together while each keeps responsibility for its own work. Explore the company and choose the path that fits: https://www.jmerrill.one/';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const campaign = { jm1_campaignauthorityid: 'campaign', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: 'J Merrill One', jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'content', jm1_idempotencykey: `${marker}:${stage}:content`,
    jm1_branch: 'J Merrill One', jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Exact native UI readback in SOCIAL-LINKEDIN-NATIVE-2026-10-08T1552Z; caption SHA-256 ${captionHash}.` };
  const booking = { jm1_socialexecutionid: 'legacy-linkedin', jm1_idempotencykey: `${marker}:${stage}:social`,
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: 'J Merrill One', jm1_platform: 'linkedin',
    jm1_executor: 'LINKEDIN_NATIVE', jm1_requesteddestination: '106683183', jm1_actualdestination: '106683183',
    jm1_requestedschedule: schedule, jm1_actualschedule: null, jm1_captionversion: captionHash,
    jm1_requestedmediahash: null, jm1_verifiedat: '2026-10-08T15:55:00Z',
    jm1_readbackstate: 'MBS_BOOKED|2026-10-08T15:55:00.000Z|CONTENT_ID=NOT_EXPOSED' };
  const nativeReadback = { state: 'VERIFIED', requireTimestamp: true,
    observedAt: new Date(Date.now() - 60_000).toISOString(), visibleScheduledAtUtc: [schedule] };
  const rows = { campaigns: [campaign], content: [content], creatives: [], socialRows: [booking] };
  assert.equal(nativeSocialApprovalProjection(booking, rows, () => false, () => null,
    '106683183', nativeReadback).state, 'APPROVED');
  assert.equal(nativeSocialApprovalProjection(booking, rows, () => false, () => null,
    '106683183', { ...nativeReadback, visibleScheduledAtUtc: [] }).state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection(booking, rows, () => false, () => null,
    '106683183', { ...nativeReadback, observedAt: '2026-10-08T15:56:00Z' }).state, 'UNKNOWN');
});

test('current eligible API requests inherit only exact approved campaign, stage, and destination authority', () => {
  const brand = 'J Merrill One';
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const stage = 'rolling-2026-10-12-1';
  const caption = 'When a project spans different needs, start by naming the question you need answered.';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'c'.repeat(64);
  const schedule = '2026-10-13T14:00:00Z';
  const request = { jm1_socialexecutionid: 'approved-request',
    jm1_idempotencykey: `${marker}:social:${stage}:facebook`, jm1_status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
    jm1_branch: brand, jm1_platform: 'facebook', jm1_requesteddestination: '101196349506906',
    jm1_requestedschedule: schedule, jm1_captionversion: `${marker}:caption:${stage}:v1`,
    jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED' };
  const content = { jm1_contentworkid: 'content', jm1_idempotencykey: `${marker}:content:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption };
  const creative = { jm1_creativeworkid: 'creative', jm1_idempotencykey: `${marker}:creative:${stage}`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [request] };
  const scheduleForStage = (candidate, platform) => candidate === stage && platform === 'facebook' ? schedule : null;
  assert.equal(nativeSocialApprovalProjection(request, rows, () => true, scheduleForStage,
    '101196349506906').state, 'APPROVED');
  assert.equal(nativeSocialApprovalProjection({ ...request, jm1_requesteddestination: '104395329284856' },
    rows, () => true, scheduleForStage, '101196349506906').state, 'UNKNOWN');
  assert.equal(nativeSocialApprovalProjection({ ...request, jm1_requestedschedule: '2026-10-14T14:00:00Z' },
    rows, () => true, scheduleForStage, '101196349506906').state, 'UNKNOWN');
});

test('LinkedIn scheduled-list receipts reconcile only with exact persisted booking bindings and recent verification', () => {
  const verifiedAt = new Date().toISOString();
  const row = {
    jm1_socialexecutionid: 'financial-li-booking', jm1_branch: 'J Merrill Financial', jm1_platform: 'linkedin',
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_executor: 'LINKEDIN_NATIVE',
    jm1_requesteddestination: '146207089', jm1_actualdestination: '146207089',
    jm1_requestedschedule: '2026-10-23T20:00:00Z', jm1_actualschedule: '2026-10-23T20:00:00Z',
    jm1_captionversion: 'f'.repeat(64), jm1_verifiedat: verifiedAt,
    jm1_readbackstate: 'LINKEDIN_UI_SCHEDULED_LIST;BOOKING_ID=NOT_EXPOSED'
  };
  const mapped = mapDataverseSocialRows([row], [{ brand: 'J Merrill Financial', platform: 'linkedin',
    destinationId: '146207089' }]).mapped[0];
  assert.equal(mapped.nativeBookingId, null);
  assert.equal(mapped.nativeEvidence.source, 'LINKEDIN_NATIVE_UI');
  assert.equal(mapped.nativeEvidence.requireTimestamp, true);
  assert.equal(mapped.nativeEvidence.scheduledAt, row.jm1_actualschedule);
  assert.equal(mapped.nativeEvidence.captionSha256, row.jm1_captionversion);

  for (const change of [
    { jm1_actualdestination: '13048648' },
    { jm1_actualschedule: '2026-10-24T20:00:00Z' },
    { jm1_executor: 'AZURE_WORKER' },
    { jm1_verifiedat: '2026-10-08T00:00:00Z' },
    { jm1_readbackstate: 'LINKEDIN_UI_SCHEDULED_LIST;BOOKING_ID=NOT_EXPOSED;UNVERIFIED' }
  ]) {
    const candidate = mapDataverseSocialRows([{ ...row, ...change }], [{ brand: 'J Merrill Financial',
      platform: 'linkedin', destinationId: '146207089' }]).mapped[0];
    assert.equal(candidate.nativeEvidence, null);
  }
});

test('legacy native booking keys resolve exact source linkage and require campaign, source, hash, and native ID authority', () => {
  const brand = 'J Merrill One';
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const stage = 'one-instagram-oct-15';
  const caption = 'Legacy scheduled copy https://www.jmerrill.one/';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'd'.repeat(64);
  const booking = { jm1_socialexecutionid: 'social-legacy', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand, jm1_platform: 'instagram',
    jm1_requesteddestination: '@jmerrillone', jm1_requestedschedule: '2026-10-15T14:00:00Z',
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign-legacy', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'content-legacy', jm1_idempotencykey: `${marker}:${stage}:content`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Standing founder marketing authority; source https://www.jmerrill.one/; caption SHA-256 ${captionHash}; exact native booking readback 1586935576565032.` };
  const creative = { jm1_creativeworkid: 'creative-legacy', jm1_idempotencykey: `${marker}:${stage}:creative`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const source = { jm1_socialexecutionid: 'social-legacy', jm1_idempotencykey: `${marker}:${stage}:social`,
    jm1_branch: brand, jm1_platform: 'instagram', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: '@jmerrillone', jm1_requestedschedule: booking.jm1_requestedschedule,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash,
    jm1_readbackstate: 'META_SCHEDULED_NATIVE_CONTENT_ID_1586935576565032_DESTINATION_AND_TIME_VERIFIED' };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [source] };
  const result = nativeSocialApprovalProjection(booking, rows, () => false);
  assert.equal(result.state, 'APPROVED');
  assert.deepEqual(result.evidence, { campaignId: 'campaign-legacy', contentId: 'content-legacy',
    creativeId: 'creative-legacy', socialExecutionId: 'social-legacy', sourceStatus: 'NATIVE_BOOKED_VERIFIED', stage });

  assert.equal(matchesApprovedLegacyNativeSocialContent({ ...campaign, jm1_supersession: 'unrelated authority' }, content,
    { booking, source }), false);
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign,
    { ...content, jm1_copybrief: content.jm1_copybrief.replace('www.jmerrill.one', 'attacker.example') },
    { booking, source }), false);
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign,
    { ...content, jm1_copybrief: content.jm1_copybrief.replace('1586935576565032', '999') },
    { booking, source }), false);
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign, content,
    { booking, source: { ...source, jm1_readbackstate: 'MBS_BOOKED|2026-10-10|CONTENT_ID=999' } }), false);

  const mismatched = nativeSocialApprovalProjection({ ...booking, jm1_requestedschedule: '2026-10-16T14:00:00Z' }, rows, () => true);
  assert.equal(mismatched.state, 'UNKNOWN');
  assert.equal(mismatched.reason, 'NO_EXACT_SOURCE_LINKAGE');

  const ambiguous = nativeSocialApprovalProjection(booking, { ...rows,
    socialRows: [source, { ...source }] }, () => true);
  assert.equal(ambiguous.state, 'UNKNOWN');
  assert.equal(ambiguous.reason, 'AMBIGUOUS_EXACT_SOURCE_LINKAGE');
});

test('dated standing-authorization provenance reconciles an exact native reservation without backdating', () => {
  const brand = 'J Merrill One';
  const caption = 'Different needs call for different owners. J Merrill One brings Publishing, Financial, Foundation, and Productions together while each team keeps its own work and responsibility. Visit https://www.jmerrill.one/ to find the right path for your question.';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const observedAt = new Date().toISOString();
  const schedule = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const booking = { jm1_socialexecutionid: 'native-one-fb', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand,
    jm1_platform: 'facebook', jm1_executor: 'META_NATIVE', jm1_requesteddestination: '101196349506906',
    jm1_requestedschedule: schedule, jm1_captionversion: captionHash, jm1_requestedmediahash: null,
    jm1_readbackstate: `NATIVE_UI|META|AT=${observedAt}|BOOKING=981487517620543` };
  const campaign = { jm1_campaignauthorityid: 'one-approved-campaign', jm1_branch: brand, jm1_campaigntype: 'native_social',
    jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const provenance = { version: 1,
    authorizationBasis: 'Founder standing authorization for ordinary compliant social content on the nine approved brand channels',
    reconciledAt: observedAt, brand, platform: 'facebook', destination: booking.jm1_requesteddestination,
    scheduledAt: schedule, captionSha256: captionHash, mediaSha256: null,
    validation: { sourceHost: 'www.jmerrill.one', brandAndClaims: 'PASS', rightsAndCreative: 'LINK_PREVIEW_ONLY' } };
  const content = { jm1_contentworkid: 'one-content', jm1_idempotencykey: 'fixture:content:one', jm1_branch: brand,
    jm1_stage: 'one-facebook-oct22', jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `NATIVE_SOCIAL_PROVENANCE_V1\n${JSON.stringify(provenance)}` };
  const source = { ...booking };
  const nativeReadback = { state: 'VERIFIED', observedAt, visibleScheduledAtUtc: [schedule] };
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign, content, { booking, source, nativeReadback }), true);
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign, { ...content,
    jm1_copybrief: content.jm1_copybrief.replace(booking.jm1_requesteddestination, 'wrong-page') }, { booking, source, nativeReadback }), false);
  assert.equal(matchesApprovedLegacyNativeSocialContent(campaign, { ...content,
    jm1_copybrief: `NATIVE_SOCIAL_PROVENANCE_V1\n${JSON.stringify({ ...provenance,
      authorizationBasis: 'Created approval after the fact' })}` }, { booking, source, nativeReadback }), false);
});

test('approved native-batch content reconciles LinkedIn bookings without fabricating a booking ID', () => {
  const brand = 'J Merrill Financial';
  const marker = 'jm1-native-social-2026-10:j-merrill-financial';
  const stage = 'f-li';
  const caption = 'Estate readiness starts with knowing where important documents are kept. Learn more: https://www.jmerrill.financial/services';
  const captionHash = createHash('sha256').update(caption).digest('hex');
  const mediaHash = 'e'.repeat(64);
  const scheduledAt = '2026-10-12T14:00:00Z';
  const booking = { jm1_socialexecutionid: 'financial-li', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand,
    jm1_platform: 'linkedin', jm1_requesteddestination: '146207089', jm1_requestedschedule: scheduledAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash };
  const campaign = { jm1_campaignauthorityid: 'campaign-fin-li', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'content-fin-li', jm1_idempotencykey: `${marker}:${stage}:content`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Standing founder marketing authority; source https://www.jmerrill.financial/services; caption SHA-256 ${captionHash}; batch JM1-THREE-BRAND-NATIVE-BATCH-2026-10` };
  const creative = { jm1_creativeworkid: 'creative-fin-li', jm1_idempotencykey: `${marker}:${stage}:creative`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_assethash: mediaHash };
  const source = { jm1_socialexecutionid: booking.jm1_socialexecutionid, jm1_idempotencykey: `${marker}:${stage}:social`,
    jm1_branch: brand, jm1_platform: 'linkedin', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_executor: 'LINKEDIN_NATIVE',
    jm1_requesteddestination: '146207089', jm1_actualdestination: '146207089',
    jm1_requestedschedule: scheduledAt, jm1_actualschedule: scheduledAt,
    jm1_captionversion: captionHash, jm1_requestedmediahash: mediaHash,
    jm1_verifiedat: new Date().toISOString(),
    jm1_readbackstate: 'LINKEDIN_NATIVE_SCHEDULED_IMAGE_ALT_MATCH_PLATFORM_SHORT_URL' };
  const rows = { campaigns: [campaign], content: [content], creatives: [creative], socialRows: [source] };
  assert.equal(nativeSocialApprovalProjection(booking, rows, () => false).state, 'APPROVED');

  for (const [contentChange, sourceChange] of [
    [{ jm1_copybrief: content.jm1_copybrief.replace('www.jmerrill.financial', 'attacker.example') }, {}],
    [{ jm1_copybrief: content.jm1_copybrief.replace(captionHash, 'a'.repeat(64)) }, {}],
    [{}, { jm1_readbackstate: 'LINKEDIN_NATIVE_SCHEDULED_IMAGE_ALT_MATCH_PLATFORM_SHORT_URL;BOOKING_ID=123' }],
    [{}, { jm1_verifiedat: '2026-10-08T00:00:00Z' }]
  ]) {
    const result = nativeSocialApprovalProjection(booking, { ...rows,
      content: [{ ...content, ...contentChange }], socialRows: [{ ...source, ...sourceChange }] }, () => false);
    assert.equal(result.state, 'UNKNOWN');
  }

  const metaBooking = { ...booking, jm1_socialexecutionid: 'financial-fb', jm1_platform: 'facebook',
    jm1_requesteddestination: '1270611542802820', jm1_requestedschedule: '2026-10-14T14:00:00Z',
    jm1_captionversion: captionHash };
  const metaSource = { ...source, jm1_socialexecutionid: metaBooking.jm1_socialexecutionid,
    jm1_platform: 'facebook', jm1_executor: 'META_NATIVE', jm1_requesteddestination: metaBooking.jm1_requesteddestination,
    jm1_actualdestination: metaBooking.jm1_requesteddestination, jm1_requestedschedule: metaBooking.jm1_requestedschedule,
    jm1_actualschedule: metaBooking.jm1_requestedschedule, jm1_readbackstate: 'META_SCHEDULED_LIST_MATCH' };
  const metaContent = content;
  assert.equal(nativeSocialApprovalProjection(metaBooking, { campaigns: [campaign], content: [metaContent],
    creatives: [creative], socialRows: [metaSource] }, () => false).state, 'APPROVED');
  const wrongNativeReceipt = nativeSocialApprovalProjection(metaBooking, { campaigns: [campaign], content: [metaContent],
    creatives: [creative], socialRows: [{ ...metaSource, jm1_actualschedule: '2026-10-15T14:00:00Z' }] }, () => false);
  assert.equal(wrongNativeReceipt.state, 'UNKNOWN');

  const noLinkCaption = 'Write down the planning questions you want to discuss with a qualified professional.';
  const noLinkHash = createHash('sha256').update(noLinkCaption).digest('hex');
  const noLinkBooking = { ...metaBooking, jm1_captionversion: noLinkHash };
  const noLinkContent = { ...metaContent, jm1_draftcopy: noLinkCaption,
    jm1_copybrief: metaContent.jm1_copybrief.replace(captionHash, noLinkHash) };
  const noLinkSource = { ...metaSource, jm1_captionversion: noLinkHash };
  assert.equal(nativeSocialApprovalProjection(noLinkBooking, { campaigns: [campaign], content: [noLinkContent],
    creatives: [creative], socialRows: [noLinkSource] }, () => false).state, 'APPROVED');
  const wrongSource = nativeSocialApprovalProjection(noLinkBooking, { campaigns: [campaign],
    content: [{ ...noLinkContent, jm1_copybrief: noLinkContent.jm1_copybrief.replace('www.jmerrill.financial', 'attacker.example') }],
    creatives: [creative], socialRows: [noLinkSource] }, () => false);
  assert.equal(wrongSource.state, 'UNKNOWN');
});

test('exactly authorized text-only One posts do not require a fictional creative asset', () => {
  const brand = 'J Merrill One';
  const marker = 'jm1-native-social-2026-10:j-merrill-one';
  const stage = 'one-facebook-umbrella-2026-10-20';
  const caption = 'A useful starting point is to name the question and the next decision. Explore J Merrill One: https://www.jmerrill.one/';
  const hash = createHash('sha256').update(caption).digest('hex');
  const booking = { jm1_socialexecutionid: 'one-fb', jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_branch: brand,
    jm1_platform: 'facebook', jm1_requesteddestination: '101196349506906',
    jm1_requestedschedule: '2026-10-20T14:00:00Z', jm1_captionversion: hash, jm1_requestedmediahash: null };
  const campaign = { jm1_campaignauthorityid: 'one-campaign', jm1_idempotencykey: `${marker}:campaign`,
    jm1_branch: brand, jm1_campaigntype: 'native_social', jm1_state: 'PUBLIC_EXECUTION_APPROVED',
    jm1_supersession: 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.' };
  const content = { jm1_contentworkid: 'one-content', jm1_idempotencykey: `${marker}:${stage}:content`,
    jm1_branch: brand, jm1_stage: stage, jm1_publicreadystate: 'PASS', jm1_draftcopy: caption,
    jm1_copybrief: `Founder-authorized public umbrella content; source https://www.jmerrill.one/; exact caption SHA-256 ${hash}` };
  const source = { jm1_socialexecutionid: booking.jm1_socialexecutionid, jm1_idempotencykey: `${marker}:${stage}:social`,
    jm1_branch: brand, jm1_platform: 'facebook', jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requesteddestination: booking.jm1_requesteddestination, jm1_requestedschedule: booking.jm1_requestedschedule,
    jm1_captionversion: hash, jm1_requestedmediahash: null,
    jm1_readbackstate: 'MBS_BOOKED|2026-10-08T15:30:57.000Z|CONTENT_ID=992481243863239' };
  const rows = { campaigns: [campaign], content: [content], creatives: [], socialRows: [source] };
  const projection = nativeSocialApprovalProjection(booking, rows, () => false);
  assert.equal(projection.state, 'APPROVED');
  assert.equal(projection.evidence.creativeId, null);

  const mismatched = nativeSocialApprovalProjection({ ...booking, jm1_requestedmediahash: 'a'.repeat(64) }, rows, () => false);
  assert.equal(mismatched.state, 'UNKNOWN');
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
