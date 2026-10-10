import Holidays from 'date-holidays';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ZONE = 'America/New_York';
const OPEN_MINUTE = 9 * 60;
const CLOSE_MINUTE = 17 * 60;
const holidays = new Holidays('US');
const ALERT_STATES = ['NOT_DUE', 'ATTEMPTING', 'RECEIPT_PENDING', 'PROVIDER_ACCEPTED', 'RETRY_WAIT', 'HELD'];
const ALERT_MAX_ATTEMPTS = 3;

function fail(code) { const error = new Error(code); error.code = code; return error; }
function instant(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) && value.endsWith('Z'); }

function localParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map(({ type, value }) => [type, Number(value)]));
}

function localToUtc({ year, month, day, hour, minute, second = 0 }) {
  const target = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = target;
  for (let i = 0; i < 4; i++) {
    const p = localParts(new Date(guess));
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const delta = target - represented;
    if (!delta) break;
    guess += delta;
  }
  const actual = localParts(new Date(guess));
  if (actual.year !== year || actual.month !== month || actual.day !== day || actual.hour !== hour || actual.minute !== minute) {
    throw fail('CHECKPOINT_LOCAL_TIME_INVALID');
  }
  return new Date(guess);
}

function isBusinessDate({ year, month, day }) {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !holidays.isHoliday(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function calculateProductionsReviewDueAt(acceptedAt) {
  if (!instant(acceptedAt)) throw fail('CHECKPOINT_ACCEPTED_AT_INVALID');
  let remaining = 8 * 60;
  let cursor = new Date(acceptedAt);
  for (let day = 0; day < 40 && remaining > 0; day++) {
    const p = localParts(cursor);
    const date = { year: p.year, month: p.month, day: p.day };
    if (isBusinessDate(date)) {
      const minute = p.hour * 60 + p.minute;
      const startMinute = Math.max(OPEN_MINUTE, minute);
      if (startMinute < CLOSE_MINUTE) {
        const available = CLOSE_MINUTE - startMinute;
        const consumed = Math.min(remaining, available);
        cursor = new Date(localToUtc({ ...date, hour: Math.floor(startMinute / 60), minute: startMinute % 60 }).getTime() + consumed * 60_000);
        remaining -= consumed;
        if (!remaining) return new Date(cursor).toISOString();
      }
    }
    const tomorrow = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
    cursor = localToUtc({ year: tomorrow.getUTCFullYear(), month: tomorrow.getUTCMonth() + 1, day: tomorrow.getUTCDate(), hour: 9, minute: 0 });
  }
  throw fail('CHECKPOINT_CALENDAR_CAPACITY');
}

function alertFor(type, receiptId, decisionId = null) {
  const transitionId = type === 'RESOLVED' ? decisionId : receiptId;
  return { transitionId, eventId: `bp09:productions:review:${type.toLowerCase()}:${receiptId}:${transitionId}`,
    state: 'NOT_DUE', attempts: 0, lastAttemptAt: null, nextAttemptAt: null, relayReceiptId: null,
    messageId: null, providerAcceptedAt: null, failureAt: null, failureCode: null };
}

export function createInitialProductionsReviewCheckpoint({ receiptId, leadId, acceptedAt }) {
  if (!GUID.test(receiptId || '') || !GUID.test(leadId || '') || !instant(acceptedAt)) throw fail('CHECKPOINT_INITIAL_BINDING_INVALID');
  const checkpoint = {
    version: 2, receiptId: receiptId.toLowerCase(), leadId: leadId.toLowerCase(), acceptedAt,
    dueAt: calculateProductionsReviewDueAt(acceptedAt), state: 'PENDING', decision: null,
    alerts: { overdue: alertFor('OVERDUE', receiptId), resolved: null }
  };
  if (JSON.stringify(checkpoint).length > 3500) throw fail('CHECKPOINT_CAPACITY');
  return checkpoint;
}

function validAlert(alert, expected) {
  if (!alert || alert.transitionId !== expected.transitionId || alert.eventId !== expected.eventId || !ALERT_STATES.includes(alert.state) ||
      !Number.isInteger(alert.attempts) || alert.attempts < 0 || alert.attempts > ALERT_MAX_ATTEMPTS ||
      !(alert.lastAttemptAt === null || instant(alert.lastAttemptAt)) ||
      !(alert.nextAttemptAt === null || instant(alert.nextAttemptAt)) ||
      !(alert.relayReceiptId === null || GUID.test(alert.relayReceiptId)) ||
      !(alert.messageId === null || (typeof alert.messageId === 'string' && alert.messageId.length <= 200)) ||
      !(alert.providerAcceptedAt === null || instant(alert.providerAcceptedAt)) ||
      !(alert.failureAt === null || instant(alert.failureAt)) ||
      !(alert.failureCode === null || /^[A-Z0-9_:-]{1,100}$/.test(alert.failureCode))) return false;
  if (alert.state === 'ATTEMPTING') return alert.attempts > 0 && Boolean(alert.lastAttemptAt) && !alert.nextAttemptAt;
  if (alert.state === 'RECEIPT_PENDING') return Boolean(alert.relayReceiptId) && !alert.messageId && !alert.nextAttemptAt && !alert.failureCode;
  if (alert.state === 'PROVIDER_ACCEPTED') return Boolean(alert.relayReceiptId && alert.messageId && alert.providerAcceptedAt) && !alert.nextAttemptAt && !alert.failureCode;
  if (alert.state === 'RETRY_WAIT') return Boolean(alert.relayReceiptId && alert.nextAttemptAt && alert.failureCode && alert.failureAt && alert.attempts > 0);
  if (alert.state === 'HELD') return Boolean(alert.failureCode) && !alert.nextAttemptAt;
  return !alert.nextAttemptAt && !alert.failureCode && !alert.relayReceiptId && !alert.messageId &&
    !alert.providerAcceptedAt && !alert.failureAt;
}

export function validateProductionsReviewCheckpoint(value, expected) {
  if (!value || typeof value !== 'object' || !GUID.test(expected?.receiptId || '') || !GUID.test(expected?.leadId || '')) return false;
  const c = value;
  if (c.version !== 2 || !GUID.test(c.receiptId || '') || !GUID.test(c.leadId || '') ||
      c.receiptId.toLowerCase() !== expected.receiptId.toLowerCase() || c.leadId.toLowerCase() !== expected.leadId.toLowerCase() ||
      !instant(c.acceptedAt) || !instant(c.dueAt) || Date.parse(c.dueAt) < Date.parse(c.acceptedAt) ||
      !['PENDING', 'OVERDUE', 'RESOLVED'].includes(c.state) || !c.alerts || typeof c.alerts !== 'object' ||
      !validAlert(c.alerts.overdue, alertFor('OVERDUE', c.receiptId))) return false;
  if (c.state === 'RESOLVED') {
    if (!c.decision || !GUID.test(c.decision.id || '') || c.decision.actionId !== 'ACCEPT_FOR_FOLLOW_UP' ||
        c.decision.outcome !== 'ACCEPTED' || c.decision.before !== 'NEW' || c.decision.after !== 'FOLLOW_UP_REQUIRED' ||
        !GUID.test(c.decision.actorUserId || '') || !GUID.test(c.decision.actorObjectId || '') ||
        !GUID.test(c.decision.recordingActorId || '') || !instant(c.decision.recordedAt) ||
        typeof c.decision.idempotencyKey !== 'string' || !GUID.test(c.decision.idempotencyKey)) return false;
    if (!validAlert(c.alerts.resolved, alertFor('RESOLVED', c.receiptId, c.decision.id))) return false;
  } else if (c.decision !== null || c.alerts.resolved !== null) return false;
  return JSON.stringify(c).length <= 3500;
}

function actionEvidenceIsValid(action, adapter, receipt, lead) {
  return action?.id && GUID.test(action.id) && action.receiptId?.toLowerCase() === receipt.id.toLowerCase() &&
    action.leadId?.toLowerCase() === lead.id.toLowerCase() && action.actionId === 'ACCEPT_FOR_FOLLOW_UP' &&
    action.outcome === 'ACCEPTED' && action.before === 'NEW' && action.after === 'FOLLOW_UP_REQUIRED' &&
    action.actorUserId === adapter.reviewerSystemUserId && action.actorObjectId === adapter.reviewerObjectId &&
    action.idempotencyKey?.toLowerCase() === receipt.id.toLowerCase() && action.recordingActorId && GUID.test(action.recordingActorId) &&
    instant(action.recordedAt);
}

function sameDecision(action, decision) {
  return action && decision && ['id', 'receiptId', 'leadId', 'actionId', 'outcome', 'before', 'after',
    'actorUserId', 'actorObjectId', 'idempotencyKey', 'recordedAt', 'recordingActorId']
    .every((key) => action[key] === decision[key]);
}

async function progressAlert({ checkpoint, type, notify, now, save }) {
  const alertKey = type === 'OVERDUE' ? 'overdue' : 'resolved';
  let alert = checkpoint.alerts[alertKey];
  if (alert.state === 'HELD') return { checkpoint, unresolved: true };
  if (['RECEIPT_PENDING', 'PROVIDER_ACCEPTED', 'ATTEMPTING'].includes(alert.state)) {
    if (!notify?.getDelivery || !alert.relayReceiptId) return { checkpoint, unresolved: true };
    let delivery;
    try { delivery = await notify.getDelivery({ type, receiptId: checkpoint.receiptId, leadId: checkpoint.leadId,
      transitionId: alert.transitionId, eventId: alert.eventId, relayReceiptId: alert.relayReceiptId }); }
    catch { return { checkpoint, unresolved: true }; }
    if (delivery?.state === 'ACCEPTED' && delivery.receiptId === alert.relayReceiptId &&
        delivery.retryAuthorized === false && delivery.deliveryEvidenceAvailable === false &&
        delivery.providerMessageId && instant(delivery.acceptedAt)) {
      alert = { ...alert, state: 'PROVIDER_ACCEPTED', messageId: delivery.providerMessageId,
        providerAcceptedAt: delivery.acceptedAt, failureAt: null, failureCode: null, nextAttemptAt: null };
      checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: alert } };
      await save(checkpoint);
      return { checkpoint, unresolved: true };
    }
    if (delivery?.state === 'FAILED' && delivery.receiptId === alert.relayReceiptId &&
        delivery.retryAuthorized === false && instant(delivery.failedAt)) {
      if (alert.messageId || alert.providerAcceptedAt) throw fail('CHECKPOINT_RELAY_STATE_DRIFT');
      if (alert.attempts >= ALERT_MAX_ATTEMPTS) {
        alert = { ...alert, state: 'HELD', nextAttemptAt: null, failureAt: delivery.failedAt,
          failureCode: 'RELAY_FAILURE_ATTEMPTS_EXHAUSTED' };
      } else {
      alert = { ...alert, state: 'RETRY_WAIT', nextAttemptAt: new Date(now.getTime() + alert.attempts * 5 * 60_000).toISOString(),
          messageId: null, providerAcceptedAt: null, failureAt: delivery.failedAt,
          failureCode: 'RELAY_FAILURE_CONFIRMED' };
      }
      checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: alert } };
      await save(checkpoint);
      return { checkpoint, unresolved: true };
    }
    return { checkpoint, unresolved: true };
  }
  if (alert.state === 'RETRY_WAIT' && Date.parse(alert.nextAttemptAt) > now.getTime()) return { checkpoint, unresolved: true };
  if (!notify?.send) {
    alert = { ...alert, state: 'HELD', nextAttemptAt: null, failureCode: 'CHECKPOINT_ALERT_ROUTE_UNAVAILABLE' };
    checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: alert } };
    await save(checkpoint);
    return { checkpoint, unresolved: true };
  }
  if (alert.attempts >= ALERT_MAX_ATTEMPTS) {
    alert = { ...alert, state: 'HELD', nextAttemptAt: null, failureCode: 'CHECKPOINT_ALERT_ATTEMPTS_EXHAUSTED' };
    checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: alert } };
    await save(checkpoint);
    return { checkpoint, unresolved: true };
  }
  const attempting = { ...alert, state: 'ATTEMPTING', attempts: alert.attempts + 1,
    lastAttemptAt: now.toISOString(), nextAttemptAt: null, failureAt: null, failureCode: null };
  checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: attempting } };
  await save(checkpoint);
  try {
    const result = await notify.send({ type, receiptId: checkpoint.receiptId, leadId: checkpoint.leadId,
      transitionId: alert.transitionId, eventId: alert.eventId });
    if (result?.accepted !== true || !GUID.test(result.receiptId || '') || result.idempotencyKey !== alert.eventId ||
        alert.relayReceiptId && result.receiptId !== alert.relayReceiptId ||
        result.recipient !== 'productions@jmerrill.one' || result.privacySafe !== true) throw fail('CHECKPOINT_ALERT_ACCEPTANCE_UNPROVEN');
    alert = { ...attempting, state: 'RECEIPT_PENDING', relayReceiptId: result.receiptId, messageId: null,
      providerAcceptedAt: null };
  } catch (error) {
    alert = { ...attempting, state: 'ATTEMPTING', nextAttemptAt: null,
      failureAt: now.toISOString(), failureCode: error.code || 'CHECKPOINT_ALERT_FAILURE' };
  }
  checkpoint = { ...checkpoint, alerts: { ...checkpoint.alerts, [alertKey]: alert } };
  await save(checkpoint);
  return { checkpoint, unresolved: true };
}

