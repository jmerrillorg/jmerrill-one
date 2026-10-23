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

export function metaBranchApiExecutionEnabled(expected) {
  if (expected?.branchName === 'J Merrill Financial') {
    return expected.metaApiExecutionEnabled === true;
  }
  return expected?.active === true;
}

export async function verifyMetaAuthorityForBranch(expected, verifyAuthority) {
  return runMetaOperationForBranch(expected, verifyAuthority);
}

export async function runMetaOperationForBranch(expected, operation, disabledState = 'META_BRANCH_API_EXECUTION_DISABLED') {
  if (!metaBranchApiExecutionEnabled(expected)) {
    return { ok: false, state: disabledState };
  }
  return operation(expected);
}
