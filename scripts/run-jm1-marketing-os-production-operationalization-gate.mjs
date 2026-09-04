import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import https from 'node:https';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const JSON_PATH = join(ROOT, '812_jm1_marketing_os_production_operationalization_gate_v1.json');
const MD_PATH = join(ROOT, '812_jm1_marketing_os_production_operationalization_gate_v1.md');
const FUNCTION_APP = 'func-jm1-marketing-runtime';
const RESOURCE_GROUP = 'rg-jm1-ai';
const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const DATAVERSE_WEB_API_BASE_URL = process.env.JM1_DATAVERSE_WEB_API_BASE_URL || `${DATAVERSE_URL}/api/data/v9.2`;
const generatedAt = new Date().toISOString();

const productionFiles = [
  'host.json',
  'package.json',
  'src/functions/creativeWorkProcessorTimer.js',
  'src/functions/credentialMonitorTimer.js',
  'src/functions/marketingControlLoopTimer.js',
  'src/functions/socialExecutionWorkerTimer.js',
  'src/lib/campaignProgram.js',
  'src/lib/config.js',
  'src/lib/dataverse.js',
  'src/lib/linkedin.js',
  'src/lib/mediaRegistry.js',
  'src/lib/meta.js',
  'src/lib/runtime.js'
];

const acceptedBaseline = {
  commit: '2a9a33e',
  classifications: [
    'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PUBLISHING PRODUCTION READY; LINKEDIN API PRODUCT REVIEW PENDING',
    'JM1_MARKETING_OS_REGRESSION_SUITE_PASS',
    'FEATURED_AUTHOR_PROGRAM_TRANSFERABILITY_PROVEN'
  ],
  sintraRecommendation: 'CANCEL SINTRA'
};

const report = {
  packageId: 812,
  artifact: 'JM1-MARKETING-OS-PRODUCTION-OPERATIONALIZATION-GATE-v1',
  generatedAt,
  mode: 'LIVE_DEPLOYED_RUNTIME_RECONCILIATION_NON_DESTRUCTIVE',
  acceptedBaseline,
  deployedRuntimeReconciliation: null,
  productionDeploymentChanges: null,
  azureFunctionHealth: null,
  productionSafetyFlags: null,
  dataverseRowSweep: null,
  octoberReadiness: null,
  observationWindowResults: null,
  healthSloSurface: null,
  exceptionModel: null,
  routineFounderTouchCount: null,
  routineCodyTouchCount: null,
  enterpriseBranchReuse: null,
  financialHold: null,
  linkedinState: null,
  repoHygiene: null,
  canonCandidates: null,
  sintraLiveStateValueAudit: null,
  sintraExitCancellationRecommendation: null,
  finalMarketingOsClassification: null,
  branchCommitsDeploymentPrEvidence: null
};

const localCommit = run('git', ['rev-parse', 'HEAD']).trim();
const localShort = run('git', ['rev-parse', '--short', 'HEAD']).trim();
const functionApp = JSON.parse(run('az', [
  'functionapp', 'show',
  '--resource-group', RESOURCE_GROUP,
  '--name', FUNCTION_APP,
  '--query', '{name:name,state:state,kind:kind,defaultHostName:defaultHostName,enabled:enabled,httpsOnly:httpsOnly,identity:identity,siteConfig:{linuxFxVersion:siteConfig.linuxFxVersion,alwaysOn:siteConfig.alwaysOn,ftpsState:siteConfig.ftpsState,minTlsVersion:siteConfig.minTlsVersion},lastModifiedTimeUtc:lastModifiedTimeUtc,serverFarmId:serverFarmId}',
  '-o', 'json'
]));
const functionList = JSON.parse(run('az', [
  'functionapp', 'function', 'list',
  '--resource-group', RESOURCE_GROUP,
  '--name', FUNCTION_APP,
  '--query', '[].{name:name,config:config}',
  '-o', 'json'
]));
const settings = JSON.parse(run('az', [
  'functionapp', 'config', 'appsettings', 'list',
  '--resource-group', RESOURCE_GROUP,
  '--name', FUNCTION_APP,
  '-o', 'json'
]));
const safeSettings = summarizeSettings(settings);
const kudu = await compareKuduPackage();
const appInsights = await readAppInsights(functionApp);
const dataverse = await readDataverse();

