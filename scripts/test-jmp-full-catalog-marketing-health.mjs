import assert from 'node:assert/strict';
import { evaluateFullCatalogMarketingHealth, selectFullCatalogCandidate, summarizeFullCatalogMarketingHealth } from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const base = { marketingAuthorityState: 'MARKETING_ELIGIBLE', rightsState: 'NO_RIGHTS_HOLD_FOUND', retirementState: 'ACTIVE', catalogState: 'PUBLISHED_CATALOG' };
const fixtures = [
  { ...base, titleId: 'shift', title: 'The Shift', author: 'Sean A Crowley I', assetReadiness: 'READY' },
  { ...base, titleId: 'strategies', title: 'Strategies for Success', author: 'Sean A Crowley I', assetReadiness: 'READY' },
  { ...base, titleId: 'ambiguous', title: 'Ambiguous', author: 'A', assetReadiness: 'AMBIGUOUS' },
  { ...base, titleId: 'missing', title: 'Missing', author: 'B', assetReadiness: 'MISSING' },
  { ...base, titleId: 'partial', title: 'Partial', author: 'C', assetReadiness: 'PARTIAL', compatibleArchetypeAvailable: true },
  { ...base, titleId: 'ready-b', title: 'Ready B', author: 'Z', assetReadiness: 'READY' },
  { ...base, titleId: 'ready-a', title: 'Ready A', author: 'Y', assetReadiness: 'READY' }
];
const evaluate = () => evaluateFullCatalogMarketingHealth(fixtures, { nowIso: '2026-09-05T12:00:00Z', currentFeaturedAuthor: 'Sean A Crowley I', nextFeaturedAuthor: 'Iyorwuese Hagher' });
const first = evaluate(); const second = evaluate(); const summary = summarizeFullCatalogMarketingHealth(first);
assert.equal(first.length, 7);
assert.deepEqual(first, second, 'unchanged inputs must produce deterministic decisions');
assert.equal(summary.total, 7);
assert.equal(first.find((row) => row.titleId === 'shift').disposition, 'RECENT_RELEASE_HELD');
assert.equal(first.find((row) => row.titleId === 'strategies').disposition, 'LAUNCH_PRIORITY');
assert.equal(first.find((row) => row.titleId === 'ambiguous').disposition, 'ASSET_HELD');
assert.equal(first.find((row) => row.titleId === 'missing').disposition, 'ASSET_HELD');
assert.equal(first.find((row) => row.titleId === 'partial').disposition, 'EVERGREEN_ELIGIBLE');
assert.equal(selectFullCatalogCandidate(first).titleId, selectFullCatalogCandidate(second).titleId);
assert.equal(new Set(first.map((row) => row.titleId)).size, first.length);
console.log(JSON.stringify({ passed: 9, failed: 0, classification: 'JMP_FULL_CATALOG_MARKETING_HEALTH_REGRESSION_PASS' }, null, 2));
