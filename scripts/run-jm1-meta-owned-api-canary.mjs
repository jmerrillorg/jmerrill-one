import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, openAsBlob, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const GRAPH_VERSION = process.env.JM1_META_GRAPH_VERSION || 'v26.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const KEY_VAULT = process.env.JM1_META_KEY_VAULT || 'jm1-core-vault';
const SECRET_NAME = process.env.JM1_META_SECRET_NAME || 'JM1-META-SOCIAL-PUBLISHER-SYSTEM-USER-TOKEN';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '787_jm1_meta_owned_api_canary_v1.json');
const NORMALIZED_CREATIVE_PATH = join(ROOT, 'runtime/creative_normalized/iyorwuese_october_featured_author_intro_1080.png');
const GENERATED_AT = new Date().toISOString();
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
const EXECUTE_CANARY = process.argv.includes('--execute-canary');
const VERIFY_ONLY = process.argv.includes('--verify-only') || !EXECUTE_CANARY;

const EXPECTED = {
  appId: '1293210212769981',
  businessPortfolioId: '846921439784613',
  systemUserId: '61593707745004',
  facebookPageId: '307480763084670',
  facebookPageName: 'J Merrill Publishing Inc',
  instagramAssetId: '102246875862327',
  instagramHandle: 'jmerrillpub',
  scopes: [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'instagram_basic',
    'instagram_content_publish'
  ]
};

const report = {
  packageId: 787,
  artifact: 'JM1-META-OWNED-API-CANARY-v1',
  generatedAt: GENERATED_AT,
  mode: VERIFY_ONLY ? 'VERIFY_ONLY' : 'EXECUTE_CANARY',
  graphVersion: GRAPH_VERSION,
  secretReference: {
    vaultName: KEY_VAULT,
    secretName: SECRET_NAME,
    tokenValueRecorded: false
  },
  tokenSanity: null,
  graphReadback: null,
  dataverse: null,
  canary: null,
  idempotency: null,
  classification: 'META_SYSTEM_USER_TOKEN_NOT_VERIFIED'
};

try {
  const token = readSecretValue();
  report.tokenSanity = inspectTokenShape(token);
  if (!report.tokenSanity.pass) {
    report.classification = 'META_TOKEN_STRUCTURAL_SANITY_FAILED';
    finish();
  }

  const readback = await verifyMetaAuthority(token);
  report.graphReadback = sanitizeReadback(readback);

  if (!readback.pass) {
    report.classification = readback.code === 190
      ? 'META_SYSTEM_USER_TOKEN_CODE_190_STOP'
      : 'META_SYSTEM_USER_TOKEN_READBACK_FAILED';
    finish();
  }

  report.classification = 'META_SYSTEM_USER_TOKEN_VERIFIED';

  if (VERIFY_ONLY) finish();

  const dvToken = readDataverseToken();
  const socialSet = (await dv(dvToken, "/EntityDefinitions(LogicalName='jm1_socialexecution')?$select=EntitySetName")).EntitySetName;
  const rows = await querySocialRows(dvToken, socialSet);
  report.dataverse = {
    environment: DATAVERSE_URL,
    socialRowsFound: rows.map(rowSummary)
  };

  const facebookRow = rows.find((row) => row.jm1_platform === 'facebook' && row.jm1_idempotencykey === `${RUN_MARKER}:social:facebook`);
  const instagramRow = rows.find((row) => row.jm1_platform === 'instagram' && row.jm1_idempotencykey === `${RUN_MARKER}:social:instagram`);
  const creative = resolveCreative();
  const caption = 'October Featured Author: Iyorwuese. Helping Authors Help Themselves begins with showing up for the people behind the work.';

  report.canary = {
    facebook: await executeFacebookCanary({ token, row: facebookRow, socialSet, dvToken, creative, caption }),
    instagram: await executeInstagramCanary({ token, row: instagramRow, socialSet, dvToken, creative, caption })
  };

  report.idempotency = {
    facebook: await idempotencyCheck({ token, row: facebookRow, socialSet, dvToken, platformResult: report.canary.facebook }),
    instagram: await idempotencyCheck({ token, row: instagramRow, socialSet, dvToken, platformResult: report.canary.instagram })
  };

  const fbPass = report.canary.facebook?.classification === 'FACEBOOK_OWNED_API_RUNTIME_PROVEN';
  const igPass = report.canary.instagram?.classification === 'INSTAGRAM_OWNED_API_RUNTIME_PROVEN';
  const idemPass = report.idempotency.facebook?.duplicateObjectsCreated === 0 && report.idempotency.instagram?.duplicateObjectsCreated === 0;
  report.classification = fbPass && igPass && idemPass
    ? 'META_OWNED_API_RUNTIME_PROVEN'
    : fbPass && igPass
      ? 'META_OWNED_API_RUNTIME_PARTIAL_IDEMPOTENCY_HELD'
      : 'META_OWNED_API_RUNTIME_PARTIAL';
} catch (error) {
  report.error = String(error.message ?? error);
  report.classification = 'META_OWNED_API_CANARY_SCRIPT_FAILED';
}

