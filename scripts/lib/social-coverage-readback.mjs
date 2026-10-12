import { createHash } from 'node:crypto';

const ZONE = 'America/New_York';
const DAY = 24 * 60 * 60 * 1000;
const MAX_NATIVE_READBACK_AGE_MS = 12 * 60 * 60 * 1000;
const NATIVE_RESERVATION_STATUSES = new Set([
  'NATIVE_RESERVATION_VERIFIED',
  'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED'
]);

export function applyCurrentFinancialProductionDestinations(snapshot, metaReadback = null) {
  if (metaReadback && (metaReadback.facebookPageId !== '104395329284856'
    || metaReadback.instagramHandle !== 'jmerrillfinancial'
    || !metaReadback.observedAt || Number.isNaN(Date.parse(metaReadback.observedAt)))) {
    throw new Error('Financial Meta readback must bind the verified production Page, Instagram handle, and observation timestamp');
  }
  if (metaReadback?.linkedinPageId && (metaReadback.linkedinPageId !== '146207089'
    || !metaReadback.linkedinObservedAt || Number.isNaN(Date.parse(metaReadback.linkedinObservedAt)))) {
    throw new Error('Financial LinkedIn readback must bind the verified Page and observation timestamp');
  }
  const observedDateET = metaReadback ? new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(metaReadback.observedAt)) : null;
  const preservedHistoricalFinancialEvidence = [];
  const currentItems = (snapshot.items || []).filter((item) => {
    if (item.brand !== 'J Merrill Financial') return true;
    const isLegacyFacebook = item.platform === 'facebook' && item.destinationId === '1270611542802820';
    const isTestInstagram = item.platform === 'instagram'
      && (item.destinationHandle === 'jmerrillfin' || item.destinationId === '17841438473100276');
    if (!isLegacyFacebook && !isTestInstagram) return true;
    preservedHistoricalFinancialEvidence.push({
      ...item,
      currentDisposition: isTestInstagram ? 'EXCLUDED_TEST_ACCOUNT' : 'EXCLUDED_LEGACY_PAGE',
      preservedFromCurrentSnapshot: true
    });
    return false;
  });
  return {
    ...snapshot,
    items: currentItems,
    preservedHistoricalFinancialEvidence: [
      ...(snapshot.preservedHistoricalFinancialEvidence || []),
      ...preservedHistoricalFinancialEvidence
    ],
    channels: (snapshot.channels || []).map((channel) => {
      if (channel.brand !== 'J Merrill Financial') return channel;
      if (channel.platform === 'facebook') return {
        ...channel,
        destinationId: '104395329284856',
        destinationHandle: null,
        nativeReadback: { ...channel.nativeReadback, businessPortfolioId: '1306466683241061',
          accountAssetId: '104395329284856', preservedSeparatePageId: '1270611542802820',
          ...(metaReadback ? { state: 'VERIFIED', observedDateET, observedAt: metaReadback.observedAt,
            requireTimestamp: true, visibleScheduledAtUtc: metaReadback.facebookScheduledAtUtc || [] } : {}),
          view: 'Current Financial production Page overlay; native schedule readback recorded separately' }
      };
      if (channel.platform === 'instagram') return {
        ...channel,
        destinationId: null,
        destinationHandle: 'jmerrillfinancial',
        nativeReadback: { ...channel.nativeReadback, businessPortfolioId: '1306466683241061',
          accountHandle: 'jmerrillfinancial', excludedTestHandle: 'jmerrillfin',
          ...(metaReadback ? { state: 'VERIFIED', observedDateET, observedAt: metaReadback.observedAt,
            requireTimestamp: true, visibleScheduledAtUtc: metaReadback.instagramScheduledAtUtc || [] } : {}),
          view: 'Current Financial production handle overlay; Graph business ID unverified' }
      };
      if (channel.platform === 'linkedin' && metaReadback?.linkedinPageId) return {
        ...channel,
        destinationId: '146207089',
        nativeReadback: { ...channel.nativeReadback, state: 'VERIFIED', observedDateET: new Intl.DateTimeFormat('en-CA', {
          timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date(metaReadback.linkedinObservedAt)), observedAt: metaReadback.linkedinObservedAt,
        requireTimestamp: true, accountAssetId: metaReadback.linkedinPageId,
        visibleScheduledAtUtc: metaReadback.linkedinScheduledAtUtc || [],
        view: 'Current Financial LinkedIn scheduled-post list; native access verified, API permission separate' }
      };
      return channel;
    })
  };
}

export function partitionCurrentFinancialDestinationRows(rows) {
  const preservedHistoricalFinancialRows = [];
  const currentRows = rows.filter((row) => {
    if (row.jm1_branch !== 'J Merrill Financial') return true;
    const destination = String(row.jm1_requesteddestination || '').replace(/^@/, '').toLowerCase();
    const legacyPage = row.jm1_platform === 'facebook' && destination === '1270611542802820';
    const testInstagram = row.jm1_platform === 'instagram'
      && ['jmerrillfin', '17841438473100276'].includes(destination);
    if (!legacyPage && !testInstagram) return true;
    preservedHistoricalFinancialRows.push({
      ...row,
      currentDisposition: testInstagram ? 'EXCLUDED_TEST_ACCOUNT' : 'EXCLUDED_LEGACY_PAGE'
    });
    return false;
  });
  return { currentRows, preservedHistoricalFinancialRows };
}

