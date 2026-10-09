import { createHash } from 'node:crypto';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DESTINATION = 'productions@jmerrill.one';
const MAX_ALERT_ATTEMPTS = 3;
const RETRY_MINUTES = 5;
const TIME_ZONE = 'America/New_York';
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});

function fail(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function partsAt(instant) {
  const parts = Object.fromEntries(formatter.formatToParts(new Date(instant))
    .filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]));
  return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour,
    minute: parts.minute, second: parts.second, millisecond: new Date(instant).getUTCMilliseconds() };
}

function dateKey({ year, month, day }) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateParts(key) {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

function shiftDate(key, days) {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function observedFixedHoliday(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  if (weekday === 6) date.setUTCDate(date.getUTCDate() - 1);
  if (weekday === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function nthWeekday(year, month, weekday, occurrence) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return new Date(Date.UTC(year, month - 1, 1 + ((weekday - firstWeekday + 7) % 7) + 7 * (occurrence - 1)))
    .toISOString().slice(0, 10);
}

function lastWeekday(year, month, weekday) {
  const lastDay = new Date(Date.UTC(year, month, 0));
  return new Date(Date.UTC(year, month - 1, lastDay.getUTCDate() - ((lastDay.getUTCDay() - weekday + 7) % 7)))
    .toISOString().slice(0, 10);
}

function holidaysFor(year) {
  return new Set([
    observedFixedHoliday(year, 1, 1),
    nthWeekday(year, 1, 1, 3),
    nthWeekday(year, 2, 1, 3),
    lastWeekday(year, 5, 1),
    observedFixedHoliday(year, 6, 19),
    observedFixedHoliday(year, 7, 4),
    nthWeekday(year, 9, 1, 1),
    nthWeekday(year, 10, 1, 2),
    observedFixedHoliday(year, 11, 11),
    nthWeekday(year, 11, 4, 4),
    observedFixedHoliday(year, 12, 25)
  ]);
}

function isBusinessDate(key) {
  const { year } = dateParts(key);
  const weekday = new Date(`${key}T00:00:00.000Z`).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return ![year - 1, year, year + 1].some((holidayYear) => holidaysFor(holidayYear).has(key));
}

function nextBusinessDate(key) {
  let next = key;
  do { next = shiftDate(next, 1); } while (!isBusinessDate(next));
  return next;
}

function localToUtc(key, millisecondsAfterMidnight) {
  const { year, month, day } = dateParts(key);
  const hour = Math.floor(millisecondsAfterMidnight / 3_600_000);
  const minute = Math.floor((millisecondsAfterMidnight % 3_600_000) / 60_000);
  const second = Math.floor((millisecondsAfterMidnight % 60_000) / 1_000);
  const millisecond = millisecondsAfterMidnight % 1_000;
  const desired = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  let candidate = desired;
  for (let attempt = 0; attempt < 4; attempt++) {
    const actual = partsAt(candidate);
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day,
      actual.hour, actual.minute, actual.second, actual.millisecond);
    const adjustment = desired - represented;
    candidate += adjustment;
    if (!adjustment) break;
  }
  return candidate;
}

export function productionsReviewDueAt(acceptedAt) {
  const accepted = Date.parse(acceptedAt);
  if (!Number.isFinite(accepted) || !validInstant(acceptedAt)) {
    throw fail('CHECKPOINT_ACCEPTED_AT_INVALID');
  }
  let local = partsAt(accepted);
  let day = dateKey(local);
  let wall = ((local.hour * 60 + local.minute) * 60 + local.second) * 1_000 + local.millisecond;
  const opening = 9 * 3_600_000;
  const closing = 17 * 3_600_000;
  if (!isBusinessDate(day) || wall >= closing) {
    day = nextBusinessDate(day);
    wall = opening;
  } else if (wall < opening) {
    wall = opening;
  }

  let remaining = 8 * 3_600_000;
  while (remaining > 0) {
    const available = closing - wall;
    if (remaining <= available) return new Date(localToUtc(day, wall + remaining)).toISOString();
    remaining -= available;
    day = nextBusinessDate(day);
    wall = opening;
  }
  return new Date(localToUtc(day, wall)).toISOString();
}

function get(value, ...keys) {
  if (!value || typeof value !== 'object') return undefined;
  for (const key of keys) if (Object.hasOwn(value, key)) return value[key];
  return undefined;
}

function asObject(value, code) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { throw fail(code); }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw fail(code);
  return value;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function emptyAlert(eventId) {
  return { eventId, state: 'NOT_DUE', attempts: 0, lastAttemptAt: null,
    nextAttemptAt: null, messageId: null, providerMessageId: null, lookupOnly: false,
    deliveredAt: null, failureCode: null };
}

function validInstant(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && value.endsWith('Z');
}

function validateAlert(alert, eventId) {
  return Boolean(alert && alert.eventId === eventId &&
    ['NOT_DUE', 'ATTEMPTING', 'PROVIDER_ACCEPTED', 'DELIVERED', 'RETRY_WAIT', 'HELD'].includes(alert.state) &&
    Number.isInteger(alert.attempts) && alert.attempts >= 0 && alert.attempts <= MAX_ALERT_ATTEMPTS &&
    (alert.lastAttemptAt === null || validInstant(alert.lastAttemptAt)) &&
    (alert.nextAttemptAt === null || validInstant(alert.nextAttemptAt)) &&
    (alert.messageId === null || (typeof alert.messageId === 'string' && alert.messageId.length <= 200)) &&
    (alert.providerMessageId === null || (typeof alert.providerMessageId === 'string' && alert.providerMessageId.length <= 200)) &&
    typeof alert.lookupOnly === 'boolean' &&
    (alert.deliveredAt === null || validInstant(alert.deliveredAt)) &&
    (alert.failureCode === null || /^[A-Z0-9_:-]{1,100}$/.test(alert.failureCode)));
}

function validateCheckpoint(value, candidate) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 2 ||
      String(value.receiptId || '').toLowerCase() !== candidate.receiptId.toLowerCase() ||
      String(value.leadId || '').toLowerCase() !== candidate.leadId.toLowerCase() ||
      value.acceptedAt !== candidate.acceptedAt || value.dueAt !== productionsReviewDueAt(candidate.acceptedAt) ||
      !['PENDING', 'OVERDUE', 'RESOLVED'].includes(value.state) ||
      !value.alerts || !validateAlert(value.alerts.overdue, `bp09:productions:review-overdue:${candidate.receiptId}`) ||
      JSON.stringify(value).length > 3500) return false;
  if (value.state === 'RESOLVED') {
    const decision = value.decision;
    return Boolean(decision && GUID.test(decision.id || '') && decision.receiptId === candidate.receiptId &&
      decision.leadId === candidate.leadId && decision.actionId === 'ACCEPT_FOR_FOLLOW_UP' &&
      decision.outcome === 'ACCEPTED' && decision.before === 'NEW' && decision.after === 'FOLLOW_UP_REQUIRED' &&
      GUID.test(decision.actorUserId || '') && GUID.test(decision.actorObjectId || '') &&
      GUID.test(decision.recordingActorId || '') && validInstant(decision.recordedAt) &&
      decision.idempotencyKey?.toLowerCase() === candidate.receiptId.toLowerCase() &&
      validateAlert(value.alerts.resolved, `bp09:productions:review-resolved:${candidate.receiptId}:${decision.id}`));
  }
  return value.decision === null && value.alerts.resolved === null;
}

