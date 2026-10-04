const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOLD_CHECKS = ['activeEngagement', 'contract', 'dispute', 'legalHold', 'preservationException'];

function validInstant(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

export function productionsInquiryDueAt(receivedAt) {
  if (!validInstant(receivedAt)) throw new Error('RETENTION_RECEIPT_TIME_INVALID');
  const received = new Date(receivedAt);
  const year = received.getUTCFullYear() + 1;
  const month = received.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(received.getUTCDate(), lastDay),
    received.getUTCHours(), received.getUTCMinutes(), received.getUTCSeconds(),
    received.getUTCMilliseconds())).toISOString();
}

export function classifyProductionsInquiryRetention({ receipt, lead, review, now = new Date() }) {
  if (!receipt || receipt.version !== 2 || receipt.channel !== 'jmerrill.productions/contact' ||
      receipt.routingDestination !== 'J Merrill Productions' || receipt.submission?.intent !== 'productions' ||
      receipt.state !== 'COMPLETED' || receipt.finalState !== 'LEAD_CREATED' ||
      !GUID.test(receipt.id || '') || !GUID.test(receipt.leadReference || '') ||
      !GUID.test(receipt.contactReference || '') || !validInstant(receipt.receivedAt)) {
    return { state: 'HELD', code: 'RETENTION_SOURCE_INVALID' };
  }
  const manifest = { receiptId: receipt.id, leadId: receipt.leadReference,
    contactId: receipt.contactReference, receivedAt: receipt.receivedAt,
    dueAt: productionsInquiryDueAt(receipt.receivedAt) };
  if (!lead || lead.leadid !== manifest.leadId ||
      lead._parentcontactid_value !== manifest.contactId ||
      !lead.description?.includes(`Intake receipt: ${manifest.receiptId}`)) {
    return { state: 'HELD', code: 'RETENTION_LINK_INVALID', manifest };
  }
  if (!Number.isFinite(now.getTime())) return { state: 'HELD', code: 'RETENTION_CLOCK_INVALID', manifest };
  if (now.getTime() < Date.parse(manifest.dueAt)) return { state: 'RETAIN', manifest };
  if (!review || review.receiptId !== manifest.receiptId || review.leadId !== manifest.leadId ||
      review.contactId !== manifest.contactId || !GUID.test(review.reviewerId || '') ||
      !validInstant(review.reviewedAt) || Date.parse(review.reviewedAt) < Date.parse(manifest.dueAt) ||
      Date.parse(review.reviewedAt) > now.getTime()) {
    return { state: 'REVIEW_REQUIRED', manifest };
  }
  if (review.decision === 'converted' && review.targetRecordClass && GUID.test(review.targetRecordId || '')) {
    return { state: 'TRANSFERRED', manifest };
  }
  if (review.decision === 'hold') return { state: 'HELD', code: 'RETENTION_OWNER_HOLD', manifest };
  if (review.decision !== 'dispose' || HOLD_CHECKS.some((key) => typeof review[key] !== 'boolean')) {
    return { state: 'REVIEW_REQUIRED', manifest };
  }
  if (HOLD_CHECKS.some((key) => review[key])) {
    return { state: 'HELD', code: 'RETENTION_EXCEPTION', manifest };
  }
  return { state: 'LEGAL_EXCEPTION_CHECK_REQUIRED', manifest };
}
