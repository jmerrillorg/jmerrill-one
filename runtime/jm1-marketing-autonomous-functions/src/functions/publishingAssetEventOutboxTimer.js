import { app } from '@azure/functions';
import { QueueClient } from '@azure/storage-queue';
import { dv } from '../lib/dataverse.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';
import { runEnvelope } from '../lib/runtime.js';

const SOURCE_EVENT = 'TITLE_CLOSEOUT_APPROVED_STAGE_V1';
const EMISSION_EVENT = 'PRODUCTION_ASSET_EVENT_EMITTED_V1';

app.timer('publishingAssetEventOutboxTimer', {
  schedule: process.env.JM1_PUBLISHING_ASSET_OUTBOX_CRON || '0 12,42 * * * *',
  handler: async (timer, context) => withDistributedTimerLease('publishing-asset-event-outbox', runEnvelope('PUBLISHING_ASSET_EVENT_OUTBOX', timer, context), context, async () => {
    const queue = QueueClient.fromConnectionString(process.env.AzureWebJobsStorage, process.env.JM1_PRODUCTION_ASSET_EVENT_QUEUE || 'jmp-production-asset-events');
    await queue.createIfNotExists();
    const logs = (await dv(`/jm1_executionlogs?$select=jm1_executionlogid,jm1_name,jm1_actiontype,jm1_sourcerecordid,createdon&$filter=jm1_actiontype%20eq%20'${SOURCE_EVENT}'&$orderby=createdon%20asc&$top=100`)).value || [];
    const emitted = [];
    for (const log of logs) {
      const marker = `${EMISSION_EVENT}:${log.jm1_executionlogid}`;
      const existing = (await dv(`/jm1_executionlogs?$select=jm1_executionlogid&$filter=${encodeURIComponent(`jm1_actiontype eq '${EMISSION_EVENT}' and jm1_name eq '${marker}'`)}&$top=1`)).value?.[0];
      if (existing) continue;
      const event = await resolveAssetEvent(log);
      if (!event) { context.warn(JSON.stringify({ event: 'PUBLISHING_ASSET_EVENT_NOT_EMITTED', executionLogId: log.jm1_executionlogid, reason: 'REQUIRED_ARTIFACT_LINEAGE_INCOMPLETE' })); continue; }
      await queue.sendMessage(Buffer.from(JSON.stringify(event)).toString('base64'));
      const now = new Date().toISOString();
      await dv('/jm1_executionlogs', { method: 'POST', body: JSON.stringify({
        jm1_name: marker, jm1_actiontype: EMISSION_EVENT, jm1_actiondescription: `Approved Publishing artifact event emitted for canonical work ${event.canonicalWorkId}.`,
        jm1_agentname: 'PublishingAssetEventOutboxAdapter', jm1_agentmodel: EMISSION_EVENT, jm1_bandlevel: 835500000,
        jm1_executionstatus: 835500001, jm1_startedon: now, jm1_completedon: now,
        jm1_sourceentity: 'jm1_executionlog', jm1_sourcerecordid: log.jm1_executionlogid
      }) });
      emitted.push({ eventId: event.eventId, canonicalWorkId: event.canonicalWorkId });
    }
    context.log(JSON.stringify({ event: 'PUBLISHING_ASSET_EVENT_OUTBOX', sourceEvent: SOURCE_EVENT, sourceRows: logs.length, emitted, routineFounderTouch: 0, routineCodyTouch: 0 }));
  })
});

async function resolveAssetEvent(log) {
  if (!/^[0-9a-f-]{36}$/i.test(log.jm1_sourcerecordid || '')) return null;
  const gate = (await dv(`/jm1pub_editorialapprovalgates?$select=jm1pub_editorialapprovalgateid,_jm1pub_titleid_value,_jm1pub_editorialstageid_value,_jm1pub_deliverableartifactid_value&$filter=jm1pub_editorialapprovalgateid%20eq%20${log.jm1_sourcerecordid}&$top=1`)).value?.[0];
  const artifactId = gate?._jm1pub_deliverableartifactid_value;
  if (!artifactId || !gate?._jm1pub_titleid_value) return null;
  const artifact = (await dv(`/jm1pub_editorialartifacts?$select=jm1pub_editorialartifactid,jm1pub_filename,jm1pub_artifacttype,jm1pub_repositorydriveid,jm1pub_repositoryitemid,jm1pub_repositorypath,jm1pub_sha256,jm1pub_filesizebytes,jm1pub_iscurrentapproved,modifiedon&$filter=jm1pub_editorialartifactid%20eq%20${artifactId}&$top=1`)).value?.[0];
  if (!artifact?.jm1pub_iscurrentapproved || !artifact.jm1pub_repositorydriveid || !artifact.jm1pub_repositoryitemid || !artifact.jm1pub_repositorypath) return null;
  return {
    eventId: log.jm1_executionlogid, eventType: SOURCE_EVENT, occurredAt: log.createdon,
    canonicalWorkId: gate._jm1pub_titleid_value, editionId: '', canonicalProductId: '',
    driveId: artifact.jm1pub_repositorydriveid, itemId: artifact.jm1pub_repositoryitemid,
    fileName: artifact.jm1pub_filename || artifact.jm1pub_editorialartifactid, mimeType: mime(artifact.jm1pub_filename),
    assetType: `APPROVED_EDITORIAL_ARTIFACT_${artifact.jm1pub_artifacttype || 'UNSPECIFIED'}`,
    assetState: 'GOVERNED_PRIMARY', lifecycleStage: gate._jm1pub_editorialstageid_value,
    sourceSystem: 'PublishingTitleCloseoutService', correlationId: log.jm1_name,
    sha256: artifact.jm1pub_sha256 || '', webUrl: artifact.jm1pub_repositorypath,
    relativePath: artifact.jm1pub_repositorypath, size: Number(artifact.jm1pub_filesizebytes || 0),
    lastModified: artifact.modifiedon, matchBasis: 'TITLE_CLOSEOUT_APPROVED_ARTIFACT', readinessState: 'UNCHANGED'
  };
}
function mime(name = '') { if (/\.pdf$/i.test(name)) return 'application/pdf'; if (/\.docx$/i.test(name)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; if (/\.png$/i.test(name)) return 'image/png'; if (/\.jpe?g$/i.test(name)) return 'image/jpeg'; return 'application/octet-stream'; }
