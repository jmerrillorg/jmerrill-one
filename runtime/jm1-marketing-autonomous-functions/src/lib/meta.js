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

async function graph(path, params = {}, method = 'GET') {
  const body = new URLSearchParams(params);
  body.set('access_token', META_SYSTEM_USER_TOKEN);
  const url = `${GRAPH_BASE}${path}`;
  const response = method === 'GET'
    ? await fetch(`${url}?${body.toString()}`)
    : await fetch(url, { method, body });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json: sanitize(json) };
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