export async function reconcileProductionsReviewCheckpoints({ adapter, notify, now = new Date(), limit = 100 }) {
  if (!adapter || typeof adapter.listPendingReceipts !== 'function' || typeof adapter.getLead !== 'function' ||
      typeof adapter.listReviewerActions !== 'function' || typeof adapter.saveCheckpoint !== 'function') throw fail('CHECKPOINT_ADAPTER_UNAVAILABLE');
  if (!GUID.test(adapter.teamId || '') || !GUID.test(adapter.reviewerSystemUserId || '') || !GUID.test(adapter.reviewerObjectId || '')) throw fail('CHECKPOINT_AUTHORITY_CONFIG_INVALID');
  if (typeof adapter.authorityCheck !== 'function' || !await adapter.authorityCheck()) throw fail('CHECKPOINT_AUTHORITY_MISSING');
  const receipts = await adapter.listPendingReceipts({ limit });
  const outcomes = [];
  for (const receipt of receipts) {
    try {
      if (!GUID.test(receipt?.id || '') || !GUID.test(receipt?.leadId || '') || receipt.brand !== 'JMPRODUCTIONS' ||
          !instant(receipt.acceptedAt) || receipt.ownerId?.toLowerCase() !== adapter.teamId.toLowerCase()) throw fail('CHECKPOINT_RECEIPT_INVALID');
      const lead = await adapter.getLead(receipt.leadId);
      if (!lead || lead.id?.toLowerCase() !== receipt.leadId.toLowerCase() || lead.brand !== 'JMPRODUCTIONS' ||
          lead.receiptId?.toLowerCase() !== receipt.id.toLowerCase() || lead.ownerId?.toLowerCase() !== adapter.teamId.toLowerCase() ||
          lead.acceptedAt !== receipt.acceptedAt) throw fail('CHECKPOINT_RECEIPT_LEAD_MISMATCH');
      let checkpoint = lead.checkpoint || createInitialProductionsReviewCheckpoint({ receiptId: receipt.id, leadId: lead.id, acceptedAt: receipt.acceptedAt });
      if (!validateProductionsReviewCheckpoint(checkpoint, { receiptId: receipt.id, leadId: lead.id })) throw fail('CHECKPOINT_STATE_INVALID');
      let persisted = lead.checkpoint;
      const save = async (next) => {
        if (JSON.stringify(next) === JSON.stringify(persisted)) return;
        await adapter.saveCheckpoint({ receiptId: receipt.id, leadId: lead.id, checkpoint: next, etag: lead.etag });
        persisted = next;
      };
      const actions = await adapter.listReviewerActions({ receiptId: receipt.id, leadId: lead.id, limit: 10 });
      if (actions.length > 1) throw fail('CHECKPOINT_ACTION_AMBIGUOUS');
      if (checkpoint.state === 'RESOLVED' && !sameDecision(actions[0], checkpoint.decision)) {
        throw fail('CHECKPOINT_DECISION_DRIFT');
      }
      if (checkpoint.state !== 'RESOLVED') {
        const action = actions[0];
        if (action && !actionEvidenceIsValid(action, adapter, receipt, lead)) throw fail('CHECKPOINT_ACTION_NOT_ATTRIBUTABLE');
        if (action) {
          checkpoint = { ...checkpoint, state: 'RESOLVED', decision: action,
            alerts: { ...checkpoint.alerts, resolved: alertFor('RESOLVED', receipt.id, action.id) } };
          await save(checkpoint);
        }
        if (!action && now.getTime() >= Date.parse(checkpoint.dueAt)) checkpoint = { ...checkpoint, state: 'OVERDUE' };
      }
      if (checkpoint.state === 'OVERDUE') {
        const progressed = await progressAlert({ checkpoint, type: 'OVERDUE', notify, now, save });
        checkpoint = progressed.checkpoint;
      }
      if (checkpoint.state === 'RESOLVED') {
        const progressed = await progressAlert({ checkpoint, type: 'RESOLVED', notify, now, save });
        checkpoint = progressed.checkpoint;
      }
      await save(checkpoint);
      outcomes.push({ receiptId: receipt.id, state: checkpoint.state,
        overdueAlert: checkpoint.alerts.overdue.state, resolutionAlert: checkpoint.alerts.resolved?.state || 'NOT_APPLICABLE' });
    } catch (error) {
      outcomes.push({ receiptId: receipt?.id || null, state: 'HELD', code: error.code || 'CHECKPOINT_UNCLASSIFIED' });
    }
  }
  return outcomes;
}
