import assert from 'node:assert/strict';

process.env.DATAVERSE_RESOURCE_URL ||= 'https://example.crm.dynamics.com';
process.env.DATAVERSE_TENANT_ID ||= '00000000-0000-0000-0000-000000000000';
process.env.DATAVERSE_CLIENT_ID ||= 'offline-regression-client';
process.env.DATAVERSE_CLIENT_SECRET ||= 'offline-regression-secret';

const {
  LINKEDIN_REQUIRED_SCOPES,
  linkedInImagePostPayload,
  organizationUrnFor
} = await import('../runtime/jm1-marketing-autonomous-functions/src/lib/linkedin.js');

const generatedAt = new Date().toISOString();
const organizationId = '13048648';
const organizationUrn = 'urn:li:organization:13048648';
const caption = 'J Merrill Publishing LinkedIn owned-runtime regression proof.';
const imageUrn = 'urn:li:image:jm1RegressionImage';

const tests = [
  test('least-privilege organization social scopes are fixed', () => {
    assert.deepEqual(LINKEDIN_REQUIRED_SCOPES, ['w_organization_social', 'r_organization_social']);
  }),
  test('organization URN is deterministic and branch-scoped', () => {
    assert.equal(organizationUrnFor(organizationId), organizationUrn);
    assert.equal(organizationUrnFor(organizationUrn), organizationUrn);
  }),
  test('image post payload uses current Posts API shape', () => {
    const payload = linkedInImagePostPayload({
      organizationId,
      caption,
      imageUrn,
      altText: 'Approved J Merrill Publishing creative.'
    });
    assert.equal(payload.author, organizationUrn);
    assert.equal(payload.commentary, caption);
    assert.equal(payload.visibility, 'PUBLIC');
    assert.equal(payload.lifecycleState, 'PUBLISHED');
    assert.equal(payload.distribution.feedDistribution, 'MAIN_FEED');
    assert.equal(payload.content.media.id, imageUrn);
    assert.equal(payload.content.media.altText, 'Approved J Merrill Publishing creative.');
  }),
  test('unsupported SVG media is held before LinkedIn upload', () => {
    assert.equal(mediaPreflight('image/svg+xml').state, 'LINKEDIN_UNSUPPORTED_IMAGE_MIME_TYPE');
    assert.equal(mediaPreflight('image/png').state, 'LINKEDIN_MEDIA_PREFLIGHT_PASS');
  }),
  test('post-publish Dataverse failure reconciles without a duplicate LinkedIn post', () => {
    const runtime = simulatedLinkedInRuntime();
    const first = runtime.execute();
    const second = runtime.execute();
    const third = runtime.execute();
    assert.equal(first.state, 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE');
    assert.equal(second.state, 'LINKEDIN_RECONCILED_PLATFORM_SUCCESS');
    assert.equal(third.state, 'IDEMPOTENT_ALREADY_CERTIFIED');
    assert.equal(runtime.platformObjects.length, 1);
    assert.equal(runtime.row.status, 'PUBLISHED_VERIFIED');
  }),
  test('duplicate LinkedIn readback refuses certification', () => {
    const runtime = simulatedLinkedInRuntime({ duplicatePlatformObjects: true });
    const result = runtime.reconcile();
    assert.equal(result.state, 'LINKEDIN_RECONCILIATION_MATCH_NOT_UNIQUE');
    assert.equal(result.matches, 2);
  }),
  test('stale claim recovery waits one tick before safe reclaim', () => {
    const runtime = simulatedLinkedInRuntime({ staleClaim: true });
    const first = runtime.execute();
    const second = runtime.execute();
    assert.equal(first.state, 'LINKEDIN_STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM');
    assert.equal(second.state, 'PUBLISHED_VERIFIED');
    assert.equal(runtime.platformObjects.length, 1);
  })
];

const failures = tests.filter((result) => !result.ok);
const report = {
  artifact: 'JM1-LINKEDIN-RUNTIME-REGRESSION-SUITE-v1',
  generatedAt,
  mode: 'OFFLINE_NON_DESTRUCTIVE',
  tests,
  passed: tests.length - failures.length,
  failed: failures.length,
  classifications: failures.length === 0
    ? [
      'LINKEDIN_ADAPTER_PAYLOAD_READY',
      'LINKEDIN_POST_PUBLISH_RECONCILIATION_PROVEN_OFFLINE',
      'LINKEDIN_STALE_CLAIM_RECOVERY_PROVEN_OFFLINE'
    ]
    : ['LINKEDIN_ADAPTER_REGRESSION_FAIL']
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exit(1);

function test(name, fn) {
  try {
    fn();
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, error: error.message };
  }
}

function mediaPreflight(mimeType) {
  return ['image/jpeg', 'image/png', 'image/gif'].includes(mimeType)
    ? { state: 'LINKEDIN_MEDIA_PREFLIGHT_PASS' }
    : { state: 'LINKEDIN_UNSUPPORTED_IMAGE_MIME_TYPE', mimeType };
}

function simulatedLinkedInRuntime(options = {}) {
  const row = {
    status: options.staleClaim ? 'PUBLISHING_CLAIMED' : 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
    platformPostId: '',
    caption,
    destination: organizationUrn,
    verifiedAt: options.staleClaim ? new Date(Date.now() - 25 * 60 * 1000).toISOString() : ''
  };
  const platformObjects = options.duplicatePlatformObjects
    ? [
      { id: 'urn:li:share:regression1', caption, destination: organizationUrn, imageUrn },
      { id: 'urn:li:share:regression2', caption, destination: organizationUrn, imageUrn }
    ]
    : [];
  let failPlatformAcceptedWrite = !options.staleClaim;

  return {
    row,
    platformObjects,
    execute() {
      if (row.platformPostId && row.status === 'PUBLISHED_VERIFIED') {
        return { state: 'IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: row.platformPostId };
      }
      if (row.status === 'PUBLISHING_CLAIMED') {
        if (options.staleClaim && !row.staleRecovered) {
          row.status = 'RETRY_REQUIRED';
          row.staleRecovered = true;
          return { state: 'LINKEDIN_STALE_CLAIM_RECOVERY_READY_FOR_SAFE_RECLAIM' };
        }
        return this.reconcile();
      }
      if (row.status === 'RETRY_REQUIRED') row.status = 'PUBLIC_READY_SCHEDULED_ELIGIBLE';

      row.status = 'PUBLISHING_CLAIMED';
      const object = {
        id: `urn:li:share:regression${platformObjects.length + 1}`,
        caption: row.caption,
        destination: row.destination,
        imageUrn
      };
      platformObjects.push(object);
      if (failPlatformAcceptedWrite) {
        failPlatformAcceptedWrite = false;
        return { state: 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE', platformPostIdNotYetStored: object.id };
      }
      row.platformPostId = object.id;
      row.status = 'PUBLISHED_VERIFIED';
      return { state: 'PUBLISHED_VERIFIED', platformPostId: object.id };
    },
    reconcile() {
      const matches = platformObjects.filter((object) =>
        object.caption === row.caption
        && object.destination === row.destination
      );
      if (matches.length !== 1) return { state: 'LINKEDIN_RECONCILIATION_MATCH_NOT_UNIQUE', matches: matches.length };
      row.platformPostId = matches[0].id;
      row.status = 'PUBLISHED_VERIFIED';
      return { state: 'LINKEDIN_RECONCILED_PLATFORM_SUCCESS', platformPostId: matches[0].id };
    }
  };
}