export async function queryDataversePages(initialUrl, token, fetchImpl = fetch) {
  const values = [];
  let next = initialUrl;
  while (next) {
    const response = await fetchImpl(next, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', Prefer: 'odata.maxpagesize=1000' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`Dataverse readback failed: HTTP ${response.status}`);
    const body = await response.json();
    values.push(...(body.value || []));
    next = body['@odata.nextLink'] || null;
  }
  return values;
}

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

function findingKey(channel, state, evidence) {
  const identity = [channel.brand, channel.platform, channel.destinationId || channel.destinationHandle || 'UNRESOLVED'];
  const hash = createHash('sha256').update(JSON.stringify([1, identity, state, evidence])).digest('hex').slice(0, 24);
  return `social-coverage-v1-${hash}`;
}

function matchesDestination(item, channel) {
  return Boolean((channel.destinationId && item.destinationId === channel.destinationId)
    || (channel.platform === 'instagram'
      && (channel.destinationHandle || channel.nativeReadback?.portfolioHandle)
      && item.destinationHandle === (channel.destinationHandle || channel.nativeReadback.portfolioHandle)));
}

function publishedDateET(item) {
  return item.publishedDateET || (item.publishedAt ? easternDate(item.publishedAt) : null);
}

function nativeOwner(platform) {
  return platform === 'linkedin' ? 'LINKEDIN_NATIVE' : 'META_NATIVE';
}

function timestampEvidenceFresh(observedAt, asOfTimestamp) {
  const observed = Date.parse(observedAt || '');
  const asOf = Date.parse(asOfTimestamp || '');
  return Number.isFinite(observed) && Number.isFinite(asOf)
    && observed <= asOf && asOf - observed <= MAX_NATIVE_READBACK_AGE_MS;
}

function hasNativeBookingProof(item, asOf, asOfTimestamp = asOf) {
  const source = item.nativeEvidence?.source;
  if (source === 'LINKEDIN_NATIVE_UI' && item.nativeEvidence?.scheduleListOnly === true) {
    return item.nativeEvidence.scheduledAt === item.scheduledAt
      && item.nativeEvidence.destinationId === item.destinationId
      && timestampEvidenceFresh(item.nativeEvidence.observedAt, asOfTimestamp);
  }
  const uiSourceMatchesPlatform = (item.platform === 'linkedin' && source === 'LINKEDIN_NATIVE_UI')
    || (['facebook', 'instagram'].includes(item.platform) && source === 'META_NATIVE_UI');
  const evidenceFresh = item.nativeEvidence?.requireTimestamp === true
    ? timestampEvidenceFresh(item.nativeEvidence.observedAt, asOfTimestamp)
    : item.nativeEvidence?.observedDateET === asOf;
  return Boolean(item.nativeBookingId || (uiSourceMatchesPlatform
    && evidenceFresh
    && (item.captionText
      ? item.nativeEvidence.captionSha256 === createHash('sha256').update(item.captionText).digest('hex')
      : item.captionSha256 === item.nativeEvidence.captionSha256)
    && item.nativeEvidence.scheduledAt === item.scheduledAt));
}

export function retainNativeEvidenceItems(items) {
  return items.filter((item) => item.kind === 'NATIVE_BOOKING'
    || item.source === 'NATIVE_READBACK'
    || (item.kind === 'PUBLISHED' && item.platformPostId));
}

export function reconcileNativeDataverseClaims(nativeItems, dataverseItems, asOf) {
  const date = easternDate(asOf);
  const matchedDataverseIds = new Set();
  const items = nativeItems.map((native) => {
    if (native.kind !== 'NATIVE_BOOKING' || !hasNativeBookingProof(native, date, asOf)) return native;
    const captionHash = native.nativeEvidence?.captionSha256 || native.captionSha256;
    if (!captionHash) return native;
    const sameReservation = (row) => row.kind === 'NATIVE_BOOKING'
      && row.brand === native.brand
      && row.platform === native.platform
      && row.scheduledAt === native.scheduledAt
      && ((native.destinationId && row.destinationId === native.destinationId)
        || (native.destinationHandle && row.destinationHandle === native.destinationHandle));
    const match = (native.dataverseRecordId
      ? dataverseItems.find((row) => row.id === native.dataverseRecordId && sameReservation(row))
      : null) || dataverseItems.find((row) => sameReservation(row)
        && row.contentKey === `${native.brand}:${captionHash}`);
    if (!match) return native;
    matchedDataverseIds.add(match.id);
    return {
      ...native,
      nativeBookingId: native.nativeBookingId || null,
      approvalState: native.approvalState && native.approvalState !== 'UNKNOWN'
        ? native.approvalState
        : match.approvalState || 'UNKNOWN',
      nativeApprovalEvidence: match.nativeApprovalEvidence || native.nativeApprovalEvidence || null,
      nativeApprovalReason: match.nativeApprovalReason || native.nativeApprovalReason || null,
      dataverseSocialExecutionId: match.id,
      dataverseStatus: match.status,
      dataverseReadbackState: match.readbackState,
      dataverseEvidenceMatch: native.dataverseRecordId === match.id
        ? 'DESTINATION_SCHEDULE_RECORD_ID'
        : 'DESTINATION_SCHEDULE_CAPTION_SHA256',
      sourceCopyStatus: match.contentKey === `${native.brand}:${captionHash}`
        ? 'CAPTION_HASH_MATCH'
        : native.sourceCopyStatus || 'SOURCE_COPY_NOT_PROVEN',
      dataverseBookingEvidence: match.status === 'NATIVE_BOOKED_VERIFIED' ? 'NATIVE_BOOKED_VERIFIED' : null
    };
  });
  return { items, matchedDataverseIds };
}

export function mapDataverseSocialRows(rows, channels) {
  const mapped = [];
  const unclassified = [];
  for (const row of rows) {
    const platform = String(row.jm1_platform || '').toLowerCase();
    const branch = String(row.jm1_branch || '').trim();
    const destination = String(row.jm1_actualdestination || row.jm1_requesteddestination || '').trim();
    let matches = channels.filter((channel) => channel.platform === platform
      && branch && channel.brand === branch);
    if (matches.length !== 1) {
      const byDestination = channels.filter((channel) => channel.platform === platform
        && destination
        && (destination === channel.destinationId
          || destination.replace(/^@/, '') === channel.destinationHandle));
      if (byDestination.length === 1) matches = byDestination;
    }
    if (matches.length !== 1) {
      unclassified.push(row);
      continue;
    }
    const channel = matches[0];
    const isPublished = row.jm1_status === 'PUBLISHED_VERIFIED' && Boolean(row.jm1_platformpostid);
    const isNativeBooking = row.jm1_status === 'NATIVE_BOOKED_VERIFIED';
    const isNativeReservation = NATIVE_RESERVATION_STATUSES.has(row.jm1_status);
    const destinationId = /^\d+$/.test(destination) ? destination : null;
    const destinationHandle = /^@?[a-z0-9._]+$/i.test(destination) && !destinationId
      ? destination.replace(/^@/, '')
      : null;
    const localReservation = isNativeReservation ? parseNativeReservationName(row.jm1_name) : null;
    mapped.push({
      id: row.jm1_socialexecutionid,
      kind: isPublished ? 'PUBLISHED' : isNativeBooking ? 'NATIVE_BOOKING' : isNativeReservation ? 'NATIVE_RESERVATION' : 'API_REQUEST',
      brand: channel.brand,
      platform,
      destinationId,
      destinationHandle,
      expectedDestinationId: channel.destinationId || null,
      requestedDestinationText: destination || null,
      scheduledAt: row.jm1_requestedschedule || null,
      publishedAt: isPublished ? row.jm1_actualschedule || null : null,
      platformPostId: isPublished ? row.jm1_platformpostid : null,
      nativeBookingId: isNativeBooking ? nativeBookingIdFromReadback(row.jm1_readbackstate) : null,
      captionSha256: isNativeBooking ? row.jm1_captionversion || null : null,
      mediaSha256: isNativeBooking ? row.jm1_requestedmediahash || null : null,
      nativeEvidence: isNativeBooking ? nativeEvidenceFromReadback(row.jm1_readbackstate, row, channel) : null,
      status: row.jm1_status || null,
      campaignType: row.campaignType || null,
      campaignSocialEligible: row.campaignSocialEligible ?? null,
      campaignSocialEligibilityReason: row.campaignSocialEligibilityReason || null,
      campaignAuthorityState: row.campaignAuthorityState || null,
      nativeReservationStatus: isNativeReservation ? row.jm1_status : null,
      nativeReservationLocalDate: localReservation?.date || null,
      nativeReservationLocalTime: localReservation?.time || null,
      nativeReservationTimeZone: row.jm1_status === 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED'
        ? 'UNVERIFIED'
        : isNativeReservation && row.jm1_requestedschedule ? 'LOCAL_ZONE_NOT_STORED' : null,
      captionFingerprint: isNativeReservation ? row.jm1_captionversion || null : null,
      mediaSha256: isNativeReservation ? row.jm1_requestedmediahash || null : null,
      reservationReadbackState: isNativeReservation ? row.jm1_readbackstate || null : null,
      approvalState: isNativeBooking ? row.nativeApprovalState || 'UNKNOWN'
        : /^HELD/.test(row.jm1_status || '') ? 'HELD' : row.contentApprovalState || 'UNKNOWN',
      nativeApprovalEvidence: isNativeBooking ? row.nativeApprovalEvidence || null : null,
      contentApprovalEvidence: !isNativeBooking ? row.contentApprovalEvidence || null : null,
      nativeApprovalReason: isNativeBooking ? row.nativeApprovalReason || null : null,
      readbackState: row.jm1_readbackstate || null,
      executor: row.jm1_executor || null,
      contentKey: row.jm1_captionversion ? `${channel.brand}:${row.jm1_captionversion}` : null
    });
  }
  return { mapped, unclassified };
}

export function matchesApprovedLegacyNativeSocialContent(campaign, content, { booking, source, nativeReadback } = {}) {
  const expectedHost = {
    'J Merrill One': 'www.jmerrill.one',
    'J Merrill Publishing': 'jmerrill.pub',
    'J Merrill Financial': 'www.jmerrill.financial'
  }[campaign?.jm1_branch];
  const copybrief = String(content?.jm1_copybrief || '');
  const exactMatch = copybrief.match(/^Standing founder marketing authority; source (https:\/\/[^;]+); caption SHA-256 ([a-f0-9]{64}); exact native booking readback ([0-9]+)\.$/);
  const batchMatch = copybrief.match(/^Standing founder marketing authority; source (https:\/\/[^;]+); caption SHA-256 ([a-f0-9]{64}); batch JM1-THREE-BRAND-NATIVE-BATCH-2026-10$/);
  const itemMatch = copybrief.match(/^Founder-authorized public umbrella content; source (https:\/\/[^;]+); exact caption SHA-256 ([a-f0-9]{64})$/);
  const linkedInListMatch = copybrief.match(/^Exact native UI readback in SOCIAL-LINKEDIN-NATIVE-[0-9TZ-]+; caption SHA-256 ([a-f0-9]{64})\.$/);
  const match = exactMatch || batchMatch || itemMatch;
  if (!expectedHost || campaign?.jm1_campaigntype !== 'native_social'
    || campaign?.jm1_state !== 'PUBLIC_EXECUTION_APPROVED'
    || campaign?.jm1_supersession !== 'Founder standing marketing authorization; item source and media checks required. No Publishing Meta worker release.'
    || content?.jm1_branch !== campaign.jm1_branch || content?.jm1_publicreadystate !== 'PASS'
    || !content?.jm1_draftcopy || !source || !booking
    || source.jm1_socialexecutionid !== booking.jm1_socialexecutionid
    || source.jm1_status !== 'NATIVE_BOOKED_VERIFIED' || (!match && !linkedInListMatch)) return false;
  const captionHash = createHash('sha256').update(content.jm1_draftcopy).digest('hex');
  const sourceUrls = [...String(content.jm1_draftcopy || '').matchAll(/https:\/\/[^\s)]+/g)].map(([value]) => {
    try { return new URL(value.replace(/[.,;!?]+$/, '')); } catch { return null; }
  }).filter(Boolean);
  const sourceUrlMatches = (url) => url.protocol === 'https:'
    && [expectedHost, expectedHost.replace(/^www\./, '')].includes(url.hostname)
    && !url.username && !url.password && !url.port && !url.search && !url.hash;
  const linkedInListProof = Boolean(linkedInListMatch
    && source.jm1_platform === 'linkedin'
    && source.jm1_executor === 'LINKEDIN_NATIVE'
    && source.jm1_actualdestination === booking.jm1_requesteddestination
    && source.jm1_requesteddestination === booking.jm1_requesteddestination
    && source.jm1_requestedschedule === booking.jm1_requestedschedule
    && /^MBS_BOOKED\|[^|]+\|CONTENT_ID=NOT_EXPOSED$/.test(String(source.jm1_readbackstate || ''))
    && linkedInListMatch[1] === captionHash
    && Array.isArray(nativeReadback?.visibleScheduledAtUtc)
    && nativeReadback.visibleScheduledAtUtc.some((value) => Date.parse(value) === Date.parse(booking.jm1_requestedschedule))
    && nativeReadback.state === 'VERIFIED'
    && nativeReadback.requireTimestamp === true
    && timestampEvidenceFresh(nativeReadback.observedAt, new Date().toISOString())
    && sourceUrls.some(sourceUrlMatches));
  if (linkedInListProof) return booking.jm1_captionversion === captionHash;
  if (!match) return false;
  let sourceUrl;
  try {
    sourceUrl = new URL(match[1]);
  } catch {
    return false;
  }
  const nativeContentId = exactMatch?.[3];
  const readback = String(source.jm1_readbackstate || '');
  const readbackIds = [
    readback.match(/(?:^|\|)CONTENT_ID=([0-9]+)(?:\||$)/)?.[1],
    readback.match(/NATIVE_CONTENT_ID_([0-9]+)/)?.[1]
  ].filter(Boolean);
  const nativeMetaReservationProof = reservationBookingProof(source, booking, nativeReadback);
  const nativeBatchBookingProof = source.jm1_platform === 'linkedin'
    ? source.jm1_executor === 'LINKEDIN_NATIVE'
      && source.jm1_actualdestination === booking.jm1_requesteddestination
      && source.jm1_actualschedule === booking.jm1_requestedschedule
      && timestampEvidenceFresh(source.jm1_verifiedat, new Date().toISOString())
      && /^LINKEDIN_NATIVE_SCHEDULED_(?:IMAGE_ALT_MATCH_PLATFORM_SHORT_URL|\d{4}_\d{2}_\d{2}_\d{4}_CAPTION_COVER_ALT_MATCH)$/.test(readback)
    : ['facebook', 'instagram'].includes(source.jm1_platform)
      && source.jm1_executor === 'META_NATIVE'
      && source.jm1_actualschedule === booking.jm1_requestedschedule
      && String(source.jm1_actualdestination || '').replace(/^@/, '')
        === String(booking.jm1_requesteddestination || '').replace(/^@/, '')
      && (/^META_SCHEDULED_LIST_MATCH$|^META_NATIVE_SCHEDULED_CONTENT_ID_\d+_CAPTION_MEDIA_ALT_MATCH$/.test(readback)
        || nativeMetaReservationProof);
  return sourceUrl.protocol === 'https:' && sourceUrl.hostname === expectedHost
    && !sourceUrl.username && !sourceUrl.password && !sourceUrl.port
    && !sourceUrl.search && !sourceUrl.hash
    && (Boolean(batchMatch) || Boolean(exactMatch) || content.jm1_draftcopy.includes(match[1]))
    && match[2] === captionHash && booking.jm1_captionversion === captionHash
    && (itemMatch
      ? campaign.jm1_branch === 'J Merrill One' && source.jm1_platform === 'facebook'
        && !booking.jm1_requestedmediahash && !source.jm1_requestedmediahash
        && /^MBS_BOOKED\|[^|]+\|CONTENT_ID=[0-9]+$/.test(readback)
      : exactMatch
      ? (readbackIds.length === 1 && readbackIds[0] === nativeContentId) || nativeMetaReservationProof
      : nativeBatchBookingProof);
}