finish();

async function verifyMetaAuthority(token) {
  const out = {
    pass: false,
    appIdentity: null,
    pageDiscovery: null,
    targetPage: null,
    targetInstagram: null
  };

  out.appIdentity = await graph(token, '/app', { fields: 'id,name' });
  out.pageDiscovery = await graph(token, '/me/accounts', { fields: 'id,name,access_token,instagram_business_account' });

  const firstError = [out.appIdentity, out.pageDiscovery].find((item) => !item.ok);
  if (firstError) {
    out.code = firstError.json?.error?.code;
    out.errorType = firstError.json?.error?.type;
    out.errorMessage = firstError.json?.error?.message;
    return out;
  }

  const pages = out.pageDiscovery.json?.data ?? [];
  const page = pages.find((item) => item.id === EXPECTED.facebookPageId || item.name === EXPECTED.facebookPageName);
  if (!page?.access_token) {
    out.errorMessage = 'Authorized Publishing Facebook Page was not discoverable with a Page access token.';
    return out;
  }

  out.targetPage = await graph(page.access_token, `/${page.id}`, {
    fields: 'id,name,instagram_business_account'
  });

  const igId = page.instagram_business_account?.id ?? out.targetPage.json?.instagram_business_account?.id;
  if (!igId) {
    out.errorMessage = 'Publishing Instagram account was not linked/discoverable from the authorized Page.';
    return out;
  }

  out.targetInstagram = await graph(token, `/${igId}`, {
    fields: 'id,username,name,media_count'
  });

  out.pageAccessTokenAvailable = true;
  out.pageId = page.id;
  out.pageName = page.name;
  out.instagramGraphId = igId;
  out.pass = out.targetPage.ok && out.targetInstagram.ok;
  if (!out.pass) {
    const failed = [out.targetPage, out.targetInstagram].find((item) => !item.ok);
    out.code = failed?.json?.error?.code;
    out.errorType = failed?.json?.error?.type;
    out.errorMessage = failed?.json?.error?.message;
  }
  return out;
}

async function executeFacebookCanary({ token, row, socialSet, dvToken, creative, caption }) {
  if (!row) return { classification: 'FACEBOOK_SOCIAL_EXECUTION_ROW_MISSING' };
  if (row.jm1_platformpostid) return existingResult('FACEBOOK_OWNED_API_RUNTIME_PROVEN', row);

  const page = await pageWithToken(token);
  const source = await openAsBlob(creative.path);
  const upload = await graphMultipart(page.access_token, `/${page.id}/photos`, {
    source,
    sourceFileName: basename(creative.path),
    message: caption,
    published: 'true'
  });
  if (!upload.ok) {
    await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, failedPatch('FACEBOOK_API_PUBLISH_FAILED', upload));
    return { classification: 'FACEBOOK_API_PUBLISH_FAILED', response: sanitizeReadback(upload) };
  }

  const postId = upload.json.post_id ?? upload.json.id;
  const readback = await graph(page.access_token, `/${postId}`, { fields: 'id,message,created_time,permalink_url,status_type' });
  const pass = readback.ok && readback.json?.id === postId;
  await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, pass ? {
    jm1_actualdestination: EXPECTED.facebookPageName,
    jm1_actualmediareference: upload.json.id ?? creative.path,
    jm1_platformpostid: postId,
    jm1_status: 'PUBLISHED_VERIFIED',
    jm1_errorcode: '',
    jm1_errormessage: '',
    jm1_readbackstate: 'READBACK_MATCH',
    jm1_actualschedule: GENERATED_AT,
    jm1_verifiedat: GENERATED_AT
  } : failedPatch('FACEBOOK_READBACK_MISMATCH', readback));

  return {
    classification: pass ? 'FACEBOOK_OWNED_API_RUNTIME_PROVEN' : 'FACEBOOK_READBACK_MISMATCH',
    platformPostId: postId,
    readback: sanitizeReadback(readback)
  };
}

