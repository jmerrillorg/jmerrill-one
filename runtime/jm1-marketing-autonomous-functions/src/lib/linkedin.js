import {
  AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED,
  LINKEDIN_ACCESS_TOKEN,
  LINKEDIN_API_VERSION,
  LINKEDIN_APP_ID,
  LINKEDIN_APP_NAME,
  LINKEDIN_APP_VERIFICATION_STATE,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_GRANTED_SCOPES,
  LINKEDIN_PRIVACY_POLICY_URL,
  LINKEDIN_PRODUCT_STATE,
  LINKEDIN_REDIRECT_URI,
  LINKEDIN_TOKEN_EXPIRES_AT,
  LINKEDIN_TOKEN_SECRET_REFERENCE
} from './config.js';

export const LINKEDIN_REQUIRED_SCOPES = ['w_organization_social', 'r_organization_social'];
const REST_BASE = 'https://api.linkedin.com/rest';
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

export function checkLinkedInAuthority(branch) {
  const configured = Boolean(LINKEDIN_CLIENT_ID && LINKEDIN_APP_ID);
  const organizationId = branch.linkedinOrganizationId || '';
  const verified = LINKEDIN_APP_VERIFICATION_STATE === 'VERIFIED_WITH_PUBLISHING_PAGE';
  const productApproved = LINKEDIN_PRODUCT_STATE === 'COMMUNITY_MANAGEMENT_APPROVED';
  const scopesReady = LINKEDIN_REQUIRED_SCOPES.every((scope) => LINKEDIN_GRANTED_SCOPES.includes(scope));
  const tokenReady = Boolean(LINKEDIN_ACCESS_TOKEN);

  if (!configured) {
    return {
      ok: false,
      state: 'LINKEDIN_APP_NOT_CONFIGURED',
      organizationId,
      requiredScopes: LINKEDIN_REQUIRED_SCOPES,
      grantedScopes: LINKEDIN_GRANTED_SCOPES,
      redirectUri: LINKEDIN_REDIRECT_URI,
      privacyPolicyUrl: LINKEDIN_PRIVACY_POLICY_URL,
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
      requiredScopes: LINKEDIN_REQUIRED_SCOPES,
      grantedScopes: LINKEDIN_GRANTED_SCOPES,
      redirectUri: LINKEDIN_REDIRECT_URI,
      privacyPolicyUrl: LINKEDIN_PRIVACY_POLICY_URL,
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
      productState: LINKEDIN_PRODUCT_STATE,
      requiredScopes: LINKEDIN_REQUIRED_SCOPES,
      grantedScopes: LINKEDIN_GRANTED_SCOPES,
      redirectUri: LINKEDIN_REDIRECT_URI,
      privacyPolicyUrl: LINKEDIN_PRIVACY_POLICY_URL,
      autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
    };
  }

  if (!scopesReady) {
    return {
      ok: false,
      state: 'LINKEDIN_REQUIRED_SCOPES_NOT_GRANTED',
      appId: LINKEDIN_APP_ID,
      clientId: LINKEDIN_CLIENT_ID,
      appName: LINKEDIN_APP_NAME,
      organizationId,
      requiredScopes: LINKEDIN_REQUIRED_SCOPES,
      grantedScopes: LINKEDIN_GRANTED_SCOPES,
      autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
    };
  }

  if (!tokenReady) {
    return {
      ok: false,
      state: 'LINKEDIN_ACCESS_TOKEN_SECRET_NOT_RESOLVED',
      appId: LINKEDIN_APP_ID,
      clientId: LINKEDIN_CLIENT_ID,
      appName: LINKEDIN_APP_NAME,
      organizationId,
      tokenSecretReference: LINKEDIN_TOKEN_SECRET_REFERENCE,
      tokenExpiresAt: LINKEDIN_TOKEN_EXPIRES_AT,
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
    requiredScopes: LINKEDIN_REQUIRED_SCOPES,
    grantedScopes: LINKEDIN_GRANTED_SCOPES,
    apiVersion: LINKEDIN_API_VERSION,
    tokenSecretReference: LINKEDIN_TOKEN_SECRET_REFERENCE,
    tokenExpiresAt: LINKEDIN_TOKEN_EXPIRES_AT,
    autonomousExecutionEnabled: AUTONOMOUS_LINKEDIN_EXECUTION_ENABLED
  };
}

export async function verifyLinkedInOrganizationAuthority({ organizationId }) {
  if (!LINKEDIN_ACCESS_TOKEN) return { ok: false, state: 'LINKEDIN_ACCESS_TOKEN_SECRET_NOT_RESOLVED' };
  const organizationUrn = organizationUrnFor(organizationId);
  const encoded = encodeURIComponent(organizationUrn);
  const result = await linkedInFetch(`/organizationAcls?q=organization&organization=${encoded}&role=ADMINISTRATOR&state=APPROVED`);
  if (!result.ok) {
    return {
      ok: false,
      state: 'LINKEDIN_ORGANIZATION_AUTHORITY_READBACK_FAILED',
      status: result.status,
      message: result.json?.message || result.json?.serviceErrorCode || ''
    };
  }
  const match = (result.json.elements || []).find((item) =>
    item.organization === organizationUrn
    && item.role === 'ADMINISTRATOR'
    && item.state === 'APPROVED'
  );
  return match
    ? { ok: true, state: 'LINKEDIN_ORGANIZATION_POST_AUTHORITY_VERIFIED', organizationUrn, role: match.role }
    : { ok: false, state: 'LINKEDIN_ORGANIZATION_ADMIN_ROLE_NOT_FOUND', organizationUrn };
}

export async function publishLinkedInOrganizationImagePost({ expected, caption, imageUrl, altText = '', title = '' }) {
  const organizationId = expected.linkedinOrganizationId || expected.organizationId || '';
  if (!organizationId || !caption || !imageUrl) {
    return { ok: false, state: 'LINKEDIN_ORGANIZATION_CAPTION_OR_MEDIA_MISSING' };
  }

  const authority = checkLinkedInAuthority({ linkedinOrganizationId: organizationId });
  if (!authority.ok) return authority;

  const organizationAuthority = await verifyLinkedInOrganizationAuthority({ organizationId });
  if (!organizationAuthority.ok) return organizationAuthority;

  const asset = await fetchImageAsset(imageUrl);
  if (!asset.ok) return asset;

  const uploaded = await uploadLinkedInImage({ organizationId, asset });
  if (!uploaded.ok) return uploaded;

  const postPayload = linkedInImagePostPayload({
    organizationId,
    caption,
    imageUrn: uploaded.imageUrn,
    altText,
    title
  });
  const post = await linkedInFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(postPayload)
  });
  const postUrn = post.response.headers.get('x-restli-id') || post.json?.id || '';
  if (!post.ok || !postUrn) {
    return {
      ok: false,
      state: 'LINKEDIN_POST_CREATE_FAILED',
      status: post.status,
      platformPostId: postUrn,
      message: post.json?.message || ''
    };
  }

  const readback = await readLinkedInPost(postUrn);
  if (!readback.ok) return { ...readback, platformPostId: postUrn };

  const matches = readback.json.author === organizationUrnFor(organizationId)
    && readback.json.commentary === caption
    && readback.json.content?.media?.id === uploaded.imageUrn
    && readback.json.visibility === 'PUBLIC';

  return {
    ok: matches,
    state: matches ? 'PUBLISHED_VERIFIED' : 'READBACK_MISMATCH',
    readbackState: matches ? 'LINKEDIN_READBACK_MATCH' : 'READBACK_MISMATCH',
    platformPostId: postUrn,
    actualDestination: organizationUrnFor(organizationId),
    actualMediaReference: uploaded.imageUrn,
    publishedAt: readback.json.publishedAt || readback.json.createdAt || null,
    permalink: linkedInFeedUrl(postUrn),
    readback: sanitize(readback.json)
  };
}

