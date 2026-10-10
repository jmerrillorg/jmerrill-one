import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildArtifactName,
  createManifest,
  selectSuccessfulLiveDeployment,
  selectSuccessfulArtifact,
  verifyManifestIdentity,
  verifyLiveDeployedBaseline,
  verifyPackageBytes
} from './marketing-release-provenance.mjs';

const commitSha = 'a'.repeat(40);
const repository = 'jmerrillorg/jmerrill-one';
const runId = '123456';
const runAttempt = '2';
const workflowPath = '.github/workflows/azure-marketing-functions.yml';
const artifactName = buildArtifactName(commitSha, runId, runAttempt);

function fixtures() {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'jm1-release-provenance-'));
  const packagePath = path.join(directory, `jm1-marketing-functions-${commitSha}.zip`);
  const deployedPath = path.join(directory, 'deployed-package.zip');
  const manifestPath = path.join(directory, 'release-provenance.json');
  const expectedPath = path.join(directory, 'expected.json');
  const bytes = Buffer.from('verified-release-package-bytes');
  writeFileSync(packagePath, bytes);
  writeFileSync(deployedPath, bytes);
  const manifest = createManifest({
    repository,
    commitSha,
    runId,
    runAttempt,
    workflowPath,
    artifactName,
    packageName: path.basename(packagePath),
    packageSha256: createHash('sha256').update(bytes).digest('hex')
  });
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const expected = { repository, commitSha, workflowPath, runId, runAttempt, artifactName, artifactId: '987654' };
  writeFileSync(expectedPath, JSON.stringify(expected));
  return { directory, packagePath, deployedPath, manifestPath, expectedPath, manifest, expected };
}

test('release provenance binds package bytes to repository, SHA, successful run and artifact identity', async () => {
  const f = fixtures();
  try {
    const manifest = JSON.parse(readFileSync(f.manifestPath, 'utf8'));
    const digest = await verifyPackageBytes({ manifest, expected: f.expected, deployedPackagePath: f.deployedPath });
    assert.equal(digest, manifest.packageSha256);
  } finally {
    rmSync(f.directory, { recursive: true, force: true });
  }
});

test('tampered Azure rollback package fails against the successful build artifact digest', async () => {
  const f = fixtures();
  try {
    writeFileSync(f.deployedPath, 'tampered-azure-blob-bytes');
    await assert.rejects(verifyPackageBytes({ manifest: f.manifest, expected: f.expected, deployedPackagePath: f.deployedPath }), /rollback package bytes/);
  } finally {
    rmSync(f.directory, { recursive: true, force: true });
  }
});

test('mismatched commit, run attempt, repository, or artifact identity fails closed', () => {
  const f = fixtures();
  for (const [key, value] of [['commitSha', 'b'.repeat(40)], ['runAttempt', '1'], ['repository', 'other/repo'], ['artifactName', 'wrong-artifact']]) {
    assert.throws(() => verifyManifestIdentity(f.manifest, { ...f.expected, [key]: value }), /does not match|identity is invalid/);
  }
  rmSync(f.directory, { recursive: true, force: true });
});

test('missing provenance fields fail closed', () => {
  const f = fixtures();
  const missing = { ...f.manifest };
  delete missing.packageSha256;
  assert.throws(() => verifyManifestIdentity(missing, f.expected), /missing required identity fields/);
  rmSync(f.directory, { recursive: true, force: true });
});

test('a SHA-named package and locally computed hash are not accepted without a successful Actions artifact record', () => {
  const run = { id: 1, run_attempt: 1, status: 'completed', conclusion: 'success', deployJobConclusion: 'success', head_sha: commitSha, path: workflowPath, repository: { full_name: repository }, created_at: '2026-10-09T12:00:00Z' };
  assert.throws(() => selectSuccessfulArtifact([run], [], { repository, commitSha }), /No unexpired successful build artifact/);
});

