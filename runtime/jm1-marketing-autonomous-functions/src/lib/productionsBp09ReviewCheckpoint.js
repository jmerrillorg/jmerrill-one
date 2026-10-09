const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EXCEPTIONS = Object.freeze({
  CALENDAR_UNAVAILABLE: 'PRD_REVIEW_CALENDAR_UNAVAILABLE',
  DUE_AT_INVALID: 'PRD_REVIEW_DUE_AT_INVALID',
  REVIEW_READ_UNAUTHORIZED: 'PRD_REVIEW_READ_UNAUTHORIZED',
  REVIEW_READ_UNAVAILABLE: 'PRD_REVIEW_READ_UNAVAILABLE',
  REVIEW_EVIDENCE_INVALID: 'PRD_REVIEW_EVIDENCE_INVALID',
  ALERT_ROUTE_UNAUTHORIZED: 'PRD_REVIEW_ALERT_ROUTE_UNAUTHORIZED',
  ALERT_ROUTE_UNVERIFIED: 'PRD_REVIEW_ALERT_ROUTE_UNVERIFIED'
});

function exception(code, state = 'BLOCKED') {
  return { state, exception: code, effects: 'NONE' };
}

function validReview(receipt, actions) {
  const matching = actions.filter((action) => action.jm1_receiptid === receipt.id ||
    action._jm1_receiptid_value === receipt.id);
  if (matching.length !== 1) return false;
  const action = matching[0];
  return (action.jm1_leadid === receipt.leadReference || action._jm1_leadid_value === receipt.leadReference) &&
    action.jm1_actionid === 'ACCEPT_FOR_FOLLOW_UP' &&
    action.jm1_outcome === 'ACCEPTED' && GUID.test(action.jm1_actorid || '') &&
    GUID.test(action.jm1_productionsinquiryactionid || action.id || '');
}

export function evaluateProductionsReviewCheckpoint({
  receipt, reviewReadState, reviewActions = [], dueAt, calendarState,
  alertRouteState, now = new Date()
}) {
  if (!receipt || !GUID.test(receipt.id || '') || !GUID.test(receipt.leadReference || '') ||
      receipt.channel !== 'jmerrill.productions/contact' ||
      receipt.routingDestination !== 'J Merrill Productions' ||
      receipt.submission?.intent !== 'productions' || receipt.state !== 'COMPLETED' ||
      receipt.finalState !== 'LEAD_CREATED') {
    return exception(EXCEPTIONS.REVIEW_EVIDENCE_INVALID);
  }
  if (calendarState !== 'AVAILABLE') return exception(EXCEPTIONS.CALENDAR_UNAVAILABLE);
  if (!Number.isFinite(Date.parse(dueAt)) || new Date(Date.parse(dueAt)).toISOString() !== dueAt) {
    return exception(EXCEPTIONS.DUE_AT_INVALID);
  }
  if (reviewReadState === 'DENIED') return exception(EXCEPTIONS.REVIEW_READ_UNAUTHORIZED);
  if (reviewReadState !== 'AVAILABLE') return exception(EXCEPTIONS.REVIEW_READ_UNAVAILABLE);
  if (validReview(receipt, reviewActions)) {
    return { state: 'REVIEWED_ACCEPTED_FOR_FOLLOW_UP', resolved: true, effects: 'NONE' };
  }
  if (reviewActions.some((action) => action.jm1_receiptid === receipt.id ||
      action._jm1_receiptid_value === receipt.id)) {
    return exception(EXCEPTIONS.REVIEW_EVIDENCE_INVALID);
  }
  const current = Date.parse(now);
  if (!Number.isFinite(current)) return exception(EXCEPTIONS.DUE_AT_INVALID);
  if (current < Date.parse(dueAt)) {
    return { state: 'PENDING_REVIEW', dueAt, resolved: false, effects: 'NONE' };
  }
  if (alertRouteState === 'UNAUTHORIZED') return exception(EXCEPTIONS.ALERT_ROUTE_UNAUTHORIZED, 'OVERDUE_BLOCKED');
  if (alertRouteState !== 'AUTHORIZED') return exception(EXCEPTIONS.ALERT_ROUTE_UNVERIFIED, 'OVERDUE_BLOCKED');
  return { state: current === Date.parse(dueAt) ? 'REVIEW_DUE' : 'REVIEW_OVERDUE',
    dueAt, resolved: false, alertEligible: true, effects: 'NONE' };
}

export const PRODUCTIONS_REVIEW_CHECKPOINT_EXCEPTIONS = EXCEPTIONS;
