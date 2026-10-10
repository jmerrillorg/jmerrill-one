const AMBIGUOUS_STATES = new Set([
  'FACEBOOK_PUBLISH_OUTCOME_AMBIGUOUS',
  'FACEBOOK_READBACK_FAILED',
  'INSTAGRAM_PUBLISH_OUTCOME_AMBIGUOUS',
  'INSTAGRAM_READBACK_FAILED'
]);

export function isAmbiguousPublicationOutcome(result) {
  return Boolean(result?.outcomeAmbiguous || AMBIGUOUS_STATES.has(result?.state));
}

export function reconcileProviderPublication(existing) {
  if (existing?.ok && Number(existing.duplicateCount || 0) === 0 && existing.platformPostId) {
    return { state: 'PUBLISHED_VERIFIED', repostAllowed: false, resolutionState: 'RESOLVED' };
  }
  return {
    state: 'AMBIGUOUS_PUBLICATION_OUTCOME',
    repostAllowed: false,
    resolutionState: 'OPEN',
    providerReadback: Number(existing?.duplicateCount || 0) > 0 ? 'DUPLICATE_PROVIDER_MATCHES' : existing?.state || 'PROVIDER_READBACK_UNAVAILABLE'
  };
}

export function classifyProviderScheduleEvidence({ expected, observed }) {
  if (!expected?.destinationId || !expected?.scheduledAt || !expected?.captionSha256
    || !observed?.source || !observed?.observedAt) {
    return { state: 'PROVIDER_EVIDENCE_INCOMPLETE', exceptionState: 'OPEN', repostAllowed: false };
  }
  if (observed.destinationId !== expected.destinationId || observed.captionSha256 !== expected.captionSha256) {
    return { state: 'AMBIGUOUS_PUBLICATION_OUTCOME', exceptionState: 'OPEN', repostAllowed: false };
  }
  if (observed.state === 'SCHEDULED' && observed.scheduledAt === expected.scheduledAt) {
    return { state: 'PROVIDER_SCHEDULE_MATCH', exceptionState: null, repostAllowed: false };
  }
  if (observed.state === 'SCHEDULED' && observed.scheduledAt && observed.scheduledAt !== expected.scheduledAt) {
    return { state: 'PROVIDER_SCHEDULE_MOVED', exceptionState: 'OPEN', repostAllowed: false };
  }
  if (observed.state === 'MISSING') {
    return { state: 'PROVIDER_SCHEDULE_MISSING', exceptionState: 'OPEN', repostAllowed: false };
  }
  if (observed.state === 'PUBLISHED' && observed.platformPostId) {
    return { state: 'PROVIDER_PUBLISHED_AFTER_SCHEDULE', exceptionState: 'RESOLVED', repostAllowed: false };
  }
  return { state: 'AMBIGUOUS_PUBLICATION_OUTCOME', exceptionState: 'OPEN', repostAllowed: false };
}

export function ambiguousPublicationException({ row, envelope, resultState, resolutionState = 'OPEN' }) {
  const key = row.jm1_idempotencykey;
  if (!key) throw new Error('Ambiguous publication exception requires a social idempotency key');
  return {
    jm1_name: 'Social publication outcome requires reconciliation',
    jm1_branch: row.jm1_branch || '',
    jm1_campaign: row.jm1_name || '',
    jm1_workrecord: row.jm1_socialexecutionid,
    jm1_exceptiontype: 'PUBLICATION_OUTCOME_AMBIGUOUS',
    jm1_severity: 'P1',
    jm1_reason: `Provider publication outcome is ambiguous (${resultState || 'UNKNOWN'}). Do not repost until provider readback identifies exactly one matching post or an operator resolves the outcome.`,
    jm1_resolutionstate: resolutionState,
    jm1_resolution: resolutionState === 'RESOLVED'
      ? 'Resolved by an exact single provider-post match. The existing post was reconciled; no repost was performed.'
      : 'Reconcile the exact destination, caption, scheduled time, and provider post ID. Retry is prohibited while the outcome remains ambiguous.',
    jm1_authorityrequired: 'JM1 marketing runtime operator',
    jm1_createdat: envelope.startedAt,
    jm1_attemptcount: Number(row.jm1_attemptcount || 0),
    jm1_correlationid: envelope.correlationId,
    jm1_worker: 'social-execution-worker',
    jm1_lastfailureat: envelope.startedAt,
    jm1_exceptionowner: 'JM1 marketing runtime operator',
    jm1_idempotencykey: `social-publication-outcome:${key}`
  };
}
