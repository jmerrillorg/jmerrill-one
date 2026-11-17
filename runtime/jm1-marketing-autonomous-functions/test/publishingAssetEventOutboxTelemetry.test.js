import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeOutbox } from '../src/lib/publishingAssetEventOutboxTelemetry.js';

test('reports no source rows distinctly from no eligible source events', () => {
  assert.deepEqual(summarizeOutbox(0, []), {
    sourceRows: 0,
    emittedCount: 0,
    alreadyEmittedCount: 0,
    notEligibleCount: 0,
    noSourceRows: true,
    noEligibleEvents: false,
    outcome: 'NO_SOURCE_ROWS',
    outcomes: []
  });

  const result = summarizeOutbox(2, [
    { sourceExecutionLogId: 'a', disposition: 'NOT_ELIGIBLE', reason: 'REQUIRED_ARTIFACT_LINEAGE_INCOMPLETE' },
    { sourceExecutionLogId: 'b', disposition: 'NOT_ELIGIBLE', reason: 'REQUIRED_ARTIFACT_LINEAGE_INCOMPLETE' }
  ]);
  assert.equal(result.noSourceRows, false);
  assert.equal(result.noEligibleEvents, true);
  assert.equal(result.outcome, 'NO_ELIGIBLE_EVENTS');
  assert.equal(result.notEligibleCount, 2);
});

test('reports prior emission separately from ineligible and newly emitted rows', () => {
  const allPrior = summarizeOutbox(2, [
    { sourceExecutionLogId: 'a', disposition: 'ALREADY_EMITTED' },
    { sourceExecutionLogId: 'b', disposition: 'ALREADY_EMITTED' }
  ]);
  assert.equal(allPrior.outcome, 'ALL_ALREADY_EMITTED');
  assert.equal(allPrior.alreadyEmittedCount, 2);
  assert.equal(allPrior.noEligibleEvents, false);

  const mixed = summarizeOutbox(3, [
    { sourceExecutionLogId: 'a', disposition: 'EMITTED' },
    { sourceExecutionLogId: 'b', disposition: 'ALREADY_EMITTED' },
    { sourceExecutionLogId: 'c', disposition: 'NOT_ELIGIBLE', reason: 'REQUIRED_ARTIFACT_LINEAGE_INCOMPLETE' }
  ]);
  assert.equal(mixed.outcome, 'EVENTS_EMITTED');
  assert.equal(mixed.emittedCount, 1);
  assert.equal(mixed.alreadyEmittedCount, 1);
  assert.equal(mixed.notEligibleCount, 1);
});
