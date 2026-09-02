import {
  AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED,
  LINKEDIN_APP_ID,
  LINKEDIN_APP_NAME,
  LINKEDIN_APP_VERIFICATION_STATE,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_PRODUCT_STATE
} from './config.js';

export function checkLinkedInAuthority(branch) {
  const configured = Boolean(LINKEDIN_CLIENT_ID && LINKEDIN_APP_ID);
  const organizationId = branch.linkedinOrganizationId || '';
  const verified = LINKEDIN_APP_VERIFICATION_STATE === 'VERIFIED_WITH_PUBLISHING_PAGE';
  const productApproved = LINKEDIN_PRODUCT_STATE === 'COMMUNITY_MANAGEMENT_APPROVED';

  if (!configured) {
    return {
      ok: false,
      state: 'LINKEDIN_APP_NOT_CONFIGURED',
      organizationId,
      autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
    };
  }

  if (!verified) {
    return {
      ok: false,
      state: LINKEDIN_APP_VERIFICATION_STATE || 'LINKEDIN_APP_COMPANY_VERIFICATION_REQUIRED',
      appId: LINKEDIN_APP_ID,
      clientId: LINKEDIN_CLIENT_ID,
      appName: LINKEDIN_APP_NAME,
      organizationId,
      autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
    };
  }

  if (!productApproved) {
    return {
      ok: false,
      state: LINKEDIN_PRODUCT_STATE || 'LINKEDIN_API_PRODUCT_REVIEW_PENDING_OR_EMAIL_VERIFICATION_REQUIRED',
      appId: LINKEDIN_APP_ID,
      clientId: LINKEDIN_CLIENT_ID,
      appName: LINKEDIN_APP_NAME,
      organizationId,
      autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
    };
  }

  return {
    ok: true,
    state: 'LINKEDIN_API_AUTHORITY_AVAILABLE',
    appId: LINKEDIN_APP_ID,
    clientId: LINKEDIN_CLIENT_ID,
    appName: LINKEDIN_APP_NAME,
    organizationId,
    autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
  };
}