function normalizeCandidate(value) {
  const brand = get(value, 'Brand', 'brand');
  const candidate = {
    receiptId: get(value, 'ReceiptId', 'receiptId'),
    leadId: get(value, 'LeadId', 'leadId'),
    acceptedAt: get(value, 'AcceptedAt', 'acceptedAt')
  };
  if (!GUID.test(candidate.receiptId || '') || !GUID.test(candidate.leadId || '') ||
      !validInstant(candidate.acceptedAt) || (brand !== undefined && brand !== 'JMPRODUCTIONS')) {
    throw fail('CHECKPOINT_CANDIDATE_INVALID');
  }
  return candidate;
}

function extractDecision(evidence, candidate, now) {
  const actions = get(evidence, 'Actions', 'actions', 'ActionEvidence', 'actionEvidence');
  if (!Array.isArray(actions)) throw fail('CHECKPOINT_ACTION_EVIDENCE_MISSING');
  const decisions = actions.map((action) => ({
    id: get(action, 'AuditId', 'auditId', 'Id', 'id'),
    receiptId: get(action, 'ReceiptId', 'receiptId'),
    leadId: get(action, 'LeadId', 'leadId'),
    actionId: get(action, 'ActionId', 'actionId'),
    outcome: get(action, 'Outcome', 'outcome'),
    before: get(action, 'Before', 'before'),
    after: get(action, 'After', 'after'),
    actorUserId: get(action, 'ActorUserId', 'actorUserId'),
    actorObjectId: get(action, 'ActorObjectId', 'actorObjectId'),
    recordingActorId: get(action, 'RecordingActorId', 'recordingActorId'),
    recordedAt: get(action, 'RecordedAt', 'recordedAt'),
    idempotencyKey: get(action, 'IdempotencyKey', 'idempotencyKey')
  })).filter((decision) => GUID.test(decision.id || '') &&
    decision.receiptId?.toLowerCase() === candidate.receiptId.toLowerCase() &&
    decision.leadId?.toLowerCase() === candidate.leadId.toLowerCase() &&
    decision.actionId === 'ACCEPT_FOR_FOLLOW_UP' && decision.outcome === 'ACCEPTED' &&
    decision.before === 'NEW' && decision.after === 'FOLLOW_UP_REQUIRED' &&
    GUID.test(decision.actorUserId || '') && GUID.test(decision.actorObjectId || '') &&
    GUID.test(decision.recordingActorId || '') && validInstant(decision.recordedAt) &&
    Date.parse(decision.recordedAt) >= Date.parse(candidate.acceptedAt) &&
    Date.parse(decision.recordedAt) <= now.getTime() &&
    decision.idempotencyKey?.toLowerCase() === candidate.receiptId.toLowerCase());
  if (decisions.length > 1) throw fail('CHECKPOINT_ACTION_AMBIGUOUS');
  return decisions[0] || null;
}

