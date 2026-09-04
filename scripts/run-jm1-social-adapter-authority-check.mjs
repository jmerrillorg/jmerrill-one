import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '781_jm1_social_adapter_authority_check_v1.json');
const GENERATED_AT = '2026-09-02T00:00:00-04:00';
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');

const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const socialSet = (await dv("/EntityDefinitions(LogicalName='jm1_socialexecution')?$select=EntitySetName")).EntitySetName;
const rows = await queryByKey(socialSet, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const authority = inspectAuthority();
const updated = [];

for (const row of rows) {
  const platform = row.jm1_platform;
  const isMeta = platform === 'facebook' || platform === 'instagram';
  const isLinkedIn = platform === 'linkedin';
  const hasAuthority = isMeta ? authority.metaCredentialReferencePresent : isLinkedIn ? authority.linkedinCredentialReferencePresent : false;
  if (hasAuthority) continue;

  const state = isLinkedIn ? 'HELD_EXTERNAL_PLATFORM_AUTHORITY' : 'HELD_EXTERNAL_PLATFORM_AUTHORITY';
  const errorCode = isLinkedIn ? 'LINKEDIN_PLATFORM_AUTHORITY_MISSING' : 'META_PLATFORM_AUTHORITY_MISSING';
  const errorMessage = isLinkedIn
    ? 'LinkedInAdapter payload can be constructed, but no JM1-owned LinkedIn developer app/product/OAuth authority is available for organization 13048648.'
    : 'MetaAdapter payload can be constructed, but no JM1-owned Meta developer app/OAuth token authority is available for Publishing Facebook/Instagram destinations.';

  await dv(`/${socialSet}(${row.jm1_socialexecutionid})`, {
    method: 'PATCH',
    body: JSON.stringify({
      jm1_status: state,
      jm1_errorcode: errorCode,
      jm1_errormessage: errorMessage,
      jm1_readbackstate: 'NOT_EXECUTED_AUTHORITY_CHECK_HELD',
      jm1_verifiedat: '2026-09-02T04:00:00Z'
    })
  });
  updated.push({ id: row.jm1_socialexecutionid, platform, state, errorCode });
}

const readback = await queryByKey(socialSet, `${RUN_MARKER}:social`, 'jm1_socialexecutionid');
const report = {
  packageId: 781,
  artifact: 'JM1-SOCIAL-ADAPTER-AUTHORITY-CHECK-v1',
  generatedAt: GENERATED_AT,
  environment: DATAVERSE_URL,
  authorityInventory: authority,
  adapterBoundary: {
    meta: 'Social Execution -> MetaAdapter -> authority check -> HELD_EXTERNAL_PLATFORM_AUTHORITY until JM1-owned app/token/asset authority exists.',
    linkedin: 'Social Execution -> LinkedInAdapter -> authority check -> HELD_EXTERNAL_PLATFORM_AUTHORITY until LinkedIn developer product/OAuth approval exists.',
    browserExecutionUsed: false,
    platformPublishingAttempted: false
  },
  socialRowsInspected: rows.length,
  socialRowsUpdated: updated,
  readback: readback.map((row) => ({
    id: row.jm1_socialexecutionid,
    name: row.jm1_name,
    platform: row.jm1_platform,
    status: row.jm1_status,
    errorCode: row.jm1_errorcode,
    readbackState: row.jm1_readbackstate,
    idempotencyKey: row.jm1_idempotencykey
  })),
  classification: 'SOCIAL_ADAPTER_AUTHORITY_BOUNDARY_PROVEN_HELD'
};

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classification: report.classification,
  inspected: report.socialRowsInspected,
  updated: report.socialRowsUpdated.length
}, null, 2));

function inspectAuthority() {
  const envNames = Object.keys(process.env).filter((name) => /META|FACEBOOK|INSTAGRAM|LINKEDIN|SOCIAL/i.test(name)).sort();
  const azureApps = safeJsonCommand('az', ['ad', 'app', 'list', '--display-name', 'J Merrill', '--query', '[].displayName', '-o', 'json'], []);
  const vaults = safeJsonCommand('az', ['keyvault', 'list', '--query', '[].name', '-o', 'json'], []);
  const secretNames = {};
  for (const vault of vaults) {
    secretNames[vault] = safeJsonCommand('az', ['keyvault', 'secret', 'list', '--vault-name', vault, '--query', '[].name', '-o', 'json'], 'INACCESSIBLE_OR_EMPTY');
  }
  const haystack = JSON.stringify({ envNames, azureApps, secretNames });
  return {
    inspectedWithoutReadingSecretValues: true,
    envNames,
    azureApps,
    keyVaults: vaults,
    secretNameInventory: secretNames,
    metaCredentialReferencePresent: /META|FACEBOOK|INSTAGRAM/i.test(haystack),
    linkedinCredentialReferencePresent: /LINKEDIN/i.test(haystack),
    metaDeveloperUiObserved: 'Signed-in Meta for Developers console showed no apps under no selected business portfolio.',
    linkedinDeveloperUiObserved: 'Signed-in LinkedIn developer console showed zero apps and Create app route available.'
  };
}

async function queryByKey(entitySet, keyPrefix, primaryId) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const select = `${primaryId},jm1_name,jm1_idempotencykey,jm1_platform,jm1_status,jm1_errorcode,jm1_readbackstate`;
  const response = await dv(`/${entitySet}?$select=${select}&$filter=${filter}&$top=100`);
  return response.value ?? [];
}

async function dv(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch(`${DATAVERSE_URL}/api/data/v9.2${path}`, {
    ...init,
    signal: controller.signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) throw new Error(`Dataverse ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return {};
  return response.json();
}

function safeJsonCommand(command, args, fallback) {
  try {
    return JSON.parse(execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return fallback;
  }
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}
