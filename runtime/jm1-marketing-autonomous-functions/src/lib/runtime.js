import { createHash, randomUUID } from 'node:crypto';

export function isoNow() {
  return new Date().toISOString();
}

export function runEnvelope(triggerType, timer, context) {
  const startedAt = isoNow();
  const runId = `${triggerType}:${startedAt}:${randomUUID()}`;
  return {
    runId,
    correlationId: context.invocationId,
    triggerType,
    runtimeService: 'Azure Functions Timer Trigger',
    startedAt,
    scheduleStatus: timer?.scheduleStatus || null,
    founderTouchCount: 0,
    codyManualStartCount: 0,
    browserExecutionCount: 0,
    metaBusinessSuiteUiPublishing: false,
    sintraPublishing: false,
    linkedinNativeUiPublishing: false
  };
}

export function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

export const FEATURED_AUTHOR_AUTHORITIES = [
  {
    branch: 'J Merrill Publishing',
    month: '2026-09',
    author: 'Sean A Crowley I',
    startsAt: '2026-09-01T00:00:00-04:00',
    stopsAt: '2026-09-30T23:59:59-04:00',
    titles: [
      {
        title: 'The Shift: Changing with God',
        lifecycleState: 'NEW_RECENTLY_RELEASED',
        releaseState: 'released'
      },
      {
        title: 'Strategies for Success in Educational Leadership',
        lifecycleState: 'PRE_LAUNCH_TO_RELEASE',
        releaseDate: '2026-09-22'
      }
    ]
  },
  {
    branch: 'J Merrill Publishing',
    month: '2026-10',
    author: 'Iyorwuese Hagher',
    markerAuthor: 'Iyorwuese',
    startsAt: '2026-10-01T00:00:00-04:00',
    stopsAt: '2026-10-31T23:59:59-04:00',
    titles: []
  }
];

export function featuredAuthorMarker(authority) {
  return deterministicId(
    'FEATURED_AUTHOR_MONTH_ACTIVE',
    authority.branch || 'J Merrill Publishing',
    authority.month,
    authority.markerAuthor || authority.author
  );
}

export function featuredAuthorAuthorityForDate(now = new Date(), authorities = FEATURED_AUTHOR_AUTHORITIES) {
  const evaluatedAt = now instanceof Date ? now : new Date(now);
  const validAuthorities = authorities
    .map((authority) => ({
      ...authority,
      marker: featuredAuthorMarker(authority),
      starts: new Date(authority.startsAt),
      stops: new Date(authority.stopsAt)
    }))
    .filter((authority) => !Number.isNaN(authority.starts.getTime()) && !Number.isNaN(authority.stops.getTime()))
    .sort((a, b) => a.starts - b.starts);
  const current = validAuthorities.find((authority) => evaluatedAt >= authority.starts && evaluatedAt <= authority.stops) || null;
  const next = validAuthorities.find((authority) => authority.starts > evaluatedAt) || null;
  return {
    evaluatedAt: evaluatedAt.toISOString(),
    current: current ? authorityView(current, 'ACTIVE_CURRENT_MONTH') : null,
    next: next ? authorityView(next, current ? 'FUTURE_NEXT_MONTH_PRESTAGED' : 'FUTURE_NEXT_MONTH') : null
  };
}

export function currentFeaturedAuthorMarker(now = new Date()) {
  return featuredAuthorAuthorityForDate(now).current?.marker || '';
}

export function septemberSeanMarker() {
  return featuredAuthorMarker(FEATURED_AUTHOR_AUTHORITIES[0]);
}

export function octoberIyorwueseMarker() {
  return featuredAuthorMarker(FEATURED_AUTHOR_AUTHORITIES[1]);
}

export function activeBranches(branchConfig) {
  return Object.entries(branchConfig)
    .filter(([, config]) => config.active)
    .map(([key, config]) => ({ key, ...config }));
}

export const CREDENTIAL_STATES = Object.freeze({
  KNOWN_VALID: 'KNOWN_VALID',
  EXPIRING_60D: 'EXPIRING_60D',
  EXPIRING_30D: 'EXPIRING_30D',
  EXPIRING_14D: 'EXPIRING_14D',
  EXPIRING_7D: 'EXPIRING_7D',
  EXPIRED: 'EXPIRED',
  EXPIRATION_UNKNOWN: 'EXPIRATION_UNKNOWN',
  NONEXPIRING_PROVEN: 'NONEXPIRING_PROVEN',
  INVALID_METADATA: 'INVALID_METADATA',
  READBACK_FAILED: 'READBACK_FAILED',
  NOT_ISSUED: 'NOT_ISSUED',
  ROTATION_DUE: 'META_CREDENTIAL_ROTATION_DUE'
});

const DAY_MS = 24 * 60 * 60 * 1000;
const RFC3339_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