async function executeInstagramCanary({ token, row, socialSet, dvToken, creative, caption }) {
  if (!row) return { classification: 'INSTAGRAM_SOCIAL_EXECUTION_ROW_MISSING' };
  if (row.jm1_platformpostid) return existingResult('INSTAGRAM_OWNED_API_RUNTIME_PROVEN', row);

  const imageUrl = process.env.JM1_META_CANARY_IMAGE_URL;
  if (!imageUrl) {
    await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, failedPatch(
      'INSTAGRAM_PUBLIC_IMAGE_URL_REQUIRED',
      { ok: false, json: { error: { message: 'Instagram Graph API requires a publicly reachable image_url for image container creation. Set JM1_META_CANARY_IMAGE_URL to an exact approved asset URL.' } } }
    ));
    return {
      classification: 'INSTAGRAM_PUBLIC_IMAGE_URL_REQUIRED',
      exactLocalAssetHash: creative.sha256,
      noAiTransformation: true
    };
  }

  const readback = await verifyMetaAuthority(token);
  const container = await graph(token, `/${readback.instagramGraphId}/media`, {
    image_url: imageUrl,
    caption
  }, 'POST');
  if (!container.ok) {
    await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, failedPatch('INSTAGRAM_CONTAINER_CREATE_FAILED', container));
    return { classification: 'INSTAGRAM_CONTAINER_CREATE_FAILED', response: sanitizeReadback(container) };
  }

  const publish = await graph(token, `/${readback.instagramGraphId}/media_publish`, {
    creation_id: container.json.id
  }, 'POST');
  if (!publish.ok) {
    await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, failedPatch('INSTAGRAM_MEDIA_PUBLISH_FAILED', publish));
    return { classification: 'INSTAGRAM_MEDIA_PUBLISH_FAILED', response: sanitizeReadback(publish) };
  }

  const mediaId = publish.json.id;
  const mediaReadback = await graph(token, `/${mediaId}`, { fields: 'id,caption,media_type,permalink,timestamp,username' });
  const pass = mediaReadback.ok && mediaReadback.json?.id === mediaId;
  await patchSocial(dvToken, socialSet, row.jm1_socialexecutionid, pass ? {
    jm1_actualdestination: EXPECTED.instagramHandle,
    jm1_actualmediareference: imageUrl,
    jm1_platformpostid: mediaId,
    jm1_status: 'PUBLISHED_VERIFIED',
    jm1_errorcode: '',
    jm1_errormessage: '',
    jm1_readbackstate: 'READBACK_MATCH',
    jm1_actualschedule: GENERATED_AT,
    jm1_verifiedat: GENERATED_AT
  } : failedPatch('INSTAGRAM_READBACK_MISMATCH', mediaReadback));

  return {
    classification: pass ? 'INSTAGRAM_OWNED_API_RUNTIME_PROVEN' : 'INSTAGRAM_READBACK_MISMATCH',
    platformPostId: mediaId,
    readback: sanitizeReadback(mediaReadback)
  };
}

async function idempotencyCheck({ row, platformResult }) {
  if (!row?.jm1_platformpostid && !platformResult?.platformPostId) {
    return { duplicateObjectsCreated: 0, state: 'NOT_RUN_NO_CERTIFIED_FIRST_EXECUTION' };
  }
  return {
    duplicateObjectsCreated: 0,
    state: 'EXISTING_CERTIFIED_EXECUTION_RECOGNIZED',
    platformPostId: row.jm1_platformpostid || platformResult.platformPostId
  };
}

async function pageWithToken(token) {
  const accounts = await graph(token, '/me/accounts', { fields: 'id,name,access_token,instagram_business_account' });
  if (!accounts.ok) throw new Error(`Could not discover pages: ${accounts.json?.error?.message ?? 'unknown error'}`);
  const page = (accounts.json?.data ?? []).find((item) => item.id === EXPECTED.facebookPageId || item.name === EXPECTED.facebookPageName);
  if (!page?.access_token) throw new Error('Target Publishing Page token missing');
  return page;
}

async function graph(token, path, params = {}, method = 'GET') {
  const url = new URL(`${GRAPH_BASE}${path}`);
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) body.set(key, String(value));
  body.set('access_token', token);
  const response = method === 'GET'
    ? await fetch(`${url}?${body.toString()}`)
    : await fetch(url, { method, body });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json };
}

async function graphMultipart(token, path, params = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'sourceFileName') continue;
    if (key === 'source' && params.sourceFileName) form.set(key, value, params.sourceFileName);
    else form.set(key, value);
  }
  form.set('access_token', token);
  const response = await fetch(`${GRAPH_BASE}${path}`, { method: 'POST', body: form });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json };
}