function stableGuid(seed) {
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ['8', '9', 'a', 'b'][Number.parseInt(hex[16], 16) % 4];
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function transitionId(phase, candidate, decision) {
  return phase === 'resolved' ? decision.id : stableGuid(`BP09-PRODUCTIONS-REVIEW-OVERDUE:${candidate.receiptId}`);
}

function notificationPayload(phase, candidate, decision) {
  const transition = transitionId(phase, candidate, decision);
  return {
    brand: 'JMPRODUCTIONS',
    to: DESTINATION,
    templateId: phase === 'overdue' ? 'PRODUCTIONS.BP09_REVIEW_OVERDUE' : 'PRODUCTIONS.BP09_REVIEW_RESOLVED',
    templateVersion: '1.0.0',
    templateData: { referenceId: candidate.receiptId, leadId: candidate.leadId, transitionId: transition }
  };
}

function acceptedProbe(result, payload) {
  const phase = payload.templateId.endsWith('OVERDUE') ? 'overdue' : 'resolved';
  const key = `bp09:productions:review:${phase}:${payload.templateData.referenceId}:${payload.templateData.transitionId}`;
  return result?.status === 200 && result.body?.authorized === true && result.body?.noSend === true &&
    result.body.callerId === 'one-bp09-productions-prod' && result.body.brand === 'JMPRODUCTIONS' &&
    result.body.templateId === payload.templateId && result.body.templateVersion === '1.0.0' &&
    result.body.recipient === DESTINATION && result.body.referenceId === payload.templateData.referenceId &&
    result.body.idempotencyKey === key;
}

function retryState(alert, now, code) {
  if (alert.attempts >= MAX_ALERT_ATTEMPTS) {
    return { ...alert, state: 'HELD', nextAttemptAt: null, failureCode: code };
  }
  return { ...alert, state: 'RETRY_WAIT',
    nextAttemptAt: new Date(now.getTime() + alert.attempts * RETRY_MINUTES * 60_000).toISOString(),
    failureCode: code, messageId: null, deliveredAt: null };
}

function retryLookupState(alert, now, code) {
  if (alert.attempts >= MAX_ALERT_ATTEMPTS) {
    return { ...alert, state: 'HELD', nextAttemptAt: null, failureCode: code, lookupOnly: true };
  }
  return { ...alert, state: 'RETRY_WAIT',
    nextAttemptAt: new Date(now.getTime() + alert.attempts * RETRY_MINUTES * 60_000).toISOString(),
    failureCode: code, lookupOnly: true };
}

async function notifyPhase({ relay, candidate, checkpoint, phase, now, persist }) {
  const decision = checkpoint.decision;
  const alertName = phase;
  let alert = checkpoint.alerts[alertName];
  if (!alert || ['PROVIDER_ACCEPTED', 'DELIVERED'].includes(alert.state)) return { checkpoint, failure: null };
  if (alert.state === 'HELD' && !alert.lookupOnly) return { checkpoint, failure: alert.failureCode };
  if (alert.nextAttemptAt && Date.parse(alert.nextAttemptAt) > now.getTime()) {
    return { checkpoint, failure: alert.state === 'RETRY_WAIT' ? alert.failureCode : null };
  }
  if (alert.attempts >= MAX_ALERT_ATTEMPTS && alert.state !== 'ATTEMPTING') {
    alert = { ...alert, state: 'HELD', nextAttemptAt: null, failureCode: alert.failureCode || 'ALERT_ATTEMPTS_EXHAUSTED' };
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.failureCode };
  }

  const payload = notificationPayload(phase, candidate, decision);
  if (alert.lookupOnly) {
    alert = { ...alert, state: 'ATTEMPTING', attempts: alert.state === 'ATTEMPTING' ? alert.attempts : alert.attempts + 1,
      lastAttemptAt: now.toISOString(), nextAttemptAt: null, failureCode: null };
    checkpoint.alerts[alertName] = alert;
    await persist();
    const lookupPayload = { ...payload, receiptId: alert.messageId };
    let lookup;
    try { lookup = await relay.lookup(lookupPayload); } catch {
      alert = retryLookupState(alert, now, 'DELIVERY_LOOKUP_UNKNOWN');
      checkpoint.alerts[alertName] = alert;
      await persist();
      return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
    }
    if (lookup?.status === 200 && lookup.body?.status === 'accepted' &&
        lookup.body?.receiptId === alert.messageId &&
        lookup.body?.providerMessageId === alert.providerMessageId &&
        lookup.body?.deliveryEvidenceAvailable === false && lookup.body?.retryAuthorized === false) {
      alert = { ...alert, state: 'PROVIDER_ACCEPTED', nextAttemptAt: null, failureCode: null,
        lookupOnly: false };
    } else {
      alert = retryLookupState(alert, now, lookup?.body?.status === 'failed'
        ? 'RELAY_DELIVERY_FAILED' : 'DELIVERY_LOOKUP_UNKNOWN');
    }
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
  }
  const attempt = alert.state === 'ATTEMPTING' ? alert.attempts : alert.attempts + 1;
  alert = { ...alert, state: 'ATTEMPTING', attempts: attempt,
    lastAttemptAt: now.toISOString(), nextAttemptAt: null, failureCode: null };
  checkpoint.alerts[alertName] = alert;
  await persist();

  let probe;
  try { probe = await relay.probe(payload); } catch {
    alert = retryState(alert, now, 'RELAY_PROBE_UNAVAILABLE');
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
  }
  if (!acceptedProbe(probe, payload)) {
    alert = retryState(alert, now, 'RELAY_PROBE_DENIED');
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
  }

  let sent;
  try { sent = await relay.send(payload); } catch {
    alert = retryState(alert, now, 'RELAY_SEND_UNCERTAIN');
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
  }
  const messageId = sent?.body?.jm1MessageId;
  const providerMessageId = sent?.body?.providerMessageId;
  if (![200, 202].includes(sent?.status) || sent.body?.accepted !== true ||
      sent.body?.deliveryState !== 'ACCEPTED' || !GUID.test(messageId || '') || !providerMessageId) {
    const code = sent?.status === 409 ? 'RELAY_IDEMPOTENCY_CONFLICT'
      : sent?.body?.inProgress ? 'RELAY_SEND_IN_PROGRESS' : 'RELAY_SEND_REJECTED';
    alert = retryState(alert, now, code);
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: alert.state === 'HELD' ? alert.failureCode : null };
  }

  alert = { ...alert, messageId, providerMessageId, lookupOnly: true };
  checkpoint.alerts[alertName] = alert;
  await persist();
  const lookupPayload = { ...payload, receiptId: messageId };
  let lookup;
  try { lookup = await relay.lookup(lookupPayload); } catch {
    alert = retryLookupState(alert, now, 'DELIVERY_LOOKUP_UNKNOWN');
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: null };
  }
  if (lookup?.status !== 200 || lookup.body?.status !== 'accepted' ||
      lookup.body?.receiptId !== messageId || lookup.body?.providerMessageId !== providerMessageId ||
      lookup.body?.deliveryEvidenceAvailable !== false || lookup.body?.retryAuthorized !== false) {
    const code = lookup?.body?.status === 'failed' ? 'RELAY_DELIVERY_FAILED' : 'DELIVERY_LOOKUP_UNKNOWN';
    alert = retryLookupState(alert, now, code);
    checkpoint.alerts[alertName] = alert;
    await persist();
    return { checkpoint, failure: null };
  }

  alert = { ...alert, state: 'PROVIDER_ACCEPTED', messageId, nextAttemptAt: null, failureCode: null };
  alert.providerMessageId = providerMessageId;
  checkpoint.alerts[alertName] = alert;
  await persist();
  return { checkpoint, failure: alert.state === 'RETRY_WAIT' ? alert.failureCode : null };
}

