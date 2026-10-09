#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WORKFLOW_PATH = '.github/workflows/azure-marketing-functions.yml';

export function buildArtifactName(commitSha, runId, runAttempt) {
  return `jm1-marketing-functions-${commitSha}-run-${runId}-attempt-${runAttempt}`;
}

export function createManifest({ repository, commitSha, runId, runAttempt, workflowPath, artifactName, packageName, packageSha256 }) {
  if (!repository || !/^[0-9a-f]{40}$/.test(commitSha || '') || !/^\d+$/.test(String(runId || ''))
    || !/^\d+$/.test(String(runAttempt || '')) || !workflowPath || !artifactName || !packageName
    || !/^[0-9a-f]{64}$/.test(packageSha256 || '')) {
    throw new Error('Release provenance requires repository, commit, run, workflow, artifact, package, and SHA-256 identities.');
  }
  if (workflowPath !== WORKFLOW_PATH || packageName !== `jm1-marketing-functions-${commitSha}.zip`
    || artifactName !== buildArtifactName(commitSha, runId, runAttempt)) {
    throw new Error('Release provenance identities do not match the governed workflow/package naming contract.');
  }
  return {
    schemaVersion: 1,
    repository,
    commitSha,
    workflowPath,
    runId: String(runId),
    runAttempt: String(runAttempt),
    artifactName,
    packageName,
    packageSha256
  };
}

export function selectSuccessfulArtifact(workflowRuns, artifacts, { repository, commitSha, workflowPath = WORKFLOW_PATH }) {
  const runs = workflowRuns
    .filter((run) => run.status === 'completed'
      && run.conclusion === 'success'
      && run.deployJobConclusion === 'success'
      && run.head_sha === commitSha
      && run.path === workflowPath
      && run.repository?.full_name === repository
      && /^\d+$/.test(String(run.id || ''))
      && /^\d+$/.test(String(run.run_attempt || '')))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

  for (const run of runs) {
    const expectedName = buildArtifactName(commitSha, run.id, run.run_attempt);
    const artifact = artifacts.find((candidate) => candidate.name === expectedName
      && candidate.expired === false
      && candidate.workflow_run?.id === run.id
      && candidate.workflow_run?.head_sha === commitSha);
    if (!artifact) continue;
    return {
      repository,
      commitSha,
      workflowPath,
      runId: String(run.id),
      runAttempt: String(run.run_attempt),
      artifactName: expectedName,
      artifactId: String(artifact.id)
    };
  }
  throw new Error(`No unexpired successful build artifact proves rollback package provenance for ${commitSha}; refusing release.`);
}

export function verifyManifestIdentity(manifest, expected) {
  const required = ['schemaVersion', 'repository', 'commitSha', 'workflowPath', 'runId', 'runAttempt', 'artifactName', 'packageName', 'packageSha256'];
  if (!manifest || required.some((key) => manifest[key] === undefined || manifest[key] === null || manifest[key] === '')) {
    throw new Error('Release provenance manifest is missing required identity fields.');
  }
  if (manifest.schemaVersion !== 1) throw new Error('Unsupported release provenance schema.');
  for (const key of ['repository', 'commitSha', 'workflowPath', 'runId', 'runAttempt', 'artifactName']) {
    if (String(manifest[key]) !== String(expected[key])) throw new Error(`Release provenance ${key} does not match the successful build record.`);
  }
  if (manifest.packageName !== `jm1-marketing-functions-${expected.commitSha}.zip`
    || manifest.artifactName !== buildArtifactName(expected.commitSha, expected.runId, expected.runAttempt)
    || manifest.workflowPath !== WORKFLOW_PATH
    || !/^[0-9a-f]{64}$/.test(manifest.packageSha256)) {
    throw new Error('Release provenance package or workflow identity is invalid.');
  }
}

export async function verifyPackageBytes({ manifest, expected, deployedPackagePath }) {
  verifyManifestIdentity(manifest, expected);
  const deployedHash = await sha256File(deployedPackagePath);
  if (deployedHash !== manifest.packageSha256) throw new Error('Deployed rollback package bytes do not match the successful build artifact SHA-256.');
  return manifest.packageSha256;
}

export async function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

