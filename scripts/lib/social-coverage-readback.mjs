import { createHash } from 'node:crypto';

const ZONE = 'America/New_York';
const DAY = 24 * 60 * 60 * 1000;

function easternDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid timestamp: ${value}`);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}

function addDays(date, days) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

function mondayOf(date) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

function channelKey(value) {
  return `${value.brand}:${value.platform}`;
}

function publishedDateET(item) {
  return item.publishedDateET || (item.publishedAt ? easternDate(item.publishedAt) : null);
}

function nativeOwner(platform) {
  return platform === 'linkedin' ? 'LINKEDIN_NATIVE' : 'META_NATIVE';
}

function hasNativeBookingProof(item, asOf) {
  return Boolean(item.nativeBookingId || (item.platform === 'linkedin'
    && item.nativeEvidence?.source === 'LINKEDIN_NATIVE_UI'
    && item.nativeEvidence.observedDateET === asOf
    && item.captionText
    && item.nativeEvidence.captionSha256 === createHash('sha256').update(item.captionText).digest('hex')
    && item.nativeEvidence.scheduledAt === item.scheduledAt));
}

export function buildSocialCoverageReadback(snapshot) {
  const asOf = easternDate(snapshot.asOf);
  const end = addDays(asOf, 14);
  const channels = snapshot.channels || [];
  const items = snapshot.items || [];
  if (new Set(channels.map(channelKey)).size !== channels.length) throw new Error('Duplicate channel authority');

  const results = channels.map((channel) => {
    const related = items.filter((item) => channelKey(item) === channelKey(channel));
    const nativeEvidenceFresh = channel.nativeReadback?.observedDateET === asOf;
    const verifiedNative = nativeEvidenceFresh && channel.nativeReadback?.state === 'VERIFIED';
    const nativeScheduled = related.filter((item) =>
      item.kind === 'NATIVE_BOOKING'
      && verifiedNative
      && item.destinationId === channel.destinationId
      && hasNativeBookingProof(item, asOf)
      && item.scheduledAt
      && easternDate(item.scheduledAt) >= asOf
      && easternDate(item.scheduledAt) < end
    );
    const booked = nativeScheduled.filter((item) => item.approvalState === 'APPROVED');
    const unapprovedScheduled = nativeScheduled.filter((item) => item.approvalState !== 'APPROVED');
    const published = related.filter((item) =>
      item.kind === 'PUBLISHED'
      && item.destinationId === channel.destinationId
      && item.platformPostId
      && publishedDateET(item)
    );
    const apiRequests = related.filter((item) => item.kind === 'API_REQUEST');
    const pastDueRequests = apiRequests.filter((item) => item.scheduledAt && easternDate(item.scheduledAt) < asOf);
    const approvedContent = related.filter((item) => item.kind === 'CONTENT' && item.approvalState === 'APPROVED');
    const held = related.filter((item) => item.status?.startsWith('HELD') || item.approvalState === 'HELD');
    const failures = related.filter((item) => /FAILED|DEAD_LETTER|RETRY_REQUIRED|RECONCILIATION_REQUIRED/.test(item.status || ''));
    const duplicateRisk = nativeScheduled.filter((native) =>
      apiRequests.some((request) => request.contentKey
        && request.contentKey === native.contentKey)
    );
    const mixedChannelAuthority = nativeScheduled.filter((native) =>
      channel.executionOwner !== nativeOwner(native.platform));
    const weeks = [0, 1].map((week) => {
      const start = addDays(asOf, week * 7);
      const stop = addDays(start, 7);
      return { start, stopExclusive: stop, verifiedBookings: booked.filter((item) => {
        const date = easternDate(item.scheduledAt);
        return date >= start && date < stop;
      }).length };
    });
    const states = [];
    if (!verifiedNative) states.push('NATIVE_READBACK_UNVERIFIED');
    if (!channel.destinationId || channel.executionOwner === 'UNRESOLVED') states.push('DESTINATION_AUTHORITY_UNRESOLVED');
    if (weeks.some((week) => week.verifiedBookings === 0)) states.push('ROLLING_COVERAGE_GAP');
    if (held.length) states.push('HELD_ITEMS');
    if (failures.length) states.push('EXECUTION_FAILURE');
    if (pastDueRequests.length) states.push('PAST_DUE_API_REQUEST');
    if (duplicateRisk.length) states.push('DUAL_SCHEDULER_RISK');
    if (mixedChannelAuthority.length) states.push('MIXED_CHANNEL_EXECUTION_AUTHORITY');
    if (unapprovedScheduled.length) states.push('UNAPPROVED_NATIVE_SCHEDULE');
    return {
      brand: channel.brand,
      platform: channel.platform,
      destinationId: channel.destinationId || null,
      executionOwner: channel.executionOwner,
      nativeReadback: channel.nativeReadback || null,
      nativeScheduled: nativeScheduled.length,
      nativeBookingRows: nativeScheduled.map((item) => ({
        id: item.id,
        nativeBookingId: item.nativeBookingId || null,
        proof: item.nativeBookingId ? 'NATIVE_ID' : 'LINKEDIN_NATIVE_UI',
        scheduledAt: item.scheduledAt,
        approvalState: item.approvalState || null,
        executionOwner: nativeOwner(item.platform)
      })),
      verifiedBookings: booked.length,
      unapprovedScheduled: unapprovedScheduled.map((item) => item.id),
      nextVerifiedBooking: booked.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0]?.scheduledAt || null,
      apiRequests: apiRequests.length,
      apiRequestRows: apiRequests.map((item) => ({
        id: item.id,
        requestedAt: item.scheduledAt || null,
        pastDue: Boolean(item.scheduledAt && easternDate(item.scheduledAt) < asOf),
        status: item.status || null,
        approvalState: item.approvalState || null,
        campaignAuthorityState: item.campaignAuthorityState || null,
        expectedDestinationId: item.expectedDestinationId || null,
        requestedDestinationText: item.requestedDestinationText || null,
        readbackState: item.readbackState || null
      })),
      approvedContentNotBooked: approvedContent.length,
      publishedWithPlatformId: published.length,
      publishedIds: published.map((item) => item.platformPostId),
      heldItems: held.map((item) => item.id),
      failures: failures.map((item) => item.id),
      duplicateRisk: duplicateRisk.map((item) => item.id),
      mixedChannelAuthority: mixedChannelAuthority.map((item) => item.id),
      weeks,
      states
    };
  });

  const authorCoverage = (snapshot.authorPrograms || []).map((program) => {
    const first = `${program.month}-01`;
    const nextMonth = new Date(Date.parse(`${first}T12:00:00Z`));
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const stop = nextMonth.toISOString().slice(0, 10);
    const weeks = [];
    for (let start = mondayOf(first); start < stop; start = addDays(start, 7)) {
      const endExclusive = addDays(start, 7);
      const proof = items.filter((item) =>
        item.brand === program.brand
        && item.author === program.author
        && item.theme === 'AUTHOR_SPOTLIGHT'
        && channels.some((channel) => channelKey(channel) === channelKey(item)
          && channel.destinationId === item.destinationId
          && ((item.kind === 'PUBLISHED' && item.platformPostId && publishedDateET(item))
            || (item.kind === 'NATIVE_BOOKING' && hasNativeBookingProof(item, asOf)
              && item.approvalState === 'APPROVED' && item.scheduledAt
              && easternDate(item.scheduledAt) >= asOf
              && channel.nativeReadback?.state === 'VERIFIED'
              && channel.nativeReadback.observedDateET === asOf)))
      ).filter((item) => {
        const date = item.kind === 'PUBLISHED' ? publishedDateET(item) : easternDate(item.scheduledAt);
        return date >= first && date < stop && date >= start && date < endExclusive;
      });
      weeks.push({ startMondayET: start, endExclusiveMondayET: endExclusive, proofIds: proof.map((item) => item.id) });
    }
    return { brand: program.brand, author: program.author, month: program.month,
      coveredWeeks: weeks.filter((week) => week.proofIds.length).length, totalWeeks: weeks.length, weeks };
  });

  return { asOfDateET: asOf, endExclusiveDateET: end, zone: ZONE, channels: results, authorCoverage };
}