async function getEvidence(adapter, candidate) {
  const result = await adapter.request('/jm1_GetProductionsReviewCheckpoint', 'POST', {
    ReceiptId: candidate.receiptId, LeadId: candidate.leadId
  });
  const evidence = asObject(result?.EvidenceJson, 'CHECKPOINT_EVIDENCE_INVALID');
  if (String(get(evidence, 'ReceiptId', 'receiptId') || '').toLowerCase() !== candidate.receiptId.toLowerCase() ||
      String(get(evidence, 'LeadId', 'leadId') || '').toLowerCase() !== candidate.leadId.toLowerCase() ||
      (get(evidence, 'AcceptedAt', 'acceptedAt') !== undefined &&
        get(evidence, 'AcceptedAt', 'acceptedAt') !== candidate.acceptedAt) ||
      typeof get(evidence, 'RowVersion', 'rowVersion') !== 'string' ||
      !get(evidence, 'RowVersion', 'rowVersion') || get(evidence, 'RowVersion', 'rowVersion').length > 128) {
    throw fail('CHECKPOINT_EVIDENCE_BINDING_MISMATCH');
  }
  return { evidence, rowVersion: get(evidence, 'RowVersion', 'rowVersion') };
}

async function updateAndSave(adapter, candidate, checkpoint, rowVersion) {
  const response = await adapter.request('/jm1_SaveProductionsReviewCheckpoint', 'POST', {
    ReceiptId: candidate.receiptId,
    LeadId: candidate.leadId,
    ExpectedVersion: rowVersion,
    CheckpointJson: JSON.stringify(checkpoint)
  });
  const nextVersion = String(response?.RowVersion || '');
  if (!nextVersion) throw fail('CHECKPOINT_SAVE_READBACK_MISSING');
  const reread = await getEvidence(adapter, candidate);
  const saved = get(reread.evidence, 'Checkpoint', 'checkpoint', 'CheckpointJson', 'checkpointJson');
  if (!saved || stableJson(asObject(saved, 'CHECKPOINT_SAVE_READBACK_INVALID')) !== stableJson(checkpoint) ||
      reread.rowVersion !== nextVersion) throw fail('CHECKPOINT_SAVE_READBACK_MISMATCH');
  return nextVersion;
}

