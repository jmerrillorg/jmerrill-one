import { createHash } from 'node:crypto';

const CURRENT_AUTHORITY = new Map([
  ['the shift', { title: 'The Shift', author: 'Sean A Crowley I', state: 'ACTIVE_CONFIRMED', marketing: 'MARKETING_AUTHORITY_CONFIRMED', lifecycle: 'NEW_RECENTLY_RELEASED' }],
  ['strategies for success', { title: 'Strategies for Success', author: 'Sean A Crowley I', state: 'ACTIVE_CONFIRMED', marketing: 'MARKETING_AUTHORITY_CONFIRMED', lifecycle: 'LAUNCH_2026_09_22' }],
  ['a portrait of paradise', { title: 'A Portrait of Paradise', author: 'Iyorwuese Hagher', state: 'ACTIVE_CONFIRMED', marketing: 'MARKETING_AUTHORITY_CONFIRMED', lifecycle: 'CURRENT_TITLE' }],
  ['the conquest of azenga', { title: 'The Conquest of Azenga', author: 'Iyorwuese Hagher', state: 'ACTIVE_CONFIRMED', marketing: 'MARKETING_AUTHORITY_CONFIRMED', lifecycle: 'CURRENT_TITLE' }]
]);

export const RAW_FIELDS = ['ISBN13', 'Title', 'Format', 'Status', 'ISBN', 'KINDLE', 'Published', 'List Price', 'Cost', '40%', 'New', 'AUTHOR COPY', 'Author', 'Contract', 'IsDistributed', 'House'];

export function parseCatalogTsv(source) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line, index, all) => index === 0 || line.length || index < all.length - 1);
  const headers = lines[0].split('\t').map((value) => value.trim());
  if (RAW_FIELDS.some((field) => !headers.includes(field))) throw new Error('Catalog source is missing required raw fields.');
  return lines.slice(1).filter(Boolean).map((line, index) => {
    const values = line.split('\t');
    return { sourceRow: index + 2, raw: Object.fromEntries(headers.map((header, column) => [header, (values[column] || '').trim()])) };
  });
}

export function reconcileCatalog(rows, dataverseText = []) {
  const staged = rows.map(stageRow);
  const productRows = staged.filter((row) => row.primaryResult !== 'RESERVED_ISBN' && row.primaryResult !== 'INVALID_OR_INCOMPLETE_RECORD');
  const workGroups = new Map();
  for (const row of productRows) {
    const key = `${row.normalized.authorKey}::${row.normalized.workKey}`;
    const group = workGroups.get(key) || [];
    group.push(row);
    workGroups.set(key, group);
  }

  const searchableDataverse = dataverseText.map(normalizeSearchText).filter(Boolean);
  const works = [...workGroups.entries()].map(([key, products]) => buildWork(key, products, searchableDataverse));
  const editions = buildEditions(works);
  const authors = [...new Set(works.map((work) => work.authorKey))].sort();

  return {
    staged,
    authors,
    works,
    editions,
    counts: summarize(staged, works, editions, authors),
    shelley: shelleyResult(works),
    currentTitles: currentTitleResults(works),
    codeDefinitions: codeDefinitionSummary(staged)
  };
}

function stageRow({ sourceRow, raw }) {
  const title = raw.Title.trim();
  const author = raw.Author.trim();
  const normalizedIsbn = digits(raw.ISBN13 || raw.ISBN);
  const identifier = classifyIdentifier(raw.ISBN13 || raw.ISBN, raw.KINDLE, title);
  if (!title && identifier.class === 'ISBN13') {
    return { sourceRow, raw, normalized: { ...identifier, workKey: '', authorKey: '' }, primaryResult: 'RESERVED_ISBN', secondaryFlags: ['RESERVED_UNASSIGNED_ISBN'] };
  }
  if (!title || !author || identifier.class === 'UNKNOWN_IDENTIFIER') {
    return { sourceRow, raw, normalized: { ...identifier, workKey: normalizeTitle(title), authorKey: normalizeAuthor(author) }, primaryResult: 'INVALID_OR_INCOMPLETE_RECORD', secondaryFlags: missingFlags(raw) };
  }
  const workKey = normalizeTitle(title);
  const authority = CURRENT_AUTHORITY.get(workKey);
  return {
    sourceRow,
    raw,
    normalized: {
      ...identifier,
      isbn13: normalizedIsbn.length === 13 ? normalizedIsbn : '',
      asin: raw.KINDLE.trim().toUpperCase(),
      workKey,
      canonicalTitle: authority?.title || canonicalDisplayTitle(title),
      authorKey: normalizeAuthor(author),
      canonicalAuthor: authority?.author || author,
      format: normalizeFormat(raw.Format),
      published: normalizeDate(raw.Published)
    },
    primaryResult: authority ? 'MATCHED_EXISTING_FORMAT' : 'RIGHTS_REVIEW_REQUIRED',
    secondaryFlags: [
      ...(canonicalDisplayTitle(title) !== title ? ['TITLE_NAME_NORMALIZATION'] : []),
      ...(/Sean Crowley/i.test(author) ? ['AUTHOR_MATCH_NORMALIZED_TO_SEAN_A_CROWLEY_I'] : []),
      ...legacyCodeFlags(raw)
    ]
  };
}