function reservationBookingProof(source, booking, nativeReadback) {
  const scheduledAt = Date.parse(booking.jm1_requestedschedule || '');
  const observedAt = Date.parse(nativeReadback?.observedAt || '');
  const receiptObservedAt = source.jm1_verifiedat
    || String(source.jm1_readbackstate || '').match(/(?:^|\|)AT=([^|]+)/)?.[1];
  return source.jm1_status === 'NATIVE_BOOKED_VERIFIED'
    && source.jm1_executor === 'META_NATIVE'
    && (source.jm1_actualschedule == null || source.jm1_actualschedule === booking.jm1_requestedschedule)
    && (source.jm1_actualdestination == null || String(source.jm1_actualdestination).replace(/^@/, '')
      === String(booking.jm1_requesteddestination || '').replace(/^@/, '')
    )
    && /^NATIVE_UI\|META\|AT=[^|]+\|BOOKING=(?:NOT_EXPOSED|[0-9]+)$/.test(String(source.jm1_readbackstate || ''))
    && timestampEvidenceFresh(receiptObservedAt, new Date().toISOString())
    && timestampEvidenceFresh(nativeReadback?.observedAt, new Date().toISOString())
    && nativeReadback?.state === 'VERIFIED'
    && Array.isArray(nativeReadback.visibleScheduledAtUtc)
    && nativeReadback.visibleScheduledAtUtc.some((value) => Date.parse(value) === scheduledAt);
}

