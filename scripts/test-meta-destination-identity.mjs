import assert from 'node:assert/strict';
import test from 'node:test';

import { findConfiguredMetaPage, metaBranchApiExecutionEnabled, metaDestinationMatches, verifyMetaAuthorityForBranch } from '../runtime/jm1-marketing-autonomous-functions/src/lib/metaDestination.js';

const financial = {
  facebookPageId: '104395329284856',
  facebookPageName: 'J Merrill Financial',
  instagramGraphId: '17841499999999999',
  instagramHandle: 'jmerrillfinancial',
  instagramEnabled: true
};

test('Meta dispatch requires exact numeric production destination identity', () => {
  assert.equal(metaDestinationMatches(financial, 'facebook', '104395329284856'), true);
  assert.equal(metaDestinationMatches(financial, 'facebook', '1270611542802820'), false);
  assert.equal(metaDestinationMatches(financial, 'facebook', 'J Merrill Financial'), false);
  assert.equal(metaDestinationMatches(financial, 'instagram', '17841499999999999'), true);
  assert.equal(metaDestinationMatches(financial, 'instagram', 'jmerrillfinancial'), false);
  assert.equal(metaDestinationMatches({ ...financial, instagramGraphId: null }, 'instagram', 'jmerrillfin'), false);
});

test('Page discovery cannot substitute a same-name Page for the configured Page ID', () => {
  const pages = [
    { id: '1270611542802820', name: 'J Merrill Financial' },
    { id: '104395329284856', name: 'J Merrill Financial' }
  ];
  assert.equal(findConfiguredMetaPage(pages, financial), pages[1]);
  assert.equal(findConfiguredMetaPage([pages[0]], financial), null);
});

test('Financial Meta API execution fails closed until its explicit access flag is verified', () => {
  assert.equal(metaBranchApiExecutionEnabled({ ...financial, branchName: 'J Merrill Financial' }), false);
  assert.equal(metaBranchApiExecutionEnabled({ ...financial, branchName: 'J Merrill Financial', metaApiExecutionEnabled: true }), true);
  assert.equal(metaBranchApiExecutionEnabled({ active: true, branchName: 'J Merrill One' }), true);
  assert.equal(metaBranchApiExecutionEnabled({ active: false, branchName: 'J Merrill One' }), false);
});

test('disabled Financial Meta branch makes no authority API call', async () => {
  let calls = 0;
  const result = await verifyMetaAuthorityForBranch(
    { ...financial, branchName: 'J Merrill Financial', metaApiExecutionEnabled: false },
    async () => { calls += 1; return { ok: true }; }
  );

  assert.deepEqual(result, { ok: false, state: 'META_BRANCH_API_EXECUTION_DISABLED' });
  assert.equal(calls, 0);
});

test('enabled Meta branch performs its normal authority verification', async () => {
  const expected = { ...financial, branchName: 'J Merrill One', active: true };
  let verified;
  const result = await verifyMetaAuthorityForBranch(expected, async (branch) => {
    verified = branch;
    return { ok: true, state: 'META_SYSTEM_USER_TOKEN_VERIFIED' };
  });

  assert.equal(verified, expected);
  assert.deepEqual(result, { ok: true, state: 'META_SYSTEM_USER_TOKEN_VERIFIED' });
});
