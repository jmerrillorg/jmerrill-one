import assert from 'node:assert/strict';
import { classifyProductionsInquiryRetention, productionsInquiryDueAt } from
  '../runtime/jm1-marketing-autonomous-functions/src/lib/productionsBp09Retention.js';

const receipt = { version: 2, id: '11111111-1111-4111-a111-111111111111',
  leadReference: '22222222-2222-4222-a222-222222222222',
  contactReference: '33333333-3333-4333-a333-333333333333',
  receivedAt: '2026-10-03T20:00:00.000Z', channel: 'jmerrill.productions/contact',
  routingDestination: 'J Merrill Productions', submission: { intent: 'productions' },
  state: 'COMPLETED', finalState: 'LEAD_CREATED' };
const lead = { leadid: receipt.leadReference, _parentcontactid_value: receipt.contactReference,
  description: `Source: jmerrill.productions/contact\nIntake receipt: ${receipt.id}\n\nSynthetic body` };
const review = { receiptId: receipt.id, leadId: receipt.leadReference,
  contactId: receipt.contactReference, reviewerId: '44444444-4444-4444-a444-444444444444',
  reviewedAt: '2027-10-03T20:01:00.000Z', decision: 'dispose', activeEngagement: false,
  contract: false, dispute: false, legalHold: false, preservationException: false };
const classify = (overrides = {}) => classifyProductionsInquiryRetention({
  receipt, lead, review, now: new Date('2027-10-04T00:00:00.000Z'), ...overrides
});

assert.equal(productionsInquiryDueAt(receipt.receivedAt), '2027-10-03T20:00:00.000Z');
assert.equal(productionsInquiryDueAt('2024-02-29T12:00:00.000Z'), '2025-02-28T12:00:00.000Z');
assert.equal(classify({ now: new Date('2027-10-03T19:59:59.000Z') }).state, 'RETAIN');
assert.equal(classify({ review: null }).state, 'REVIEW_REQUIRED');
assert.equal(classify({ receipt: { ...receipt, channel: 'jmerrill.one/contact' } }).code, 'RETENTION_SOURCE_INVALID');
assert.equal(classify({ lead: { ...lead, leadid: review.reviewerId } }).code, 'RETENTION_LINK_INVALID');
assert.equal(classify({ review: { ...review, leadId: review.reviewerId } }).state, 'REVIEW_REQUIRED');
assert.equal(classify({ review: { ...review, reviewedAt: '2026-10-04T00:00:00.000Z' } }).state, 'REVIEW_REQUIRED');
assert.equal(classify({ review: { ...review, decision: 'hold' } }).code, 'RETENTION_OWNER_HOLD');
for (const hold of ['activeEngagement', 'contract', 'dispute', 'legalHold', 'preservationException']) {
  assert.equal(classify({ review: { ...review, [hold]: true } }).code, 'RETENTION_EXCEPTION');
}
assert.equal(classify({ review: { ...review, decision: 'converted', targetRecordClass: 'production-project',
  targetRecordId: '7745ec78-a122-4ee9-b125-c5d30d79f9ca' } }).state, 'TRANSFERRED');
assert.equal(classify().state, 'LEGAL_EXCEPTION_CHECK_REQUIRED');
assert.deepEqual(Object.keys(classify().manifest).sort(), ['contactId', 'dueAt', 'leadId', 'receiptId', 'receivedAt']);
assert.equal(JSON.stringify(classify()).includes('Synthetic body'), false);

console.log('Productions BP-09 retention: due date, review, holds, transfer, source and linkage guards PASS');