export function classifyCredentialMetadata(metadata = {}, now = new Date()) {
  const evaluatedAt = asValidDate(now);
  const issued = credentialTimestamp(metadata.issuedAt);
  const expires = credentialTimestamp(metadata.expiresAt);
  const rotationDue = credentialTimestamp(metadata.rotationDueAt);

  if (!evaluatedAt || [issued, expires, rotationDue].some((item) => item.kind === 'invalid')) {
    return credentialClassification(CREDENTIAL_STATES.INVALID_METADATA, issued, expires, rotationDue);
  }

  if (metadata.nonexpiringProven && expires.kind !== 'missing') {
    return credentialClassification(CREDENTIAL_STATES.INVALID_METADATA, issued, expires, rotationDue);
  }

  if (metadata.notIssued && [issued, expires, rotationDue].some((item) => item.kind !== 'missing')) {
    return credentialClassification(CREDENTIAL_STATES.INVALID_METADATA, issued, expires, rotationDue);
  }

  if (issued.kind === 'valid' && expires.kind === 'valid' && issued.epochMs > expires.epochMs) {
    return credentialClassification(CREDENTIAL_STATES.INVALID_METADATA, issued, expires, rotationDue);
  }

  if (rotationDue.kind === 'valid' && expires.kind === 'valid' && rotationDue.epochMs > expires.epochMs) {
    return credentialClassification(CREDENTIAL_STATES.INVALID_METADATA, issued, expires, rotationDue);
  }

  if (metadata.readbackAvailable === false) {
    return credentialClassification(CREDENTIAL_STATES.READBACK_FAILED, issued, expires, rotationDue);
  }

  if (metadata.notIssued) {
    return credentialClassification(CREDENTIAL_STATES.NOT_ISSUED, issued, expires, rotationDue);
  }

  if (metadata.nonexpiringProven) {
    return credentialClassification(CREDENTIAL_STATES.NONEXPIRING_PROVEN, issued, expires, rotationDue);
  }

  if (expires.kind === 'missing') {
    return credentialClassification(CREDENTIAL_STATES.EXPIRATION_UNKNOWN, issued, expires, rotationDue);
  }

  if (evaluatedAt.getTime() >= expires.epochMs) {
    return credentialClassification(CREDENTIAL_STATES.EXPIRED, issued, expires, rotationDue);
  }

  if (rotationDue.kind === 'valid' && evaluatedAt.getTime() >= rotationDue.epochMs) {
    return credentialClassification(CREDENTIAL_STATES.ROTATION_DUE, issued, expires, rotationDue);
  }

  const remainingMs = expires.epochMs - evaluatedAt.getTime();
  if (remainingMs <= 7 * DAY_MS) return credentialClassification(CREDENTIAL_STATES.EXPIRING_7D, issued, expires, rotationDue);
  if (remainingMs <= 14 * DAY_MS) return credentialClassification(CREDENTIAL_STATES.EXPIRING_14D, issued, expires, rotationDue);
  if (remainingMs <= 30 * DAY_MS) return credentialClassification(CREDENTIAL_STATES.EXPIRING_30D, issued, expires, rotationDue);
  if (remainingMs <= 60 * DAY_MS) return credentialClassification(CREDENTIAL_STATES.EXPIRING_60D, issued, expires, rotationDue);
  return credentialClassification(CREDENTIAL_STATES.KNOWN_VALID, issued, expires, rotationDue);
}

export function credentialState(rotationDueAt, expiresAt, now = new Date()) {
  return classifyCredentialMetadata({ rotationDueAt, expiresAt }, now).state;
}

function credentialTimestamp(value) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return { kind: 'missing', value: null, epochMs: null };
  }

  if (typeof value !== 'string' || !RFC3339_WITH_ZONE.test(value.trim())) {
    return { kind: 'invalid', value: null, epochMs: null };
  }

  const timestamp = value.trim();
  const epochMs = Date.parse(timestamp);
  if (!Number.isFinite(epochMs)) return { kind: 'invalid', value: null, epochMs: null };
  return { kind: 'valid', value: timestamp, epochMs };
}

function credentialClassification(state, issued, expires, rotationDue) {
  const exceptionCodes = {
    [CREDENTIAL_STATES.EXPIRING_60D]: 'CREDENTIAL_EXPIRING_60D',
    [CREDENTIAL_STATES.EXPIRING_30D]: 'CREDENTIAL_EXPIRING_30D',
    [CREDENTIAL_STATES.EXPIRING_14D]: 'CREDENTIAL_EXPIRING_14D',
    [CREDENTIAL_STATES.EXPIRING_7D]: 'CREDENTIAL_EXPIRING_7D',
    [CREDENTIAL_STATES.EXPIRED]: 'CREDENTIAL_EXPIRED',
    [CREDENTIAL_STATES.EXPIRATION_UNKNOWN]: 'CREDENTIAL_EXPIRATION_UNKNOWN',
    [CREDENTIAL_STATES.INVALID_METADATA]: 'CREDENTIAL_METADATA_INVALID',
    [CREDENTIAL_STATES.READBACK_FAILED]: 'CREDENTIAL_READBACK_FAILED',
    [CREDENTIAL_STATES.NOT_ISSUED]: 'CREDENTIAL_NOT_ISSUED',
    [CREDENTIAL_STATES.ROTATION_DUE]: 'META_CREDENTIAL_ROTATION_DUE'
  };

  return {
    state,
    exceptionCode: exceptionCodes[state] || '',
    issuedAt: issued.value,
    expiresAt: expires.value,
    rotationDueAt: rotationDue.value
  };
}

function asValidDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function authorityView(authority, state) {
  return {
    branch: authority.branch,
    month: authority.month,
    author: authority.author,
    marker: authority.marker,
    state,
    startsAt: authority.startsAt,
    stopsAt: authority.stopsAt,
    titles: authority.titles || []
  };
}