test('live baseline selector requires the exact successful deployment run and deploy job', () => {
  const run = { id: 88, run_attempt: 1, status: 'completed', conclusion: 'success', head_sha: commitSha, path: workflowPath, repository: { full_name: repository } };
  const job = { name: 'deploy', conclusion: 'success' };
  assert.equal(selectSuccessfulLiveDeployment(run, job, { repository, commitSha }).baselineOnly, true);
  for (const [changedRun, changedJob] of [
    [{ ...run, conclusion: 'failure' }, job],
    [{ ...run, head_sha: 'b'.repeat(40) }, job],
    [run, { ...job, conclusion: 'failure' }],
    [run, { ...job, name: 'validate' }]
  ]) assert.throws(() => selectSuccessfulLiveDeployment(changedRun, changedJob, { repository, commitSha }), /Live rollback baseline requires/);
});

test('expired, mismatched-SHA, failed, or wrong-attempt artifacts are rejected', () => {
  const run = { id: 1, run_attempt: 2, status: 'completed', conclusion: 'success', deployJobConclusion: 'success', head_sha: commitSha, path: workflowPath, repository: { full_name: repository }, created_at: '2026-10-09T12:00:00Z' };
  const name = buildArtifactName(commitSha, run.id, run.run_attempt);
  for (const artifact of [
    { id: 1, name, expired: true, workflow_run: { id: 1, head_sha: commitSha } },
    { id: 2, name, expired: false, workflow_run: { id: 2, head_sha: commitSha } },
    { id: 3, name: buildArtifactName(commitSha, run.id, 1), expired: false, workflow_run: { id: 1, head_sha: commitSha } },
    { id: 5, name, expired: false, workflow_run: { id: 1, head_sha: 'b'.repeat(40) } }
  ]) assert.throws(() => selectSuccessfulArtifact([run], [artifact], { repository, commitSha }), /No unexpired successful build artifact/);
  assert.throws(() => selectSuccessfulArtifact([{ ...run, conclusion: 'failure' }], [{ id: 4, name, expired: false, workflow_run: { id: 1, head_sha: commitSha } }], { repository, commitSha }), /No unexpired successful build artifact/);
  assert.throws(() => selectSuccessfulArtifact([{ ...run, deployJobConclusion: 'failure' }], [{ id: 4, name, expired: false, workflow_run: { id: 1, head_sha: commitSha } }], { repository, commitSha }), /No unexpired successful build artifact/);
});

test('latest successful matching workflow run is bound to its exact artifact and attempt', () => {
  const earlier = { id: 10, run_attempt: 1, status: 'completed', conclusion: 'success', deployJobConclusion: 'success', head_sha: commitSha, path: workflowPath, repository: { full_name: repository }, created_at: '2026-10-08T12:00:00Z' };
  const latest = { ...earlier, id: 11, run_attempt: 3, created_at: '2026-10-09T12:00:00Z' };
  const artifact = { id: 22, name: buildArtifactName(commitSha, latest.id, latest.run_attempt), expired: false, workflow_run: { id: latest.id, head_sha: commitSha } };
  const selected = selectSuccessfulArtifact([earlier, latest], [artifact], { repository, commitSha });
  assert.equal(selected.runId, '11');
  assert.equal(selected.runAttempt, '3');
  assert.equal(selected.artifactId, '22');
});

test('rollback bootstrap accepts only the exact live SHA-named package with a successful deployment run', async () => {
  const f = fixtures();
  const baseline = {
    repository, commitSha, workflowPath, runId, runAttempt,
    artifactName: null, artifactId: null, baselineOnly: true
  };
  try {
    const url = `https://stjm1diagrunner.blob.core.windows.net/function-releases/jm1-marketing-functions-${commitSha}.zip`;
    const hash = await verifyLiveDeployedBaseline({
      baseline, repository, commitSha, deployedPackageUrl: url, expectedPackageUrl: url,
      deployedPackagePath: f.deployedPath
    });
    assert.equal(hash, f.manifest.packageSha256);
    await assert.rejects(verifyLiveDeployedBaseline({
      baseline, repository, commitSha, deployedPackageUrl: url.replace(commitSha, 'b'.repeat(40)),
      expectedPackageUrl: url, deployedPackagePath: f.deployedPath
    }), /URL does not match/);
    await assert.rejects(verifyLiveDeployedBaseline({
      baseline: { ...baseline, runId: '' }, repository, commitSha,
      deployedPackageUrl: url, expectedPackageUrl: url, deployedPackagePath: f.deployedPath
    }), /not bound to a successful deployment/);
  } finally {
    rmSync(f.directory, { recursive: true, force: true });
  }
});