export function nativeSocialApprovalProjection(booking, { campaigns, content, creatives, socialRows }, isApprovedContent, scheduleForStage = () => null, expectedDestination = null, nativeReadback = null) {
  const checkableStatuses = ['NATIVE_BOOKED_VERIFIED', 'PUBLIC_READY_SCHEDULED_ELIGIBLE', 'RETRY_REQUIRED'];
  if (!checkableStatuses.includes(booking.jm1_status)) return { state: 'UNKNOWN', evidence: null, reason: 'NOT_AN_APPROVAL_CHECKABLE_SOCIAL_ROW' };
  const captionHash = booking.jm1_captionversion;
  const mediaHash = booking.jm1_requestedmediahash;
  const destination = booking.jm1_requesteddestination;
  const scheduledAt = Date.parse(booking.jm1_requestedschedule || '');
  const platform = String(booking.jm1_platform || '').toLowerCase();
  if (!captionHash || !destination || !Number.isFinite(scheduledAt) || !platform) {
    return { state: 'UNKNOWN', evidence: null, reason: 'BOOKING_BINDING_INCOMPLETE' };
  }

  const candidates = [];
  let templateAuthorityMismatch = false;
  let legacyAuthorityMismatch = false;
  const reservationKey = /^jm1-native-reservation-v1:[a-f0-9]{64}$/.test(String(booking.jm1_idempotencykey || ''));
  const normalizeDestination = (value) => String(value || '').replace(/^@/, '').toLowerCase();
  const expectedDestinations = (Array.isArray(expectedDestination) ? expectedDestination : [expectedDestination])
    .filter(Boolean).map(normalizeDestination);
  const reservationDestinationMatches = !(reservationKey || expectedDestinations.length > 0) || (expectedDestinations.length > 0
    && expectedDestinations.includes(normalizeDestination(booking.jm1_requesteddestination))
    && (!booking.jm1_actualdestination
      || expectedDestinations.includes(normalizeDestination(booking.jm1_actualdestination))));
  if (!reservationDestinationMatches) {
    return { state: 'UNKNOWN', evidence: null, reason: 'RESERVATION_DESTINATION_AUTHORITY_MISMATCH' };
  }
  if (reservationKey) {
    const observedAt = Date.parse(nativeReadback?.observedAt || '');
    const verifiedAt = Date.parse(booking.jm1_verifiedat
      || String(booking.jm1_readbackstate || '').match(/(?:^|\|)AT=([^|]+)/)?.[1] || '');
    const exactSlot = nativeReadback?.state === 'VERIFIED'
      && Array.isArray(nativeReadback.visibleScheduledAtUtc)
      && nativeReadback.visibleScheduledAtUtc.some((value) => Date.parse(value) === scheduledAt);
    const fresh = [observedAt, verifiedAt].every((timestamp) => Number.isFinite(timestamp)
      && Date.now() - timestamp >= 0 && Date.now() - timestamp <= MAX_NATIVE_READBACK_AGE_MS);
    if ((booking.jm1_actualschedule != null && booking.jm1_actualschedule !== booking.jm1_requestedschedule)
      || (booking.jm1_actualdestination != null && booking.jm1_actualdestination !== destination)
      || !exactSlot || !fresh) {
      return { state: 'UNKNOWN', evidence: null, reason: 'RESERVATION_LACKS_FRESH_EXACT_NATIVE_SLOT_BINDING' };
    }
  }
  const sourceRows = reservationKey ? [booking] : socialRows;
  for (const source of sourceRows) {
    const key = String(source.jm1_idempotencykey || '');
    const currentMatch = key.match(/^(.*):social:([^:]+):([^:]+)$/);
    const legacyMatch = key.match(/^(.*):([^:]+):social$/);
    const reservationSource = reservationKey && source.jm1_socialexecutionid === booking.jm1_socialexecutionid;
    const legacyKey = !currentMatch && Boolean(legacyMatch);
    if (!currentMatch && !legacyKey && !reservationSource) continue;
    const marker = currentMatch ? currentMatch[1] : legacyMatch?.[1] || null;
    const stage = currentMatch ? currentMatch[2] : legacyMatch?.[2] || null;
    const sourcePlatform = currentMatch ? currentMatch[3] : source.jm1_platform;
    if (String(sourcePlatform || '').toLowerCase() !== platform
      || source.jm1_branch !== booking.jm1_branch
      || source.jm1_platform?.toLowerCase() !== platform
      || source.jm1_requesteddestination !== destination
      || (stage?.startsWith('rolling-') && scheduleForStage(stage, platform)
        && Date.parse(scheduleForStage(stage, platform)) !== scheduledAt)
      || Date.parse(source.jm1_requestedschedule || '') !== scheduledAt
      || (reservationSource
        ? source.jm1_captionversion !== captionHash
        : legacyKey
        ? source.jm1_captionversion !== captionHash
        : source.jm1_captionversion !== `${marker}:caption:${stage}:v1`)
      || source.jm1_requestedmediahash !== mediaHash) continue;

    if (reservationSource) {
      const matchingContent = content.filter((row) => row.jm1_branch === booking.jm1_branch
        && row.jm1_publicreadystate === 'PASS'
        && createHash('sha256').update(String(row.jm1_draftcopy || '')).digest('hex') === captionHash
        && (() => {
          const platforms = String(row.jm1_copybrief || '').match(/(?:^|; )platforms=([^;]+)/)?.[1];
          return !platforms || platforms.split(',').map((value) => value.trim()).includes(platform);
        })());
      for (const candidateContent of matchingContent) {
        const candidateMarker = String(candidateContent.jm1_copybrief || '').match(/(?:^|; )campaign=([^; ]+)/)?.[1]
          || String(candidateContent.jm1_idempotencykey || '').match(/^(.*):[^:]+:content$/)?.[1] + ':campaign';
        const matchingCampaigns = campaigns.filter((row) => row.jm1_idempotencykey === candidateMarker
          && row.jm1_branch === booking.jm1_branch
          && row.jm1_campaigntype === 'native_social'
          && row.jm1_state === 'PUBLIC_EXECUTION_APPROVED');
        const matchingCreatives = creatives.filter((row) => row.jm1_branch === booking.jm1_branch
          && row.jm1_stage === candidateContent.jm1_stage
          && row.jm1_publicreadystate === 'PASS'
          && row.jm1_assethash === mediaHash);
        const creativeAuthorityPass = mediaHash
          ? matchingCreatives.length === 1
          : source.jm1_requestedmediahash == null && matchingCreatives.length === 0;
        if (matchingCampaigns.length !== 1 || !creativeAuthorityPass) continue;
        const contentAuthorityPass = isApprovedContent(matchingCampaigns[0], candidateContent)
          || matchesApprovedLegacyNativeSocialContent(matchingCampaigns[0], candidateContent, {
            booking, source, nativeReadback
          });
        if (!contentAuthorityPass) {
          templateAuthorityMismatch = true;
          continue;
        }
      candidates.push({
          campaignId: matchingCampaigns[0].jm1_campaignauthorityid,
          contentId: candidateContent.jm1_contentworkid,
          creativeId: matchingCreatives[0]?.jm1_creativeworkid || null,
          socialExecutionId: source.jm1_socialexecutionid,
          sourceStatus: source.jm1_status,
          stage: candidateContent.jm1_stage,
          sourceStageScheduledAt: scheduleForStage(candidateContent.jm1_stage, platform) || null
        });
      }
      continue;
    }

    const campaignKey = `${marker}:campaign`;
    const contentKey = legacyKey ? `${marker}:${stage}:content` : `${marker}:content:${stage}`;
    const creativeKey = legacyKey ? `${marker}:${stage}:creative` : `${marker}:creative:${stage}`;
    const matchingCampaigns = campaigns.filter((row) => row.jm1_idempotencykey === campaignKey
      && row.jm1_branch === booking.jm1_branch
      && row.jm1_campaigntype === 'native_social'
      && row.jm1_state === 'PUBLIC_EXECUTION_APPROVED');
    const matchingContent = content.filter((row) => row.jm1_idempotencykey === contentKey
      && row.jm1_branch === booking.jm1_branch
      && row.jm1_stage === stage
      && row.jm1_publicreadystate === 'PASS'
      && (!legacyKey
        || createHash('sha256').update(String(row.jm1_draftcopy || '')).digest('hex') === captionHash));
    const matchingCreatives = creatives.filter((row) => row.jm1_idempotencykey === creativeKey
      && row.jm1_branch === booking.jm1_branch
      && row.jm1_stage === stage
      && row.jm1_publicreadystate === 'PASS'
      && row.jm1_assethash === mediaHash);
    const creativeAuthorityPass = mediaHash
      ? matchingCreatives.length === 1
      : source.jm1_requestedmediahash == null && matchingCreatives.length === 0;
    const allowedSourceState = source.jm1_status === 'HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED'
      || source.jm1_status === 'PUBLIC_READY_SCHEDULED_ELIGIBLE'
      || source.jm1_status === 'NATIVE_BOOKED_VERIFIED';
    if (matchingCampaigns.length !== 1 || matchingContent.length !== 1
      || !creativeAuthorityPass || !allowedSourceState) continue;
    const contentAuthorityPass = legacyKey
      ? matchesApprovedLegacyNativeSocialContent(matchingCampaigns[0], matchingContent[0], { booking, source, nativeReadback })
      : isApprovedContent(matchingCampaigns[0], matchingContent[0]);
    if (!contentAuthorityPass) {
      if (legacyKey) legacyAuthorityMismatch = true;
      else templateAuthorityMismatch = true;
      continue;
    }

    candidates.push({
      campaignId: matchingCampaigns[0].jm1_campaignauthorityid,
      contentId: matchingContent[0].jm1_contentworkid,
      creativeId: matchingCreatives[0]?.jm1_creativeworkid || null,
      socialExecutionId: source.jm1_socialexecutionid,
      sourceStatus: source.jm1_status,
      stage
    });
  }
  if (candidates.length > 1) {
    if (new Set(candidates.map((candidate) => candidate.socialExecutionId)).size > 1) {
      return { state: 'UNKNOWN', evidence: null, reason: 'AMBIGUOUS_EXACT_SOURCE_LINKAGE' };
    }
    if (new Set(candidates.map((candidate) => `${candidate.socialExecutionId}:${candidate.stage}`)).size < candidates.length) {
      return { state: 'UNKNOWN', evidence: null, reason: 'AMBIGUOUS_EXACT_SOURCE_LINKAGE' };
    }
    const campaignIds = new Set(candidates.map((candidate) => candidate.campaignId));
    if (campaignIds.size !== 1) return { state: 'UNKNOWN', evidence: null, reason: 'AMBIGUOUS_EXACT_SOURCE_LINKAGE' };
    const exactSlotCandidates = candidates.filter((candidate) =>
      Date.parse(candidate.sourceStageScheduledAt || '') === scheduledAt);
    const eligibleCandidates = exactSlotCandidates.length ? exactSlotCandidates : candidates.filter((candidate) =>
      !candidate.sourceStageScheduledAt || Date.parse(candidate.sourceStageScheduledAt) <= scheduledAt);
    if (!eligibleCandidates.length) return { state: 'UNKNOWN', evidence: null, reason: 'NO_EXACT_SOURCE_LINKAGE' };
    eligibleCandidates.sort((left, right) =>
      Date.parse(right.sourceStageScheduledAt || '') - Date.parse(left.sourceStageScheduledAt || '')
      || left.contentId.localeCompare(right.contentId));
    candidates.splice(0, candidates.length, eligibleCandidates[0]);
  }
  if (candidates.length === 0) return {
    state: 'UNKNOWN', evidence: null,
    reason: legacyAuthorityMismatch ? 'LEGACY_SOURCE_AUTHORITY_NOT_PROVEN'
      : templateAuthorityMismatch ? 'REVIEWED_TEMPLATE_VALIDATION_MISMATCH' : 'NO_EXACT_SOURCE_LINKAGE'
  };
  const { sourceStageScheduledAt, ...evidence } = candidates[0];
  return { state: 'APPROVED', evidence, reason: 'EXACT_AUTHORITY_LINKAGE_PASS' };
}