function buildWork(key, products, searchableDataverse) {
  const first = products[0];
  const authority = CURRENT_AUTHORITY.get(first.normalized.workKey);
  const dataverseMatched = searchableDataverse.some((value) => value.includes(first.normalized.workKey));
  return {
    workKey: stableId('work', key),
    titleKey: first.normalized.workKey,
    canonicalTitle: first.normalized.canonicalTitle,
    authorKey: first.normalized.authorKey,
    canonicalAuthor: first.normalized.canonicalAuthor,
    authorityState: authority?.state || 'RIGHTS_REVIEW_REQUIRED',
    marketingAuthority: authority?.marketing || 'MARKETING_AUTHORITY_HELD',
    lifecycle: authority?.lifecycle || 'UNRESOLVED_LEGACY_CATALOG',
    dataverseMatch: dataverseMatched,
    sourceRows: products.map((row) => row.sourceRow),
    formatProductCount: products.length,
    products: products.map((row) => ({ sourceRow: row.sourceRow, identifierClass: row.normalized.class, identifier: row.normalized.value, isbn13: row.normalized.isbn13, asin: row.normalized.asin, format: row.normalized.format, published: row.normalized.published }))
  };
}

function buildEditions(works) {
  return works.flatMap((work) => {
    const groups = new Map();
    for (const product of work.products) {
      const year = product.published?.slice(0, 4) || 'UNKNOWN';
      const relation = /2nd edition|second edition/i.test(work.canonicalTitle) ? 'SECOND_EDITION' : 'UNKNOWN_EDITION_RELATION';
      const key = `${work.workKey}:${year}:${relation}`;
      const products = groups.get(key) || [];
      products.push(product);
      groups.set(key, products);
    }
    return [...groups.entries()].map(([key, products]) => ({ editionKey: stableId('edition', key), workKey: work.workKey, publicationYear: key.split(':').at(-2), relation: key.split(':').at(-1), products: products.map((product) => product.identifier) }));
  });
}

function summarize(staged, works, editions, authors) {
  const reserved = staged.filter((row) => row.primaryResult === 'RESERVED_ISBN').length;
  const invalid = staged.filter((row) => row.primaryResult === 'INVALID_OR_INCOMPLETE_RECORD').length;
  return {
    sourceRowsTotal: staged.length,
    assignedProductRows: staged.length - reserved - invalid,
    reservedUnassignedIsbnRows: reserved,
    invalidRows: invalid,
    canonicalWorksDiscovered: works.length,
    authorsDiscovered: authors.length,
    editionsDiscovered: editions.length,
    formatProductsDiscovered: staged.length - reserved - invalid,
    dataverseWorkMatches: works.filter((work) => work.dataverseMatch).length,
    dataverseWorkMissing: works.filter((work) => !work.dataverseMatch).length,
    formatMatches: staged.filter((row) => row.primaryResult === 'MATCHED_EXISTING_FORMAT').length,
    formatMissing: staged.filter((row) => row.primaryResult === 'RIGHTS_REVIEW_REQUIRED').length,
    dataverseConflicts: 0,
    authorConflicts: staged.filter((row) => row.secondaryFlags.includes('AUTHOR_MATCH_REVIEW_REQUIRED')).length,
    rightsExceptions: works.filter((work) => work.authorityState === 'RIGHTS_REVIEW_REQUIRED').length,
    statusExceptions: works.filter((work) => work.lifecycle === 'UNRESOLVED_LEGACY_CATALOG').length,
    activeConfirmed: works.filter((work) => work.authorityState === 'ACTIVE_CONFIRMED').length,
    inactiveConfirmed: 0,
    retiredConfirmed: 0,
    authorityReview: 0,
    marketingHealthEligible: works.filter((work) => work.marketingAuthority === 'MARKETING_AUTHORITY_CONFIRMED').length
  };
}