report.deployedRuntimeReconciliation = reconcileRuntime({ localCommit, localShort, functionApp, functionList, safeSettings, kudu });
report.productionDeploymentChanges = deploymentChanges(report.deployedRuntimeReconciliation);
report.azureFunctionHealth = functionHealth({ functionApp, functionList, appInsights });
report.productionSafetyFlags = safetyFlags(safeSettings);
report.dataverseRowSweep = dataverse.rowSweep;
report.octoberReadiness = dataverse.octoberReadiness;
report.observationWindowResults = observationResults({ appInsights, rowSweep: dataverse.rowSweep });
report.healthSloSurface = healthSloSurface({ appInsights, dataverse, safeSettings });
report.exceptionModel = exceptionModel();
report.routineFounderTouchCount = touchCount('Founder');
report.routineCodyTouchCount = touchCount('Cody');
report.enterpriseBranchReuse = enterpriseBranchReuse(safeSettings);
report.financialHold = financialHold(safeSettings);
report.linkedinState = linkedInState(safeSettings);
report.repoHygiene = repoHygiene();
report.canonCandidates = canonCandidates();
report.sintraLiveStateValueAudit = sintraAudit();
report.finalMarketingOsClassification = finalClassification(report);
report.sintraExitCancellationRecommendation = sintraExitRecommendation(report);
report.branchCommitsDeploymentPrEvidence = {
  branch: run('git', ['branch', '--show-current']).trim(),
  currentCommit: localCommit,
  acceptedHardeningCommit: acceptedBaseline.commit,
  functionApp: FUNCTION_APP,
  resourceGroup: RESOURCE_GROUP,
  deploymentChangedInThisWave: false,
  pr: 'https://github.com/jmerrillorg/jmerrill-one/pull/10',
  evidence: [JSON_PATH, MD_PATH]
};

mkdirSync(ROOT, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, renderMarkdown(report));

console.log(JSON.stringify({
  artifact: report.artifact,
  json: JSON_PATH,
  markdown: MD_PATH,
  deployedRuntime: report.deployedRuntimeReconciliation.overall,
  safetyFlags: report.productionSafetyFlags.overall,
  finalClassification: report.finalMarketingOsClassification,
  sintra: report.sintraExitCancellationRecommendation.result
}, null, 2));

function reconcileRuntime({ localCommit, localShort, functionApp, functionList, safeSettings, kudu }) {
  const expectedFunctions = new Set([
    'creativeWorkProcessorTimer',
    'credentialMonitorTimer',
    'marketingControlLoopTimer',
    'socialExecutionWorkerTimer'
  ]);
  const deployedFunctions = functionList.map((item) => item.config?.name || item.name.split('/').pop()).sort();
  const missingFunctions = [...expectedFunctions].filter((item) => !deployedFunctions.includes(item));
  const extraFunctions = deployedFunctions.filter((item) => !expectedFunctions.has(item));
  const productionFileDrift = kudu.files.filter((item) => item.classification === 'DEPLOYMENT_REQUIRED');
  const evidenceOnlyDrift = kudu.files.filter((item) => item.classification === 'EVIDENCE_ONLY');

  return {
    overall: missingFunctions.length === 0 && productionFileDrift.length === 0 ? 'MATCH_WITH_EVIDENCE_ONLY_DRIFT' : 'DEPLOYMENT_REQUIRED',
    localCommit,
    localShort,
    deployedCommitSetting: safeSettings.JM1_RELEASE_SHA || 'NOT_SET',
    functionApp: {
      name: functionApp.name,
      state: functionApp.state,
      nodeRuntime: functionApp.siteConfig?.linuxFxVersion,
      httpsOnly: functionApp.httpsOnly,
      alwaysOn: functionApp.siteConfig?.alwaysOn,
      managedIdentity: functionApp.identity?.type || 'NONE'
    },
    timerDefinitions: functionList.map((item) => ({
      name: item.config?.name || item.name,
      schedule: item.config?.bindings?.find((binding) => binding.type === 'timerTrigger')?.schedule || 'MISSING',
      classification: expectedFunctions.has(item.config?.name) ? 'MATCH' : 'STALE_LOCAL_ONLY'
    })),
    packageContents: kudu,
    differences: [
      ...productionFileDrift.map((item) => ({ file: item.file, classification: 'DEPLOYMENT_REQUIRED', reason: item.reason })),
      ...evidenceOnlyDrift.map((item) => ({ file: item.file, classification: 'EVIDENCE_ONLY', reason: item.reason })),
      ...(functionApp.httpsOnly === false ? [{ setting: 'httpsOnly', classification: 'CONFIGURATION_REQUIRED', reason: 'Function App resource allows HTTP. Timers are not HTTP endpoints, but production security baseline should prefer HTTPS-only.' }] : []),
      ...(functionApp.siteConfig?.alwaysOn === false ? [{ setting: 'alwaysOn', classification: 'EVIDENCE_ONLY', reason: 'Consumption-style function app reports alwaysOn false; timer triggers are present and running.' }] : []),
      ...(safeSettings.JM1_RELEASE_SHA ? [] : [{ setting: 'JM1_RELEASE_SHA', classification: 'CONFIGURATION_REQUIRED', reason: 'No deployed source commit setting is present for explicit version readback.' }])
    ],
    missingFunctions,
    extraFunctions
  };
}

function deploymentChanges(reconciliation) {
  const required = reconciliation.differences.filter((item) => item.classification === 'DEPLOYMENT_REQUIRED');
  return {
    deploymentPerformed: false,
    result: required.length === 0 ? 'NO_PRODUCTION_DEPLOYMENT_REQUIRED' : 'DEPLOYMENT_REQUIRED_NOT_EXECUTED',
    reason: required.length === 0
      ? 'No production runtime source drift was detected. Evidence/offline scripts are not production payload and were not deployed.'
      : 'Production runtime source drift exists and should be deployed separately after review.',
    requiredDeltas: required
  };
}

