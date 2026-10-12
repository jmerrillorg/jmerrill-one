import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { applyCurrentFinancialProductionDestinations, buildDataverseReconciliationFindings, buildSocialCoverageReadback, mapDataverseSocialRows, nativeSocialApprovalProjection, partitionCurrentFinancialDestinationRows, queryDataversePages, reconcileNativeDataverseClaims, retainNativeEvidenceItems } from './lib/social-coverage-readback.mjs';
import { lifecycleSocialEligibilityForCampaignType } from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';
import { matchesApprovedNativeSocialContent, nativeSocialScheduledAt } from '../runtime/jm1-marketing-autonomous-functions/src/lib/nativeSocialProgram.js';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/social-coverage-readback.mjs <evidence.json> [--live-dataverse]');
const snapshot = JSON.parse(readFileSync(input, 'utf8'));
const financialDestinationOverlay = process.argv.includes('--current-financial-production-destinations');
const metaReadbackArg = process.argv.find((arg) => arg.startsWith('--financial-meta-readback='));
const metaReadback = metaReadbackArg ? JSON.parse(readFileSync(metaReadbackArg.slice('--financial-meta-readback='.length), 'utf8')) : null;
if (financialDestinationOverlay) Object.assign(snapshot, applyCurrentFinancialProductionDestinations(snapshot, metaReadback));
snapshot.sourceSnapshotAsOf = snapshot.sourceSnapshotAsOf || snapshot.asOf || null;
snapshot.readbackMode = process.argv.includes('--live-dataverse') ? 'LIVE_DATAVERSE' : 'SNAPSHOT_ONLY';
let reconciliationRows = [];
if (process.argv.includes('--live-dataverse')) {
  if (!snapshot.dataverseMarker || !snapshot.dataverseUrl) throw new Error('Live readback requires dataverseMarker and dataverseUrl');
  let token;
  try {
    token = execFileSync('az', [
      'account', 'get-access-token', '--resource', snapshot.dataverseUrl,
      '--query', 'accessToken', '-o', 'tsv'
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 15000,
      killSignal: 'SIGTERM'
    }).trim();
  } catch (error) {
    const detail = error.code === 'ETIMEDOUT'
      ? 'Azure CLI token acquisition exceeded 15 seconds.'
      : `Azure CLI token acquisition failed (${error.code || `exit ${error.status ?? 'unknown'}`}).`;
    throw new Error(`${detail} Existing Azure authentication may need attention; no token value was logged.`);
  }
  if (!token) throw new Error('Azure CLI returned an empty access token; no token value was logged.');
  const query = async (set, select, filter) => {
    const url = new URL(`${snapshot.dataverseUrl}/api/data/v9.2/${set}`);
    url.searchParams.set('$select', select);
    url.searchParams.set('$filter', filter);
    try {
      return await queryDataversePages(url.toString(), token);
    } catch (error) {
      if (!error.message.startsWith('Dataverse readback failed: HTTP ')) {
        const detail = error.name === 'TimeoutError' || error.name === 'AbortError'
          ? 'request exceeded 20 seconds'
          : 'request could not be completed';
        throw new Error(`Dataverse ${set} readback ${detail}; no partial result was reported.`);
      }
      throw new Error(`Dataverse ${set} readback failed: ${error.message.replace('Dataverse readback failed: ', '')}`);
    }
  };
  const marker = snapshot.dataverseMarker;
  const overdueLookbackDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [campaigns, content, rows, futureRows, nativeReservationRows] = await Promise.all([
    query('jm1_campaignauthorities', 'jm1_idempotencykey,jm1_state,jm1_branch', `jm1_idempotencykey eq '${marker}:campaign'`),
    query('jm1_contentworks', 'jm1_idempotencykey,jm1_publicreadystate', `startswith(jm1_idempotencykey,'${marker}:content')`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion', `startswith(jm1_idempotencykey,'${marker}:social')`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion,jm1_requestedmediahash,jm1_verifiedat,jm1_name', `jm1_requestedschedule ge ${overdueLookbackDate}T00:00:00Z`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion,jm1_requestedmediahash,jm1_verifiedat,jm1_name', "jm1_status eq 'NATIVE_RESERVATION_VERIFIED' or jm1_status eq 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED'")
  ]);
  const nativeCampaigns = await query('jm1_campaignauthorities',
    'jm1_campaignauthorityid,jm1_idempotencykey,jm1_campaigntype,jm1_state,jm1_branch,jm1_supersession',
    "jm1_campaigntype eq 'native_social'");
  const nativeMarkers = [...new Set(nativeCampaigns.map((campaign) =>
    campaign.jm1_idempotencykey?.replace(/:campaign$/, '')).filter(Boolean))];
  const nativeSource = { content: [], creatives: [], socialRows: [] };
  for (const marker of nativeMarkers) {
    const prefix = marker.replaceAll("'", "''");
    const [nativeContent, nativeCreatives, nativeSocialRows] = await Promise.all([
      query('jm1_contentworks', 'jm1_contentworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_draftcopy,jm1_copybrief', `startswith(jm1_idempotencykey,'${prefix}:')`),
      query('jm1_creativeworks', 'jm1_creativeworkid,jm1_idempotencykey,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash', `startswith(jm1_idempotencykey,'${prefix}:')`),
      query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_branch,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_actualschedule,jm1_actualdestination,jm1_executor,jm1_verifiedat,jm1_captionversion,jm1_requestedmediahash,jm1_readbackstate', `startswith(jm1_idempotencykey,'${prefix}:')`)
    ]);
    nativeSource.content.push(...nativeContent);
    nativeSource.creatives.push(...nativeCreatives);
    nativeSource.socialRows.push(...nativeSocialRows);
  }
  const lifecycleMarkers = [...new Set(futureRows.map((row) => row.jm1_idempotencykey?.split(':social:')[0]).filter(Boolean))];
  const lifecycleCampaigns = lifecycleMarkers.length
    ? await query('jm1_campaignauthorities', 'jm1_idempotencykey,jm1_campaigntype,jm1_state,jm1_name', lifecycleMarkers
      .map((item) => `jm1_idempotencykey eq '${item.replaceAll("'", "''")}:campaign'`).join(' or '))
    : [];
  const campaignPolicyByMarker = new Map(lifecycleCampaigns.map((campaign) => {
    const marker = campaign.jm1_idempotencykey?.replace(/:campaign$/, '');
    const eligible = lifecycleSocialEligibilityForCampaignType(campaign.jm1_campaigntype);
    return [marker, {
      campaignType: campaign.jm1_campaigntype || null,
      campaignSocialEligible: eligible,
      campaignSocialEligibilityReason: eligible === false ? 'SOCIAL_INELIGIBLE_BY_LIFECYCLE_POLICY' : null,
      campaignAuthorityState: campaign.jm1_state || null
    }];
  }));
  const campaignApproved = campaigns.length === 1 && campaigns[0].jm1_state === 'PUBLIC_EXECUTION_APPROVED';
  const current = rows.map((row) => {
    const stage = row.jm1_idempotencykey.split(':social:')[1]?.split(':')[0];
    const contentApproved = content.some((item) =>
      item.jm1_idempotencykey === `${marker}:content:${stage}` && item.jm1_publicreadystate === 'PASS');
    const published = row.jm1_status === 'PUBLISHED_VERIFIED' && row.jm1_platformpostid;
    return {
      id: row.jm1_socialexecutionid,
      kind: published ? 'PUBLISHED' : 'API_REQUEST',
      brand: 'J Merrill Publishing',
      platform: row.jm1_platform,
      destinationId: null,
      expectedDestinationId: snapshot.channels.find((channel) =>
        channel.brand === 'J Merrill Publishing' && channel.platform === row.jm1_platform)?.destinationId || null,
      requestedDestinationText: row.jm1_requesteddestination || null,
      scheduledAt: row.jm1_requestedschedule,
      publishedAt: published ? row.jm1_actualschedule : null,
      platformPostId: published ? row.jm1_platformpostid : null,
      status: row.jm1_status,
      campaignAuthorityState: campaigns.length === 1 ? campaigns[0].jm1_state : 'MISSING_OR_AMBIGUOUS',
      approvalState: published ? 'HISTORIC' : campaignApproved && contentApproved ? 'APPROVED' : 'HELD',
      contentKey: `${marker}:${stage}`,
      readbackState: row.jm1_readbackstate
    };
  });
  const contentItems = content.flatMap((item) => rows.filter((row) =>
    row.jm1_idempotencykey.includes(`:social:${item.jm1_idempotencykey.split(':content:')[1]}:`)
  ).map((row) => ({
    id: `${item.jm1_idempotencykey}:${row.jm1_platform}`,
    kind: 'CONTENT',
    brand: 'J Merrill Publishing',
    platform: row.jm1_platform,
    approvalState: item.jm1_publicreadystate === 'PASS' ? 'APPROVED' : 'HELD',
    source: 'LIVE_DATAVERSE'
  })));
  const nativeItems = retainNativeEvidenceItems(snapshot.items);
  const futureRowIds = new Set(futureRows.map((row) => row.jm1_socialexecutionid));
  const observedFutureRows = [...futureRows, ...nativeReservationRows.filter((row) => !futureRowIds.has(row.jm1_socialexecutionid))]
    .map((row) => ({
      ...row,
      ...(campaignPolicyByMarker.get(row.jm1_idempotencykey?.split(':social:')[0]) || {})
    }));
  const { currentRows: allFutureRows, preservedHistoricalFinancialRows } = financialDestinationOverlay
    ? partitionCurrentFinancialDestinationRows(observedFutureRows)
    : { currentRows: observedFutureRows, preservedHistoricalFinancialRows: [] };
  for (const booking of allFutureRows.filter((row) => ['NATIVE_BOOKED_VERIFIED', 'PUBLIC_READY_SCHEDULED_ELIGIBLE', 'RETRY_REQUIRED'].includes(row.jm1_status))) {
    const channel = snapshot.channels.find((item) => item.brand === booking.jm1_branch
      && item.platform === booking.jm1_platform);
    const expectedDestinations = [channel?.destinationId, channel?.destinationHandle,
      channel?.nativeReadback?.portfolioHandle].filter(Boolean);
    const projection = nativeSocialApprovalProjection(booking, {
      campaigns: nativeCampaigns,
      ...nativeSource
    }, matchesApprovedNativeSocialContent, (stage, platform) => stage?.startsWith('rolling-')
      ? nativeSocialScheduledAt(stage, platform)
      : null, expectedDestinations, channel?.nativeReadback || null);
    if (booking.jm1_status === 'NATIVE_BOOKED_VERIFIED') {
      booking.nativeApprovalState = projection.state;
      booking.nativeApprovalEvidence = projection.evidence;
      booking.nativeApprovalReason = projection.reason;
    } else {
      booking.contentApprovalState = projection.state;
      booking.contentApprovalEvidence = projection.evidence;
      booking.contentApprovalReason = projection.reason;
    }
  }
  reconciliationRows = allFutureRows;
  const mappedDataverse = mapDataverseSocialRows(allFutureRows, snapshot.channels);
  const sourceRowById = new Map(allFutureRows.map((row) => [row.jm1_socialexecutionid, row]));
  const currentById = new Map(current.map((row) => [row.id, row]));
  const mappedItems = mappedDataverse.mapped.map((item) => {
    const currentRow = currentById.get(item.id);
    const sourceRow = sourceRowById.get(item.id);
    return {
      ...item,
      ...(currentRow || {}),
      campaignType: sourceRow?.campaignType || null,
      campaignSocialEligible: sourceRow?.campaignSocialEligible ?? null,
      campaignSocialEligibilityReason: sourceRow?.campaignSocialEligibilityReason || null,
      kind: item.kind,
      destinationId: item.destinationId,
      destinationHandle: item.destinationHandle,
      expectedDestinationId: item.expectedDestinationId,
      requestedDestinationText: item.requestedDestinationText
    };
  });
  const { items: reconciledNativeItems, matchedDataverseIds } = reconcileNativeDataverseClaims(
    nativeItems,
    mappedItems,
    new Date().toISOString()
  );
  const remainingMappedItems = mappedItems.filter((item) => !matchedDataverseIds.has(item.id)
    && !nativeItems.some((native) => native.id === item.id
    || (item.platformPostId && native.platformPostId === item.platformPostId)));
  snapshot.items = [...reconciledNativeItems, ...remainingMappedItems, ...current.filter((row) =>
    !remainingMappedItems.some((item) => item.id === row.id)
      && !reconciledNativeItems.some((item) => row.platformPostId && row.platformPostId === item.platformPostId)), ...contentItems];
  snapshot.unclassifiedDataverseRows = mappedDataverse.unclassified.map((row) => ({
    id: row.jm1_socialexecutionid,
    idempotencyKey: row.jm1_idempotencykey,
    branch: row.jm1_branch || null,
    platform: row.jm1_platform,
    status: row.jm1_status,
    requestedSchedule: row.jm1_requestedschedule,
    requestedDestination: row.jm1_requesteddestination,
    platformPostId: row.jm1_platformpostid
  }));
  snapshot.mappedDataverseRows = mappedDataverse.mapped.length;
  snapshot.campaignPolicyExclusions = allFutureRows.filter((row) => row.campaignSocialEligible === false).map((row) => ({
    id: row.jm1_socialexecutionid,
    campaignType: row.campaignType,
    reason: row.campaignSocialEligibilityReason,
    status: row.jm1_status,
    scheduledAt: row.jm1_requestedschedule
  }));
  snapshot.preservedHistoricalFinancialDataverseRows = [
    ...(snapshot.preservedHistoricalFinancialDataverseRows || []),
    ...preservedHistoricalFinancialRows
  ];
  snapshot.liveDataverseObservedAt = new Date().toISOString();
  snapshot.asOf = snapshot.liveDataverseObservedAt;
}
const report = buildSocialCoverageReadback(snapshot);
const reconciliationFindings = buildDataverseReconciliationFindings(
  [...reconciliationRows, ...(snapshot.unclassifiedDataverseRows || [])],
  snapshot.asOf
);
process.stdout.write(`${JSON.stringify({
  ...report,
  readbackMode: snapshot.readbackMode,
  sourceSnapshotAsOf: snapshot.sourceSnapshotAsOf,
  liveDataverseObservedAt: snapshot.liveDataverseObservedAt || null,
  alertDelivery: 'REPORT_ONLY_WITH_STABLE_DEDUPE_KEYS',
  ...(snapshot.unclassifiedDataverseRows ? { unclassifiedDataverseRows: snapshot.unclassifiedDataverseRows } : {}),
  ...(snapshot.mappedDataverseRows !== undefined ? { mappedDataverseRows: snapshot.mappedDataverseRows } : {}),
  ...(snapshot.campaignPolicyExclusions ? { campaignPolicyExclusions: snapshot.campaignPolicyExclusions } : {}),
  ...(financialDestinationOverlay ? { financialDestinationOverlay: {
    state: 'CURRENT_DESTINATION_IDENTITIES_ONLY', facebookPageId: '104395329284856',
    instagramHandle: 'jmerrillfinancial', instagramGraphBusinessId: 'UNVERIFIED',
    excludedInstagramTestHandle: 'jmerrillfin', historicalSnapshotPreserved: true,
    nativeReadback: metaReadback ? 'CURRENT_META_UI_READBACK' : 'NOT_REFRESHED'
  }, preservedHistoricalFinancialEvidence: snapshot.preservedHistoricalFinancialEvidence || [],
  preservedHistoricalFinancialDataverseRows: (snapshot.preservedHistoricalFinancialDataverseRows || []).map((row) => ({
    id: row.jm1_socialexecutionid,
    idempotencyKey: row.jm1_idempotencykey,
    platform: row.jm1_platform,
    status: row.jm1_status,
    requestedSchedule: row.jm1_requestedschedule,
    requestedDestination: row.jm1_requesteddestination,
    currentDisposition: row.currentDisposition
  })) } : {}),
  ...(snapshot.unclassifiedDataverseRows ? { reconciliationFindings } : {})
}, null, 2)}\n`);
