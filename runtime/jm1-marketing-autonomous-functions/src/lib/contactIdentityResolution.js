export const CONTACT_IDENTITY_RESOLUTION = Object.freeze({
  NO_EMAIL_MATCH: 'NO_EMAIL_MATCH',
  SINGLE_EMAIL_MATCH_LEGACY: 'SINGLE_EMAIL_MATCH_LEGACY',
  AMBIGUOUS_EMAIL_MATCH: 'AMBIGUOUS_EMAIL_MATCH',
  LOOKUP_SCOPE_UNAVAILABLE: 'LOOKUP_SCOPE_UNAVAILABLE',
  INVALID_CANDIDATE_SET: 'INVALID_CANDIDATE_SET'
});

// Email is a contact point, not proof of a unique person identity.
export function classifyContactCandidates(candidates, { scopeComplete = false, scopeBasis = '' } = {}) {
  if (!Array.isArray(candidates) || candidates.some((candidate) =>
    !candidate || typeof candidate.contactid !== 'string' || !candidate.contactid
  )) {
    return { state: CONTACT_IDENTITY_RESOLUTION.INVALID_CANDIDATE_SET, contactId: null };
  }
  if (candidates.length > 1) {
    return { state: CONTACT_IDENTITY_RESOLUTION.AMBIGUOUS_EMAIL_MATCH, contactId: null };
  }
  if (scopeComplete !== true || typeof scopeBasis !== 'string' || !scopeBasis.trim()) {
    return { state: CONTACT_IDENTITY_RESOLUTION.LOOKUP_SCOPE_UNAVAILABLE, contactId: null };
  }
  if (candidates.length === 1) {
    return {
      state: CONTACT_IDENTITY_RESOLUTION.SINGLE_EMAIL_MATCH_LEGACY,
      contactId: candidates[0].contactid
    };
  }
  return { state: CONTACT_IDENTITY_RESOLUTION.NO_EMAIL_MATCH, contactId: null };
}