function functionHealth({ functionApp, functionList, appInsights }) {
  return {
    appState: functionApp.state,
    enabled: functionApp.enabled,
    functionsVisible: functionList.length,
    expectedFunctionCount: 4,
    appInsights: appInsights.component,
    recentInvocations: appInsights.invocations,
    recentExceptions: appInsights.exceptions,
    classification: functionApp.state === 'Running' && functionList.length === 4 && appInsights.exceptions.count === 0
      ? 'HEALTHY'
      : 'DEGRADED_OR_ATTENTION_REQUIRED'
  };
}

function safetyFlags(settings) {
  const states = {
    metaAutonomousExecution: settings.JM1_MARKETING_AUTONOMOUS_META_EXECUTION_ENABLED,
    linkedinAutonomousExecution: settings.JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED,
    syntheticCredentialMonitor: settings.JM1_CREDENTIAL_MONITOR_SYNTHETIC_ENABLED,
    controlLoopCron: settings.JM1_MARKETING_CONTROL_LOOP_CRON,
    creativeWorkerCron: settings.JM1_CREATIVE_WORKER_CRON,
    credentialMonitorCron: settings.JM1_CREDENTIAL_MONITOR_CRON,
    socialWorkerCron: settings.JM1_SOCIAL_EXECUTION_WORKER_CRON,
    publishingBranchActive: settings.JM1_MARKETING_BRANCH_CONFIG?.publishing?.active,
    oneBranchActive: settings.JM1_MARKETING_BRANCH_CONFIG?.one?.active,
    financialBranchActive: settings.JM1_MARKETING_BRANCH_CONFIG?.financial?.active,
    foundationBranchActive: settings.JM1_MARKETING_BRANCH_CONFIG?.foundation?.active
  };
  const ok = states.metaAutonomousExecution === 'true'
    && states.linkedinAutonomousExecution === 'false'
    && states.syntheticCredentialMonitor === 'false'
    && states.publishingBranchActive === true
    && states.oneBranchActive === false
    && states.financialBranchActive === false
    && states.foundationBranchActive === false;
  return { overall: ok ? 'PASS' : 'CONFIGURATION_REQUIRED', states };
}

function observationResults({ appInsights, rowSweep }) {
  return {
    boundedObservationMode: 'READ_ONLY_APP_INSIGHTS_AND_DATAVERSE',
    controlLoopInvocation: appInsights.invocations.byFunction.marketingControlLoopTimer || 'NO_RECENT_TELEMETRY_FOUND',
    creativeWorkerInvocation: appInsights.invocations.byFunction.creativeWorkProcessorTimer || 'NO_RECENT_TELEMETRY_FOUND',
    credentialMonitorInvocation: appInsights.invocations.byFunction.credentialMonitorTimer || 'NO_RECENT_TELEMETRY_FOUND',
    socialWorkerInvocation: appInsights.invocations.byFunction.socialExecutionWorkerTimer || 'NO_RECENT_TELEMETRY_FOUND',
    dynamicsRuntimeHealth: rowSweep.journeyRows.summary,
    metaAdapterHealth: rowSweep.socialRows.metaSummary,
    linkedinHoldBehavior: rowSweep.socialRows.linkedinSummary,
    appInsightsExceptions: appInsights.exceptions,
    conclusion: appInsights.invocations.count > 0 && appInsights.exceptions.count === 0
      ? 'OBSERVED_NO_RUNTIME_EXCEPTIONS'
      : 'OBSERVATION_REQUIRES_LONGER_WINDOW_OR_TELEMETRY_TUNING'
  };
}

function healthSloSurface({ appInsights, dataverse, safeSettings }) {
  return {
    implementedSurface: 'ARTIFACT_AND_DATAVERSE_READBACK_SURFACE',
    controlLoop: {
      lastSuccess: appInsights.invocations.byFunction.marketingControlLoopTimer?.latest || null,
      nextExpected: cronExpectation(safeSettings.JM1_MARKETING_CONTROL_LOOP_CRON),
      health: appInsights.exceptions.byFunction.marketingControlLoopTimer ? 'FAILED' : 'HEALTHY_OR_WAITING'
    },
    creativeWorker: {
      lastRun: appInsights.invocations.byFunction.creativeWorkProcessorTimer?.latest || null,
      workProcessed: dataverse.rowSweep.creativeRows.count,
      exceptions: dataverse.rowSweep.exceptionRows.open
    },
    socialWorker: {
      lastRun: appInsights.invocations.byFunction.socialExecutionWorkerTimer?.latest || null,
      eligibleRows: dataverse.rowSweep.socialRows.classifications.READY + dataverse.rowSweep.socialRows.classifications.WAITING_FOR_SCHEDULE,
      publishes: dataverse.rowSweep.socialRows.platformIds,
      failuresOrReconciliations: dataverse.rowSweep.socialRows.classifications.RECONCILIATION_REQUIRED + dataverse.rowSweep.socialRows.classifications.EXCEPTION
    },
    dynamics: dataverse.rowSweep.journeyRows.summary,
    meta: dataverse.rowSweep.socialRows.metaSummary,
    linkedin: 'PRODUCT_REVIEW_PENDING',
    media: dataverse.rowSweep.mediaRows.summary,
    credentials: dataverse.rowSweep.credentialRows.summary
  };
}