function shelleyResult(works) {
  const rows = works.filter((work) => work.authorKey === normalizeAuthor('Shelley McIntosh'));
  return { canonicalWorkCount: rows.length, formatRecordCount: rows.reduce((sum, work) => sum + work.formatProductCount, 0), activeConfirmed: 0, held: rows.length, conflicts: 0, works: rows.map((work) => ({ title: work.canonicalTitle, formats: work.products.map((product) => product.format), authorityState: work.authorityState })) };
}

function currentTitleResults(works) {
  return [...CURRENT_AUTHORITY].map(([key, authority]) => {
    const work = works.find((item) => item.titleKey === key);
    return { title: authority.title, found: Boolean(work), formats: work?.products.map((product) => product.format) || [], publicationDates: [...new Set(work?.products.map((product) => product.published).filter(Boolean) || [])], authorityState: authority.state, marketingAuthority: authority.marketing, lifecycle: authority.lifecycle };
  });
}

function codeDefinitionSummary(staged) {
  const values = (field) => [...new Set(staged.map((row) => row.raw[field]).filter(Boolean))].sort();
  return { status: values('Status'), house: values('House'), contract: values('Contract'), isDistributed: values('IsDistributed'), classification: 'CODE_DEFINITION_REQUIRED', translationApplied: false };
}

export function reconciliationFingerprint(reconciliation) {
  return createHash('sha256').update(JSON.stringify({ staged: reconciliation.staged, works: reconciliation.works, editions: reconciliation.editions })).digest('hex');
}

function normalizeTitle(value) { return value.toLowerCase().replace(/[’']/g, '').replace(/&/g, ' and ').replace(/\bfor success in educational leadership\b/g, 'for success').replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim(); }
function canonicalDisplayTitle(value) { return value.replace(/\s+/g, ' ').trim(); }
function normalizeAuthor(value) { return value.toLowerCase().replace(/[.,’']/g, '').replace(/\s+/g, ' ').trim(); }
function normalizeSearchText(value) { return normalizeTitle(String(value || '')); }
function digits(value) { return String(value || '').replace(/\D/g, ''); }
function normalizeFormat(value) { const source = value.toLowerCase(); if (/audio/.test(source)) return 'AUDIO'; if (/hard/.test(source)) return 'HARDBACK'; if (/paper/.test(source)) return 'PAPERBACK'; if (/ebook|digital/.test(source)) return 'DIGITAL'; return value.toUpperCase(); }
function normalizeDate(value) { if (!value) return ''; const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/); if (!match) return value; const month = ({ jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' })[match[2].toLowerCase()]; return `20${match[3]}-${month}-${match[1].padStart(2, '0')}`; }
function classifyIdentifier(primary, kindle, title) { const value = String(primary || '').trim(); const isbn = digits(value); if (!title && isbn.length === 13) return { class: 'ISBN13', value: isbn }; if (/^BK_ACX/i.test(value)) return { class: 'AUDIO_IDENTIFIER', value }; if (isbn.length === 13) return { class: 'ISBN13', value: isbn }; if (/^B0[A-Z0-9]+$/i.test(kindle)) return { class: 'ASIN', value: kindle.toUpperCase() }; if (value) return { class: 'LEGACY_IDENTIFIER', value }; return { class: 'UNKNOWN_IDENTIFIER', value: '' }; }
function legacyCodeFlags(raw) { const flags = []; if (raw.Status) flags.push('CODE_DEFINITION_REQUIRED:STATUS'); if (raw.House) flags.push('CODE_DEFINITION_REQUIRED:HOUSE'); if (raw.Contract) flags.push('CODE_DEFINITION_REQUIRED:CONTRACT'); if (raw.IsDistributed) flags.push('CODE_DEFINITION_REQUIRED:IS_DISTRIBUTED'); return flags; }
function missingFlags(raw) { return [!raw.Title && 'MISSING_TITLE', !raw.Author && 'MISSING_AUTHOR', !(raw.ISBN13 || raw.ISBN || raw.KINDLE) && 'MISSING_IDENTIFIER'].filter(Boolean); }
function stableId(namespace, value) { return `${namespace}_${createHash('sha256').update(value).digest('hex').slice(0, 24)}`; }
