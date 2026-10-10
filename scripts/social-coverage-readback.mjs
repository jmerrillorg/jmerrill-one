import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildSocialCoverageReadback, classifyDataverseExecutionRow, mapDataverseSocialRows, reconcileNativeDataverseClaims, retainNativeEvidenceItems } from './lib/social-coverage-readback.mjs';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/social-coverage-readback.mjs <evidence.json> [--live-dataverse]');
const snapshot = JSON.parse(readFileSync(input, 'utf8'));
snapshot.sourceSnapshotAsOf = snapshot.asOf || null;
snapshot.readbackMode = process.argv.includes('--live-dataverse') ? 'LIVE_DATAVERSE' : 'SNAPSHOT_ONLY';
if (process.argv.includes('--live-dataverse')) {
  if (!snapshot.dataverseMarker || !snapshot.dataverseUrl) throw new Error('Live readback requires dataverseMarker and dataverseUrl');
  const token = execFileSync('az', [
    'account', 'get-access-token', '--resource', snapshot.dataverseUrl,
    '--query', 'accessToken', '-o', 'tsv'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const query = async (set, select, filter) => {
    const values = [];
    const url = new URL(`${snapshot.dataverseUrl}/api/data/v9.2/${set}`);
    url.searchParams.set('$select', select);
    url.searchParams.set('$filter', filter);
    url.searchParams.set('$top', '100');
    let next = url.toString();
    while (next) {
      const response = await fetch(next, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Dataverse ${set} readback failed: HTTP ${response.status}`);
      const body = await response.json();
      values.push(...(body.value || []));
      next = body['@odata.nextLink'] || null;
    }
    return values;
  };
  const marker = snapshot.dataverseMarker;
  const overdueLookbackDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [campaigns, content, rows, futureRows, nativeReservationRows] = await Promise.all([
    query('jm1_campaignauthorities', 'jm1_idempotencykey,jm1_state,jm1_branch', `jm1_idempotencykey eq '${marker}:campaign'`),
    query('jm1_contentworks', 'jm1_idempotencykey,jm1_publicreadystate', `startswith(jm1_idempotencykey,'${marker}:content')`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion', `startswith(jm1_idempotencykey,'${marker}:social')`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion,jm1_requestedmediahash,jm1_name', `jm1_requestedschedule ge ${overdueLookbackDate}T00:00:00Z`),
    query('jm1_socialexecutions', 'jm1_socialexecutionid,jm1_idempotencykey,jm1_platform,jm1_status,jm1_requestedschedule,jm1_requesteddestination,jm1_platformpostid,jm1_actualschedule,jm1_actualdestination,jm1_readbackstate,jm1_branch,jm1_executor,jm1_captionversion,jm1_requestedmediahash,jm1_name', "jm1_status eq 'NATIVE_RESERVATION_VERIFIED' or jm1_status eq 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED'")
  ]);
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
  const allFutureRows = [...futureRows, ...nativeReservationRows.filter((row) => !futureRowIds.has(row.jm1_socialexecutionid))];
  const mappedDataverse = mapDataverseSocialRows(allFutureRows, snapshot.channels);
  const currentById = new Map(current.map((row) => [row.id, row]));
  const mappedItems = mappedDataverse.mapped.map((item) => {
    const currentRow = currentById.get(item.id);
    return {
      ...item,
      ...(currentRow || {}),
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
  snapshot.liveDataverseObservedAt = new Date().toISOString();
  snapshot.asOf = snapshot.liveDataverseObservedAt;
}
const report = buildSocialCoverageReadback(snapshot);
const reconciliationFindings = (snapshot.unclassifiedDataverseRows || []).flatMap((row) => {
  const finding = classifyDataverseExecutionRow(row, snapshot.asOf);
  return finding ? [{ id: row.id, platform: row.platform, status: row.status,
    requestedSchedule: row.requestedSchedule, requestedDestination: row.requestedDestination, ...finding }] : [];
});
process.stdout.write(`${JSON.stringify({
  ...report,
  readbackMode: snapshot.readbackMode,
  sourceSnapshotAsOf: snapshot.sourceSnapshotAsOf,
  liveDataverseObservedAt: snapshot.liveDataverseObservedAt || null,
  alertDelivery: 'REPORT_ONLY_WITH_STABLE_DEDUPE_KEYS',
  ...(snapshot.unclassifiedDataverseRows ? { unclassifiedDataverseRows: snapshot.unclassifiedDataverseRows } : {}),
  ...(snapshot.mappedDataverseRows !== undefined ? { mappedDataverseRows: snapshot.mappedDataverseRows } : {}),
  ...(snapshot.unclassifiedDataverseRows ? { reconciliationFindings } : {})
}, null, 2)}\n`);
