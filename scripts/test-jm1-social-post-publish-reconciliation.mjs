import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '795_jm1_social_post_publish_reconciliation_regression_v1.json');
const generatedAt = new Date().toISOString();

const row = {
  id: 'regression-social-row',
  idempotencyKey: 'regression:post-publish-failure',
  platform: 'instagram',
  status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
  platformPostId: '',
  caption: 'October Featured Author: Iyorwuese Hagher. A Portrait of Paradise opens a reader-first invitation.',
  destination: 'jmerrillpub'
};

const platform = {
  objects: [],
  publish() {
    const object = {
      id: `mock_ig_${this.objects.length + 1}`,
      caption: row.caption,
      username: row.destination,
      timestamp: generatedAt,
      permalink: `https://example.test/${this.objects.length + 1}`
    };
    this.objects.push(object);
    return object;
  },
  findByCaptionPrefix(prefix) {
    return this.objects
      .filter((object) => object.caption.startsWith(prefix) && object.username === row.destination)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
};

const dataverse = {
  failNextPostPublishWrite: true,
  writes: [],
  patch(payload) {
    if (this.failNextPostPublishWrite && payload.status === 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED') {
      this.failNextPostPublishWrite = false;
      throw new Error('SIMULATED_DATAVERSE_METADATA_WRITE_FAILURE');
    }
    Object.assign(row, payload);
    this.writes.push(payload.status);
  }
};

const first = executeWorkerOnce();
const retry = executeWorkerOnce();

const report = {
  packageId: 795,
  artifact: 'JM1-SOCIAL-POST-PUBLISH-RECONCILIATION-REGRESSION-v1',
  generatedAt,
  mode: 'NON_DESTRUCTIVE_SIMULATION',
  firstExecution: first,
  retryExecution: retry,
  platformObjectsCreated: platform.objects.length,
  duplicateObjectsCreated: platform.objects.length - 1,
  finalRow: row,
  dataverseWrites: dataverse.writes,
  classification: platform.objects.length === 1
    && retry.state === 'RECONCILED_PLATFORM_SUCCESS'
    && row.status === 'PUBLISHED_VERIFIED'
      ? 'POST_PUBLISH_FAILURE_IDEMPOTENCY_PROVEN'
      : 'POST_PUBLISH_FAILURE_IDEMPOTENCY_NOT_PROVEN'
};

mkdirSync(ROOT, { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

function executeWorkerOnce() {
  if (row.platformPostId && row.status === 'PUBLISHED_VERIFIED') {
    return { state: 'IDEMPOTENT_ALREADY_CERTIFIED', platformPostId: row.platformPostId };
  }

  if (row.status === 'PUBLISHING_CLAIMED' || row.status === 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED') {
    const matches = platform.findByCaptionPrefix(row.caption.slice(0, 72));
    if (matches.length === 1) {
      dataverse.patch({
        status: 'PUBLISHED_VERIFIED',
        platformPostId: matches[0].id,
        actualDestination: matches[0].username,
        actualMediaReference: matches[0].permalink,
        readbackState: 'RECONCILED_PLATFORM_SUCCESS_READBACK_MATCH'
      });
      return { state: 'RECONCILED_PLATFORM_SUCCESS', platformPostId: matches[0].id };
    }
    return { state: 'RECONCILIATION_MATCH_NOT_UNIQUE', matches: matches.length };
  }

  dataverse.patch({ status: 'PUBLISHING_CLAIMED', readbackState: 'PUBLISHING_CLAIMED' });
  const object = platform.publish();
  try {
    dataverse.patch({
      status: 'PLATFORM_OBJECT_EXISTS_DATAVERSE_RECONCILIATION_REQUIRED',
      platformPostId: object.id,
      actualDestination: object.username,
      actualMediaReference: object.permalink,
      readbackState: 'PLATFORM_OBJECT_ID_PERSISTED'
    });
    dataverse.patch({ status: 'PUBLISHED_VERIFIED', readbackState: 'READBACK_MATCH' });
    return { state: 'PUBLISHED_VERIFIED', platformPostId: object.id };
  } catch (error) {
    return { state: 'SIMULATED_POST_PUBLISH_DATAVERSE_FAILURE', error: error.message, platformPostIdNotYetStored: object.id };
  }
}
