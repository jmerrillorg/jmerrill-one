import { createHash } from 'node:crypto';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { buildCreativeArtifact, campaignMarker, inferAssetState } from './campaignProgram.js';
import { BRANCH_CONFIG, MEDIA_PUBLIC_BASE_URL, MEDIA_STORAGE_ACCOUNT_NAME, MEDIA_STORAGE_CONTAINER, MEDIA_STORAGE_PREFIX } from './config.js';
import { dv, entitySet, patchById, queryByPrefix, upsertByIdempotency } from './dataverse.js';

let cachedContainerClient = null;

export async function registerCampaignCreativeMedia({ campaign, contentRows, creativeRows, exceptionRows, envelope, context }) {
  const mediaSet = await entitySet('jm1_mediaasset');
  const socialSet = await entitySet('jm1_socialexecution');
  const marker = campaignMarker(campaign);
  const assetState = inferAssetState(exceptionRows);
  const writes = [];

  for (const creative of creativeRows) {
    if (creative.jm1_publicreadystate !== 'PASS') continue;
    if (!String(creative.jm1_assetpath || '').startsWith('runtime-generated://')) continue;

    const content = contentRows.find((row) => row.jm1_stage === creative.jm1_stage);
    if (!content) {
      writes.push({ type: 'media', state: 'HELD_CONTENT_REFERENCE_MISSING', creativeId: creative.jm1_creativeworkid, stage: creative.jm1_stage });
      continue;
    }

    const archetype = archetypeFromAssetPath(creative.jm1_assetpath);
    const artifact = buildCreativeArtifact({ campaign, content, archetype, assetState, forceLogoFailure: false });
    if (artifact.sha256 !== creative.jm1_assethash) {
      writes.push({
        type: 'media',
        state: 'HELD_CREATIVE_HASH_RECONSTRUCTION_MISMATCH',
        creativeId: creative.jm1_creativeworkid,
        expectedHash: creative.jm1_assethash,
        reconstructedHash: artifact.sha256
      });
      continue;
    }

    const uploaded = await uploadPublicMedia({
      marker,
      stage: creative.jm1_stage,
      fileName: `${archetype.toLowerCase()}-${artifact.sha256.slice(0, 16)}.svg`,
      body: artifact.svg,
      mimeType: 'image/svg+xml'
    });
    const remote = await verifyRemoteHash(uploaded.publicUrl, artifact.sha256);
    const publicState = remote.ok ? 'PUBLIC_HTTPS_HASH_VERIFIED' : 'PUBLIC_HTTPS_HASH_MISMATCH';
    const mediaPayload = {
      jm1_name: `${content.jm1_name} durable media`,
      jm1_mediabranch: campaign.jm1_branch || BRANCH_CONFIG.publishing.branchName,
      jm1_assettype: 'social_creative_svg',
      jm1_filename: uploaded.fileName,
      jm1_mimetype: 'image/svg+xml',
      jm1_dimensions: artifact.dimensions,
      jm1_sha256local: artifact.sha256,
      jm1_sha256remote: remote.sha256 || '',
      jm1_storageprovider: 'Azure Blob Static Website',
      jm1_storagecontainer: MEDIA_STORAGE_CONTAINER,
      jm1_storagepath: uploaded.path,
      jm1_durableurl: uploaded.publicUrl,
      jm1_publicaccessibilitystate: publicState,
      jm1_rightsprovenancestate: 'JM1_GENERATED_WITH_OFFICIAL_LOGO_AND_PUBLIC_READY_GATE',
      jm1_publicreadystate: artifact.publicReady.state,
      jm1_supersededstate: 'CURRENT',
      jm1_creativeworkidtext: creative.jm1_creativeworkid,
      jm1_campaignauthorityidtext: campaign.jm1_campaignauthorityid,
      jm1_idempotencykey: `${creative.jm1_idempotencykey}:media:${artifact.sha256}`
    };
    const mediaWrite = await upsertByIdempotency(mediaSet, 'jm1_mediaassetid', mediaPayload);
    writes.push({
      type: 'media',
      id: mediaWrite.id,
      created: mediaWrite.created,
      stage: creative.jm1_stage,
      url: uploaded.publicUrl,
      hashVerified: remote.ok,
      publicState
    });

    if (!remote.ok || artifact.publicReady.state !== 'PASS') continue;

    const socialRows = await queryByPrefix(
      socialSet,
      `${marker}:social:${creative.jm1_stage}`,
      'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_requestedschedule,jm1_requestedmediahash',
      10
    );
    for (const row of socialRows.filter((item) => ['facebook', 'instagram'].includes(item.jm1_platform) && !item.jm1_platformpostid)) {
      if (row.jm1_requestedmediahash !== artifact.sha256) {
        writes.push({ type: 'social', id: row.jm1_socialexecutionid, state: 'HELD_REQUESTED_MEDIA_HASH_MISMATCH', platform: row.jm1_platform });
        continue;
      }
      const schedule = new Date(row.jm1_requestedschedule);
      const scheduleFuture = !Number.isNaN(schedule.getTime()) && schedule > new Date(envelope.startedAt);
      await patchById(socialSet, row.jm1_socialexecutionid, {
        jm1_actualmediareference: uploaded.publicUrl,
        jm1_status: scheduleFuture ? 'PUBLIC_READY_SCHEDULED_ELIGIBLE' : 'HELD_SCHEDULE_REVIEW_REQUIRED',
        jm1_errorcode: '',
        jm1_errormessage: '',
        jm1_readbackstate: scheduleFuture ? 'DURABLE_MEDIA_REGISTERED_SCHEDULED_NOT_DUE' : 'DURABLE_MEDIA_REGISTERED_SCHEDULE_REVIEW_REQUIRED',
        jm1_verifiedat: envelope.startedAt
      });
      writes.push({
        type: 'social',
        id: row.jm1_socialexecutionid,
        platform: row.jm1_platform,
        state: scheduleFuture ? 'PUBLIC_READY_SCHEDULED_ELIGIBLE' : 'HELD_SCHEDULE_REVIEW_REQUIRED',
        scheduledFor: row.jm1_requestedschedule
      });
    }
  }

  context?.log?.(JSON.stringify({
    ...envelope,
    subsystem: 'DURABLE_MEDIA_REGISTRY',
    storage: {
      account: MEDIA_STORAGE_ACCOUNT_NAME,
      container: MEDIA_STORAGE_CONTAINER,
      prefix: MEDIA_STORAGE_PREFIX,
      publicBaseUrl: MEDIA_PUBLIC_BASE_URL
    },
    dataverseWrite: writes
  }));
  return writes;
}

