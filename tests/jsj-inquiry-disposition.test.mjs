import assert from 'node:assert/strict';
import test from 'node:test';
import { dispositionPatch } from '../scripts/lib/jsj-inquiry-disposition.mjs';

const row = { jm1_jsjinquiryid: 'row-one', jm1_name: 'JSJ-ONE', jm1_deliverystate: 'DELIVERED', jm1_closedat: null, jm1_disposition: null };
const decision = { id: 'row-one', reference: 'JSJ-ONE', outcome: 'JUNK', decidedBy: 'Jackie Smith, Jr.', decisionAt: null, source: 'Owner decision in coordination thread', recordedBy: 'JM1 admin (Codex operator)', recordedAt: '2026-10-09T08:00:00Z' };

test('junk decision keeps an unknown decision time distinct from the recording time', () => {
  assert.deepEqual(dispositionPatch(row, decision), {
    jm1_disposition: 'JUNK', jm1_dispositiondecidedby: decision.decidedBy,
    jm1_dispositiondecisionat: null, jm1_dispositionsource: decision.source,
    jm1_dispositionrecordedby: decision.recordedBy, jm1_dispositionrecordedat: decision.recordedAt,
    jm1_closedat: decision.recordedAt,
  });
});

test('refuses another row, completed inquiry, or invented outcome', () => {
  assert.throws(() => dispositionPatch(row, { ...decision, id: 'other' }), /identity mismatch/);
  assert.throws(() => dispositionPatch({ ...row, jm1_closedat: decision.recordedAt }, decision), /not open/);
  assert.throws(() => dispositionPatch(row, { ...decision, outcome: 'RESPONDED' }), /Unsupported/);
});
