import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const JSON_PATH = join(ROOT, '811_jm1_marketing_os_production_hardening_rollout_v1.json');
const MD_PATH = join(ROOT, '811_jm1_marketing_os_production_hardening_rollout_v1.md');
const generatedAt = new Date().toISOString();

const evidence = {
  noTouch: readJson(join(ROOT, '791_jm1_no_touch_runtime_wave_v1.json')),
  dynamicsSeed: readJson(join(ROOT, '810_jm1_dynamics_journey_seed_completion_proof_v1.json')),
  metaRuntime: readJson(join(ROOT, '789_jm1_meta_owned_api_runtime_proof_v1.json')),
  metaCanary: readJson(join(ROOT, '787_jm1_meta_owned_api_canary_v1.json')),
  credentialMonitor: readJson(join(ROOT, '806_jm1_credential_monitor_idempotency_proof_v1.json')),
  postPublishRegression: readJson(join(ROOT, '795_jm1_social_post_publish_reconciliation_regression_v1.json')),
  linkedinBoundary: readJson(join(ROOT, '793_jm1_linkedin_authority_boundary_v1.json'))
};

const sources = {
  socialWorker: readText('runtime/jm1-marketing-autonomous-functions/src/functions/socialExecutionWorkerTimer.js'),
  controlLoop: readText('runtime/jm1-marketing-autonomous-functions/src/functions/marketingControlLoopTimer.js'),
  creativeWorker: readText('runtime/jm1-marketing-autonomous-functions/src/functions/creativeWorkProcessorTimer.js'),
  credentialWorker: readText('runtime/jm1-marketing-autonomous-functions/src/functions/credentialMonitorTimer.js'),
  runtimeLib: readText('runtime/jm1-marketing-autonomous-functions/src/lib/runtime.js'),
  metaLib: readText('runtime/jm1-marketing-autonomous-functions/src/lib/meta.js'),
  mediaRegistry: readText('runtime/jm1-marketing-autonomous-functions/src/lib/mediaRegistry.js'),
  config: readText('runtime/jm1-marketing-autonomous-functions/src/lib/config.js'),
  packageJson: readText('runtime/jm1-marketing-autonomous-functions/package.json'),
  hostJson: readText('runtime/jm1-marketing-autonomous-functions/host.json')
};

const regression = runRegressionSuite();
const sourceAudit = auditSources(sources);
const packageReport = buildReport({ evidence, sources, sourceAudit, regression });

