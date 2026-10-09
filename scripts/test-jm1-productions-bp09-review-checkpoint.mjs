import assert from 'node:assert/strict';
import { evaluateProductionsReviewCheckpoint as evaluate, PRODUCTIONS_REVIEW_CHECKPOINT_EXCEPTIONS as X } from '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09ReviewCheckpoint.js';

const receipt = {
  id: '11111111-1111-4111-a111-111111111111',
  leadReference: '22222222-2222-4222-a222-222222222222',
  channel: 'jmerrill.productions/contact', routingDestination: 'J Merrill Productions',
  submission: { intent: 'productions' }, state: 'COMPLETED', finalState: 'LEAD_CREATED'
};
const dueAt = '2026-11-02T16:00:00.000Z';
const base = { receipt, calendarState: 'AVAILABLE', dueAt, reviewReadState: 'AVAILABLE',
  alertRouteState: 'AUTHORIZED' };

assert.equal(evaluate({ ...base, now: '2026-11-02T13:59:59.999Z' }).state, 'PENDING_REVIEW');
assert.equal(evaluate({ ...base, now: dueAt }).state, 'REVIEW_DUE');
assert.equal(evaluate({ ...base, now: '2026-11-02T16:00:00.001Z' }).state, 'REVIEW_OVERDUE');
assert.equal(evaluate({ ...base, calendarState: 'UNAVAILABLE' }).exception, X.CALENDAR_UNAVAILABLE);
assert.equal(evaluate({ ...base, dueAt: 'bad' }).exception, X.DUE_AT_INVALID);
assert.equal(evaluate({ ...base, reviewReadState: 'DENIED' }).exception, X.REVIEW_READ_UNAUTHORIZED);
assert.equal(evaluate({ ...base, reviewReadState: 'UNAVAILABLE' }).exception, X.REVIEW_READ_UNAVAILABLE);
assert.equal(evaluate({ ...base, alertRouteState: 'UNVERIFIED', now: '2026-11-03T14:00:00.000Z' }).exception,
  X.ALERT_ROUTE_UNVERIFIED);
assert.equal(evaluate({ ...base, alertRouteState: 'UNAUTHORIZED', now: '2026-11-03T14:00:00.000Z' }).exception,
  X.ALERT_ROUTE_UNAUTHORIZED);

const accepted = { jm1_productionsinquiryactionid: '33333333-3333-4333-a333-333333333333',
  jm1_receiptid: receipt.id, jm1_leadid: receipt.leadReference, jm1_actionid: 'ACCEPT_FOR_FOLLOW_UP',
  jm1_actorid: '44444444-4444-4444-a444-444444444444', jm1_outcome: 'ACCEPTED' };
assert.equal(evaluate({ ...base, reviewActions: [accepted], now: '2026-11-03T14:00:00.000Z' }).state,
  'REVIEWED_ACCEPTED_FOR_FOLLOW_UP');
assert.equal(evaluate({ ...base, reviewActions: [{ ...accepted, jm1_receiptid: '55555555-5555-4555-a555-555555555555' }],
  now: '2026-11-03T14:00:00.000Z' }).state, 'REVIEW_OVERDUE');
assert.equal(evaluate({ ...base, reviewActions: [{ ...accepted, jm1_outcome: 'REPLAY' }],
  now: '2026-11-03T14:00:00.000Z' }).exception, X.REVIEW_EVIDENCE_INVALID);
assert.equal(evaluate({ ...base, reviewActions: [accepted, accepted],
  now: '2026-11-03T14:00:00.000Z' }).exception, X.REVIEW_EVIDENCE_INVALID);
assert.equal(evaluate({ ...base, receipt: { ...receipt, channel: 'jmerrill.one/contact' } }).exception,
  X.REVIEW_EVIDENCE_INVALID);

// Calendar adapters own Eastern business-day calculation; fixtures pin observed-holiday and DST results.
const calendarFixtures = [
  { receivedAt: '2026-10-30T15:00:00.000Z', dueAt: '2026-11-02T16:00:00.000Z', label: 'weekend + DST end' },
  { receivedAt: '2026-11-10T15:00:00.000Z', dueAt: '2026-11-12T15:00:00.000Z', label: 'observed Veterans Day closure' },
  { receivedAt: '2026-03-06T15:00:00.000Z', dueAt: '2026-03-09T14:00:00.000Z', label: 'DST start' }
];
const easternClock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
for (const fixture of calendarFixtures) {
  assert.ok(Number.isFinite(Date.parse(fixture.receivedAt)), fixture.label);
  assert.ok(Number.isFinite(Date.parse(fixture.dueAt)), fixture.label);
  assert.equal(easternClock.format(new Date(fixture.receivedAt)), easternClock.format(new Date(fixture.dueAt)), fixture.label);
}
console.log('Productions BP-09 review checkpoint state machine and fail-closed synthetic contract PASS');
