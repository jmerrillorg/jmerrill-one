export const FAILURE_STATES = Object.freeze([
  'RETRYABLE',
  'RETRY_SCHEDULED',
  'TERMINAL_EXCEPTION',
  'DEAD_LETTERED',
  'RESOLVED',
  'SUPERSEDED'
]);

export function classifyFailure({ attempts = 0, maxAttempts = 3, category = '', retryable = true }) {
  const normalizedAttempts = Math.max(0, Number(attempts) || 0);
  const normalizedMax = Math.max(1, Number(maxAttempts) || 3);
  const terminalCategory = /AUTHORIZATION|BRANCH_LEAKAGE|DUPLICATE|RIGHTS|COMPLIANCE|READBACK_MISMATCH/i.test(category);
  if (!retryable || terminalCategory || normalizedAttempts >= normalizedMax) {
    return {
      state: 'DEAD_LETTERED',
      terminalState: 'TERMINAL_EXCEPTION',
      attempts: normalizedAttempts,
      maxAttempts: normalizedMax,
      retryAt: null
    };
  }
  const delayMinutes = Math.min(240, 5 * (2 ** normalizedAttempts));
  return {
    state: normalizedAttempts === 0 ? 'RETRYABLE' : 'RETRY_SCHEDULED',
    attempts: normalizedAttempts,
    maxAttempts: normalizedMax,
    retryAfterMinutes: delayMinutes
  };
}

export function deadLetterRecord({ envelope, worker, branch, campaign, category, attempts, message, owner }) {
  return {
    jm1_name: `${worker} terminal failure`,
    jm1_branch: branch,
    jm1_campaign: campaign || '',
    jm1_workrecord: envelope.runId,
    jm1_exceptiontype: category,
    jm1_severity: 'P1',
    jm1_reason: message,
    jm1_resolutionstate: 'DEAD_LETTERED',
    jm1_resolution: 'Resolve or supersede the failed work record; do not retry blindly.',
    jm1_authorityrequired: owner || 'JM1 marketing runtime operator',
    jm1_createdat: envelope.startedAt,
    jm1_idempotencykey: `${envelope.runId}:dead-letter:${worker}:${category}:${attempts}`
  };
}