export async function lookupMediaUrlByHash(hash) {
  if (!hash) return '';
  const mediaSet = await entitySet('jm1_mediaasset');
  const filter = encodeURIComponent(`jm1_sha256local eq '${hash}' and jm1_publicaccessibilitystate eq 'PUBLIC_HTTPS_HASH_VERIFIED' and jm1_supersededstate eq 'CURRENT'`);
  const response = await dv(`/${mediaSet}?$select=jm1_durableurl,jm1_sha256local,jm1_publicaccessibilitystate&$filter=${filter}&$top=1`);
  return response.value?.[0]?.jm1_durableurl || '';
}

function archetypeFromAssetPath(assetPath) {
  const file = String(assetPath || '').split('/').pop() || 'TYPOGRAPHIC_PRE_COVER.svg';
  return file.replace(/\.svg$/i, '').toUpperCase();
}

async function uploadPublicMedia({ marker, stage, fileName, body, mimeType }) {
  const containerClient = getContainerClient();
  const path = [MEDIA_STORAGE_PREFIX, marker, stage, fileName].filter(Boolean).join('/');
  const blockBlob = containerClient.getBlockBlobClient(path);
  await blockBlob.upload(body, Buffer.byteLength(body), {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobCacheControl: 'public, max-age=31536000, immutable'
    },
    metadata: {
      jm1_sha256: createHash('sha256').update(body).digest('hex'),
      jm1_public_ready: 'true'
    }
  });
  return {
    fileName,
    path,
    publicUrl: `${MEDIA_PUBLIC_BASE_URL.replace(/\/$/, '')}/${path}`
  };
}

function getContainerClient() {
  if (cachedContainerClient) return cachedContainerClient;
  const credential = new DefaultAzureCredential();
  const serviceClient = new BlobServiceClient(`https://${MEDIA_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, credential);
  cachedContainerClient = serviceClient.getContainerClient(MEDIA_STORAGE_CONTAINER);
  return cachedContainerClient;
}

async function verifyRemoteHash(url, expectedSha256) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return { ok: false, status: response.status, sha256: '' };
  const body = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash('sha256').update(body).digest('hex');
  return { ok: sha256 === expectedSha256, status: response.status, sha256 };
}