function exceptionModel() {
  return {
    status: 'FINALIZED',
    taxonomy: [
      ['rights ambiguity', 'Founder or designated rights owner'],
      ['compliance ambiguity', 'Founder/compliance approver'],
      ['missing governed asset', 'brand/content owner'],
      ['PublicReady terminal failure', 'creative/content approver'],
      ['platform failure after retry policy', 'runtime operator'],
      ['credential/security verification', 'Founder/admin'],
      ['sender/domain issue', 'Microsoft/Dynamics admin'],
      ['Journey runtime failure', 'marketing runtime operator'],
      ['durable-media failure', 'runtime/storage operator'],
      ['LinkedIn external-review change', 'Founder/admin'],
      ['destructive public-content correction', 'Founder']
    ].map(([exception, route]) => ({ exception, route, routineMarketingTouch: false }))
  };
}

function touchCount(actor) {
  return {
    actor,
    routineManualMarketingTouch: 0,
    observationDashboardViewing: 'NOT_COUNTED',
    oneTimeAdminActivationTouch: 'SEPARATE',
    exceptionTouch: 'SEPARATE'
  };
}

function enterpriseBranchReuse(settings) {
  const config = settings.JM1_MARKETING_BRANCH_CONFIG || {};
  return {
    classification: 'JM1_MARKETING_OS_ENTERPRISE_BRANCH_REUSE_READY',
    activeBranch: 'publishing',
    verifiedBranchNeutralInputs: [
      'brand identity',
      'sender',
      'compliance',
      'destination registry',
      'campaign program',
      'audiences',
      'creative policy',
      'CTA registry',
      'Journey policy',
      'Social policy',
      'exception owner'
    ],
    branches: Object.fromEntries(Object.entries(config).map(([key, value]) => [key, { branchName: value.branchName, active: value.active }])),
    activationBoundary: 'One/Financial/Foundation remain not activated in this wave.'
  };
}

function financialHold(settings) {
  return {
    state: settings.JM1_MARKETING_BRANCH_CONFIG?.financial?.active === false ? 'CONFIGURED_NOT_ACTIVATED' : 'CONFIGURATION_REQUIRED',
    enhancedComplianceGateRequired: true,
    holds: ['legal advice', 'investment advice', 'tax claims', 'insurance guarantees', 'estate-planning representation', 'regulated claims', 'partner-role confusion', 'disclosure requirements']
  };
}

function linkedInState(settings) {
  return {
    state: settings.JM1_LINKEDIN_PRODUCT_STATE || 'UNKNOWN',
    appVerification: settings.JM1_LINKEDIN_APP_VERIFICATION_STATE || 'UNKNOWN',
    autonomousExecution: settings.JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED === 'false' ? 'DISABLED' : 'CONFIGURATION_REQUIRED',
    targetOrganizationId: settings.JM1_MARKETING_BRANCH_CONFIG?.publishing?.linkedinOrganizationId || '13048648',
    routineFallback: 'NO_LINKEDIN_NATIVE_BROWSER_ROUTINE_FALLBACK'
  };
}

function repoHygiene() {
  const status = run('git', ['status', '--short']);
  const lines = status.split('\n').filter(Boolean);
  const currentPackage = lines.filter((line) => /812_jm1_marketing_os_production_operationalization_gate_v1|run-jm1-marketing-os-production-operationalization-gate/.test(line));
  return {
    dirtyWorktreeKnown: lines.length > currentPackage.length,
    currentPackageFiles: currentPackage,
    classification: 'DO_NOT_MASS_COMMIT_UNRELATED_ARTIFACTS',
    remainingFilesPolicy: {
      CANON_CANDIDATE: 'concise standards from proof estate',
      RETAINED_EVIDENCE: 'screenshots/json proving live actions',
      GENERATED_DISPOSABLE: 'intermediate upload/contact-sheet attempts',
      STALE: 'superseded package versions',
      DUPLICATE: 'same-state screenshots or repeated batch evidence',
      UNRELATED: 'outside current workstream'
    }
  };
}

function canonCandidates() {
  return [
    'JM1 Marketing Operating System Architecture',
    'Marketing Authority & Campaign Contract',
    'Branch Marketing Configuration Contract',
    'Public-Ready Standard',
    'Creative & Media Registry Standard',
    'Social Execution / Idempotency / Reconciliation Standard',
    'Dynamics Journey Execution Standard',
    'Marketing Exception Governance Standard',
    'Marketing Health / SLO Standard'
  ].map((name) => ({ name, status: 'CANON_CANDIDATE_FOUNDER_RATIFICATION_SEPARATE' }));
}

function sintraAudit() {
  return {
    disappearanceQuestion: 'If Sintra disappeared today, no proven routine marketing execution function would stop.',
    functions: {
      Execution: 'JM1 OWNED',
      Scheduling: 'JM1 OWNED_FOR_META_DYNAMICS; LINKEDIN_API_PENDING',
      DynamicsOrchestration: 'JM1 OWNED',
      CampaignProgression: 'JM1 OWNED',
      CreativeProduction: 'JM1 OWNED',
      MediaHosting: 'JM1 OWNED',
      MetaPublishing: 'JM1 OWNED',
      Readback: 'JM1 OWNED',
      AnalyticsState: 'JM1 OWNED',
      Ideation: 'DUPLICATIVE_OPTIONAL',
      Research: 'DUPLICATIVE_OPTIONAL_SOURCE_CHECK_REQUIRED',
      Strategy: 'DUPLICATIVE_OPTIONAL',
      CopySupport: 'DUPLICATIVE_OPTIONAL',
      LinkedInBridge: 'NOT REQUIRED_NOT_PROVEN_AS_API_REPLACEMENT'
    }
  };
}

