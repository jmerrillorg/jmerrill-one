import assert from 'node:assert/strict';
import test from 'node:test';
import { approvedCampaignForSocial } from '../src/lib/socialCampaignAuthority.js';

const approved = {
  jm1_idempotencykey: 'october:campaign',
  jm1_branch: 'J Merrill Publishing',
  jm1_state: 'PUBLIC_EXECUTION_APPROVED'
};

test('exactly matched approved Publishing campaign permits new social execution', () => {
  assert.equal(approvedCampaignForSocial('october', [approved]), approved);
});

test('held, absent, ambiguous, and mismatched campaigns fail closed', () => {
  assert.equal(approvedCampaignForSocial('october', [{ ...approved, jm1_state: 'SYSTEM_AUTHORITY_CREATED_HELD_FOR_DOWNSTREAM_PROOF' }]), null);
  assert.equal(approvedCampaignForSocial('october', []), null);
  assert.equal(approvedCampaignForSocial('october', [approved, approved]), null);
  assert.equal(approvedCampaignForSocial('november', [approved]), null);
  assert.equal(approvedCampaignForSocial('october', [{ ...approved, jm1_branch: 'J Merrill One' }]), null);
  assert.equal(approvedCampaignForSocial('october', [{ ...approved, jm1_state: 'AUTONOMOUS_CAMPAIGN_STAGE_RESOLUTION_PROVEN' }]), null);
});