async function processCandidate({ adapter, relay, candidate, now }) {
  const { evidence, rowVersion } = await getEvidence(adapter, candidate);
  const rawCheckpoint = get(evidence, 'Checkpoint', 'checkpoint', 'CheckpointJson', 'checkpointJson');
  let checkpoint = rawCheckpoint ? asObject(rawCheckpoint, 'CHECKPOINT_STORED_STATE_INVALID') : null;
  if (checkpoint && !validateCheckpoint(checkpoint, candidate)) throw fail('CHECKPOINT_STORED_STATE_INVALID');
  const dueAt = productionsReviewDueAt(candidate.acceptedAt);
  if (!checkpoint) {
    checkpoint = {
      version: 2, receiptId: candidate.receiptId, leadId: candidate.leadId,
      acceptedAt: candidate.acceptedAt, dueAt, state: 'PENDING', decision: null,
      alerts: { overdue: emptyAlert(`bp09:productions:review-overdue:${candidate.receiptId}`), resolved: null }
    };
  } else {
    checkpoint = structuredClone(checkpoint);
  }

  const decision = extractDecision(evidence, candidate, now);
  if (checkpoint.state === 'RESOLVED') {
    if (!decision || decision.id !== checkpoint.decision.id) throw fail('CHECKPOINT_RESOLUTION_EVIDENCE_MISMATCH');
  } else if (decision) {
    checkpoint.state = 'RESOLVED';
    checkpoint.decision = decision;
    checkpoint.alerts.resolved = emptyAlert(`bp09:productions:review-resolved:${candidate.receiptId}:${decision.id}`);
  } else if (now.getTime() >= Date.parse(dueAt)) {
    checkpoint.state = 'OVERDUE';
  } else {
    checkpoint.state = 'PENDING';
  }

  if (!validateCheckpoint(checkpoint, candidate)) throw fail('CHECKPOINT_SHAPE_INVALID');
  let version = rowVersion;
  const persist = async () => {
    if (!validateCheckpoint(checkpoint, candidate)) throw fail('CHECKPOINT_SHAPE_INVALID');
    version = await updateAndSave(adapter, candidate, checkpoint, version);
  };
  const priorCheckpoint = rawCheckpoint
    ? typeof rawCheckpoint === 'string' ? rawCheckpoint : JSON.stringify(rawCheckpoint)
    : null;
  if (!priorCheckpoint || JSON.stringify(checkpoint) !== priorCheckpoint) {
    await persist();
  }

  let failure = null;
  if (checkpoint.state === 'OVERDUE') {
    const result = await notifyPhase({ relay, candidate, checkpoint, phase: 'overdue', now, persist });
    checkpoint = result.checkpoint;
    failure = result.failure;
  } else if (checkpoint.state === 'RESOLVED') {
    if (Date.parse(decision.recordedAt) >= Date.parse(dueAt) && checkpoint.alerts.overdue.state === 'NOT_DUE') {
      const overdue = await notifyPhase({ relay, candidate, checkpoint, phase: 'overdue', now, persist });
      checkpoint = overdue.checkpoint;
      failure = overdue.failure;
    }
    const result = await notifyPhase({ relay, candidate, checkpoint, phase: 'resolved', now, persist });
    checkpoint = result.checkpoint;
    failure = failure || result.failure;
  }
  return { state: checkpoint.state, failure };
}