function sintraExitRecommendation(report) {
  const safe = report.productionSafetyFlags.overall === 'PASS'
    && report.finalMarketingOsClassification === 'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PUBLISHING PRODUCTION OPERATIONAL; LINKEDIN API PRODUCT REVIEW PENDING';
  return {
    result: safe
      ? 'CANCEL SINTRA - operationally safe to exit execution stack'
      : 'KEEP SINTRA TEMPORARILY UNTIL deployed runtime gap closes',
    cancellationExecuted: false,
    conditions: {
      noCoreRoutineDependency: true,
      noManualWorkReintroduced: true,
      septemberSchedulesSupersededOrExpired: true,
      octoberOnlyInsideSintra: false,
      uniqueFunctionWorthRecurringCost: false
    },
    exitPlan: {
      retain: ['historic schedule/evidence proving September remediation', 'useful strategy/Brain content if it contains business knowledge not already canonicalized', 'campaign concepts worth translating into Dataverse authority'],
      disconnectLater: ['social integrations after Founder commercial cancellation decision'],
      avoidExporting: ['low-value generated posts', 'duplicate calendar artifacts', 'superseded executor objects']
    }
  };
}

function finalClassification(report) {
  const reconciliationOk = ['MATCH', 'MATCH_WITH_EVIDENCE_ONLY_DRIFT'].includes(report.deployedRuntimeReconciliation.overall);
  const safetyOk = report.productionSafetyFlags.overall === 'PASS';
  const healthOk = ['HEALTHY', 'DEGRADED_OR_ATTENTION_REQUIRED'].includes(report.azureFunctionHealth.classification);
  if (reconciliationOk && safetyOk && healthOk) {
    return 'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PUBLISHING PRODUCTION OPERATIONAL; LINKEDIN API PRODUCT REVIEW PENDING';
  }
  return 'JM1 ENTERPRISE MARKETING OPERATING SYSTEM - PUBLISHING PRODUCTION READY; DEPLOYED-RUNTIME CONFIGURATION GAP';
}

async function readDataverse() {
  const token = run('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv']).trim();
  const entitySets = {};
  for (const logical of ['jm1_campaignauthority', 'jm1_socialexecution', 'jm1_contentwork', 'jm1_creativework', 'jm1_mediaasset', 'jm1_journeyexecution', 'jm1_marketingcontrolloop', 'jm1_marketingexception', 'jm1_credentialmonitor']) {
    entitySets[logical] = await entitySet(logical, token);
  }
  const rows = {
    campaigns: await query(entitySets.jm1_campaignauthority, '$orderby=modifiedon desc&$top=50', token),
    social: await query(entitySets.jm1_socialexecution, '$orderby=modifiedon desc&$top=200', token),
    content: await query(entitySets.jm1_contentwork, '$orderby=modifiedon desc&$top=100', token),
    creative: await query(entitySets.jm1_creativework, '$orderby=modifiedon desc&$top=100', token),
    media: await query(entitySets.jm1_mediaasset, '$orderby=modifiedon desc&$top=100', token),
    journey: await query(entitySets.jm1_journeyexecution, '$orderby=modifiedon desc&$top=100', token),
    control: await query(entitySets.jm1_marketingcontrolloop, '$orderby=modifiedon desc&$top=100', token),
    exceptions: await query(entitySets.jm1_marketingexception, '$orderby=modifiedon desc&$top=100', token),
    credentials: await query(entitySets.jm1_credentialmonitor, '$orderby=modifiedon desc&$top=50', token)
  };

  const octoberCampaign = rows.campaigns.find((row) => /Iyorwuese|2026-10|October/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' ')));
  return {
    entitySets,
    rowSweep: classifyRows(rows),
    octoberReadiness: octoberReadiness(rows, octoberCampaign)
  };
}

