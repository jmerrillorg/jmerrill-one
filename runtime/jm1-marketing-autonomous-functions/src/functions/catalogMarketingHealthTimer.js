import { app } from '@azure/functions';
import { dv, entitySet } from '../lib/dataverse.js';
import { evaluateFullCatalogMarketingHealth, selectFullCatalogCandidate, summarizeFullCatalogMarketingHealth } from '../lib/marketingLifecycle.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';
import { runEnvelope } from '../lib/runtime.js';

app.timer('catalogMarketingHealthTimer', {
  schedule: process.env.JM1_CATALOG_HEALTH_CRON || '0 7 12 * * *',
  handler: async (timer, context) => withDistributedTimerLease('catalog-marketing-health', runEnvelope('FULL_CATALOG_MARKETING_HEALTH', timer, context), context, async () => {
    const healthSet = await entitySet('jm1pub_titlemarketinghealth');
    const response = await dv("/jm1pub_titles?$select=jm1pub_titleid,jm1pub_titlename,jm1pub_authorname,jm1pub_marketingauthoritystate,jm1pub_rightsholdstate,jm1pub_retirementstate,jm1pub_currentcatalogstate,jm1pub_releasedate,jm1pub_assetregistrystatus&$filter=jm1pub_catalogcorrelationid%20eq%20'JMP-CATALOG-CANONICAL-20260905'&$top=500");
    const existing = await dv(`/${healthSet}?$select=jm1pub_canonicalworkid,jm1pub_assetreadiness,jm1pub_lastmarketedat,jm1pub_currentcampaign&$top=500`);
    const byWork = new Map((existing.value || []).map((row) => [row.jm1pub_canonicalworkid, row]));
    const titles = (response.value || []).map((row) => ({
      titleId: row.jm1pub_titleid, title: row.jm1pub_titlename, author: row.jm1pub_authorname,
      marketingAuthorityState: row.jm1pub_marketingauthoritystate, rightsState: row.jm1pub_rightsholdstate,
      retirementState: row.jm1pub_retirementstate, catalogState: row.jm1pub_currentcatalogstate,
      assetReadiness: byWork.get(row.jm1pub_titleid)?.jm1pub_assetreadiness || assetStatus(row.jm1pub_assetregistrystatus),
      lastMarketedAt: byWork.get(row.jm1pub_titleid)?.jm1pub_lastmarketedat,
      currentCampaign: byWork.get(row.jm1pub_titleid)?.jm1pub_currentcampaign
    }));
    const nowIso = new Date().toISOString();
    const health = evaluateFullCatalogMarketingHealth(titles, { nowIso, currentFeaturedAuthor: 'Sean A Crowley I', nextFeaturedAuthor: 'Iyorwuese Hagher' });
    for (const row of health) await upsertHealth(healthSet, payload(row));
    const candidate = selectFullCatalogCandidate(health);
    context.log(JSON.stringify({ event: 'FULL_CATALOG_MARKETING_HEALTH', summary: summarizeFullCatalogMarketingHealth(health), selectedWorkId: candidate?.titleId || null, publicExecutionCreated: false }));
  })
});

function payload(row) { return {
  jm1pub_name: `${row.author} - ${row.title}`.slice(0, 300), jm1pub_canonicalworkid: row.titleId,
  jm1pub_authorname: row.author, jm1pub_worktitle: row.title, jm1pub_disposition: row.disposition,
  jm1pub_reason: row.reason, jm1pub_assetreadiness: row.assetReadiness, jm1pub_nexteligibleaction: row.nextEligibleAction,
  jm1pub_priorityscore: row.score, jm1pub_evaluatedat: row.evaluatedAt,
  jm1pub_idempotencykey: `JMP_FULL_CATALOG_HEALTH:${row.titleId}`
}; }
function assetStatus(value) { return value === 100000003 ? 'READY' : value === 100000004 ? 'MISSING' : 'PARTIAL'; }
async function upsertHealth(healthSet, body) {
  const filter = encodeURIComponent(`jm1pub_idempotencykey eq '${body.jm1pub_idempotencykey.replaceAll("'", "''")}'`);
  const existing = (await dv(`/${healthSet}?$select=jm1pub_titlemarketinghealthid&$filter=${filter}&$top=1`)).value?.[0];
  if (existing) return dv(`/${healthSet}(${existing.jm1pub_titlemarketinghealthid})`, { method: 'PATCH', body: JSON.stringify(body) });
  return dv(`/${healthSet}`, { method: 'POST', body: JSON.stringify(body) });
}
