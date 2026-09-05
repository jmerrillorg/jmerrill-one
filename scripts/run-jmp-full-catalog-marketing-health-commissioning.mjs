#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateFullCatalogMarketingHealth, selectFullCatalogCandidate, summarizeFullCatalogMarketingHealth } from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const execute = process.argv.includes('--execute');
const resource = (process.env.DATAVERSE_ENVIRONMENT_URL || 'https://jm1hq.crm.dynamics.com').replace(/\/$/, '');
const api = `${resource}/api/data/v9.2`;
const evidenceDir = 'JMP-Full-Catalog-Marketing-Health-Autonomous-Commissioning-v1';
const generatedAt = new Date().toISOString();
const headers = { Authorization: `Bearer ${token()}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0' };

async function request(path, init = {}, optional = false) {
  const response = await fetch(`${api}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await response.text(); const body = text ? JSON.parse(text) : {};
  if (!response.ok && optional) return null;
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path}: ${response.status} ${body.error?.message || text.slice(0, 500)}`);
  return body;
}
const label = (Label) => ({ LocalizedLabels: [{ Label, LanguageCode: 1033 }], UserLocalizedLabel: { Label, LanguageCode: 1033 } });
const required = () => ({ Value: 'None', CanBeChanged: true, ManagedPropertyLogicalName: 'canmodifyrequirementlevelsettings' });

async function ensureSchema() {
  const logical = 'jm1pub_titlemarketinghealth';
  let entity = await request(`/EntityDefinitions(LogicalName='${logical}')?$select=MetadataId,EntitySetName`, {}, true);
  const actions = [];
  if (!entity) {
    actions.push('CREATE_TABLE');
    if (execute) await request('/EntityDefinitions', { method: 'POST', body: JSON.stringify({
      '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata', SchemaName: 'jm1pub_TitleMarketingHealth', DisplayName: label('Title Marketing Health'), DisplayCollectionName: label('Title Marketing Health'),
      Description: label('Downstream full-catalog marketing disposition derived from governed Publishing authority.'), OwnershipType: 'OrganizationOwned', IsActivity: false, HasActivities: false, HasNotes: false,
      Attributes: [{ '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata', SchemaName: 'jm1pub_Name', DisplayName: label('Name'), RequiredLevel: required(), MaxLength: 300, FormatName: { Value: 'Text' }, IsPrimaryName: true }]
    }) });
    if (execute) for (let i = 0; i < 30 && !entity; i += 1) { await new Promise((r) => setTimeout(r, 2000)); entity = await request(`/EntityDefinitions(LogicalName='${logical}')?$select=MetadataId,EntitySetName`, {}, true); }
  }
  const fields = [
    ['CanonicalWorkId', 'Canonical Work ID', 100], ['AuthorName', 'Author', 300], ['WorkTitle', 'Work', 500], ['Disposition', 'Disposition', 100],
    ['Reason', 'Reason', 850], ['AssetReadiness', 'Asset Readiness', 100], ['NextEligibleAction', 'Next Eligible Action', 300],
    ['IdempotencyKey', 'Idempotency Key', 200], ['CurrentCampaign', 'Current Campaign', 300]
  ];
  for (const [schema, display, max] of fields) {
    const fieldLogical = `jm1pub_${schema.toLowerCase()}`;
    const found = await request(`/EntityDefinitions(LogicalName='${logical}')/Attributes(LogicalName='${fieldLogical}')?$select=MetadataId`, {}, true);
    if (!found) {
      actions.push(`CREATE_${fieldLogical}`);
      if (execute) { await createAttributeWithRetry(logical, { '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata', SchemaName: `jm1pub_${schema}`, DisplayName: label(display), RequiredLevel: required(), MaxLength: max, FormatName: { Value: 'Text' } }); }
    }
  }
  const typed = [
    ['PriorityScore', 'Priority Score', 'Microsoft.Dynamics.CRM.DecimalAttributeMetadata', { MinValue: 0, MaxValue: 2000, Precision: 4 }],
    ['EvaluatedAt', 'Evaluated At', 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata', { Format: 'DateAndTime', DateTimeBehavior: { Value: 'TimeZoneIndependent' } }],
    ['LastMarketedAt', 'Last Marketed At', 'Microsoft.Dynamics.CRM.DateTimeAttributeMetadata', { Format: 'DateAndTime', DateTimeBehavior: { Value: 'TimeZoneIndependent' } }]
  ];
  for (const [schema, display, type, extra] of typed) {
    const fieldLogical = `jm1pub_${schema.toLowerCase()}`;
    const found = await request(`/EntityDefinitions(LogicalName='${logical}')/Attributes(LogicalName='${fieldLogical}')?$select=MetadataId`, {}, true);
    if (!found) { actions.push(`CREATE_${fieldLogical}`); if (execute) await createAttributeWithRetry(logical, { '@odata.type': type, SchemaName: `jm1pub_${schema}`, DisplayName: label(display), RequiredLevel: required(), ...extra }); }
  }
  if (execute) await request('/PublishAllXml', { method: 'POST', body: '{}' });
  if (execute) entity = await request(`/EntityDefinitions(LogicalName='${logical}')?$select=EntitySetName`);
  return { entitySetName: entity?.EntitySetName || 'jm1pub_titlemarketinghealths', actions };
}

const readinessBase64 = execFileSync('gh', ['api', 'repos/jmerrillorg/jmerrill-pub/contents/JMP-Full-Catalog-Production-Asset-Reconciliation-v1/evidence/reconciliation/work-asset-readiness.json?ref=main', '--jq', '.content'], { encoding: 'utf8' }).replace(/\s/g, '');
const readiness = JSON.parse(Buffer.from(readinessBase64, 'base64').toString('utf8'));
const titleResponse = await request("/jm1pub_titles?$select=jm1pub_titleid,jm1pub_titlename,jm1pub_authorname,jm1pub_marketingauthoritystate,jm1pub_rightsholdstate,jm1pub_retirementstate,jm1pub_currentcatalogstate,jm1pub_releasedate&$filter=jm1pub_catalogcorrelationid%20eq%20'JMP-CATALOG-CANONICAL-20260905'&$top=500");
const campaigns = (await request('/jm1_campaignauthorities?$select=jm1_campaignauthorityid,jm1_name,jm1_subject,jm1_state,jm1_idempotencykey&$top=500')).value || [];
const readyById = new Map(readiness.map((row) => [row.canonicalWorkId, row]));
const titles = titleResponse.value.map((row) => {
  const asset = readyById.get(row.jm1pub_titleid);
  const related = campaigns.find((campaign) => new RegExp(escapeRegex(row.jm1pub_titlename), 'i').test(`${campaign.jm1_name} ${campaign.jm1_subject}`));
  return { titleId: row.jm1pub_titleid, title: row.jm1pub_titlename, author: row.jm1pub_authorname, marketingAuthorityState: row.jm1pub_marketingauthoritystate,
    rightsState: row.jm1pub_rightsholdstate, retirementState: row.jm1pub_retirementstate, catalogState: row.jm1pub_currentcatalogstate,
    assetReadiness: asset?.readinessState || 'MISSING', governedPrimaryAsset: asset?.primaryMarketingCover || null,
    currentCampaign: related?.jm1_name || '', compatibleArchetypeAvailable: asset?.readinessState === 'PARTIAL' && asset.matchedAssetCount > 0 };
});
const health = evaluateFullCatalogMarketingHealth(titles, { nowIso: generatedAt, currentFeaturedAuthor: 'Sean A Crowley I', nextFeaturedAuthor: 'Iyorwuese Hagher' });
const summary = summarizeFullCatalogMarketingHealth(health);
if (health.length !== 129 || new Set(health.map((row) => row.titleId)).size !== 129) throw new Error('Full-catalog invariant failed.');
if (JSON.stringify(summary.assets) !== JSON.stringify({ READY: 74, PARTIAL: 16, MISSING: 11, AMBIGUOUS: 28 })) throw new Error(`Asset authority mismatch: ${JSON.stringify(summary.assets)}`);
const schema = await ensureSchema();
let healthCreates = 0; let healthUpdates = 0;
if (execute) for (const row of health) {
  const key = `JMP_FULL_CATALOG_HEALTH:${row.titleId}`; const filter = encodeURIComponent(`jm1pub_idempotencykey eq '${key}'`);
  const old = (await request(`/${schema.entitySetName}?$select=jm1pub_titlemarketinghealthid&$filter=${filter}&$top=1`)).value?.[0];
  const payload = { jm1pub_name: `${row.author} - ${row.title}`.slice(0, 300), jm1pub_canonicalworkid: row.titleId, jm1pub_authorname: row.author, jm1pub_worktitle: row.title,
    jm1pub_disposition: row.disposition, jm1pub_reason: row.reason, jm1pub_assetreadiness: row.assetReadiness, jm1pub_nexteligibleaction: row.nextEligibleAction,
    jm1pub_priorityscore: row.score, jm1pub_evaluatedat: row.evaluatedAt, jm1pub_currentcampaign: row.currentCampaign || null, jm1pub_idempotencykey: key };
  if (old) { await request(`/${schema.entitySetName}(${old.jm1pub_titlemarketinghealthid})`, { method: 'PATCH', body: JSON.stringify(payload) }); healthUpdates += 1; }
  else { await request(`/${schema.entitySetName}`, { method: 'POST', body: JSON.stringify(payload) }); healthCreates += 1; }
}
const commissionedCampaign = campaigns.find((row) => String(row.jm1_idempotencykey || '').startsWith('JMP_FULL_CATALOG_REACTIVATION:'));
const commissionedWorkId = commissionedCampaign?.jm1_idempotencykey?.split(':')[1];
const candidate = health.find((row) => row.titleId === commissionedWorkId) || selectFullCatalogCandidate(health);
let campaignResult = { state: execute ? 'NOT_CREATED' : 'WOULD_UPSERT_QUEUE_POLICY_HELD', created: false };
if (execute && candidate) {
  const key = `JMP_FULL_CATALOG_REACTIVATION:${candidate.titleId}:v1`; const filter = encodeURIComponent(`jm1_idempotencykey eq '${key}'`);
  const existing = (await request(`/jm1_campaignauthorities?$select=jm1_campaignauthorityid,jm1_state&$filter=${filter}&$top=1`)).value?.[0];
  if (!existing) {
    const body = { jm1_name: `Autonomous reactivation - ${candidate.title}`.slice(0, 200), jm1_branch: 'J Merrill Publishing', jm1_program: 'TITLE / AUTHOR MARKETING', jm1_campaigntype: 'backlist_reactivation', jm1_subject: `${candidate.author} - ${candidate.title}`.slice(0, 300), jm1_state: 'QUEUE_POLICY_HELD', jm1_idempotencykey: key };
    await request('/jm1_campaignauthorities', { method: 'POST', body: JSON.stringify(body) }); campaignResult = { state: 'QUEUE_POLICY_HELD', created: true, idempotencyKey: key };
  } else campaignResult = { state: existing.jm1_state, created: false, idempotencyKey: key };
}
const result = { artifact: 'JMP-Full-Catalog-Marketing-Health-Autonomous-Commissioning-v1', generatedAt, mode: execute ? 'EXECUTE' : 'DRY_RUN', authority: { canonicalWorks: 129, marketingEligible: 129, source: 'Ratified Publishing catalog plus Production Asset Registry' }, summary, candidate, campaignResult,
  downstream: { contentWork: 'NOT_CREATED_QUEUE_POLICY_HELD', creativeWork: 'NOT_CREATED_QUEUE_POLICY_HELD', mediaRegistry: candidate?.governedPrimaryAsset ? 'GOVERNED_PRIMARY_REFERENCE_RESOLVED' : 'NOT_RESOLVED', socialExecution: 'NONE', dynamics: 'UNCHANGED' },
  schema, writes: { healthCreates, healthUpdates, catalogMutations: 0, sharePointMutations: 0 }, guards: { shift: health.find((r) => /The Shift/i.test(r.title))?.disposition, strategies: health.find((r) => /Strategies for Success/i.test(r.title))?.disposition, sean: health.filter((r) => r.author === 'Sean A Crowley I').map((r) => r.disposition), octoberFeaturedAuthor: 'Iyorwuese Hagher', linkedinAutonomous: false, browserExecution: 0, sintraExecution: 0, publicPosts: 0 } };
mkdirSync(evidenceDir, { recursive: true }); writeFileSync(join(evidenceDir, 'commissioning.json'), `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(join(evidenceDir, 'README.md'), `# JMP Full-Catalog Marketing Health Autonomous Commissioning v1\n\nThis package records the downstream commissioning of all 129 ratified Publishing works into deterministic Marketing Health. It does not alter catalog, rights, SharePoint, or production-asset authority.\n\n- Mode: ${result.mode}\n- Works evaluated: ${summary.total}\n- Selected candidate: ${candidate ? `${candidate.author} - ${candidate.title}` : 'none'}\n- Campaign authority: ${campaignResult.state}\n- Public executions created: 0\n- Browser/Sintra execution: 0\n`);
console.log(JSON.stringify({ mode: result.mode, summary, candidate: candidate && { titleId: candidate.titleId, title: candidate.title, author: candidate.author }, campaignResult, writes: result.writes }, null, 2));

function token() { return execFileSync('az', ['account', 'get-access-token', '--resource', resource, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function createAttributeWithRetry(logical, metadata) {
  let lastError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try { return await request(`/EntityDefinitions(LogicalName='${logical}')/Attributes`, { method: 'POST', body: JSON.stringify(metadata) }); }
    catch (error) { lastError = error; await new Promise((resolve) => setTimeout(resolve, 3000)); }
  }
  throw lastError;
}