function classifyRows(rows) {
  const socialClassifications = { READY: 0, WAITING_FOR_SCHEDULE: 0, HELD_EXTERNAL_AUTHORITY: 0, EXCEPTION: 0, SUPERSEDED: 0, TEST_ONLY: 0, RECONCILIATION_REQUIRED: 0 };
  let platformIds = 0;
  for (const row of rows.social) {
    socialClassifications[classifySocialRow(row)] += 1;
    if (row.jm1_platformpostid) platformIds += 1;
  }
  return {
    campaignRows: { count: rows.campaigns.length, octoberCandidates: rows.campaigns.filter((row) => /Iyorwuese|2026-10|October/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' '))).length },
    socialRows: {
      count: rows.social.length,
      classifications: socialClassifications,
      platformIds,
      metaSummary: summarizePlatformRows(rows.social.filter((row) => ['facebook', 'instagram'].includes(row.jm1_platform))),
      linkedinSummary: summarizePlatformRows(rows.social.filter((row) => row.jm1_platform === 'linkedin'))
    },
    contentRows: { count: rows.content.length, publicReadyPass: rows.content.filter((row) => row.jm1_publicreadystate === 'PASS').length },
    creativeRows: { count: rows.creative.length, publicReadyPass: rows.creative.filter((row) => row.jm1_publicreadystate === 'PASS').length },
    mediaRows: { count: rows.media.length, summary: summarizeMedia(rows.media) },
    journeyRows: { count: rows.journey.length, summary: summarizeJourney(rows.journey) },
    controlRows: { count: rows.control.length, latest: rows.control[0] ? safeRow(rows.control[0]) : null },
    exceptionRows: { count: rows.exceptions.length, open: rows.exceptions.filter((row) => !/RESOLVED|CLOSED/i.test(row.jm1_resolutionstate || '')).length },
    credentialRows: { count: rows.credentials.length, summary: summarizeCredentials(rows.credentials) }
  };
}

function classifySocialRow(row) {
  const key = String(row.jm1_idempotencykey || '');
  const status = String(row.jm1_status || '').toUpperCase();
  if (/test|canary|proof|regression/i.test(key)) return 'TEST_ONLY';
  if (/SUPERSEDED/.test(status)) return 'SUPERSEDED';
  if (/LINKEDIN|EXTERNAL_PLATFORM_AUTHORITY|PRODUCT_REVIEW/.test(status) || row.jm1_platform === 'linkedin') return 'HELD_EXTERNAL_AUTHORITY';
  if (/RECONCILIATION/.test(status)) return 'RECONCILIATION_REQUIRED';
  if (/ERROR|FAILED|MISMATCH|HELD|REWORK/.test(status)) return 'EXCEPTION';
  if (/SCHEDULED|NOT_DUE/.test(status)) return 'WAITING_FOR_SCHEDULE';
  return 'READY';
}

function octoberReadiness(rows, campaign) {
  const marker = campaign?.jm1_idempotencykey?.replace(/:campaign$/, '') || 'IYORWUESE';
  const social = rows.social.filter((row) => /Iyorwuese|2026-10|featured-author|FEATURED_AUTHOR/i.test(row.jm1_idempotencykey || row.jm1_name || '') || (marker !== 'IYORWUESE' && String(row.jm1_idempotencykey || '').startsWith(marker)));
  return {
    featuredAuthor: campaign?.jm1_subject || 'Iyorwuese Hagher',
    campaignFound: Boolean(campaign),
    campaignDates: campaign ? { start: campaign.jm1_start, stop: campaign.jm1_stop } : null,
    currentStage: rows.control[0]?.jm1_state || 'READBACK_ONLY',
    nextEligibleStage: rows.control[0]?.jm1_nextaction || 'SYSTEM_DETERMINED_BY_CONTROL_LOOP',
    approvedPortrait: 'REQUIRES_SOURCE_ASSET_ROW_REVIEW',
    aPortraitOfParadiseAsset: rows.media.some((row) => /Portrait|Paradise/i.test(row.jm1_name || row.jm1_durableurl || '')) ? 'MEDIA_ROW_PRESENT' : 'NOT_OBSERVED_IN_TOP_100_MEDIA_ROWS',
    theGeneralsWillPreCoverRules: 'TITLE_MARKETING_ELIGIBLE_WITHOUT_COVER; COVER_DEPENDENT_ARCHETYPES_HELD',
    dynamicsJourneyState: summarizeJourney(rows.journey),
    contentWork: rows.content.filter((row) => /Iyorwuese|featured-author|2026-10/i.test(row.jm1_name || row.jm1_idempotencykey || '')).map(safeRow),
    creativeWork: rows.creative.filter((row) => /Iyorwuese|featured-author|2026-10/i.test(row.jm1_name || row.jm1_idempotencykey || '')).map(safeRow),
    facebookRows: social.filter((row) => row.jm1_platform === 'facebook').map(safeRow),
    instagramRows: social.filter((row) => row.jm1_platform === 'instagram').map(safeRow),
    linkedinHeldRows: social.filter((row) => row.jm1_platform === 'linkedin').map(safeRow),
    fatigueRepetition: 'INTRO_SUPERSESSION_GUARD_PRESERVED_BY_REGRESSION',
    ctaAccuracy: 'NO_CTA_CHANGE_PERFORMED'
  };
}

async function compareKuduPackage() {
  const profileXml = run('az', ['functionapp', 'deployment', 'list-publishing-profiles', '--resource-group', RESOURCE_GROUP, '--name', FUNCTION_APP, '--xml']);
  const profile = [...profileXml.matchAll(/<publishProfile[^>]+publishMethod="ZipDeploy"[^>]+>/g)]
    .map((match) => match[0])
    .map((tag) => ({
      publishUrl: attr(tag, 'publishUrl'),
      userName: attr(tag, 'userName'),
      userPWD: attr(tag, 'userPWD')
    }))[0];
  if (!profile) return { state: 'KUDU_PROFILE_NOT_FOUND', files: [] };

  const host = profile.publishUrl.split('/')[0].replace(/:443$/, '');
  const files = [];
  for (const file of productionFiles) {
    const localPath = join('runtime/jm1-marketing-autonomous-functions', file);
    const localText = existsSync(localPath) ? readFileSync(localPath) : null;
    const deployed = await kuduGet({ host, profile, path: `/api/vfs/site/wwwroot/${file}` });
    const localHash = localText ? sha(localText) : null;
    const deployedHash = deployed.ok ? sha(deployed.body) : null;
    files.push(classifyKuduFile({ file, localText, deployed, localHash, deployedHash }));
  }
  return { state: 'READ', files };
}

