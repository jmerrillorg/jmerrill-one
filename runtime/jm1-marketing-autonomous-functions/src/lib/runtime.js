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

export function credentialState(rotationDueAt, expiresAt, now = new Date()) {
  const due = new Date(rotationDueAt);
  const expires = new Date(expiresAt);
  if (!Number.isNaN(expires.getTime()) && now >= expires) return 'EXPIRED';
  if (!Number.isNaN(due.getTime()) && now >= due) return 'META_CREDENTIAL_ROTATION_DUE';
  return 'VERIFIED_ACTIVE_ROTATION_TRACKED';
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
