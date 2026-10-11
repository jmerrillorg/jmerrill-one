import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPublishingDestinations, readPublishingDestinations, assessPublishingCampaignUrls } from '../src/lib/publishingDestinationReadiness.js';
const catalog = () => ({ ok: true, generatedAt: new Date().toISOString(), titles: [{ id: 'canonical', slug: 'book', authors: [{ slug: 'author' }], campaignReadiness: { status: 'READY', missing: [] } }], authors: [{ slug: 'author', campaignReadiness: { status: 'READY', missing: [] } }], titleAliases: [{ id: 'duplicate', canonicalId: 'canonical' }] });
test('exact ready title and author pass; text similarity never substitutes for an ID', () => {
  const result = assessPublishingDestinations([{ titleId: 'canonical' }, { titleId: 'unknown', title: 'book' }], catalog());
  assert.equal(result[0].destinationReadiness, 'READY');
  assert.deepEqual(result[1].destinationMissing, ['EXACT_TITLE_DESTINATION_NOT_FOUND']);
});
test('missing portrait holds new selection while preserving active campaign ownership and prior holds', () => {
  const c = catalog(); c.authors[0].campaignReadiness = { status: 'HOLD', missing: ['MISSING_PORTRAIT'] };
  for (const disposition of ['ACTIVE_CAMPAIGN', 'RIGHTS_HELD', 'FATIGUE_HELD']) {
    const result = assessPublishingDestinations([{ titleId: 'canonical', disposition, currentCampaign: 'existing' }], c)[0];
    assert.equal(result.disposition, disposition); assert.equal(result.currentCampaign, 'existing');
    assert.equal(result.destinationReadiness, 'HOLD');
  }
});
test('duplicate exact public work resolves for reporting but cannot create a second campaign lane', () => {
  const result = assessPublishingDestinations([{ titleId: 'duplicate' }], catalog())[0];
  assert.equal(result.canonicalDestinationId, 'canonical');
  assert.deepEqual(result.destinationMissing, ['DUPLICATE_PUBLIC_WORK_USE_CANONICAL_ID']);
});
test('unavailable or conflicting readback fails closed', () => {
  assert.equal(assessPublishingDestinations([{ titleId: 'canonical' }], null)[0].destinationReadiness, 'HOLD');
  const c = catalog(); c.titles.push(c.titles[0]);
  assert.throws(() => assessPublishingDestinations([], c), /DUPLICATE_ID/);
});
test('reader is fixed to public metadata endpoint, bounded, and rejects stale or failed responses', async () => {
  await readPublishingDestinations(async (url, options) => { assert.equal(url, 'https://jmerrill.pub/api/public-catalog'); assert.equal(options.redirect, 'error'); return { ok: true, json: async () => catalog() }; });
  await assert.rejects(readPublishingDestinations(async () => ({ ok: false, status: 503 })), /HTTP_503/);
  const c = catalog(); c.generatedAt = '2020-01-01';
  await assert.rejects(readPublishingDestinations(async () => ({ ok: true, json: async () => c })), /STALE/);
});
test('campaign links gate exact destinations without cancelling or modifying an existing booking', () => {
  assert.equal(assessPublishingCampaignUrls('https://jmerrill.pub/books/book', catalog()).status, 'READY');
  assert.equal(assessPublishingCampaignUrls('https://jmerrill.pub/books/unknown', catalog()).status, 'HOLD');
  assert.equal(assessPublishingCampaignUrls('https://jmerrill.pub/authors/author', null).status, 'HOLD');
  assert.equal(assessPublishingCampaignUrls('https://jmerrill.pub/packages', null).status, 'NOT_APPLICABLE');
  const c = catalog(); c.titleAliases[0].retiredSlugs = ['old-book']; c.titleAliases[0].canonicalSlug = 'book';
  assert.equal(assessPublishingCampaignUrls('https://jmerrill.pub/books/old-book', c).status, 'READY');
});