async function listCandidates(adapter, maxPages) {
  const candidates = [];
  for (let page = 1; page <= maxPages; page++) {
    const response = await adapter.request('/jm1_ListProductionsReviewCheckpointCandidates', 'POST', { PageNumber: page });
    let rows;
    try { rows = JSON.parse(response?.RowsJson || '[]'); } catch { throw fail('CHECKPOINT_CANDIDATE_PAGE_INVALID'); }
    if (!Array.isArray(rows)) throw fail('CHECKPOINT_CANDIDATE_PAGE_INVALID');
    candidates.push(...rows.map(normalizeCandidate));
    if (candidates.length > 5000) throw fail('CHECKPOINT_SCAN_CAPACITY_EXCEEDED');
    if (response.MoreRecords !== true) return candidates;
  }
  throw fail('CHECKPOINT_SCAN_CAPACITY_EXCEEDED');
}

export async function reconcileProductionsReviewCheckpoints({ adapter, relay, now = new Date(), maxPages = 50 }) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime()) || !Number.isInteger(maxPages) || maxPages < 1) {
    throw fail('CHECKPOINT_SCAN_CONFIG_INVALID');
  }
  const candidates = await listCandidates(adapter, maxPages);
  const outcomes = [];
  for (const candidate of candidates) {
    try {
      outcomes.push({ ...candidate, ...(await processCandidate({ adapter, relay, candidate, now })) });
    } catch (error) {
      outcomes.push({ ...candidate, state: 'HELD', failure: error.code || 'CHECKPOINT_UNCLASSIFIED' });
    }
  }
  return outcomes;
}

export function createProductionsCheckpointDataverseAdapter({ apiBase, credential, fetchImpl = fetch }) {
  let managedCredential = credential;
  async function request(path, method, body) {
    if (!managedCredential) {
      const { ManagedIdentityCredential } = await import('@azure/identity');
      managedCredential = new ManagedIdentityCredential();
    }
    const token = await managedCredential.getToken(`${apiBase.replace(/\/api\/data\/v\d+\.\d+\/?$/, '')}/.default`);
    if (!token?.token) throw fail('CHECKPOINT_RUNTIME_TOKEN_UNAVAILABLE');
    const response = await fetchImpl(`${apiBase}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token.token}`, Accept: 'application/json',
        'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0' },
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw fail(response.status === 403 ? 'CHECKPOINT_RUNTIME_AUTHORITY_DENIED'
      : response.status === 409 || response.status === 412 ? 'CHECKPOINT_ROW_VERSION_CONFLICT'
        : `CHECKPOINT_API_${response.status}`);
    return result;
  }
  return { request };
}
