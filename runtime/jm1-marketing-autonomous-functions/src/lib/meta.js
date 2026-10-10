import { META_GRAPH_VERSION, META_SYSTEM_USER_TOKEN } from './config.js';

const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export async function verifyMetaAuthority(expected) {
  if (!META_SYSTEM_USER_TOKEN) return { ok: false, state: 'META_TOKEN_REFERENCE_NOT_RESOLVED' };

  const accounts = await graph('/me/accounts', {
    fields: 'id,name,instagram_business_account'
  });
  if (!accounts.ok) return { ok: false, state: 'META_PAGE_DISCOVERY_FAILED', status: accounts.status, message: accounts.json?.error?.message };

  const page = (accounts.json.data || []).find((item) => item.id === expected.facebookPageId || item.name === expected.facebookPageName);
  if (!page) return { ok: false, state: 'META_PUBLISHING_PAGE_NOT_FOUND' };

  const igId = page.instagram_business_account?.id;
  if (expected.instagramGraphId && igId !== expected.instagramGraphId) {
    return { ok: false, state: 'META_IG_READBACK_MISMATCH', actualInstagramGraphId: igId };
  }

  return {
    ok: true,
    state: 'META_SYSTEM_USER_TOKEN_VERIFIED',
    pageId: page.id,
    pageName: page.name,
    instagramGraphId: igId || null
  };
}

export async function publishFacebookPhoto({ expected, caption, imageUrl }) {
  if (!caption || !imageUrl) {
    return { ok: false, state: 'META_EXACT_MEDIA_OR_CAPTION_MISSING' };
  }

  const page = await pageWithAccessToken(expected);
  if (!page.ok) return page;

  const publish = await graphWriteWithToken(page.accessToken, `/${page.id}/photos`, {
    url: imageUrl,
    message: caption,
    published: 'true'
  }, 'FACEBOOK_PUBLISH_OUTCOME_AMBIGUOUS');
  if (!publish.ok) {
    return {
      ok: false,
      state: publish.state || 'FACEBOOK_PUBLISH_FAILED',
      outcomeAmbiguous: publish.outcomeAmbiguous || false,
      status: publish.status,
      message: publish.json?.error?.message
    };
  }

  const postId = publish.json.post_id || publish.json.id;
  const readback = await graphWithToken(page.accessToken, `/${postId}`, {
    fields: 'id,from,message,created_time,permalink_url,status_type'
  });
  if (!readback.ok) {
    return {
      ok: false,
      state: 'FACEBOOK_READBACK_FAILED',
      outcomeAmbiguous: true,
      status: readback.status,
      platformPostId: postId,
      message: readback.json?.error?.message
    };
  }

  const matchesDestination = readback.json.from?.id === expected.facebookPageId;
  return {
    ok: matchesDestination,
    state: matchesDestination ? 'PUBLISHED_VERIFIED' : 'READBACK_MISMATCH',
    readbackState: matchesDestination ? 'READBACK_MATCH' : 'READBACK_MISMATCH',
    platformPostId: postId,
    actualDestination: page.name,
    publishedAt: readback.json.created_time || null,
    permalink: readback.json.permalink_url || null,
    readback: readback.json
  };
}

export async function publishInstagramPhoto({ expected, caption, imageUrl }) {
  if (!caption || !imageUrl) {
    return { ok: false, state: 'META_EXACT_MEDIA_OR_CAPTION_MISSING' };
  }

  const authority = await verifyMetaAuthority(expected);
  if (!authority.ok) return authority;

  const container = await graph(`/${authority.instagramGraphId}/media`, {
    image_url: imageUrl,
    caption
  }, 'POST');
  if (!container.ok) {
    return {
      ok: false,
      state: 'INSTAGRAM_CONTAINER_CREATE_FAILED',
      status: container.status,
      message: container.json?.error?.message
    };
  }

  const mediaId = container.json.id;
  const publish = await graphWrite(`/${authority.instagramGraphId}/media_publish`, {
    creation_id: mediaId
  }, 'INSTAGRAM_PUBLISH_OUTCOME_AMBIGUOUS');
  if (!publish.ok) {
    return {
      ok: false,
      state: publish.state || 'INSTAGRAM_PUBLISH_FAILED',
      outcomeAmbiguous: publish.outcomeAmbiguous || false,
      status: publish.status,
      mediaContainerId: mediaId,
      message: publish.json?.error?.message
    };
  }

  const platformPostId = publish.json.id;
  const readback = await graph(`/${platformPostId}`, {
    fields: 'id,caption,media_type,media_url,permalink,timestamp,username'
  });
  if (!readback.ok) {
    return {
      ok: false,
      state: 'INSTAGRAM_READBACK_FAILED',
      outcomeAmbiguous: true,
      status: readback.status,
      platformPostId,
      message: readback.json?.error?.message
    };
  }

  const matchesDestination = readback.json.username === expected.instagramHandle;
  return {
    ok: matchesDestination,
    state: matchesDestination ? 'PUBLISHED_VERIFIED' : 'READBACK_MISMATCH',
    readbackState: matchesDestination ? 'READBACK_MATCH' : 'READBACK_MISMATCH',
    mediaContainerId: mediaId,
    platformPostId,
    actualDestination: readback.json.username || null,
    publishedAt: readback.json.timestamp || null,
    permalink: readback.json.permalink || null,
    readback: readback.json
  };
}

