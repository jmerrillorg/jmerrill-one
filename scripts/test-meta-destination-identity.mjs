import assert from 'node:assert/strict';
import test from 'node:test';

import { findConfiguredMetaPage, metaDestinationMatches } from '../runtime/jm1-marketing-autonomous-functions/src/lib/metaDestination.js';

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
