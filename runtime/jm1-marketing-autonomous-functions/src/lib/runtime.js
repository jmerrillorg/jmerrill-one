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

export function octoberIyorwueseMarker() {
  return deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
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
