import Holidays from 'date-holidays';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ZONE = 'America/New_York';
const OPEN_MINUTE = 9 * 60;
const CLOSE_MINUTE = 17 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const holidays = new Holidays('US');

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

export function validateProductionsReviewCheckpoint(value, expected) {
  if (!value || typeof value !== 'object' || !GUID.test(expected?.receiptId || '') || !GUID.test(expected?.leadId || '')) return false;
  const c = value;
  if (c.version !== 1 || !GUID.test(c.receiptId || '') || !GUID.test(c.leadId || '') ||
      c.receiptId.toLowerCase() !== expected.receiptId.toLowerCase() || c.leadId.toLowerCase() !== expected.leadId.toLowerCase() ||
      !instant(c.acceptedAt) || !instant(c.dueAt) || Date.parse(c.dueAt) < Date.parse(c.acceptedAt) ||
      !['PENDING', 'OVERDUE', 'RESOLVED'].includes(c.state) ||
      !['NOT_DUE', 'QUEUED', 'PROVIDER_ACCEPTED', 'DELIVERED', 'RETRY_WAIT', 'HELD'].includes(c.alertState) ||
      !(c.nextAttemptAt === null || instant(c.nextAttemptAt)) || !(c.resolvedAt === null || instant(c.resolvedAt)) ||
      !(c.decisionId === null || /^[A-Z0-9_-]{1,100}$/.test(c.decisionId)) ||
      !(c.failureCode === null || /^[A-Z0-9_:-]{1,100}$/.test(c.failureCode))) return false;
  if (c.state === 'RESOLVED' ? (!c.resolvedAt || !c.decisionId) : (c.resolvedAt || c.decisionId)) return false;
  if (c.alertState === 'RETRY_WAIT') return Boolean(c.nextAttemptAt && c.failureCode);
  if (c.alertState === 'HELD') return Boolean(c.failureCode) && !c.nextAttemptAt;
  return !c.nextAttemptAt && !c.failureCode;
}

function newCheckpoint(receipt, lead, acceptedAt) {
  return {
    version: 1, receiptId: receipt.id, leadId: lead.id, acceptedAt,
    dueAt: calculateProductionsReviewDueAt(acceptedAt), state: 'PENDING', alertState: 'NOT_DUE',
    nextAttemptAt: null, resolvedAt: null, decisionId: null, failureCode: null
  };
}

export async function reconcileProductionsReviewCheckpoints({ adapter, notify, now = new Date(), limit = 100, maxAttempts = 3 }) {
  if (!adapter || typeof adapter.listPendingReceipts !== 'function' || typeof adapter.getLead !== 'function' ||
      typeof adapter.listReviewerActions !== 'function' || typeof adapter.saveCheckpoint !== 'function') throw fail('CHECKPOINT_ADAPTER_UNAVAILABLE');
  if (typeof adapter.authorityCheck !== 'function' || !await adapter.authorityCheck()) throw fail('CHECKPOINT_AUTHORITY_MISSING');
  const receipts = await adapter.listPendingReceipts({ limit });
  const outcomes = [];
  for (const receipt of receipts) {
    let checkpoint;
    try {
      if (!GUID.test(receipt?.id || '') || !GUID.test(receipt?.leadId || '') || !instant(receipt.acceptedAt) || receipt.brand !== 'JMPRODUCTIONS') throw fail('CHECKPOINT_RECEIPT_INVALID');
      const lead = await adapter.getLead(receipt.leadId);
      if (!lead || lead.id?.toLowerCase() !== receipt.leadId.toLowerCase() || lead.brand !== 'JMPRODUCTIONS' || lead.receiptId?.toLowerCase() !== receipt.id.toLowerCase()) throw fail('CHECKPOINT_RECEIPT_LEAD_MISMATCH');
      checkpoint = receipt.checkpoint || newCheckpoint(receipt, lead, receipt.acceptedAt);
      if (!validateProductionsReviewCheckpoint(checkpoint, { receiptId: receipt.id, leadId: lead.id })) throw fail('CHECKPOINT_STATE_INVALID');
      if (checkpoint.state !== 'RESOLVED') {
        const actions = await adapter.listReviewerActions({ receiptId: receipt.id, leadId: lead.id, limit: 10 });
        const action = actions.find((item) => item?.attributable === true && item.receiptId?.toLowerCase() === receipt.id.toLowerCase() &&
          item.leadId?.toLowerCase() === lead.id.toLowerCase() && item.actorId === adapter.reviewerId &&
          item.outcome === 'ACCEPTED' && GUID.test(item.id || '') && instant(item.createdAt));
        if (action) {
          checkpoint = { ...checkpoint, state: 'RESOLVED', alertState: 'NOT_DUE',
            nextAttemptAt: null, failureCode: null, resolvedAt: action.createdAt, decisionId: action.id };
          await adapter.saveCheckpoint(receipt.id, checkpoint);
          if (notify) await notify({ kind: 'RESOLVED', receiptId: receipt.id, leadId: lead.id, eventId: `bp09:productions:review-resolved:${receipt.id}:${action.id}` });
          outcomes.push({ receiptId: receipt.id, state: 'RESOLVED' });
          continue;
        }
        if (now.getTime() >= Date.parse(checkpoint.dueAt)) checkpoint = { ...checkpoint, state: 'OVERDUE' };
      }
      if (checkpoint.state === 'OVERDUE' && checkpoint.alertState !== 'DELIVERED' && checkpoint.alertState !== 'HELD' &&
          (!checkpoint.nextAttemptAt || Date.parse(checkpoint.nextAttemptAt) <= now.getTime())) {
        if ((checkpoint.attempts || 0) >= maxAttempts || !notify) {
          checkpoint = { ...checkpoint, alertState: 'HELD', nextAttemptAt: null, failureCode: notify ? 'CHECKPOINT_ALERT_ATTEMPTS_EXHAUSTED' : 'CHECKPOINT_ALERT_ROUTE_UNAVAILABLE' };
        } else {
          try {
            const result = await notify({ kind: 'OVERDUE', receiptId: receipt.id, leadId: lead.id, eventId: `bp09:productions:review-overdue:${receipt.id}` });
            if (result?.accepted !== true || !result.messageId) throw fail('CHECKPOINT_ALERT_NOT_ACCEPTED');
            checkpoint = { ...checkpoint, alertState: 'PROVIDER_ACCEPTED', attempts: (checkpoint.attempts || 0) + 1,
              nextAttemptAt: null, failureCode: null, alertMessageId: result.messageId };
          } catch (error) {
            const attempts = (checkpoint.attempts || 0) + 1;
            checkpoint = { ...checkpoint, alertState: attempts >= maxAttempts ? 'HELD' : 'RETRY_WAIT', attempts,
              nextAttemptAt: attempts >= maxAttempts ? null : new Date(now.getTime() + attempts * 5 * 60_000).toISOString(),
              failureCode: error.code || 'CHECKPOINT_ALERT_FAILURE' };
          }
        }
      }
      await adapter.saveCheckpoint(receipt.id, checkpoint);
      outcomes.push({ receiptId: receipt.id, state: checkpoint.state, alertState: checkpoint.alertState });
    } catch (error) {
      outcomes.push({ receiptId: receipt?.id || null, state: 'HELD', code: error.code || 'CHECKPOINT_UNCLASSIFIED' });
    }
  }
  return outcomes;
}