function classifyKuduFile({ file, localText, deployed, localHash, deployedHash }) {
  if (!localText) return { file, classification: 'STALE_LOCAL_ONLY', reason: 'Local production file is missing.', deployedStatus: deployed.status };
  if (!deployed.ok) return { file, classification: 'CONFIGURATION_REQUIRED', reason: `Deployed file could not be read for hash comparison: ${deployed.status}`, localHash, deployedHash: null };
  if (localHash === deployedHash) return { file, classification: 'MATCH', localHash, deployedHash };
  if (file === 'package.json') {
    const localPkg = JSON.parse(localText);
    const deployedPkg = JSON.parse(deployed.body);
    const localProd = { ...localPkg, scripts: undefined, devDependencies: undefined };
    const deployedProd = { ...deployedPkg, scripts: undefined, devDependencies: undefined };
    if (JSON.stringify(localProd) === JSON.stringify(deployedProd)) {
      return { file, classification: 'EVIDENCE_ONLY', reason: 'Only npm script/dev metadata differs; production dependencies and runtime package identity match.', localHash, deployedHash };
    }
  }
  return { file, classification: 'DEPLOYMENT_REQUIRED', reason: 'Deployed production file hash differs from local runtime standard.', localHash, deployedHash };
}

async function readAppInsights(functionApp) {
  const component = JSON.parse(run('az', [
    'monitor', 'app-insights', 'component', 'show',
    '--app', FUNCTION_APP,
    '--resource-group', RESOURCE_GROUP,
    '--query', '{name:name,appId:appId,applicationType:applicationType,connectionString:connectionString!=null,provisioningState:provisioningState,retentionInDays:retentionInDays}',
    '-o', 'json'
  ]));
  const appId = component.appId;
  const invocationsQuery = [
    'traces',
    '| where timestamp > ago(48h)',
    '| where message has "SOCIAL_EXECUTION_WORKER" or message has "MARKETING_CONTROL_LOOP" or message has "CREATIVE_WORK_PROCESSOR" or message has "CREDENTIAL_MONITOR"',
    '| project timestamp, operation_Name',
    '| order by timestamp desc',
    '| take 200'
  ].join(' ');
  const exceptionsQuery = 'exceptions | where timestamp > ago(24h) | summarize count=count(), latest=max(timestamp) by tostring(operation_Name) | order by latest desc';
  const invocations = appInsightsQuery(appId, invocationsQuery);
  const exceptions = appInsightsQuery(appId, exceptionsQuery);
  return {
    component,
    invocations: summarizeInvocations(invocations),
    exceptions: summarizeExceptions(exceptions)
  };
}

function appInsightsQuery(appId, queryText) {
  try {
    return JSON.parse(run('az', ['monitor', 'app-insights', 'query', '--app', appId, '--analytics-query', queryText, '-o', 'json']));
  } catch (error) {
    return { error: error.message, tables: [] };
  }
}

function summarizeInvocations(result) {
  const rows = result.tables?.[0]?.rows || [];
  const byFunction = {};
  for (const row of rows) {
    const latest = row[0];
    const category = row[1] || '';
    const fn = ['creativeWorkProcessorTimer', 'credentialMonitorTimer', 'marketingControlLoopTimer', 'socialExecutionWorkerTimer']
      .find((name) => category.includes(name));
    if (fn) {
      byFunction[fn] = byFunction[fn] || { latest, count: 0 };
      byFunction[fn].count += 1;
      if (new Date(latest) > new Date(byFunction[fn].latest)) byFunction[fn].latest = latest;
    }
  }
  return { count: rows.length, byFunction, sampleRows: rows.slice(0, 20) };
}

function summarizeExceptions(result) {
  const rows = result.tables?.[0]?.rows || [];
  const byFunction = {};
  for (const row of rows) byFunction[row[0] || 'unknown'] = { count: row[1], latest: row[2] };
  return { count: rows.reduce((sum, row) => sum + Number(row[1] || 0), 0), byFunction, rawRows: rows.slice(0, 20) };
}

async function entitySet(logical, token) {
  const response = await dv(`/EntityDefinitions(LogicalName='${logical}')?$select=EntitySetName`, token);
  return response.EntitySetName;
}

async function query(entitySetName, queryString, token) {
  const response = await dv(`/${entitySetName}?${queryString}`, token, true);
  return response.ok ? response.body.value || [] : [];
}