export async function findRecentMatchingLinkedInPost({ organizationId, captionPrefix }) {
  if (!captionPrefix) return { ok: false, state: 'LINKEDIN_RECONCILIATION_CAPTION_PREFIX_MISSING' };
  const author = encodeURIComponent(organizationUrnFor(organizationId));
  const result = await linkedInFetch(`/posts?author=${author}&q=author&count=50&sortBy=LAST_MODIFIED`, {
    headers: { 'X-RestLi-Method': 'FINDER' }
  });
  if (!result.ok) {
    return { ok: false, state: 'LINKEDIN_RECONCILIATION_READBACK_FAILED', status: result.status, message: result.json?.message || '' };
  }
  const matches = (result.json.elements || [])
    .filter((item) =>
      item.author === organizationUrnFor(organizationId)
      && String(item.commentary || '').startsWith(captionPrefix)
    )
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  const match = matches[0];
  return match
    ? {
      ok: true,
      state: 'RECONCILED_PLATFORM_SUCCESS',
      platformPostId: match.id,
      actualDestination: organizationUrnFor(organizationId),
      publishedAt: match.publishedAt || match.createdAt || null,
      permalink: linkedInFeedUrl(match.id),
      duplicateCount: matches.length > 1 ? matches.length - 1 : 0
    }
    : { ok: false, state: 'NO_RECENT_LINKEDIN_MATCH_FOUND' };
}