function readbackValue(value, key) {
  const prefix = `${key}=`;
  const segment = String(value || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  const result = segment?.slice(prefix.length);
  return result && result !== 'NOT_EXPOSED_BY_UI' ? result : null;
}

function nativeBookingIdFromReadback(value) {
  const compact = String(value || '').match(/\|BOOKING=([^|]+)/);
  if (compact) return compact[1] === 'NOT_EXPOSED' ? null : compact[1];
  const legacy = readbackValue(value, 'NATIVE_BOOKING_ID');
  return legacy === 'NOT_EXPOSED_BY_UI' ? null : legacy;
}

function nativeEvidenceFromReadback(value, row, channel = null) {
  const compact = String(value || '').match(/^NATIVE_UI\|(META|LINKEDIN)\|AT=([^|]+)\|BOOKING=([^|]+)$/);
  const metaBooked = String(value || '').match(/^MBS_BOOKED\|([^|]+)\|CONTENT_ID=(.+)$/);
  const linkedInList = String(value || '') === 'LINKEDIN_UI_SCHEDULED_LIST;BOOKING_ID=NOT_EXPOSED'
    && row.jm1_executor === 'LINKEDIN_NATIVE'
    && row.jm1_actualschedule === row.jm1_requestedschedule
    && row.jm1_actualdestination === row.jm1_requesteddestination
    && timestampEvidenceFresh(row.jm1_verifiedat, new Date().toISOString());
  const linkedInNativeList = row.jm1_platform === 'linkedin'
    && row.jm1_executor === 'LINKEDIN_NATIVE'
    && row.jm1_status === 'NATIVE_BOOKED_VERIFIED'
    && row.jm1_requesteddestination === channel?.destinationId
    && Array.isArray(channel?.nativeReadback?.visibleScheduledAtUtc)
    && channel.nativeReadback.visibleScheduledAtUtc.some((slot) => Date.parse(slot) === Date.parse(row.jm1_requestedschedule))
    && channel.nativeReadback.state === 'VERIFIED'
    && channel.nativeReadback.requireTimestamp === true
    && timestampEvidenceFresh(channel.nativeReadback.observedAt, new Date().toISOString());
  const linkedInAssetMatch = String(value || '') === 'LINKEDIN_NATIVE_SCHEDULED_IMAGE_ALT_MATCH_PLATFORM_SHORT_URL'
    || /^LINKEDIN_NATIVE_SCHEDULED_\d{4}_\d{2}_\d{2}_\d{4}_CAPTION_COVER_ALT_MATCH$/.test(String(value || ''));
  const linkedInAssetMatchFresh = linkedInAssetMatch
    && row.jm1_executor === 'LINKEDIN_NATIVE'
    && row.jm1_actualschedule === row.jm1_requestedschedule
    && row.jm1_actualdestination === row.jm1_requesteddestination
    && timestampEvidenceFresh(row.jm1_verifiedat, new Date().toISOString());
  const source = compact ? `${compact[1]}_NATIVE_UI`
    : metaBooked ? 'META_NATIVE_UI'
      : readbackValue(value, 'SOURCE');
  const evidenceSource = linkedInList || linkedInAssetMatchFresh || linkedInNativeList ? 'LINKEDIN_NATIVE_UI' : source;
  const observedAt = linkedInNativeList ? channel.nativeReadback.observedAt
    : compact ? compact[2] : metaBooked ? metaBooked[1]
    : linkedInList || linkedInAssetMatchFresh ? row.jm1_verifiedat : readbackValue(value, 'OBSERVED_AT');
  const scheduledAt = linkedInNativeList ? row.jm1_requestedschedule
    : linkedInList || linkedInAssetMatchFresh ? row.jm1_actualschedule
    : compact || metaBooked ? row.jm1_requestedschedule : readbackValue(value, 'SCHEDULED_AT');
  const captionSha256 = compact || metaBooked || linkedInList || linkedInAssetMatchFresh
    ? row.jm1_captionversion : readbackValue(value, 'CAPTION_SHA256');
  if (!evidenceSource || !observedAt || !scheduledAt || (!captionSha256 && !linkedInNativeList)) return null;
  return {
    source: evidenceSource,
    observedAt,
    ...(linkedInNativeList ? { scheduleListOnly: true, destinationId: row.jm1_requesteddestination } : {}),
    ...(linkedInList || linkedInAssetMatchFresh ? { requireTimestamp: true } : {}),
    observedDateET: easternDate(observedAt),
    scheduledAt,
    captionSha256: linkedInNativeList ? null : captionSha256,
    nativeBookingId: compact ? (compact[3] === 'NOT_EXPOSED' ? null : compact[3]) : null,
    platformContentId: metaBooked ? metaBooked[2] : null
  };
}

function parseNativeReservationName(value) {
  const match = String(value || '').match(/native reservation (\d{4}-\d{2}-\d{2}) (.+)$/i);
  return match ? { date: match[1], time: match[2] } : null;
}

export function classifyDataverseExecutionRow(row, asOf) {
  const status = row.status || '';
  if (['HELD_NATIVE_BOOKING_CONFLICT', 'HELD_NATIVE_BOOKING_STALE'].includes(status)) {
    return { classification: status === 'HELD_NATIVE_BOOKING_STALE' ? 'NATIVE_BOOKING_STALE' : 'NATIVE_BOOKING_CONFLICT', actionRequired: true };
  }
  if (/^HELD/.test(status)) return { classification: 'HELD_NOT_BOOKED', actionRequired: false };
  if (/FAILED|DEAD_LETTER|RETRY_REQUIRED|RECONCILIATION_REQUIRED|NATIVE_BOOKING_(CONFLICT|STALE)/.test(status)) {
    return { classification: 'EXECUTION_FAILURE', actionRequired: true };
  }
  if (status === 'PUBLISHED_VERIFIED' && !row.platformPostId) {
    return { classification: 'PUBLISHED_STATE_MISSING_PLATFORM_ID', actionRequired: true };
  }
  if (status !== 'NATIVE_BOOKED_VERIFIED') return null;
  if (!row.requestedSchedule) {
    return { classification: 'NATIVE_BOOKING_CLAIM_MISSING_SCHEDULE', actionRequired: true };
  }
  if (row.platformPostId) {
    return { classification: 'NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION', actionRequired: true };
  }
  return {
    classification: Date.parse(row.requestedSchedule) <= Date.parse(asOf)
      ? 'PAST_DUE_NATIVE_BOOKING_CLAIM'
      : 'NATIVE_BOOKING_CLAIM_REQUIRES_FRESH_UI_PROOF',
    actionRequired: true
  };
}

export function buildDataverseReconciliationFindings(rows, asOf) {
  const seen = new Set();
  return rows.flatMap((row) => {
    const id = row.jm1_socialexecutionid || row.id;
    if (seen.has(id)) return [];
    seen.add(id);
    if (row.campaignSocialEligible === false) return [];
    const finding = classifyDataverseExecutionRow({
      id,
      platform: row.jm1_platform || row.platform,
      status: row.jm1_status || row.status,
      requestedSchedule: row.jm1_requestedschedule || row.requestedSchedule,
      requestedDestination: row.jm1_requesteddestination || row.requestedDestination,
      platformPostId: row.jm1_platformpostid || row.platformPostId
    }, asOf);
    return finding?.actionRequired
      && finding.classification !== 'NATIVE_BOOKING_CLAIM_REQUIRES_FRESH_UI_PROOF'
      ? [{
        id,
        platform: row.jm1_platform || row.platform,
        status: row.jm1_status || row.status,
        requestedSchedule: row.jm1_requestedschedule || row.requestedSchedule,
        requestedDestination: row.jm1_requesteddestination || row.requestedDestination,
        ...finding
      }]
      : [];
  });
}

export function buildSocialCoverageReadback(snapshot) {
  const asOf = easternDate(snapshot.asOf);
  const end = addDays(asOf, 14);
  const channels = snapshot.channels || [];
  const items = snapshot.items || [];
  if (new Set(channels.map(channelKey)).size !== channels.length) throw new Error('Duplicate channel authority');

  const results = channels.map((channel) => {
    const related = items.filter((item) => channelKey(item) === channelKey(channel));
    const observedDate = channel.nativeReadback?.observedDateET;
    const timestampRequired = channel.nativeReadback?.requireTimestamp === true;
    const observedAt = channel.nativeReadback?.observedAt;
    const observationTimestampValid = timestampEvidenceFresh(observedAt, snapshot.asOf);
    const nativeEvidenceFresh = timestampRequired
      ? observationTimestampValid
      : observedDate === asOf;
    const verifiedNative = nativeEvidenceFresh && channel.nativeReadback?.state === 'VERIFIED';
    const destinationResolved = Boolean(channel.destinationId || channel.destinationHandle
      || (channel.platform === 'instagram' && channel.nativeReadback?.portfolioHandle))
      && channel.executionOwner !== 'UNRESOLVED';
    const coverageProofValid = verifiedNative && destinationResolved;
    const nativeReadbackStatus = verifiedNative ? 'CURRENT'
      : !observedDate ? 'MISSING'
        : timestampRequired && !observedAt ? 'MISSING_TIMESTAMP'
          : timestampRequired && Date.parse(observedAt) > Date.parse(snapshot.asOf) ? 'FUTURE_DATED'
            : timestampRequired && !observationTimestampValid ? 'STALE'
              : observedDate > asOf ? 'FUTURE_DATED'
                : observedDate < asOf ? 'STALE'
            : /FAIL|ERROR/i.test(channel.nativeReadback?.state || '') ? 'FAILED' : 'UNVERIFIED';
    const nativeScheduledReceipts = related.filter((item) =>
      item.kind === 'NATIVE_BOOKING'
      && verifiedNative
      && matchesDestination(item, channel)
      && hasNativeBookingProof(item, asOf, snapshot.asOf)
      && item.scheduledAt
      && easternDate(item.scheduledAt) >= asOf
      && easternDate(item.scheduledAt) < end
    );
    const nativeSlots = new Map();
    for (const item of nativeScheduledReceipts) {
      const destination = item.destinationId || item.destinationHandle || item.requestedDestinationText || '';
      const captionHash = item.captionSha256 || item.nativeEvidence?.captionSha256 || '';
      const mediaHash = item.mediaSha256 || item.nativeEvidence?.mediaSha256 || '';
      const identity = item.nativeBookingId
        ? `booking:${destination}:${item.nativeBookingId}`
        : destination && item.scheduledAt && captionHash
          ? `content:${destination}:${item.scheduledAt}:${captionHash}:${mediaHash}`
          : `receipt:${item.id}`;
      const group = nativeSlots.get(identity) || [];
      group.push(item);
      nativeSlots.set(identity, group);
    }
    const nativeSlotGroups = [...nativeSlots.values()];
    const nativeScheduled = nativeSlotGroups.map((group) =>
      group.find((item) => item.approvalState === 'APPROVED') || group[0]);
    const slotCountedReceiptIds = new Set(nativeScheduled.map((item) => item.id));
    const verifiedFutureNativeClaims = related.filter((item) => item.kind === 'NATIVE_BOOKING'
      && matchesDestination(item, channel)
      && hasNativeBookingProof(item, asOf, snapshot.asOf)
      && item.scheduledAt && easternDate(item.scheduledAt) >= asOf);
    const verifiedBookingsBeyondHorizon = verifiedFutureNativeClaims.filter((item) =>
      easternDate(item.scheduledAt) >= end
    );
    const booked = nativeSlotGroups.filter((group) => group.some((item) => item.approvalState === 'APPROVED'))
      .map((group) => group.find((item) => item.approvalState === 'APPROVED'));
    const bookingClaims = related.filter((item) => item.kind === 'NATIVE_BOOKING');
    const unverifiedBookingClaims = bookingClaims.filter((item) => !nativeScheduledReceipts.includes(item)
      && !verifiedBookingsBeyondHorizon.includes(item));
    const scheduleVisibleInNativeList = (item) => channel.nativeReadback?.visibleScheduledAtUtc?.includes(item.scheduledAt);
    const visibleScheduleTimes = [...new Set(channel.nativeReadback?.visibleScheduledAtUtc || [])]
      .filter((slot) => {
        const date = easternDate(slot);
        return date >= asOf && date < end;
      });
    const exactNativeScheduleTimes = new Set(nativeScheduled.map((item) => item.scheduledAt));
    const unmatchedVisibleScheduleTimes = visibleScheduleTimes.filter((slot) => !exactNativeScheduleTimes.has(slot));
    const contradictedBookingClaims = verifiedNative && destinationResolved
      ? unverifiedBookingClaims.filter((item) => item.scheduledAt
        && easternDate(item.scheduledAt) >= asOf
        && easternDate(item.scheduledAt) < end
        && !scheduleVisibleInNativeList(item))
      : [];
    const visibleScheduleCopyMismatches = unverifiedBookingClaims.filter(scheduleVisibleInNativeList);
    const sourceLineageReviewItems = nativeScheduled.filter((item) =>
      ['NATIVE_COPY_DIFFERS_FROM_CONTENTWORK', 'SOURCE_COPY_NOT_PROVEN', 'NO_EXACT_CONTENTWORK_MATCH']
        .includes(item.sourceCopyStatus)
    );
    const unresolvedBookingClaims = unverifiedBookingClaims.filter((item) =>
      !contradictedBookingClaims.includes(item) && !visibleScheduleCopyMismatches.includes(item));
    const pastDueBookingClaims = unverifiedBookingClaims.filter((item) => item.scheduledAt
      && Date.parse(item.scheduledAt) < Date.parse(snapshot.asOf));
    const unapprovedScheduled = nativeSlotGroups.filter((group) =>
      !group.some((item) => item.approvalState === 'APPROVED')).map((group) => group[0]);
    const published = related.filter((item) =>
      item.kind === 'PUBLISHED'
      && matchesDestination(item, channel)
      && item.platformPostId
      && publishedDateET(item)
    );
    const apiRequests = related.filter((item) => item.kind === 'API_REQUEST');
    const policyExcludedApiRequests = apiRequests.filter((item) => item.campaignSocialEligible === false);
    const nativeReservations = related.filter((item) => item.kind === 'NATIVE_RESERVATION');
    const pastDueRequests = apiRequests.filter((item) => item.scheduledAt
      && easternDate(item.scheduledAt) < asOf
      && item.campaignSocialEligible !== false
      && !/^HELD/.test(item.status || '')
      && item.approvalState !== 'HELD');
    const approvedContent = related.filter((item) => item.kind === 'CONTENT' && item.approvalState === 'APPROVED');
    const held = related.filter((item) => item.status?.startsWith('HELD') || item.approvalState === 'HELD');
    const failures = related.filter((item) => /FAILED|DEAD_LETTER|RETRY_REQUIRED|RECONCILIATION_REQUIRED|NATIVE_BOOKING_(CONFLICT|STALE)/.test(item.status || ''));
    const duplicateRisk = nativeScheduled.filter((native) =>
      apiRequests.some((request) => request.contentKey
        && request.contentKey === native.contentKey)
    );
    const mixedChannelAuthority = nativeScheduled.filter((native) =>
      channel.executionOwner !== nativeOwner(native.platform));
    const weeks = [0, 1].map((week) => {
      const start = addDays(asOf, week * 7);
      const stop = addDays(start, 7);
      return {
        start,
        stopExclusive: stop,
        scheduledBookings: coverageProofValid ? new Set([
          ...nativeScheduled.map((item) => item.scheduledAt),
          ...unmatchedVisibleScheduleTimes
        ].filter((slot) => {
          const date = easternDate(slot);
          return date >= start && date < stop;
        })).size : null,
        verifiedBookings: coverageProofValid ? booked.filter((item) => {
          const date = easternDate(item.scheduledAt);
          return date >= start && date < stop;
        }).length : null
      };
    });
    const states = [];
    if (!verifiedNative) states.push(`NATIVE_READBACK_${nativeReadbackStatus}`);
    if ((!channel.destinationId && !channel.destinationHandle) || channel.executionOwner === 'UNRESOLVED') states.push('DESTINATION_AUTHORITY_UNRESOLVED');
    if (!channel.destinationId && channel.destinationHandle) states.push('NUMERIC_DESTINATION_ID_UNVERIFIED');
    if (!coverageProofValid) states.push('COVERAGE_STATUS_UNKNOWN');
    else if (weeks.some((week) => week.scheduledBookings === 0)) states.push('ROLLING_COVERAGE_GAP');
    if (held.length) states.push('HELD_ITEMS');
    if (failures.length) states.push('EXECUTION_FAILURE');
    if (pastDueRequests.length) states.push('PAST_DUE_API_REQUEST');
    if (pastDueBookingClaims.length) states.push('PAST_DUE_NATIVE_BOOKING_CLAIM');
    if (unresolvedBookingClaims.length) states.push('NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION');
    if (contradictedBookingClaims.length) states.push('NATIVE_BOOKING_CONFLICT');
    if (visibleScheduleCopyMismatches.length || unmatchedVisibleScheduleTimes.length || sourceLineageReviewItems.length) {
      states.push('NATIVE_BOOKING_SOURCE_COPY_REVIEW');
    }
    if (nativeReservations.length) states.push('NATIVE_RESERVATION_REQUIRES_PUBLICATION_READBACK');
    if (nativeReservations.some((item) => item.nativeReservationTimeZone === 'UNVERIFIED')) {
      states.push('NATIVE_RESERVATION_TIMEZONE_UNVERIFIED');
    }
    if (duplicateRisk.length) states.push('DUAL_SCHEDULER_RISK');
    if (mixedChannelAuthority.length) states.push('MIXED_CHANNEL_EXECUTION_AUTHORITY');
    if (unapprovedScheduled.length) states.push('UNAPPROVED_NATIVE_SCHEDULE');
    const alertFindings = [];
    if (!verifiedNative) {
      const state = `NATIVE_READBACK_${nativeReadbackStatus}`;
      alertFindings.push({
        dedupeKey: findingKey(channel, state, observedDate || 'NO_OBSERVATION'),
        state,
        action: 'REFRESH_NATIVE_SCHEDULER_READBACK',
        evidence: { observedDateET: observedDate || null },
        delivery: 'REPORT_ONLY'
      });
    }
    if (coverageProofValid) {
      for (const week of weeks.filter((entry) => entry.scheduledBookings === 0)) {
        const calendarWeekStart = mondayOf(week.start);
        alertFindings.push({
          dedupeKey: findingKey(channel, 'ROLLING_COVERAGE_GAP', calendarWeekStart),
          state: 'ROLLING_COVERAGE_GAP',
          action: 'REVIEW_VERIFIED_COVERAGE_GAP',
          evidence: { calendarWeekStart, calendarWeekStopExclusive: addDays(calendarWeekStart, 7) },
          delivery: 'REPORT_ONLY'
        });
      }
    }
    for (const [state, ids, action] of [
      ['EXECUTION_FAILURE', failures.map((item) => item.id), 'RECONCILE_EXECUTION_FAILURE'],
      ['PAST_DUE_API_REQUEST', pastDueRequests.map((item) => item.id), 'RECONCILE_PAST_DUE_REQUEST'],
      ['PAST_DUE_NATIVE_BOOKING_CLAIM', pastDueBookingClaims.map((item) => item.id), 'RECONCILE_NATIVE_BOOKING_CLAIM'],
      ['NATIVE_BOOKING_CLAIM_REQUIRES_RECONCILIATION', unresolvedBookingClaims.map((item) => item.id), 'RECONCILE_NATIVE_BOOKING_CLAIM'],
      ['NATIVE_BOOKING_CONFLICT', contradictedBookingClaims.map((item) => item.id), 'RECONCILE_CONTRADICTED_NATIVE_BOOKING'],
      ['DUAL_SCHEDULER_RISK', duplicateRisk.map((item) => item.id), 'RESOLVE_DUPLICATE_SCHEDULER_RISK']
    ]) {
      if (!ids.length) continue;
      const orderedIds = [...ids].sort();
      alertFindings.push({
        dedupeKey: findingKey(channel, state, orderedIds),
        state,
        action,
        evidence: { recordIds: orderedIds },
        delivery: 'REPORT_ONLY'
      });
    }
    if (visibleScheduleCopyMismatches.length || unmatchedVisibleScheduleTimes.length || sourceLineageReviewItems.length) {
      const ids = [...visibleScheduleCopyMismatches.map((item) => item.id),
        ...sourceLineageReviewItems.map((item) => item.dataverseSocialExecutionId || item.id),
        ...unmatchedVisibleScheduleTimes].sort();
      alertFindings.push({
        dedupeKey: findingKey(channel, 'NATIVE_BOOKING_SOURCE_COPY_REVIEW', ids),
        state: 'NATIVE_BOOKING_SOURCE_COPY_REVIEW',
        action: 'REVIEW_NATIVE_BOOKING_SOURCE_COPY',
        evidence: { recordIds: ids },
        delivery: 'REPORT_ONLY'
      });
    }
    if ((!channel.destinationId && !channel.destinationHandle) || channel.executionOwner === 'UNRESOLVED') {
      alertFindings.push({
        dedupeKey: findingKey(channel, 'DESTINATION_AUTHORITY_UNRESOLVED', channel.destinationId || channel.destinationHandle || 'MISSING'),
        state: 'DESTINATION_AUTHORITY_UNRESOLVED',
        action: 'VERIFY_DESTINATION_AUTHORITY',
        evidence: { recordIds: [channel.destinationId || channel.destinationHandle || 'MISSING'] },
        delivery: 'REPORT_ONLY'
      });
    }
    return {
      brand: channel.brand,
      platform: channel.platform,
      destinationId: channel.destinationId || null,
      destinationHandle: channel.destinationHandle || null,
      executionOwner: channel.executionOwner,
      nativeReadback: channel.nativeReadback || null,
      nativeReadbackFresh: nativeEvidenceFresh,
      nativeReadbackStatus,
      coverageStatus: coverageProofValid
        ? weeks.some((week) => week.scheduledBookings === 0) ? 'VERIFIED_GAP'
          : weeks.every((week) => week.verifiedBookings > 0) && unapprovedScheduled.length === 0
            && visibleScheduleCopyMismatches.length === 0 && unmatchedVisibleScheduleTimes.length === 0
            ? 'VERIFIED_COVERED' : 'SCHEDULED_APPROVAL_REVIEW'
        : 'UNKNOWN',
      nativeScheduled: coverageProofValid ? nativeScheduled.length : null,
      observedScheduledBookings: coverageProofValid ? nativeScheduled.length : null,
      visibleCalendarSlots: coverageProofValid ? visibleScheduleTimes : null,
      unmatchedVisibleScheduleTimes,
      nativeBookingClaims: bookingClaims.length,
      verifiedBookingsBeyondHorizon: verifiedBookingsBeyondHorizon.map((item) => ({
        id: item.id,
        scheduledAt: item.scheduledAt,
        destinationId: item.destinationId || null
      })),
      unverifiedBookingClaims: unverifiedBookingClaims.map((item) => ({
        id: item.id,
        scheduledAt: item.scheduledAt || null,
        destinationId: item.destinationId || null,
        destinationHandle: item.destinationHandle || null,
        status: item.status || null,
        approvalState: item.approvalState || 'UNKNOWN',
        nativeApprovalEvidence: item.nativeApprovalEvidence || null,
        nativeApprovalReason: item.nativeApprovalReason || null,
        readbackState: item.readbackState || null,
        scheduleVisibleInNativeList: Boolean(scheduleVisibleInNativeList(item)),
        pastDue: Boolean(item.scheduledAt && Date.parse(item.scheduledAt) < Date.parse(snapshot.asOf))
      })),
      visibleScheduleCopyMismatches: visibleScheduleCopyMismatches.map((item) => ({
        id: item.id,
        scheduledAt: item.scheduledAt || null,
        destinationId: item.destinationId || null,
        sourceCopyStatus: item.sourceCopyStatus || 'SOURCE_COPY_NOT_PROVEN'
      })),
      contradictedBookingClaims: contradictedBookingClaims.map((item) => ({
        id: item.id,
        scheduledAt: item.scheduledAt,
        destinationId: item.destinationId || null,
        destinationHandle: item.destinationHandle || null,
        readbackState: item.readbackState || null
      })),
      nativeBookingRows: nativeScheduledReceipts.map((item) => ({
        id: item.id,
        nativeBookingId: item.nativeBookingId || null,
        proof: item.nativeBookingId ? 'NATIVE_ID' : item.nativeEvidence.source,
        scheduledAt: item.scheduledAt,
        approvalState: item.approvalState || null,
        approvalReason: item.nativeApprovalReason || null,
        sourceCopyStatus: item.sourceCopyStatus || null,
        linkedCampaignId: item.nativeApprovalEvidence?.campaignId || null,
        linkedContentId: item.nativeApprovalEvidence?.contentId || null,
        linkedCreativeId: item.nativeApprovalEvidence?.creativeId || null,
        countedSlot: slotCountedReceiptIds.has(item.id),
        sameSlotReceiptIds: (nativeSlotGroups.find((group) => group.includes(item)) || []).map((receipt) => receipt.id),
        executionOwner: nativeOwner(item.platform)
      })),
      verifiedBookings: coverageProofValid ? booked.length : null,
      unapprovedScheduled: unapprovedScheduled.map((item) => item.id),
      nextVerifiedBooking: booked.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0]?.scheduledAt || null,
      apiRequests: apiRequests.length,
      policyExcludedApiRequests: policyExcludedApiRequests.map((item) => ({
        id: item.id,
        campaignType: item.campaignType || null,
        reason: item.campaignSocialEligibilityReason || 'SOCIAL_INELIGIBLE_BY_LIFECYCLE_POLICY',
        disposition: 'PRESERVE_NO_PUBLISH',
        owner: 'JM1_MARKETING_RUNTIME_OWNER',
        action: 'CLASSIFY_LEGACY_NON_SOCIAL_CHILD'
      })),
      nativeReservations: nativeReservations.map((item) => ({
        id: item.id,
        status: item.nativeReservationStatus,
        destinationId: item.destinationId || null,
        destinationHandle: item.destinationHandle || null,
        scheduledAtUtc: item.scheduledAt || null,
        localDate: item.nativeReservationLocalDate || null,
        localTime: item.nativeReservationLocalTime || null,
        timeZone: item.nativeReservationTimeZone || null,
        captionFingerprint: item.captionFingerprint || null,
        mediaSha256: item.mediaSha256 || null,
        readbackState: item.reservationReadbackState || null
      })),
      apiRequestRows: apiRequests.map((item) => ({
        id: item.id,
        requestedAt: item.scheduledAt || null,
        pastDue: Boolean(item.scheduledAt && easternDate(item.scheduledAt) < asOf
          && item.campaignSocialEligible !== false
          && !/^HELD/.test(item.status || '') && item.approvalState !== 'HELD'),
        campaignType: item.campaignType || null,
        campaignSocialEligible: item.campaignSocialEligible ?? null,
        campaignSocialEligibilityReason: item.campaignSocialEligibilityReason || null,
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
      alertFindings,
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
          && matchesDestination(item, channel)
          && ((item.kind === 'PUBLISHED' && item.platformPostId && publishedDateET(item))
            || (item.kind === 'NATIVE_BOOKING' && hasNativeBookingProof(item, asOf, snapshot.asOf)
              && item.scheduledAt
              && easternDate(item.scheduledAt) >= asOf
              && channel.nativeReadback?.state === 'VERIFIED'
              && (channel.nativeReadback.requireTimestamp === true
                ? timestampEvidenceFresh(channel.nativeReadback.observedAt, snapshot.asOf)
                : channel.nativeReadback.observedDateET === asOf))))
      ).filter((item) => {
        const date = item.kind === 'PUBLISHED' ? publishedDateET(item) : easternDate(item.scheduledAt);
        return date >= first && date < stop && date >= start && date < endExclusive;
      });
      weeks.push({
        startMondayET: start,
        endExclusiveMondayET: endExclusive,
        proofIds: proof.map((item) => item.id),
        approvedProofIds: proof.filter((item) => item.kind === 'PUBLISHED' || item.approvalState === 'APPROVED')
          .map((item) => item.id),
        approvalUnverifiedProofIds: proof.filter((item) => item.kind === 'NATIVE_BOOKING'
          && item.approvalState !== 'APPROVED').map((item) => item.id)
      });
    }
    return { brand: program.brand, author: program.author, month: program.month,
      coveredWeeks: weeks.filter((week) => week.proofIds.length).length,
      approvalVerifiedWeeks: weeks.filter((week) => week.approvedProofIds.length).length,
      totalWeeks: weeks.length, weeks };
  });

  return {
    asOfDateET: asOf,
    endExclusiveDateET: end,
    zone: ZONE,
    channels: results,
    authorCoverage,
    alertFindings: results.flatMap((channel) => channel.alertFindings)
  };
}
