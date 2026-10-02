import assert from 'node:assert/strict';
import test from 'node:test';
import { eligibleForDeletion, retentionCutoff } from './lib/jsj-retention-policy.mjs';

const now = new Date('2026-10-02T00:00:00Z');
const cutoff = retentionCutoff(now);
const closed = { jm1_closedat: '2025-10-01T00:00:00Z' };

test('deletes only unconverted inquiries at least 12 months after closure', () => {
  assert.equal(cutoff.toISOString(), '2025-10-02T00:00:00.000Z');
  assert.equal(eligibleForDeletion(closed, cutoff), true);
  assert.equal(eligibleForDeletion({ jm1_closedat: cutoff.toISOString() }, cutoff), true);
  assert.equal(eligibleForDeletion({ jm1_closedat: '2025-10-03T00:00:00Z' }, cutoff), false);
  assert.equal(eligibleForDeletion({}, cutoff), false);
});

test('hold and authoritative transfer prevent deletion', () => {
  assert.equal(eligibleForDeletion({ ...closed, jm1_retentionhold: 'Legal hold' }, cutoff), false);
  assert.equal(eligibleForDeletion({ ...closed, jm1_transferredat: '2025-11-01T00:00:00Z' }, cutoff), false);
  assert.equal(eligibleForDeletion({ ...closed, jm1_authoritativerecord: 'contact:123' }, cutoff), false);
});
