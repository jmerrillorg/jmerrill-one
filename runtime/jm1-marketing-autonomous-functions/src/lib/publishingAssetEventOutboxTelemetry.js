export function summarizeOutbox(sourceRows, outcomes) {
  const counts = outcomes.reduce((summary, outcome) => {
    if (outcome.disposition === 'EMITTED') summary.emittedCount += 1;
    else if (outcome.disposition === 'ALREADY_EMITTED') summary.alreadyEmittedCount += 1;
    else if (outcome.disposition === 'NOT_ELIGIBLE') summary.notEligibleCount += 1;
    return summary;
  }, { emittedCount: 0, alreadyEmittedCount: 0, notEligibleCount: 0 });

  let outcome;
  if (sourceRows === 0) outcome = 'NO_SOURCE_ROWS';
  else if (counts.emittedCount > 0) outcome = 'EVENTS_EMITTED';
  else if (counts.alreadyEmittedCount === sourceRows) outcome = 'ALL_ALREADY_EMITTED';
  else if (counts.notEligibleCount === sourceRows) outcome = 'NO_ELIGIBLE_EVENTS';
  else outcome = 'MIXED_NO_NEW_EMISSIONS';

  return {
    sourceRows,
    ...counts,
    noSourceRows: sourceRows === 0,
    noEligibleEvents: sourceRows > 0 && counts.emittedCount === 0 && counts.alreadyEmittedCount === 0,
    outcome,
    outcomes
  };
}