export async function findRecentMatchingMetaObject({ expected, platform, caption, attemptedAt }) {
  if (!caption || !attemptedAt) return { ok: false, state: 'META_RECONCILIATION_EXACT_CONTENT_OR_ATTEMPT_TIME_MISSING' };
  const expectedCaption = normalizeCaption(caption);
  const expectedTime = Date.parse(attemptedAt);
  if (!Number.isFinite(expectedTime)) return { ok: false, state: 'META_RECONCILIATION_ATTEMPT_TIME_INVALID' };

  if (platform === 'instagram') {
    const authority = await verifyMetaAuthority(expected);
    if (!authority.ok) return authority;
    const media = await graph(`/${authority.instagramGraphId}/media`, {
      fields: 'id,caption,media_type,permalink,timestamp,username',
      limit: '50'
    });
    if (!media.ok) return { ok: false, state: 'INSTAGRAM_RECONCILIATION_READBACK_FAILED', status: media.status, message: media.json?.error?.message };
    const matches = (media.json.data || [])
      .filter((item) => normalizeCaption(item.caption) === expectedCaption
        && item.username === expected.instagramHandle
        && isWithinAttemptWindow(item.timestamp, expectedTime))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const match = matches[0];
    return match
      ? {
        ok: true,
        state: 'RECONCILED_PLATFORM_SUCCESS',
        platformPostId: match.id,
        actualDestination: match.username,
        publishedAt: match.timestamp || null,
        permalink: match.permalink || null,
        duplicateCount: matches.length > 1 ? matches.length - 1 : 0
      }
      : { ok: false, state: 'NO_RECENT_INSTAGRAM_MATCH_FOUND' };
  }

  if (platform === 'facebook') {
    const page = await pageWithAccessToken(expected);
    if (!page.ok) return page;
    const photos = await graphWithToken(page.accessToken, `/${page.id}/photos`, {
      type: 'uploaded',
      fields: 'id,name,created_time,link,from',
      limit: '50'
    });
    if (!photos.ok) return { ok: false, state: 'FACEBOOK_RECONCILIATION_READBACK_FAILED', status: photos.status, message: photos.json?.error?.message };
    const matches = (photos.json.data || [])
      .filter((item) => normalizeCaption(item.name) === expectedCaption
        && item.from?.id === expected.facebookPageId
        && isWithinAttemptWindow(item.created_time, expectedTime))
      .sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
    const match = matches[0];
    return match
      ? {
        ok: true,
        state: 'RECONCILED_PLATFORM_SUCCESS',
        platformPostId: match.id,
        actualDestination: page.name,
        publishedAt: match.created_time || null,
        permalink: match.link || null,
        duplicateCount: matches.length > 1 ? matches.length - 1 : 0
      }
      : { ok: false, state: 'NO_RECENT_FACEBOOK_MATCH_FOUND' };
  }

  return { ok: false, state: 'META_RECONCILIATION_UNSUPPORTED_PLATFORM' };
}

function normalizeCaption(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isWithinAttemptWindow(value, expectedTime) {
  const actualTime = Date.parse(value || '');
  return Number.isFinite(actualTime) && Math.abs(actualTime - expectedTime) <= 60 * 60 * 1000;
}

async function pageWithAccessToken(expected) {
  const accounts = await graph('/me/accounts', {
    fields: 'id,name,access_token,instagram_business_account'
  }, 'GET', false);
  if (!accounts.ok) return { ok: false, state: 'META_PAGE_DISCOVERY_FAILED', status: accounts.status, message: accounts.json?.error?.message };

  const page = (accounts.json.data || []).find((item) => item.id === expected.facebookPageId || item.name === expected.facebookPageName);
  if (!page) return { ok: false, state: 'META_PUBLISHING_PAGE_NOT_FOUND' };
  if (!page.access_token) return { ok: false, state: 'META_PAGE_ACCESS_TOKEN_NOT_RETURNED' };
  return { ok: true, id: page.id, name: page.name, accessToken: page.access_token };
}

async function graph(path, params = {}, method = 'GET', shouldSanitize = true) {
  return graphWithToken(META_SYSTEM_USER_TOKEN, path, params, method, shouldSanitize);
}

async function graphWithToken(token, path, params = {}, method = 'GET', shouldSanitize = true) {
  const body = new URLSearchParams(params);
  body.set('access_token', token);
  const url = `${GRAPH_BASE}${path}`;
  const response = method === 'GET'
    ? await fetch(`${url}?${body.toString()}`)
    : await fetch(url, { method, body });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json: shouldSanitize ? sanitize(json) : json };
}

async function graphWriteWithToken(token, path, params, ambiguousState) {
  try {
    const result = await graphWithToken(token, path, params, 'POST');
    if (!result.ok && result.status >= 500) {
      return { ...result, state: ambiguousState, outcomeAmbiguous: true };
    }
    return result;
  } catch {
    return { ok: false, status: null, state: ambiguousState, outcomeAmbiguous: true, json: {} };
  }
}

async function graphWrite(path, params, ambiguousState) {
  return graphWriteWithToken(META_SYSTEM_USER_TOKEN, path, params, ambiguousState);
}

function sanitize(input) {
  if (Array.isArray(input)) return input.map(sanitize);
  if (input && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [
      key,
      /token/i.test(key) ? '[REDACTED]' : sanitize(value)
    ]));
  }
  return input;
}