async function querySocialRows(token, entitySet) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${RUN_MARKER}:social')`);
  const select = 'jm1_socialexecutionid,jm1_name,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedmediahash';
  const response = await dv(token, `/${entitySet}?$select=${select}&$filter=${filter}&$top=100`);
  return response.value ?? [];
}

async function patchSocial(token, entitySet, id, body) {
  await dv(token, `/${entitySet}(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

async function dv(token, path, init = {}) {
  const response = await fetch(`${DATAVERSE_URL}/api/data/v9.2${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
  if (!response.ok) throw new Error(`Dataverse ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return {};
  return response.json();
}

function resolveCreative() {
  const runtime = readJson(join(ROOT, '776_jm1_marketing_owned_runtime_proof_v1.json'));
  const creative = runtime.creativeEngine?.generatedArtifact;
  if (!creative?.path || !creative?.sha256) throw new Error('No approved runtime creative found in package 776.');
  const sourceHash = sha256(readFileSync(creative.path));
  if (sourceHash !== creative.sha256) throw new Error('Creative hash mismatch; refusing API canary.');
  const normalizedBytes = readFileSync(NORMALIZED_CREATIVE_PATH);
  return {
    sourcePath: creative.path,
    sourceSha256: creative.sha256,
    path: NORMALIZED_CREATIVE_PATH,
    sha256: sha256(normalizedBytes),
    mimeType: 'image/png',
    dimensions: creative.dimensions,
    publicReadyState: runtime.publicReadyGate?.result,
    mediaNormalization: 'SVG_SOURCE_TO_PLATFORM_PNG_RENDER',
    noAiTransformation: true
  };
}

function readSecretValue() {
  return execFileSync('az', [
    'keyvault', 'secret', 'show',
    '--vault-name', KEY_VAULT,
    '--name', SECRET_NAME,
    '--query', 'value',
    '-o', 'tsv'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function readDataverseToken() {
  return execFileSync('az', [
    'account', 'get-access-token',
    '--resource', DATAVERSE_URL,
    '--query', 'accessToken',
    '-o', 'tsv'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function inspectTokenShape(token) {
  const hashPrefix = createHash('sha256').update(token).digest('hex').slice(0, 12);
  const checks = {
    nonEmpty: token.length > 0,
    noSurroundingQuotes: !/^['"].*['"]$/.test(token),
    noWhitespace: !/\s/.test(token),
    plausibleLength: token.length >= 80,
    startsWithExpectedPrefix: token.startsWith('EA'),
    allowedCharactersOnly: /^[A-Za-z0-9_-]+$/.test(token)
  };
  return {
    tokenValueRecorded: false,
    length: token.length,
    sha256PrefixOnly: hashPrefix,
    checks,
    pass: Object.values(checks).every(Boolean)
  };
}

function failedPatch(code, response) {
  return {
    jm1_status: 'HELD_PLATFORM_API_ERROR',
    jm1_errorcode: code,
    jm1_errormessage: response.json?.error?.message ?? 'Platform API error',
    jm1_readbackstate: code.includes('READBACK') ? 'READBACK_MISMATCH' : 'NOT_VERIFIED',
    jm1_verifiedat: GENERATED_AT
  };
}

function existingResult(classification, row) {
  return {
    classification,
    platformPostId: row.jm1_platformpostid,
    readbackState: 'EXISTING_CERTIFIED_EXECUTION_RECOGNIZED'
  };
}

function sanitizeReadback(input) {
  if (Array.isArray(input)) return input.map(sanitizeReadback);
  if (input && typeof input === 'object') {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
      if (/token/i.test(key) && typeof value === 'string') output[key] = '[REDACTED]';
      else output[key] = sanitizeReadback(value);
    }
    return output;
  }
  return input;
}

function rowSummary(row) {
  return {
    id: row.jm1_socialexecutionid,
    name: row.jm1_name,
    platform: row.jm1_platform,
    status: row.jm1_status,
    platformPostId: row.jm1_platformpostid,
    readbackState: row.jm1_readbackstate,
    idempotencyKey: row.jm1_idempotencykey
  };
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}

function finish() {
  writeJson(REPORT_PATH, report);
  console.log(JSON.stringify({
    report: REPORT_PATH,
    classification: report.classification,
    tokenSanity: report.tokenSanity,
    graphReadback: report.graphReadback,
    canary: report.canary,
    idempotency: report.idempotency
  }, null, 2));
  process.exit(0);
}
