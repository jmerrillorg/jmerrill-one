export function metaDestinationMatches(expected, platform, requestedDestination) {
  if (platform === 'facebook') {
    return Boolean(expected.facebookPageId)
      && String(requestedDestination || '') === String(expected.facebookPageId);
  }
  if (platform === 'instagram') {
    return Boolean(expected.instagramGraphId)
      && String(requestedDestination || '') === String(expected.instagramGraphId);
  }
  return false;
}

export function findConfiguredMetaPage(accounts, expected) {
  return (accounts || []).find((item) => item.id === expected.facebookPageId) || null;
}