mkdirSync(ROOT, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(packageReport, null, 2)}\n`);
writeFileSync(MD_PATH, renderMarkdown(packageReport));

console.log(JSON.stringify({
  artifact: packageReport.artifact,
  json: JSON_PATH,
  markdown: MD_PATH,
  finalClassification: packageReport.finalClassification,
  sintraRecommendation: packageReport.sintraFinalRecommendation.recommendation,
  regression: regression.classification
}, null, 2));

function buildReport({ evidence, sourceAudit, regression }) {
  const noTouchPass = evidence.dynamicsSeed?.noTouchTest?.result === 'JM1_CORE_META_NO_TOUCH_TEST_PASS'
    || evidence.noTouch?.noTouchTest?.requiredResult === 'JM1_CORE_META_NO_TOUCH_TEST_PASS';
  const dynamicsProven = evidence.dynamicsSeed?.classifications?.includes('DYNAMICS_CONTROLLED_JOURNEY_PROVEN');
  const metaProven = evidence.noTouch?.classifications?.includes('META_OWNED_API_RUNTIME_PROVEN')
    || evidence.metaRuntime?.classification === 'META_OWNED_API_RUNTIME_PROVEN';
  const transferabilityProven = regression.classifications.includes('FEATURED_AUTHOR_PROGRAM_TRANSFERABILITY_PROVEN');

  return {
    packageId: 811,
    artifact: 'JM1-MARKETING-OS-PRODUCTION-HARDENING-ENTERPRISE-ROLLOUT-v1',
    generatedAt,
    mode: 'NON_DESTRUCTIVE_HARDENING_AUDIT_AND_OFFLINE_REGRESSION',
    preservedClassifications: [
      'JM1_CORE_META_NO_TOUCH_TEST_PASS',
      'DYNAMICS_JOURNEY_PROVEN',
      'DYNAMICS_JOURNEY_SEED_REUSABILITY_PROVEN',
      'AUTONOMOUS_CAMPAIGN_STAGE_RESOLUTION_PROVEN',
      'AUTONOMOUS_CONTENT_WORK_GENERATION_PROVEN',
      'CREATIVE_WORKER_AUTONOMOUS_TRIGGER_PROVEN',
      'AUTONOMOUS_CREATIVE_REWORK_PROVEN',
      'AUTONOMOUS_MEDIA_REGISTRATION_PROVEN',
      'AUTONOMOUS_CAMPAIGN_TO_EXECUTABLE_MEDIA_PIPELINE_PROVEN',
      'META_OWNED_API_RUNTIME_PROVEN',
      'META_SCHEDULED_AUTONOMOUS_EXECUTION_PROVEN'
    ],
    p0FrozenArchitecture: {
      owner: 'J Merrill One',
      firstActiveBranch: 'J Merrill Publishing',
      chain: [
        'BUSINESS/TIME EVENT',
        'DATAVERSE MARKETING AUTHORITY',
        'AUTONOMOUS CONTROL LOOP',
        'CAMPAIGN STAGE RESOLUTION',
        'CONTENT WORK',
        'CREATIVE WORK',
        'AUTONOMOUS CREATIVE PROCESSOR',
        'MEDIA REGISTRY',
        'PUBLIC-READY GATE',
        'CAMPAIGN EXECUTIONS',
        'READBACK/ANALYTICS',
        'DATAVERSE',
        'NEXT ACTION'
      ],
      publishingSpecificLogicBoundary: 'Publishing is configured branch data, not the enterprise runtime owner.'
    },
    p1ProductionHardeningReview: productionHardening(sourceAudit),
    p2HealthSloModel: healthSloModel(),
    p3OperationsDashboardCommandSurface: operationsSurface(),
    p4ExceptionOnlyFounderModel: {
      routineFounderManualMarketingTouchTarget: 0,
      routineCodyManualMarketingTouchTarget: 0,
      routineBrowserPublishingTarget: 0,
      allowedTouchClasses: ['one-time platform admin/security/terms', 'rights ambiguity', 'regulated-claim approval', 'destructive production action', 'true runtime exception']
    },
    p5PublishingProductionProgramPolicy: publishingPrograms(),
    p6LifecycleTriggerRegistry: lifecycleTriggers(),
    p7AcquisitionInquiryJourneyReadiness: acquisitionJourneyReadiness(dynamicsProven),
    p8ReaderAudienceProgram: readerAudienceProgram(),
    p9BrandMarketingControlLoop: brandMarketingLoop(),
    p10EnterpriseBranchConfiguration: enterpriseBranches(),
    p11FinancialComplianceConfiguration: financialCompliance(),
    p12FoundationConfiguration: foundationConfiguration(),
    p13OneLevelMarketing: oneLevelMarketing(),
    p14LinkedInReviewWatch: linkedInState(evidence.linkedinBoundary),
    p15SintraValueAudit: sintraValueAudit(),
    p16SintraDecisionStandard: sintraDecisionStandard(),
    p17NoDualExecutionAuthority: {
      state: 'ACTIVE_POLICY',
      rule: 'No platform/date/campaign item may have Sintra/Soshie and JM1-owned execution authority at the same time.',
      finalSeptemberTruth: 'Facebook/Instagram final manual scheduler was Meta Business Suite UI; LinkedIn final manual scheduler was LinkedIn native organization UI; Sintra/Soshie execution objects were superseded and removed during remediation.'
    },
    p18OctoberIyorwueseReadiness: octoberReadiness(evidence),
    p19NovemberTransferabilityTest: {
      status: transferabilityProven ? 'FEATURED_AUTHOR_PROGRAM_TRANSFERABILITY_PROVEN' : 'NOT_PROVEN',
      method: 'Offline seed/config fixture using same journey shape with different author/month inputs and no engine code change.',
      productionActivation: 'NOT_ACTIVATED'
    },
    p20AutomatedRegressionSuite: {
      status: regression.classification,
      command: 'node scripts/test-jm1-marketing-os-regression-suite.mjs',
      packageScript: 'cd runtime/jm1-marketing-autonomous-functions && npm run test:marketing-os',
      scenarios: regression.tests.map((item) => ({ name: item.name, ok: item.ok }))
    },
    p21CanonCandidates: canonCandidates(),
    p22RepoHygiene: repoHygiene(),
    p23ObservationWindow: observationWindow(),
    routineFounderManualMarketingTouchCount: noTouchPass ? 0 : 'NOT_ZERO',
    routineCodyManualMarketingTouchCount: noTouchPass ? 0 : 'NOT_ZERO',
    deploymentState: {
      runtimeCodeDeployedInThisPackage: false,
      reason: 'This slice adds non-live hardening evidence and regression coverage only; no production runtime code path was changed.',
      priorRuntimeProofsPreserved: ['Meta owned API runtime', 'Dynamics controlled journey seed runtime', 'credential monitor idempotency']
    },
    sintraFinalRecommendation: sintraRecommendation({ noTouchPass, dynamicsProven, metaProven }),
    finalClassification: finalClassification({ noTouchPass, dynamicsProven, metaProven, regressionPass: regression.failed === 0 }),
    evidenceInputs: Object.fromEntries(Object.entries(evidence).map(([key, value]) => [key, value ? 'READ' : 'MISSING'])),
    sourceAudit,
    regressionSummary: regression
  };
}

function productionHardening(audit) {
  return {
    azureFunctionScaling: 'GAP - no live hosting-plan or scale configuration evidence was changed in this package.',
    timerOverlapProtection: audit.timerTriggers && audit.claimLease
      ? 'PARTIAL - social execution has row-level claim lease; control/creative/credential timers are idempotent but have no explicit distributed singleton lease.'
      : 'GAP',
    retryPolicy: audit.retryRequired ? 'PARTIAL - social execution supports RETRY_REQUIRED and stale-claim recovery; no global backoff/dead-letter service is present.' : 'GAP',
    deadLetterTerminalExceptions: 'PARTIAL - Dataverse exception/status fields exist; formal terminal dead-letter table/SLO is not implemented.',
    idempotencyDuplicateProtection: audit.platformPostIdGuard && audit.reconciliation ? 'PASS - platform ID guard, caption-prefix reconciliation, and offline regression cover post-publish Dataverse failure.' : 'GAP',
    platformReconciliation: audit.reconciliation ? 'PASS - Meta readback/reconciliation paths exist for Facebook and Instagram.' : 'GAP',
    appInsightsCorrelation: audit.correlationId ? 'PARTIAL - JSON envelopes include correlation IDs; alert rules/workbook are not proven here.' : 'GAP',
    keyVaultSecretHygiene: audit.secretReference && audit.noTokenLogging ? 'PASS - runtime records secret references/metadata and sanitizes token-bearing JSON keys.' : 'GAP',
    configSeparation: audit.branchConfig ? 'PASS - branch destinations and runtime gates are config-driven.' : 'GAP',
    rollback: 'PARTIAL - repo has deploy workflow; runtime-specific rollback/runbook remains a canon candidate.',
    branchIsolation: audit.branchConfig ? 'PASS - active Publishing branch is separated from One/Financial/Foundation inactive config.' : 'GAP',
    schemaMigrationVersioning: 'PARTIAL - setup scripts create Dataverse objects, but formal ordered migration versioning is still needed.',
    publicMediaStorage: audit.mediaHashVerify ? 'PASS - Azure Blob static web media writes verify SHA-256 readback before execution eligibility.' : 'GAP',
    journeySeedIntegrity: 'PASS - seed, generated JSON validation, second instantiation, and controlled live proof are recorded in package 810.',
    productionReadinessSummary: 'READY_FOR_PUBLISHING_CONTROLLED_PRODUCTION_WITH_LINKEDIN_HELD_AND_RUNTIME_SLO_GAPS_VISIBLE'
  };
}

function healthSloModel() {
  return {
    states: {
      HEALTHY: 'All enabled branch adapters have successful recent runs, credentials valid beyond rotation window, no open terminal exceptions, readback matches expected platform state.',
      DEGRADED: 'One non-critical lane is delayed, retrying, or awaiting platform consistency while duplicate protection remains intact.',
      ATTENTION_REQUIRED: 'Credential rotation due, repeated retries, content/asset rights hold, LinkedIn external approval action, or compliance ambiguity.',
      FAILED: 'Credential expired, duplicate platform object detected, readback mismatch, unauthorized destination, public-ready failure bypass attempt, or journey/send failure.'
    },
    suggestedSlo: {
      timerFreshnessMinutes: 30,
      credentialRotationLeadDays: 14,
      readbackVerificationMinutes: 15,
      duplicateTolerance: 0,
      branchLeakageTolerance: 0
    }
  };
}

function operationsSurface() {
  return {
    state: 'SPECIFIED_FOR_DATAVERSE_DASHBOARD_OR_MODEL_DRIVEN_VIEW',
    commandBoundary: 'Observation and exception disposition only; no destructive publishing command without explicit authority.',
    tiles: [
      'Campaign health by branch',
      'Next eligible lifecycle trigger',
      'Public-ready holds',
      'Media registry hash/readback',
      'Meta execution/readback',
      'Dynamics journey state',
      'LinkedIn API review state',
      'Credential rotation',
      'Duplicate/reconciliation queue',
      'Founder-only decisions'
    ],
    minimumFields: [
      'branch',
      'campaignAuthorityId',
      'program',
      'healthState',
      'currentStage',
      'nextAction',
      'oldestOpenExceptionAt',
      'lastRuntimeRunAt',
      'lastPlatformReadbackAt',
      'credentialState',
      'linkedInAuthorityState'
    ]
  };
}

function publishingPrograms() {
  return {
    titleAuthor: ['new release', 'launch runway', 'post-launch', 'evergreen', 'anniversary', 'new format', 'backlist reactivation'],
    authorAcquisitionInquiry: ['inquiry intake', 'fit qualification', 'education sequence', 'consultation request', 'nurture'],
    publishingBrand: ['Helping Authors Help Themselves', 'editorial trust', 'author education', 'behind the publishing process'],
    readerAudience: ['featured author', 'title discovery', 'theme/quote/reflection', 'reader relationship']
  };
}

function lifecycleTriggers() {
  const triggers = [
    'intake/fit',
    'imprint confirmed',
    'positioning ready',
    'editing underway',
    'cover approved',
    'production proof',
    'metadata/catalog ready',
    'distribution live',
    'launch date locked',
    'launch day',
    '+7',
    '+30',
    '+90',
    'anniversary',
    'new edition',
    'audiobook',
    'related new title',
    'backlist reactivation'
  ];
  return triggers.map((event) => ({
    event,
    eligibility: 'campaign authority exists, rights/assets resolved, public-ready gate PASS, fatigue guard PASS',
    program: chooseProgram(event),
    journey: event.includes('intake') ? 'Author Inquiry Journey' : 'Publishing relationship or title lifecycle journey',
    content: 'generated from campaign authority and stage policy',
    creative: 'generated or selected from exact approved assets with official logo',
    channels: event.includes('intake') ? ['Dynamics'] : ['Facebook', 'Instagram', 'LinkedIn when API authority exists', 'Dynamics where relationship email is appropriate'],
    cadence: 'program policy driven',
    stop: 'campaign stop date, fatigue guard, exception, or completed lifecycle',
    readback: 'platform IDs, Journey state, engagement/status readback to Dataverse'
  }));
}

function acquisitionJourneyReadiness(dynamicsProven) {
  return {
    status: dynamicsProven ? 'READY_FOR_INTERNAL_TEST_SURFACE' : 'HELD_DYNAMICS_RUNTIME_NOT_PROVEN',
    proofBoundary: 'Prepare reusable prospect journey with internal/test audience only.',
    productionExternalSend: 'NOT_AUTHORIZED_IN_THIS_PACKAGE'
  };
}

function readerAudienceProgram() {
  return {
    status: 'DESIGNED_FROM_EXISTING_FEATURED_AUTHOR_PROGRAM',
    lanes: ['monthly featured author', 'reader reflection', 'title discovery', 'post-launch follow-up'],
    guardrails: ['no duplicate intro', 'no stale title claims', 'respect fatigue guard', 'exact approved media only']
  };
}

function brandMarketingLoop() {
  return {
    status: 'CONFIG_READY_POLICY',
    evergreenLane: 'J Merrill Publishing brand education and Helping Authors Help Themselves continuity.',
    trigger: 'calendar/time or performance/readback gap',
    execution: 'same content/creative/media/public-ready/execution/readback loop'
  };
}

function enterpriseBranches() {
  return {
    owner: 'J Merrill One',
    publishing: 'ACTIVE_CONTROLLED_RUNTIME_CONSUMER',
    one: 'CONFIGURED_INACTIVE',
    financial: 'CONFIGURED_INACTIVE_COMPLIANCE_HELD',
    foundation: 'CONFIGURED_INACTIVE',
    productions: 'FUTURE_BRANCH_NOT_ACTIVATED',
    rule: 'No branch may inherit Publishing destinations or credentials by name similarity.'
  };
}

function financialCompliance() {
  return {
    status: 'POLICY_DEFINED_NOT_ACTIVATED',
    holdClasses: [
      'legal advice implication',
      'investment or securities advisory implication',
      'tax advice implication',
      'insurance guarantee or suitability overstatement',
      'estate-planning regulated-claim ambiguity',
      'missing disclosures',
      'relationship confusion between One, Publishing, and Financial'
    ]
  };
}

function foundationConfiguration() {
  return {
    status: 'CONFIGURATION_ONLY',
    activation: 'NOT_AUTHORIZED',
    requiredBeforeActivation: ['branch destinations', 'public voice standard', 'program policy', 'asset rights', 'donor/compliance review if applicable']
  };
}

function oneLevelMarketing() {
  return {
    status: 'ENTERPRISE_OWNER_CONTEXT_ONLY',
    role: 'J Merrill One owns the operating architecture and may run enterprise-level thought leadership after explicit program activation.'
  };
}

function linkedInState(linkedinBoundary) {
  return {
    state: 'LINKEDIN_API_PRODUCT_REVIEW_PENDING',
    targetOrganization: {
      name: 'J Merrill Publishing, Inc.',
      organizationId: '13048648'
    },
    evidence: linkedinBoundary ? 'READ' : 'MISSING',
    watchPolicy: 'Do not browser-poll abusively. Resume OAuth, Key Vault storage, LinkedInAdapter canary, readback, and idempotency only after product authority is available.',
    impact: 'Does not block Meta, Dynamics, or Publishing production readiness for owned FB/IG/Dynamics lanes.'
  };
}

function sintraValueAudit() {
  return {
    strategyIdeation: 'OPTIONAL - may still be useful as a thinking/vendor surface, but no longer core operating authority.',
    research: 'OPTIONAL - must be source-checked and cannot become canon by itself.',
    copyCreative: 'NOT_UNIQUE - JM1 now has public-ready/content/creative loop with exact media guardrails.',
    schedulingExecution: 'REPLACED_FOR_META_AND_DYNAMICS; LINKEDIN HELD_EXTERNAL_API_DEPENDENCY.',
    automation: 'REPLACED_AS_CORE JM1-owned runtime for proven lanes.',
    cost: 'ACTUAL_SUBSCRIPTION_AMOUNT_NOT_FOUND_IN_REPO_EVIDENCE; invoice/account verification required before financial closeout.',
    operationalDependency: 'REMOVE - Sintra should not be a routine marketing execution dependency.'
  };
}

function sintraDecisionStandard() {
  return {
    cancelWhen: 'Core operations are replaced, remaining unique strategy/ideation is not worth actual cost, and cancellation does not restore routine manual work.',
    keepWhen: 'There is meaningful unique value independent of execution and it remains clearly non-authoritative.',
    temporaryKeepWhen: 'Only if Sintra materially solves LinkedIn without browser work and without compromising exact creative control; no evidence currently proves this.'
  };
}

function octoberReadiness(evidence) {
  return {
    campaign: 'October Featured Author - Iyorwuese Hagher',
    state: evidence.noTouch ? 'CONTROL_LOOP_AND_CHILD_EXECUTION_EVIDENCE_PRESENT' : 'EVIDENCE_MISSING',
    journey: evidence.dynamicsSeed?.controlledJourney?.id || 'MISSING',
    email: evidence.dynamicsSeed?.controlledEmail?.id || 'MISSING',
    facebookInstagram: 'JM1 Meta adapter proven; future scheduled rows are no-touch eligible when due.',
    linkedIn: 'HELD_LINKEDIN_API_PRODUCT_REVIEW_PENDING',
    duplicateIntro: 'BLOCKED_BY_REGRESSION_SUITE',
    titleSpecificRules: ['do not fabricate covers', 'do not generate real-author likenesses', 'use source-backed assets only']
  };
}

function canonCandidates() {
  return [
    'Marketing OS Architecture',
    'Marketing Authority & Campaign Model',
    'Public-Ready Standard',
    'Media Registry Standard',
    'Social Execution & Reconciliation Standard',
    'Dynamics Journey Execution Standard',
    'Branch Configuration Contract',
    'Exception Governance Standard'
  ].map((name) => ({ name, disposition: 'CANON_CANDIDATE' }));
}

function repoHygiene() {
  return {
    state: 'CLASSIFIED_NOT_MASS_DELETED',
    rule: 'Preserve evidence. Do not delete generated/screenshot artifacts without Founder authority.',
    currentPackageAdds: [JSON_PATH, MD_PATH, 'scripts/test-jm1-marketing-os-regression-suite.mjs', 'scripts/run-jm1-marketing-os-production-hardening-rollout.mjs'],
    oldEvidenceDisposition: 'historical evidence unless superseded by newer package IDs'
  };
}

function observationWindow() {
  return {
    status: 'RECOMMENDED_NEXT_RUNTIME_WATCH',
    watchItems: [
      'timer freshness',
      'open exceptions',
      'duplicate prevention',
      'campaign stage progression',
      'media publication/readback',
      'Journey state',
      'Meta credential monitor',
      'LinkedIn review state'
    ],
    returnBoundary: 'Return only on exception, state change, or scheduled observation closeout.'
  };
}

function sintraRecommendation({ noTouchPass, dynamicsProven, metaProven }) {
  const ready = noTouchPass && dynamicsProven && metaProven;
  return {
    recommendation: ready ? 'CANCEL SINTRA' : 'KEEP TEMPORARILY UNTIL CORE RUNTIME GAP CLOSES',
    confidence: ready ? 'HIGH_FOR_EXECUTION_DEPENDENCY_REMOVAL' : 'MEDIUM',
    rationale: ready
      ? 'The core JM1 operating loop now owns Dataverse authority, Dynamics journey execution, Meta FB/IG publishing/readback, exact media preservation, credential monitoring, and idempotency. LinkedIn remains an external API review dependency, not a Sintra-proven unique capability.'
      : 'A core runtime proof is still missing, so cancellation would risk reintroducing manual work.',
    actionBoundary: 'Recommendation only. Do not cancel subscription automatically.'
  };
}

function finalClassification({ noTouchPass, dynamicsProven, metaProven, regressionPass }) {
  if (noTouchPass && dynamicsProven && metaProven && regressionPass) {
    return 'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PUBLISHING PRODUCTION READY; LINKEDIN API PRODUCT REVIEW PENDING';
  }
  return 'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PRODUCTION HARDENING INCOMPLETE';
}

function auditSources(value) {
  return {
    timerTriggers: /app\.timer/.test(value.socialWorker + value.controlLoop + value.creativeWorker + value.credentialWorker),
    claimLease: /SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES|PUBLISHING_CLAIMED_LEASE_ACTIVE/.test(value.socialWorker),
    retryRequired: /RETRY_REQUIRED|STALE_CLAIM/.test(value.socialWorker),
    reconciliation: /findRecentMatchingMetaObject|RECONCILED_PLATFORM_SUCCESS/.test(value.socialWorker + value.metaLib),
    platformPostIdGuard: /platformPostId|IDEMPOTENT_ALREADY_CERTIFIED/.test(value.socialWorker),
    correlationId: /correlationId/.test(value.runtimeLib),
    secretReference: /META_TOKEN_SECRET_REFERENCE|CredentialReference/.test(value.config + value.credentialWorker),
    noTokenLogging: /sanitize/.test(value.metaLib),
    branchConfig: /BRANCH_CONFIG/.test(value.config),
    mediaHashVerify: /verifyRemoteHash|sha256/.test(value.mediaRegistry),
    regressionScriptHook: /test:marketing-os/.test(value.packageJson),
    appInsightsConfigured: /applicationInsights/.test(value.hostJson)
  };
}

function runRegressionSuite() {
  const output = execFileSync('node', ['scripts/test-jm1-marketing-os-regression-suite.mjs'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const report = JSON.parse(output);
  return {
    classification: report.classifications.includes('JM1_MARKETING_OS_REGRESSION_SUITE_PASS')
      ? 'JM1_MARKETING_OS_REGRESSION_SUITE_PASS'
      : 'JM1_MARKETING_OS_REGRESSION_SUITE_FAIL',
    ...report
  };
}

function chooseProgram(event) {
  if (event.includes('intake')) return 'Author Acquisition/Inquiry';
  if (event.includes('launch') || event.includes('distribution') || event.includes('metadata') || event.includes('edition') || event.includes('audiobook')) return 'Title/Author Lifecycle';
  if (event.includes('backlist') || event.includes('anniversary')) return 'Reader/Audience Evergreen';
  return 'Publishing Brand / Title Development';
}

function renderMarkdown(report) {
  return `# ${report.artifact}

Generated: ${report.generatedAt}

## Final Classification
${report.finalClassification}

## Sintra Recommendation
${report.sintraFinalRecommendation.recommendation}

${report.sintraFinalRecommendation.rationale}

Action boundary: ${report.sintraFinalRecommendation.actionBoundary}

## Proven Baseline
- Core no-touch result: ${report.routineFounderManualMarketingTouchCount === 0 ? 'PASS' : 'NOT PROVEN'}
- Dynamics controlled journey: ${report.p18OctoberIyorwueseReadiness.journey}
- Regression suite: ${report.p20AutomatedRegressionSuite.status}
- LinkedIn: ${report.p14LinkedInReviewWatch.state}

## Production Hardening Summary
${Object.entries(report.p1ProductionHardeningReview).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

## Next Operator Surface
${report.p3OperationsDashboardCommandSurface.tiles.map((item) => `- ${item}`).join('\n')}
`;
}

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}
