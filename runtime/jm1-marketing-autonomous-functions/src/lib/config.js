export const DATAVERSE_URL = requireEnv('DATAVERSE_RESOURCE_URL');
export const DATAVERSE_WEB_API_BASE_URL = process.env.DATAVERSE_WEB_API_BASE_URL || `${DATAVERSE_URL}/api/data/v9.2`;
export const DATAVERSE_TENANT_ID = requireEnv('DATAVERSE_TENANT_ID');
export const DATAVERSE_CLIENT_ID = requireEnv('DATAVERSE_CLIENT_ID');
export const DATAVERSE_CLIENT_SECRET = requireEnv('DATAVERSE_CLIENT_SECRET');

export const META_SYSTEM_USER_TOKEN = process.env.JM1_META_SYSTEM_USER_TOKEN || '';
export const META_TOKEN_SECRET_REFERENCE = process.env.JM1_META_TOKEN_SECRET_REFERENCE || 'jm1-core-vault/JM1-META-SOCIAL-PUBLISHER-SYSTEM-USER-TOKEN';
export const META_TOKEN_SECRET_VERSION = process.env.JM1_META_TOKEN_SECRET_VERSION || '';
export const META_TOKEN_ISSUED_AT = process.env.JM1_META_TOKEN_ISSUED_AT || '';
export const META_TOKEN_EXPIRES_AT = process.env.JM1_META_TOKEN_EXPIRES_AT || '';
export const META_TOKEN_ROTATION_DUE_AT = process.env.JM1_META_TOKEN_ROTATION_DUE_AT || '';
export const META_GRAPH_VERSION = process.env.JM1_META_GRAPH_VERSION || 'v26.0';
export const META_MEDIA_URL_REGISTRY = parseJsonEnv('JM1_META_MEDIA_URL_REGISTRY', {});
export const META_CAPTION_REGISTRY = parseJsonEnv('JM1_META_CAPTION_REGISTRY', {});
export const LINKEDIN_CLIENT_ID = process.env.JM1_LINKEDIN_CLIENT_ID || '';
export const LINKEDIN_APP_ID = process.env.JM1_LINKEDIN_APP_ID || '';
export const LINKEDIN_APP_NAME = process.env.JM1_LINKEDIN_APP_NAME || '';
export const LINKEDIN_APP_VERIFICATION_STATE = process.env.JM1_LINKEDIN_APP_VERIFICATION_STATE || 'NOT_CONFIGURED';
export const LINKEDIN_PRODUCT_STATE = process.env.JM1_LINKEDIN_PRODUCT_STATE || 'NOT_CONFIGURED';

export const BRANCH_CONFIG = parseJsonEnv('JM1_MARKETING_BRANCH_CONFIG', {
  publishing: {
    active: true,
    branchName: 'J Merrill Publishing',
    facebookPageId: '307480763084670',
    facebookPageName: 'J Merrill Publishing Inc',
    instagramGraphId: '17841410046020869',
    instagramHandle: 'jmerrillpub',
    linkedinOrganizationId: '13048648'
  },
  one: { active: false, branchName: 'J Merrill One' },
  financial: { active: false, branchName: 'J Merrill Financial' },
  foundation: { active: false, branchName: 'J Merrill Foundation' }
});

export const AUTONOMOUS_META_EXECUTION_ENABLED = process.env.JM1_MARKETING_AUTONOMOUS_META_EXECUTION_ENABLED === 'true';
export const AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED = process.env.JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED === 'true';
export const SYNTHETIC_CREDENTIAL_MONITOR_ENABLED = process.env.JM1_CREDENTIAL_MONITOR_SYNTHETIC_ENABLED === 'true';
export const SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES = Number(process.env.JM1_SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES || 20);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required setting ${name}`);
  return value;
}

function parseJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${name}: ${error.message}`);
  }
}
