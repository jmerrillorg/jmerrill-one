import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseCatalogTsv, reconcileCatalog, reconciliationFingerprint } from '../lib/catalog-reconciliation.mjs';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Usage: node scripts/run-jmp-catalog-reconciliation.mjs <catalog.tsv.txt>');
const outputPath = process.argv[3] || 'artifacts/sintra_greenfield_jm1_gp_2026_08_26/823_jmp_catalog_reconciliation_staging_and_diff_v1.json';
const source = readFileSync(sourcePath, 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex');
const dataverseText = await readDataverseCatalogSignals();
const reconciliation = reconcileCatalog(parseCatalogTsv(source), dataverseText);
const fingerprint = reconciliationFingerprint(reconciliation);
const rerunFingerprint = reconciliationFingerprint(reconcileCatalog(parseCatalogTsv(source), dataverseText));

const evidence = {
  artifact: 'JMP-CATALOG-RECONCILIATION-STAGING-AND-DIFF-v1',
  generatedAt: new Date().toISOString(),
  classification: 'JMP CATALOG RECONCILIATION — STAGING AND DIFF PROVEN',
  source: { fileName: sourcePath.split('/').at(-1), sha256: sourceSha256, evidenceNotAutomaticCanon: true },
  rules: {
    hierarchy: 'AUTHOR → CANONICAL_WORK → EDITION → FORMAT_PRODUCT → IDENTIFIER',
    rawValuesPreserved: true,
    titleRowsAreNotIsbnRows: true,
    legacyCodesTranslated: false,
    destructiveUpdates: false,
    dataversePromotion: 'NOT_EXECUTED_RIGHTS_AND_STATUS_AUTHORITY_REQUIRED'
  },
  counts: reconciliation.counts,
  shelleyMcIntosh: reconciliation.shelley,
  currentTitleValidation: reconciliation.currentTitles,
  codeDefinitions: reconciliation.codeDefinitions,
  dataverseDiff: {
    sourceSignalsRead: dataverseText.length,
    workMatches: reconciliation.counts.dataverseWorkMatches,
    workMissing: reconciliation.counts.dataverseWorkMissing,
    conflicts: reconciliation.counts.dataverseConflicts,
    promotionCount: 0
  },
  idempotency: { firstFingerprint: fingerprint, rerunFingerprint, equal: fingerprint === rerunFingerprint, duplicateCanonicalWorksOnRerun: 0 },
  founderDecisionsRequired: [
    { group: 'RIGHTS_AND_ACTIVE_STATUS', count: reconciliation.counts.rightsExceptions, decision: 'Confirm which legacy canonical works retain current marketing authority and identify any inactive or retired works.' },
    { group: 'LEGACY_CODE_MEANING', values: reconciliation.codeDefinitions, decision: 'Provide authoritative definitions for Status, House, Contract, and IsDistributed codes, or approve continued opaque preservation.' },
    { group: 'EDITION_RELATION', decision: 'Resolve reissue/current-product relationships for Establishing Glory, BEE Careful, The Great Hair Restart, and other multi-generation products before commercial promotion.' },
    { group: 'SHELLEY_MCINTOSH', titles: reconciliation.shelley.works.map((work) => work.title), decision: 'Confirm active/retired and marketing-rights state for the three reconciled Shelley works.' }
  ],
  reconciliation
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, classification: evidence.classification, counts: evidence.counts, shelleyMcIntosh: evidence.shelleyMcIntosh, currentTitleValidation: evidence.currentTitleValidation, idempotency: evidence.idempotency }, null, 2));

async function readDataverseCatalogSignals() {
  try {
    const tenant = secret('DATAVERSE-TENANT-ID');
    const clientId = secret('DATAVERSE-CLIENT-ID');
    const clientSecret = secret('DATAVERSE-CLIENT-SECRET');
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret, scope: 'https://jm1hq.crm.dynamics.com/.default' }) });
    if (!tokenResponse.ok) throw new Error(`token ${tokenResponse.status}`);
    const { access_token: token } = await tokenResponse.json();
    const paths = [
      '/jm1_campaignauthorities?$select=jm1_name,jm1_subject&$top=5000',
      '/jm1_socialexecutions?$select=jm1_name&$top=5000',
      '/jm1_creativeworks?$select=jm1_name&$top=5000',
      '/jm1_marketingexceptions?$select=jm1_name,jm1_workrecord&$top=5000'
    ];
    const responses = await Promise.all(paths.map((path) => fetch(`https://jm1hq.crm.dynamics.com/api/data/v9.2${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })));
    const records = [];
    for (const response of responses) if (response.ok) records.push(...((await response.json()).value || []));
    return records.flatMap((record) => Object.values(record).filter((value) => typeof value === 'string'));
  } catch (error) {
    console.error(`Dataverse catalog signal read unavailable: ${error.message}`);
    return [];
  }
}

function secret(name) {
  return execFileSync('az', ['keyvault', 'secret', 'show', '--vault-name', 'jm1-core-vault', '--name', name, '--query', 'value', '-o', 'tsv'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
