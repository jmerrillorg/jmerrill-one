import assert from 'node:assert/strict';
import test from 'node:test';
import { approvedContentForSocial } from '../src/lib/socialContentApproval.js';

const row = { jm1_idempotencykey: 'campaign:social:title_discovery:facebook' };
const content = {
  jm1_idempotencykey: 'campaign:content:title_discovery',
  jm1_publicreadystate: 'PASS'
};

test('allows only the matching approved content stage', () => {
  assert.equal(approvedContentForSocial(row, [content]), content);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_publicreadystate: 'HELD_PENDING_ASSET_CONTEXT' }]), null);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_idempotencykey: 'other:content:title_discovery' }]), null);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_idempotencykey: 'campaign:content:month_introduction' }]), null);
});

test('fails closed for an unbound social row', () => {
  assert.equal(approvedContentForSocial({ jm1_idempotencykey: '' }, [content]), null);
});
