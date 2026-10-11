const catalogUrl = 'https://jmerrill.pub/api/public-catalog';

export async function readPublishingDestinations(fetcher = fetch) {
  const response = await fetcher(catalogUrl, { signal: AbortSignal.timeout(15000), headers: { Accept: 'application/json' }, redirect: 'error' });
  if (!response.ok) throw new Error(`PUBLISHING_DESTINATION_READBACK_HTTP_${response.status}`);
  const catalog = await response.json();
  if (catalog.ok !== true || !Array.isArray(catalog.titles) || !Array.isArray(catalog.authors)) throw new Error('PUBLISHING_DESTINATION_READBACK_INVALID');
  const generated = Date.parse(catalog.generatedAt);
  if (!Number.isFinite(generated) || Math.abs(Date.now() - generated) > 300000) throw new Error('PUBLISHING_DESTINATION_READBACK_STALE');
  return catalog;
}

export function assessPublishingDestinations(rows, catalog) {
  const titles = new Map();
  const authors = new Map();
  const aliases = new Map();
  for (const title of catalog?.titles || []) {
    if (titles.has(title.id)) throw new Error('PUBLISHING_DESTINATION_DUPLICATE_ID');
    titles.set(title.id, title);
  }
  for (const author of catalog?.authors || []) {
    if (authors.has(author.slug)) throw new Error('PUBLISHING_DESTINATION_DUPLICATE_AUTHOR');
    authors.set(author.slug, author);
  }
  for (const alias of catalog?.titleAliases || []) {
    if (titles.has(alias.id) || aliases.has(alias.id) || !titles.has(alias.canonicalId)) throw new Error('PUBLISHING_DESTINATION_ALIAS_CONFLICT');
    aliases.set(alias.id, alias.canonicalId);
  }
  return rows.map(row => {
    const canonicalId = aliases.get(row.titleId) || row.titleId;
    const title = titles.get(canonicalId);
    const missing = [];
    if (!catalog) missing.push('DESTINATION_READBACK_UNAVAILABLE');
    else if (!title) missing.push('EXACT_TITLE_DESTINATION_NOT_FOUND');
    else {
      if (title.campaignReadiness?.status !== 'READY') missing.push(...(title.campaignReadiness?.missing?.length ? title.campaignReadiness.missing : ['BOOK_READINESS_UNPROVEN']));
      if (!title.slug || !Array.isArray(title.authors) || title.authors.length === 0) missing.push('AUTHOR_DESTINATION_UNPROVEN');
      for (const link of title.authors || []) {
        const author = authors.get(link.slug);
        if (author?.campaignReadiness?.status !== 'READY') missing.push(...(author?.campaignReadiness?.missing?.length ? author.campaignReadiness.missing : ['AUTHOR_DESTINATION_UNPROVEN']));
      }
      if (canonicalId !== row.titleId) missing.push('DUPLICATE_PUBLIC_WORK_USE_CANONICAL_ID');
    }
    // Existing campaign ownership/holds are immutable here; this only gates new selection.
    return { ...row, destinationReadiness: missing.length ? 'HOLD' : 'READY', destinationMissing: [...new Set(missing)], canonicalDestinationId: canonicalId };
  });
}

export function assessPublishingCampaignUrls(text, catalog) {
  const destinations = [...new Set(String(text || '').match(/https:\/\/jmerrill\.pub\/(?:books|authors)\/[a-z0-9-]+/gi) || [])];
  if (!destinations.length) return { status: 'NOT_APPLICABLE', destinations: [], missing: [] };
  const missing = [];
  for (const destination of destinations) {
    if (!catalog) { missing.push('DESTINATION_READBACK_UNAVAILABLE'); continue; }
    const [kind, slug] = new URL(destination).pathname.split('/').filter(Boolean);
    if (kind === 'authors') {
      const author = catalog.authors.find(row => row.slug === slug);
      if (author?.campaignReadiness?.status !== 'READY') missing.push(...(author?.campaignReadiness?.missing?.length ? author.campaignReadiness.missing : ['EXACT_AUTHOR_DESTINATION_NOT_FOUND']));
    } else {
      const canonicalSlug = catalog.titleAliases?.find(row => row.retiredSlugs?.includes(slug))?.canonicalSlug || slug;
      const title = catalog.titles.find(row => row.slug === canonicalSlug);
      if (!title) missing.push('EXACT_TITLE_DESTINATION_NOT_FOUND');
      else missing.push(...assessPublishingDestinations([{ titleId: title.id }], catalog)[0].destinationMissing);
    }
  }
  return { status: missing.length ? 'HOLD' : 'READY', destinations, missing: [...new Set(missing)] };
}
