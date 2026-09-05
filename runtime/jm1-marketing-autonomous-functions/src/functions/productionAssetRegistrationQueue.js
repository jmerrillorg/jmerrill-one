import { app } from '@azure/functions';
import { dv, entitySet } from '../lib/dataverse.js';

app.storageQueue('productionAssetRegistrationQueue', {
  queueName: process.env.JM1_PRODUCTION_ASSET_EVENT_QUEUE || 'jmp-production-asset-events',
  connection: 'AzureWebJobsStorage',
  handler: async (message, context) => {
    const event = typeof message === 'string' ? JSON.parse(message) : message;
    validate(event);
    const productionSet = await entitySet('jm1pub_productionasset');
    const healthSet = await entitySet('jm1pub_titlemarketinghealth');
    const stableKey = `${event.driveId}:${event.itemId}`;
    const filter = encodeURIComponent(`jm1pub_stablekey eq '${odata(stableKey)}'`);
    const existing = (await dv(`/${productionSet}?$select=jm1pub_productionassetid&$filter=${filter}&$top=1`)).value?.[0];
    const payload = {
      jm1pub_name: event.fileName.slice(0, 300), jm1pub_stablekey: stableKey, jm1pub_driveid: event.driveId,
      jm1pub_itemid: event.itemId, jm1pub_filename: event.fileName, jm1pub_mimetype: event.mimeType || '',
      jm1pub_assettype: event.assetType, jm1pub_assetstate: event.assetState, jm1pub_canonicalworkid: event.canonicalWorkId,
      jm1pub_canonicalproductid: event.canonicalProductId || '', jm1pub_matchbasis: event.matchBasis || 'PUBLISHING_LIFECYCLE_EVENT',
      jm1pub_sha256: event.sha256 || '', jm1pub_weburl: event.webUrl, jm1pub_relativepath: event.relativePath || '',
      jm1pub_size: Number(event.size || 0), jm1pub_lastmodified: event.lastModified
    };
    if (existing) await dv(`/${productionSet}(${existing.jm1pub_productionassetid})`, { method: 'PATCH', body: JSON.stringify(payload) });
    else await dv(`/${productionSet}`, { method: 'POST', body: JSON.stringify(payload) });

    const healthFilter = encodeURIComponent(`jm1pub_canonicalworkid eq '${odata(event.canonicalWorkId)}'`);
    const health = (await dv(`/${healthSet}?$select=jm1pub_titlemarketinghealthid&$filter=${healthFilter}&$top=1`)).value?.[0];
    if (health) await dv(`/${healthSet}(${health.jm1pub_titlemarketinghealthid})`, { method: 'PATCH', body: JSON.stringify({
      jm1pub_assetreadiness: event.readinessState, jm1pub_nexteligibleaction: 'REEVALUATE_ON_NEXT_CONTROL_LOOP', jm1pub_evaluatedat: new Date().toISOString()
    }) });
    context.log(JSON.stringify({ event: 'PRODUCTION_ASSET_REGISTERED', stableKeyHash: await digest(stableKey), canonicalWorkId: event.canonicalWorkId, action: existing ? 'UPDATED' : 'CREATED', healthRecalculationQueued: Boolean(health) }));
  }
});

function validate(event) {
  for (const field of ['driveId', 'itemId', 'fileName', 'assetType', 'assetState', 'canonicalWorkId', 'webUrl', 'lastModified', 'readinessState']) if (!event?.[field]) throw new Error(`Missing governed production asset event field: ${field}`);
  if (!['READY', 'PARTIAL', 'MISSING', 'AMBIGUOUS'].includes(event.readinessState)) throw new Error('Invalid readinessState.');
}
function odata(value) { return String(value).replaceAll("'", "''"); }
async function digest(value) { const bytes = new TextEncoder().encode(value); const hash = await crypto.subtle.digest('SHA-256', bytes); return Buffer.from(hash).toString('hex'); }
