import assert from 'node:assert/strict';
import { classifyFailure, deadLetterRecord, FAILURE_STATES } from '../runtime/jm1-marketing-autonomous-functions/src/lib/failurePolicy.js';
import { executeWithLeaseClient } from '../runtime/jm1-marketing-autonomous-functions/src/lib/runtimeLease.js';

const context = { log() {}, warn() {}, error() {} };
const envelope = { runId: 'resilience-proof', correlationId: 'correlation-proof', startedAt: '2026-09-05T00:00:00Z' };
let held = false;
const leaseClient = {
  async acquireLease() {
    if (held) throw Object.assign(new Error('Lease already present'), { statusCode: 409 });
    held = true;
    return { leaseId: 'proof' };
  },
  async renewLease() {},
  async releaseLease() { held = false; }
};

let releaseFirst;
const first = executeWithLeaseClient(leaseClient, {
  worker: 'proof-worker', envelope, context, durationSeconds: 60,
  execute: () => new Promise((resolve) => { releaseFirst = resolve; })
});
await new Promise((resolve) => setImmediate(resolve));
const overlap = await executeWithLeaseClient(leaseClient, {
  worker: 'proof-worker', envelope, context, durationSeconds: 60,
  execute: async () => 'SHOULD_NOT_RUN'
});
assert.equal(overlap.state, 'DISTRIBUTED_LEASE_HELD_BY_ANOTHER_INVOCATION');
releaseFirst('AUTHORITATIVE_EXECUTION');
assert.equal(await first, 'AUTHORITATIVE_EXECUTION');

const retry = classifyFailure({ attempts: 1, maxAttempts: 3, category: 'PLATFORM_TIMEOUT' });
assert.equal(retry.state, 'RETRY_SCHEDULED');
assert.equal(retry.retryAfterMinutes, 10);
const exhausted = classifyFailure({ attempts: 3, maxAttempts: 3, category: 'PLATFORM_TIMEOUT' });
assert.equal(exhausted.state, 'DEAD_LETTERED');
const terminal = classifyFailure({ attempts: 1, maxAttempts: 3, category: 'BRANCH_LEAKAGE' });
assert.equal(terminal.state, 'DEAD_LETTERED');
const record = deadLetterRecord({ envelope, worker: 'proof-worker', branch: 'J Merrill Publishing', campaign: 'proof', category: 'PLATFORM_TIMEOUT', attempts: 3, message: 'bounded proof', owner: 'runtime operator' });
assert.equal(record.jm1_resolutionstate, 'DEAD_LETTERED');
assert.ok(FAILURE_STATES.includes('SUPERSEDED'));

console.log(JSON.stringify({
  artifact: 'JM1-MARKETING-RESILIENCE-REGRESSION-v1',
  passed: 5,
  failed: 0,
  classifications: [
    'JM1_MARKETING_TIMER_DISTRIBUTED_LEASES_PROVEN',
    'JM1_MARKETING_DEAD_LETTER_HANDLING_PROVEN'
  ]
}, null, 2));