async function locateArtifact({ repository, commitSha, token }) {
  if (!token) throw new Error('GH_TOKEN with Actions read access is required to locate rollback provenance.');
  const base = `https://api.github.com/repos/${repository}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const workflowFile = path.basename(WORKFLOW_PATH);
  const runsResponse = await fetch(`${base}/actions/workflows/${encodeURIComponent(workflowFile)}/runs?head_sha=${commitSha}&status=success&per_page=100`, { headers });
  if (!runsResponse.ok) throw new Error(`Unable to read successful build records: HTTP ${runsResponse.status}.`);
  const runsBody = await runsResponse.json();
  const candidates = (runsBody.workflow_runs || []).filter((run) => run.status === 'completed'
    && run.conclusion === 'success'
    && run.head_sha === commitSha
    && run.path === WORKFLOW_PATH
    && run.repository?.full_name === repository)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

  for (const run of candidates) {
    const jobsResponse = await fetch(`${base}/actions/runs/${run.id}/jobs?per_page=100`, { headers });
    if (!jobsResponse.ok) throw new Error(`Unable to read deployment job for run ${run.id}: HTTP ${jobsResponse.status}.`);
    const jobsBody = await jobsResponse.json();
    const deployedJob = (jobsBody.jobs || []).find((job) => job.name === 'deploy' && job.conclusion === 'success');
    if (!deployedJob) continue;
    const artifactName = buildArtifactName(commitSha, run.id, run.run_attempt);
    const response = await fetch(`${base}/actions/runs/${run.id}/artifacts?per_page=100`, { headers });
    if (!response.ok) throw new Error(`Unable to read build artifacts for run ${run.id}: HTTP ${response.status}.`);
    const body = await response.json();
    const artifact = (body.artifacts || []).find((item) => item.name === artifactName
      && item.expired === false
      && item.workflow_run?.id === run.id
      && item.workflow_run?.head_sha === commitSha);
    if (artifact) {
      return selectSuccessfulArtifact([{ ...run, deployJobConclusion: deployedJob.conclusion }], [artifact], { repository, commitSha });
    }
  }
  throw new Error(`No unexpired successful build artifact proves rollback package provenance for ${commitSha}; refusing release.`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!['--package', '--manifest', '--repository', '--commit-sha', '--run-id', '--run-attempt', '--artifact-name', '--workflow-path', '--expected', '--deployed-package', '--output'].includes(key)) {
      throw new Error(`Unknown argument: ${key}`);
    }
    if (!argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`Missing value for ${key}.`);
    args[key.slice(2)] = argv[++index];
  }
  return args;
}

async function main() {
  const [mode, ...argv] = process.argv.slice(2);
  const args = parseArgs(argv);
  if (mode === 'create') {
    const packageName = path.basename(args.package || '');
    const manifest = createManifest({
      repository: args.repository,
      commitSha: args['commit-sha'],
      runId: args['run-id'],
      runAttempt: args['run-attempt'],
      workflowPath: args['workflow-path'],
      artifactName: args['artifact-name'],
      packageName,
      packageSha256: await sha256File(args.package)
    });
    writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
    process.stdout.write(`Created release provenance for ${manifest.commitSha}; package SHA-256 ${manifest.packageSha256}.\n`);
    return;
  }
  if (mode === 'locate') {
    const expected = await locateArtifact({ repository: args.repository, commitSha: args['commit-sha'], token: process.env.GH_TOKEN });
    writeFileSync(args.output, `${JSON.stringify(expected, null, 2)}\n`, { flag: 'wx' });
    process.stdout.write(`Found successful run ${expected.runId} and unexpired build artifact ${expected.artifactName}.\n`);
    return;
  }
  if (mode === 'verify') {
    const expected = JSON.parse(readFileSync(args.expected, 'utf8'));
    const manifest = JSON.parse(readFileSync(args.manifest, 'utf8'));
    const digest = await verifyPackageBytes({
      manifest,
      expected,
      deployedPackagePath: args['deployed-package']
    });
    process.stdout.write(`Rollback artifact provenance and deployed package bytes verified: ${digest}.\n`);
    return;
  }
  throw new Error('Usage: marketing-release-provenance.mjs <create|locate|verify> ...');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