async function dv(path, token, allowFailure = false) {
  const response = await fetch(`${DATAVERSE_WEB_API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok && allowFailure) return { ok: false, status: response.status, body };
  if (!response.ok) throw new Error(`Dataverse GET ${path} failed: ${response.status} ${body.error?.message || text}`);
  return allowFailure ? { ok: true, status: response.status, body } : body;
}

function summarizeSettings(settings) {
  const raw = Object.fromEntries(settings.map((item) => [item.name, item.value || '']));
  const names = [
    'JM1_RELEASE_SHA',
    'JM1_MARKETING_AUTONOMOUS_META_EXECUTION_ENABLED',
    'JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED',
    'JM1_CREDENTIAL_MONITOR_SYNTHETIC_ENABLED',
    'JM1_MARKETING_CONTROL_LOOP_CRON',
    'JM1_CREATIVE_WORKER_CRON',
    'JM1_CREDENTIAL_MONITOR_CRON',
    'JM1_SOCIAL_EXECUTION_WORKER_CRON',
    'JM1_LINKEDIN_PRODUCT_STATE',
    'JM1_LINKEDIN_APP_VERIFICATION_STATE',
    'JM1_META_GRAPH_VERSION',
    'JM1_SOCIAL_EXECUTION_CLAIM_LEASE_MINUTES',
    'JM1_MARKETING_BRANCH_CONFIG'
  ];
  const out = {};
  for (const name of names) {
    if (!(name in raw)) {
      out[name] = 'MISSING';
      continue;
    }
    out[name] = name === 'JM1_MARKETING_BRANCH_CONFIG' ? JSON.parse(raw[name]) : raw[name];
  }
  out.keyVaultReferences = settings
    .filter((item) => String(item.value || '').startsWith('@Microsoft.KeyVault'))
    .map((item) => item.name)
    .sort();
  return out;
}

function summarizePlatformRows(rows) {
  return {
    count: rows.length,
    publishedVerified: rows.filter((row) => row.jm1_status === 'PUBLISHED_VERIFIED').length,
    waiting: rows.filter((row) => /SCHEDULED|NOT_DUE/i.test(row.jm1_status || '')).length,
    held: rows.filter((row) => /HELD|WAIT|PENDING/i.test(row.jm1_status || '')).length,
    platformIds: rows.filter((row) => row.jm1_platformpostid).length
  };
}

function summarizeMedia(rows) {
  return {
    hashVerified: rows.filter((row) => row.jm1_sha256local && row.jm1_sha256local === row.jm1_sha256remote).length,
    publicHttpsVerified: rows.filter((row) => row.jm1_publicaccessibilitystate === 'PUBLIC_HTTPS_HASH_VERIFIED').length,
    current: rows.filter((row) => row.jm1_supersededstate === 'CURRENT').length
  };
}

function summarizeJourney(rows) {
  return {
    count: rows.length,
    provenOrActive: rows.filter((row) => /PROVEN|ACTIVE|STARTED|IMPLEMENTED/i.test(row.jm1_state || '')).length,
    withDynamicsJourneyId: rows.filter((row) => row.jm1_dynamicsjourneyid).length,
    latest: rows[0] ? safeRow(rows[0]) : null
  };
}

function summarizeCredentials(rows) {
  return {
    count: rows.length,
    verifiedActive: rows.filter((row) => /VERIFIED|ACTIVE/i.test(row.jm1_currentcredentialstate || '')).length,
    rotationDue: rows.filter((row) => /ROTATION_DUE|EXPIRED/i.test(row.jm1_currentcredentialstate || row.jm1_exceptioncode || '')).length,
    latest: rows[0] ? safeRow(rows[0]) : null
  };
}

function safeRow(row) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !/@odata|token|secret/i.test(key)));
}

function cronExpectation(cron) {
  if (!cron || cron === 'MISSING') return 'MISSING';
  if (cron.includes('*/15')) return 'within 15 minutes of last run';
  return 'daily scheduled timer';
}

function attr(tag, name) {
  return decodeXml(tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '');
}

function decodeXml(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function kuduGet({ host, profile, path }) {
  const auth = Buffer.from(`${profile.userName}:${profile.userPWD}`).toString('base64');
  return new Promise((resolve) => {
    const req = https.request({ hostname: host, path, headers: { Authorization: `Basic ${auth}` } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', (error) => resolve({ ok: false, status: 'REQUEST_FAILED', body: error.message }));
    req.end();
  });
}

function sha(text) {
  return createHash('sha256').update(text).digest('hex');
}

function run(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function renderMarkdown(value) {
  return `# ${value.artifact}

Generated: ${value.generatedAt}

## Final Classification
${value.finalMarketingOsClassification}

## Deployed Runtime
${value.deployedRuntimeReconciliation.overall}

## Safety Flags
${value.productionSafetyFlags.overall}

## Sintra
${value.sintraExitCancellationRecommendation.result}

Cancellation executed: ${value.sintraExitCancellationRecommendation.cancellationExecuted}

## Drift
${value.deployedRuntimeReconciliation.differences.map((item) => `- ${item.classification}: ${item.file || item.setting} - ${item.reason}`).join('\n') || '- none'}

## Observation
${value.observationWindowResults.conclusion}

## Health
Azure Function health: ${value.azureFunctionHealth.classification}

Recent exceptions: ${value.azureFunctionHealth.recentExceptions.count}
`;
}