export function linkedInImagePostPayload({ organizationId, caption, imageUrn, altText = '', title = '' }) {
  const media = { id: imageUrn };
  if (title) media.title = title;
  if (altText) media.altText = altText.slice(0, 4086);
  return {
    author: organizationUrnFor(organizationId),
    commentary: caption,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    content: { media },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  };
}

export function organizationUrnFor(organizationId) {
  return String(organizationId || '').startsWith('urn:li:organization:')
    ? String(organizationId)
    : `urn:li:organization:${organizationId}`;
}

async function uploadLinkedInImage({ organizationId, asset }) {
  const init = await linkedInFetch('/images?action=initializeUpload', {
    method: 'POST',
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: organizationUrnFor(organizationId)
      }
    })
  });
  if (!init.ok) {
    return {
      ok: false,
      state: 'LINKEDIN_IMAGE_UPLOAD_INITIALIZE_FAILED',
      status: init.status,
      message: init.json?.message || ''
    };
  }

  const uploadUrl = init.json?.value?.uploadUrl;
  const imageUrn = init.json?.value?.image;
  if (!uploadUrl || !imageUrn) return { ok: false, state: 'LINKEDIN_IMAGE_UPLOAD_INITIALIZE_INCOMPLETE' };

  const upload = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': asset.mimeType },
    body: asset.body
  });
  if (!upload.ok) {
    return {
      ok: false,
      state: 'LINKEDIN_IMAGE_BINARY_UPLOAD_FAILED',
      status: upload.status,
      imageUrn
    };
  }

  return { ok: true, state: 'LINKEDIN_IMAGE_UPLOADED', imageUrn, mimeType: asset.mimeType, sha256: asset.sha256 };
}

async function fetchImageAsset(imageUrl) {
  const response = await fetch(imageUrl, { cache: 'no-store' });
  if (!response.ok) return { ok: false, state: 'LINKEDIN_MEDIA_FETCH_FAILED', status: response.status };
  const mimeType = String(response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) {
    return {
      ok: false,
      state: 'LINKEDIN_UNSUPPORTED_IMAGE_MIME_TYPE',
      mimeType,
      supportedMimeTypes: Array.from(SUPPORTED_IMAGE_TYPES)
    };
  }
  const body = Buffer.from(await response.arrayBuffer());
  return {
    ok: true,
    state: 'LINKEDIN_MEDIA_FETCHED',
    body,
    mimeType,
    byteLength: body.length,
    sha256: await sha256Hex(body)
  };
}

async function readLinkedInPost(postUrn) {
  const encoded = encodeURIComponent(postUrn);
  const result = await linkedInFetch(`/posts/${encoded}?viewContext=AUTHOR`);
  return result.ok
    ? { ok: true, state: 'LINKEDIN_POST_READBACK_OK', json: result.json }
    : { ok: false, state: 'LINKEDIN_POST_READBACK_FAILED', status: result.status, message: result.json?.message || '' };
}

async function linkedInFetch(path, init = {}) {
  const headers = {
    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
    'Linkedin-Version': LINKEDIN_API_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
    ...(init.headers || {})
  };
  const response = await fetch(`${REST_BASE}${path}`, { ...init, headers });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, response, json: sanitize(json) };
}

function linkedInFeedUrl(postUrn) {
  return `https://www.linkedin.com/feed/update/${postUrn}/`;
}

async function sha256Hex(buffer) {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(buffer).digest('hex');
}

function sanitize(input) {
  if (Array.isArray(input)) return input.map(sanitize);
  if (input && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [
      key,
      /token|secret|authorization/i.test(key) ? '[REDACTED]' : sanitize(value)
    ]));
  }
  return input;
}
