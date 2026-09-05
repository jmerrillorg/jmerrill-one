import assert from 'node:assert/strict';
import { parseCatalogTsv, reconcileCatalog, reconciliationFingerprint } from '../lib/catalog-reconciliation.mjs';

const header = 'ISBN13\tTitle\tFormat\tStatus\tISBN\tKINDLE\tPublished\tList Price\tCost\t40%\tNew\tAUTHOR COPY\tAuthor\tContract\tIsDistributed\tHouse';
const source = [header,
  "978-1-961475-79-3\tThe Shift\tPaperback\tAC (USA)\t9781961475793\t\t18-Aug-26\t\t\t\t\t\tSean Crowley\t1\tY\tY",
  "978-1-954414-17-4\tMemoir of a Black Christian Nationalist\tEbook\tAC (USA)\t9781954414174\tB09D8VNF1B\t2021-11-20\t\t\t\t\t\tShelley McIntosh\t1\tY\t",
  '978-1-969418-99-0\t\t\t\t9781969418990\t\t\t\t\t\t\t\t\t1\t\t'
].join('\n');

const first = reconcileCatalog(parseCatalogTsv(source), ['The Shift production campaign']);
const second = reconcileCatalog(parseCatalogTsv(source), ['The Shift production campaign']);
assert.equal(first.counts.sourceRowsTotal, 3);
assert.equal(first.counts.reservedUnassignedIsbnRows, 1);
assert.equal(first.counts.canonicalWorksDiscovered, 2);
assert.equal(first.works.find((work) => work.canonicalTitle === 'The Shift').lifecycle, 'NEW_RECENTLY_RELEASED');
assert.equal(first.works.find((work) => /Memoir/.test(work.canonicalTitle)).authorityState, 'RIGHTS_REVIEW_REQUIRED');
assert.equal(reconciliationFingerprint(first), reconciliationFingerprint(second));
console.log('Catalog reconciliation tests passed.');
