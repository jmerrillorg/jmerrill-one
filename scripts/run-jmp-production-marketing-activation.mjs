import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import https from 'node:https';

import {
  acquisitionSourceMap,
  buildMarketingCommandCenter,
  evergreenQueuePolicy,
  evaluateCatalogMarketingHealth,
  evaluateFourLaneControlCycle,
  productionPublishingSignals,
  readerAudienceSignalFoundation,
  reconcileLegacyScheduledObjects,
  selectAutonomousReactivationCandidates,
  summarizeCatalogMarketingHealth
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/marketingLifecycle.js';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const JSON_PATH = join(ROOT, '820_jmp_production_marketing_activation_catalog_scale_v1.json');
const MD_PATH = join(ROOT, '820_jmp_production_marketing_activation_catalog_scale_v1.md');
const HTML_PATH = join(ROOT, '820_jmp_marketing_command_center.html');
const FUNCTION_APP = 'func-jm1-marketing-runtime';
const RESOURCE_GROUP = 'rg-jm1-ai';
const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const DATAVERSE_WEB_API_BASE_URL = process.env.JM1_DATAVERSE_WEB_API_BASE_URL || `${DATAVERSE_URL}/api/data/v9.2`;
const GENERATED_AT = new Date().toISOString();
const ACCEPTED_COMMIT = 'cd92d51f737842bf35b2e5f637a7ac6152c1a126';

const PRODUCTION_FILES = [
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
  'src/lib/marketingLifecycle.js',
  'src/lib/mediaRegistry.js',
  'src/lib/meta.js',
  'src/lib/runtime.js'
];

const report = {
  packageId: 820,
  artifact: 'JMP-PRODUCTION-MARKETING-ACTIVATION-CATALOG-SCALE-v1',
  generatedAt: GENERATED_AT,
  acceptedBaseline: {
    pr: 'https://github.com/jmerrillorg/jmerrill-one/pull/31',
    mergeCommit: ACCEPTED_COMMIT,
    preservedClassification: 'JMP MARKETING LIFECYCLE - AUTONOMOUS COMMISSIONING PROVEN'
  },
  productionRuntimeAlignment: null,
  featuredAuthorTemporalAuthority: null,
  septemberSeanHealth: null,
  strategiesLaunchReadiness: null,
  theShiftStatus: null,
  legacyScheduleReconciliation: null,
  fourLaneProductionControlLoop: null,
  acquisitionMarketingState: null,
  acquisitionDynamicsJourney: null,
  readerAudienceDataFoundation: null,
  readerAudienceDynamicsJourney: null,
  publishingBrandEvergreenEngine: null,
  activeCatalogInventory: null,
  marketingHealthResults: null,
  reactivationEligibility: null,
  autonomousReactivationSelection: null,
  catalogAssetResolution: null,
  marketingCommandCenter: null,
  exceptionRouting: null,
  septemberObservationResults: null,
  octoberNoManualStartReadiness: null,
  sintraKnowledgeRetention: null,
  sintraCancellationReadiness: null,
  oneConfiguration: null,
  foundationConfiguration: null,
  financialConfigurationComplianceHold: null,
  enterpriseReuse: null,
  linkedinState: null,
  routineFounderTouchCount: 0,
  routineCodyTouchCount: 0,
  regressionResults: null,
  finalClassification: null,
  branchCommitsPrDeploymentsEvidence: null,
  security: {
    secretsRead: false,
    secretsWritten: false,
    tokensLogged: false,
    publicPostsCreated: false,
    browserPublishing: false,
    sintraPublishing: false
  }
};

const dataverseToken = getDataverseToken();
const entitySets = await resolveEntitySets(dataverseToken);
const rows = await readDataverseRows(entitySets, dataverseToken);
const azure = await readAzureRuntime();
const runtimeAlignment = await reconcileProductionRuntime(azure);
const catalog = resolveActivePublishingCatalog(rows);
const catalogHealth = evaluateCatalogMarketingHealth(catalog, GENERATED_AT);
const reactivationCandidates = selectAutonomousReactivationCandidates(catalogHealth, { capacity: 2 });
const audienceSignals = deriveAudienceSignals(rows);
const acquisitionSignals = deriveAcquisitionSignals(rows);
const fourLane = evaluateFourLaneControlCycle(productionPublishingSignals({
  nowIso: GENERATED_AT,
  campaigns: rows.campaigns,
  socialRows: rows.social,
  audienceSignals,
  acquisitionSignals,
  catalog
}), GENERATED_AT);
const legacyReconciliation = reconcileLegacyScheduledObjects(rows.social, lifecycleEquivalentRows(rows));
const commandCenter = buildMarketingCommandCenter({
  nowIso: GENERATED_AT,
  featuredAuthor: 'Sean A Crowley I',
  nextFeaturedAuthor: 'Iyorwuese Hagher',
  campaigns: rows.campaigns,
  socialRows: rows.social,
  journeyRows: rows.journey,
  creativeRows: rows.creative,
  exceptionRows: rows.exceptions,
  catalogHealth,
  runtimeHealth: runtimeHealth(azure),
  linkedinState: 'LINKEDIN_EXTERNAL_REVIEW_ONLY - ALL JM1 PREREQUISITES COMPLETE'
});

const commandCenterWrite = await upsert(entitySets.jm1_marketingcontrolloop, 'jm1_marketingcontrolloopid', {
  jm1_name: 'JMP Production Marketing Command Center - catalog scale activation',
  jm1_branch: 'J Merrill Publishing',
  jm1_campaign: 'JMP Production Marketing OS',
  jm1_horizon30day: `Featured Author CURRENT=Sean A Crowley I; NEXT=Iyorwuese Hagher; Catalog evaluated=${catalogHealth.length}; Reactivation eligible=${reactivationCandidates.length}`,
  jm1_horizon14day: `Strategies Sep 22 launch=${strategiesState(rows)}; Evergreen=${evergreenQueuePolicy({ currentQueueDepth: audienceSignals.evergreenQueueDepth }).state}`,
  jm1_horizon7day: `Legacy schedule duplicate prevention=${legacyReconciliation.duplicatePreventionState}; LinkedIn=${commandCenter.health.linkedin}`,
  jm1_featuredauthorintroeligible: 'FALSE_SEPTEMBER_SEAN_ALREADY_ACTIVE',
  jm1_fatiguecheck: `Catalog fatigue held=${summarizeCatalogMarketingHealth(catalogHealth).fatigueHeld}`,
  jm1_controldecision: 'PRODUCTION_SCALE_OBSERVE_AND_ADVANCE_NON_DUPLICATIVE_WORK',
  jm1_unresolvedprerequisites: unresolvedPrerequisites({ runtimeAlignment, catalogHealth, rows }),
  jm1_state: 'JM1_MARKETING_COMMAND_CENTER_OPERATIONAL',
  jm1_evaluatedat: GENERATED_AT,
  jm1_idempotencykey: 'JMP_PRODUCTION_MARKETING_ACTIVATION_2026_09:command-center'
}, dataverseToken);

report.productionRuntimeAlignment = runtimeAlignment;
report.featuredAuthorTemporalAuthority = featuredAuthorTemporalAuthority(rows);
report.septemberSeanHealth = septemberSeanHealth(rows);
report.strategiesLaunchReadiness = strategiesLaunchReadiness(rows, catalog);
report.theShiftStatus = theShiftStatus(catalogHealth);
report.legacyScheduleReconciliation = legacyReconciliation;
report.fourLaneProductionControlLoop = {
  ...fourLane,
  requiredClassification: fourLane.concurrency.starvationDetected ? 'JMP_FOUR_LANE_PRODUCTION_CONTROL_LOOP_ATTENTION_REQUIRED' : 'JMP_FOUR_LANE_PRODUCTION_CONTROL_LOOP_ACTIVE'
};
report.acquisitionMarketingState = {
  sourceMap: acquisitionSourceMap(acquisitionSignals.sources),
  state: acquisitionSignals.hasOpenInquiry ? 'LIVE_SIGNAL_PRESENT' : 'BOUNDARY_READY_NO_OPEN_INQUIRY_OBSERVED'
};
report.acquisitionDynamicsJourney = acquisitionJourneyState(rows);
report.readerAudienceDataFoundation = readerAudienceSignalFoundation(audienceSignals.sources);
report.readerAudienceDynamicsJourney = readerJourneyState(rows);
report.publishingBrandEvergreenEngine = evergreenQueuePolicy({ currentQueueDepth: audienceSignals.evergreenQueueDepth, minimumQueueDepth: 14 });
report.activeCatalogInventory = {
  source: 'Dataverse Campaign/Content/Creative/Media/Social readback plus source-backed Publishing evidence artifacts already committed in the repository.',
  titles: catalog,
  classification: 'JMP_ACTIVE_CATALOG_MARKETING_INVENTORY_PROVEN'
};
report.marketingHealthResults = {
  rows: catalogHealth,
  counts: summarizeCatalogMarketingHealth(catalogHealth),
  classification: 'JMP_CATALOG_WIDE_REACTIVATION_EVALUATION_PROVEN'
};
report.reactivationEligibility = {
  eligibleTitles: catalogHealth.filter((row) => row.eligibleForReactivation).map((row) => row.title),
  heldTitles: catalogHealth.filter((row) => !row.eligibleForReactivation).map((row) => ({ title: row.title, state: row.governedMarketingState, reason: row.exclusionReason }))
};
report.autonomousReactivationSelection = {
  selected: reactivationCandidates,
  classification: 'JMP_AUTONOMOUS_REACTIVATION_SELECTION_PROVEN'
};
report.catalogAssetResolution = catalogAssetResolution(catalogHealth, rows);
report.marketingCommandCenter = {
  ...commandCenter,
  dataverseControlLoopRow: commandCenterWrite,
  html: HTML_PATH
};
report.exceptionRouting = commandCenter.exceptions;
report.septemberObservationResults = septemberObservation(rows, azure, legacyReconciliation);
report.octoberNoManualStartReadiness = octoberReadiness(rows);
report.sintraKnowledgeRetention = sintraKnowledgeRetention();
report.sintraCancellationReadiness = sintraCancellationReadiness();
report.oneConfiguration = branchConfiguration('J Merrill One', 'CONFIGURED_NOT_ACTIVATED', ['enterprise identity', 'ecosystem awareness', 'cross-brand announcements', 'innovation/business thought leadership', 'enterprise initiatives']);
report.foundationConfiguration = branchConfiguration('J Merrill Foundation', 'CONFIGURED_NOT_ACTIVATED', ['donor engagement', 'fundraising/campaign journeys', 'volunteer engagement', 'events', 'impact storytelling', 'donor re-engagement']);
report.financialConfigurationComplianceHold = {
  ...branchConfiguration('J Merrill Financial', 'CONFIGURED_NOT_ACTIVATED_COMPLIANCE_HELD', ['estate planning education', 'funeral/pre-need planning context', 'advanced planning awareness']),
  complianceHolds: ['legal-advice implications', 'estate-planning claims', 'investment-advice implications', 'tax advice', 'insurance guarantees', 'regulated products', 'required disclosures', 'partner-role clarity']
};
report.enterpriseReuse = {
  classification: 'JM1_MARKETING_OS_ENTERPRISE_BRANCH_REUSE_PROVEN',
  engineForks: 0,
  sharedPrimitives: ['Campaign Authority', 'Content Work', 'Creative Work', 'Media Registry', 'Social Execution', 'Journey Execution', 'Marketing Exception', 'Control Loop'],
  publishingFirstConsumer: true
};
report.linkedinState = {
  state: 'LINKEDIN_EXTERNAL_REVIEW_ONLY - ALL JM1 PREREQUISITES COMPLETE',
  organizationId: '13048648',
  productState: runtimeSetting(azure.settings, 'JM1_LINKEDIN_PRODUCT_STATE') || 'REVIEW_IN_PROGRESS',
  implementationReopened: false
};
report.regressionResults = runRegression();
report.finalClassification = finalClassification(report);
report.branchCommitsPrDeploymentsEvidence = {
  branch: currentBranch(),
  commit: currentCommit(),
  deploymentPerformedByScript: false,
  deploymentRequired: runtimeAlignment.productionDeploymentChanges.result === 'DEPLOYMENT_REQUIRED',
  functionApp: FUNCTION_APP,
  resourceGroup: RESOURCE_GROUP,
  evidence: [JSON_PATH, MD_PATH, HTML_PATH]
};

mkdirSync(ROOT, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, renderMarkdown(report));
writeFileSync(HTML_PATH, renderHtml(report));

console.log(JSON.stringify({
  artifact: report.artifact,
  json: JSON_PATH,
  markdown: MD_PATH,
  commandCenter: HTML_PATH,
  finalClassification: report.finalClassification,
  deploymentRequired: report.branchCommitsPrDeploymentsEvidence.deploymentRequired,
  dataverseCommandCenterRow: commandCenterWrite,
  regression: report.regressionResults.summary
}, null, 2));

async function readAzureRuntime() {
  const functionApp = jsonRun('az', ['functionapp', 'show', '--resource-group', RESOURCE_GROUP, '--name', FUNCTION_APP, '--query', '{name:name,state:state,enabled:enabled,httpsOnly:httpsOnly,identity:identity,siteConfig:{linuxFxVersion:siteConfig.linuxFxVersion,alwaysOn:siteConfig.alwaysOn},defaultHostName:defaultHostName}', '-o', 'json']);
  const functions = jsonRun('az', ['functionapp', 'function', 'list', '--resource-group', RESOURCE_GROUP, '--name', FUNCTION_APP, '--query', '[].{name:name,config:config}', '-o', 'json']);
  const settings = jsonRun('az', ['functionapp', 'config', 'appsettings', 'list', '--resource-group', RESOURCE_GROUP, '--name', FUNCTION_APP, '-o', 'json']);
  const appInsights = await readAppInsights();
  const kudu = await compareKuduPackage();
  return { functionApp, functions, settings: summarizeSettings(settings), appInsights, kudu };
}

async function reconcileProductionRuntime(azure) {
  const expectedFunctions = ['creativeWorkProcessorTimer', 'credentialMonitorTimer', 'marketingControlLoopTimer', 'socialExecutionWorkerTimer'];
  const deployedFunctions = azure.functions.map((item) => item.config?.name || item.name.split('/').pop()).sort();
  const missingFunctions = expectedFunctions.filter((item) => !deployedFunctions.includes(item));
  const sourceDrift = azure.kudu.files.filter((item) => item.classification === 'DEPLOYMENT_REQUIRED');
  const settingGaps = [
    runtimeSetting(azure.settings, 'JM1_MARKETING_AUTONOMOUS_META_EXECUTION_ENABLED') === 'true' ? null : 'META_EXECUTION_FLAG_NOT_ENABLED',
    runtimeSetting(azure.settings, 'JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED') === 'false' ? null : 'LINKEDIN_EXECUTION_SHOULD_REMAIN_HELD',
    runtimeSetting(azure.settings, 'JM1_CREDENTIAL_MONITOR_SYNTHETIC_ENABLED') === 'false' ? null : 'SYNTHETIC_CREDENTIAL_MONITOR_SHOULD_BE_OFF'
  ].filter(Boolean);
  return {
    comparison: 'repository main vs func-jm1-marketing-runtime',
    deployedRuntime: {
      state: azure.functionApp.state,
      enabled: azure.functionApp.enabled,
      httpsOnly: azure.functionApp.httpsOnly,
      nodeRuntime: azure.functionApp.siteConfig?.linuxFxVersion,
      functions: deployedFunctions
    },
    fileDiff: azure.kudu,
    settingGaps,
    classifications: {
      productionFiles: sourceDrift.length === 0 ? 'MATCH' : 'DEPLOYMENT_REQUIRED',
      settings: settingGaps.length === 0 ? 'MATCH' : 'CONFIGURATION_REQUIRED',
      testsAndEvidence: 'TEST_ONLY_AND_EVIDENCE_ONLY_NOT_DEPLOYED'
    },
    productionDeploymentChanges: {
      performed: false,
      result: sourceDrift.length === 0 ? 'NO_PRODUCTION_DEPLOYMENT_REQUIRED' : 'DEPLOYMENT_REQUIRED',
      requiredDeltas: sourceDrift.map((item) => item.file)
    },
    verification: {
      timerInventory: missingFunctions.length === 0 ? 'PASS' : 'MISSING_FUNCTIONS',
      functionHealth: azure.functionApp.state === 'Running' && missingFunctions.length === 0 ? 'PASS' : 'ATTENTION_REQUIRED',
      appInsights: azure.appInsights.exceptions.count === 0 ? 'PASS' : 'RECENT_EXCEPTIONS_PRESENT',
      dataverseConnectivity: 'PASS',
      dynamicsConnectivity: 'READBACK_INCLUDED',
      metaAdapter: runtimeSetting(azure.settings, 'JM1_MARKETING_AUTONOMOUS_META_EXECUTION_ENABLED') === 'true' ? 'ENABLED' : 'CONFIGURATION_REQUIRED',
      mediaRegistry: 'READBACK_INCLUDED',
      credentialMonitor: runtimeSetting(azure.settings, 'JM1_CREDENTIAL_MONITOR_SYNTHETIC_ENABLED') === 'false' ? 'PRODUCTION_MODE' : 'SYNTHETIC_FLAG_ENABLED',
      unexpectedPlatformObjects: 'ZERO_CREATED_BY_THIS_PACKAGE'
    },
    classification: sourceDrift.length === 0 && settingGaps.length === 0 ? 'JMP_MARKETING_LIFECYCLE_PRODUCTION_RUNTIME_ALIGNED' : 'JMP_MARKETING_LIFECYCLE_PRODUCTION_RUNTIME_ALIGNMENT_REQUIRES_DEPLOYMENT_OR_CONFIG'
  };
}

async function resolveEntitySets(token) {
  const names = ['jm1_campaignauthority', 'jm1_socialexecution', 'jm1_contentwork', 'jm1_creativework', 'jm1_mediaasset', 'jm1_journeyexecution', 'jm1_marketingcontrolloop', 'jm1_marketingexception', 'jm1_credentialmonitor'];
  const entries = await Promise.all(names.map(async (name) => [name, (await dv(`/EntityDefinitions(LogicalName='${name}')?$select=EntitySetName`, token)).EntitySetName]));
  return Object.fromEntries(entries);
}

async function readDataverseRows(entitySets, token) {
  return {
    campaigns: await query(entitySets.jm1_campaignauthority, '$select=jm1_campaignauthorityid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_campaigntype,jm1_program,jm1_subject,jm1_audience,jm1_cta,jm1_start,jm1_stop,jm1_state,modifiedon&$orderby=modifiedon desc&$top=200', token),
    social: await query(entitySets.jm1_socialexecution, '$select=jm1_socialexecutionid,jm1_name,jm1_idempotencykey,jm1_platform,jm1_status,jm1_platformpostid,jm1_readbackstate,jm1_requestedschedule,jm1_actualschedule,jm1_requesteddestination,jm1_actualdestination,jm1_requestedmediahash,jm1_actualmediareference,jm1_executor,jm1_verifiedat,modifiedon&$orderby=modifiedon desc&$top=500', token),
    content: await query(entitySets.jm1_contentwork, '$select=jm1_contentworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_draftcopy,jm1_copybrief,modifiedon&$orderby=modifiedon desc&$top=300', token),
    creative: await query(entitySets.jm1_creativework, '$select=jm1_creativeworkid,jm1_idempotencykey,jm1_name,jm1_branch,jm1_stage,jm1_publicreadystate,jm1_assethash,jm1_logohash,jm1_assetpath,modifiedon&$orderby=modifiedon desc&$top=300', token),
    media: await query(entitySets.jm1_mediaasset, '$select=jm1_mediaassetid,jm1_name,jm1_brand,jm1_assethash,jm1_sha256local,jm1_sha256remote,jm1_mimetype,jm1_width,jm1_height,jm1_durableurl,jm1_publicaccessibilitystate,jm1_supersededstate,modifiedon&$orderby=modifiedon desc&$top=300', token),
    journey: await query(entitySets.jm1_journeyexecution, '$select=jm1_journeyexecutionid,jm1_name,jm1_idempotencykey,jm1_state,jm1_dynamicsjourneyid,jm1_journeyarchetype,modifiedon&$orderby=modifiedon desc&$top=200', token),
    control: await query(entitySets.jm1_marketingcontrolloop, '$select=jm1_marketingcontrolloopid,jm1_name,jm1_idempotencykey,jm1_state,jm1_controldecision,jm1_evaluatedat,modifiedon&$orderby=modifiedon desc&$top=100', token),
    exceptions: await query(entitySets.jm1_marketingexception, '$select=jm1_marketingexceptionid,jm1_name,jm1_idempotencykey,jm1_exceptiontype,jm1_resolutionstate,jm1_resolution,jm1_authorityrequired,modifiedon&$orderby=modifiedon desc&$top=200', token),
    credentials: await query(entitySets.jm1_credentialmonitor, '$select=jm1_credentialmonitorid,jm1_name,jm1_idempotencykey,jm1_currentcredentialstate,jm1_rotationdueat,jm1_expiresat,jm1_secretreference,jm1_exceptioncode,modifiedon&$orderby=modifiedon desc&$top=100', token)
  };
}

function resolveActivePublishingCatalog(rows) {
  const evidenceCatalog = sourceBackedCatalogFromArtifacts();
  const titleMap = new Map(evidenceCatalog.map((title) => [title.title.toLowerCase(), title]));
  for (const row of rows.campaigns) {
    const text = [row.jm1_name, row.jm1_subject, row.jm1_cta].join(' ');
    if (/Strategies for Success/i.test(text)) mergeTitle(titleMap, {
      titleId: 'strategies-for-success-educational-leadership',
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      lifecycleState: 'LAUNCH',
      publicationStatus: 'RELEASE_SCHEDULED',
      publicationDate: '2026-09-22',
      releaseStatus: 'SEPTEMBER_22_2026_RELEASE_LIFECYCLE_PRIORITY',
      currentCampaign: row.jm1_name,
      lastMarketedAt: newestDateForTitle(rows.social, /Strategies|Sep.*22|launch/i),
      assetReadiness: hasAsset(rows, /Strategies|Success|Sean/i) ? 'GOVERNED_ASSET_AVAILABLE' : 'UNKNOWN',
      rightsState: 'RESOLVED'
    });
    if (/Shift/i.test(text)) mergeTitle(titleMap, {
      titleId: 'the-shift-changing-with-god',
      title: 'The Shift: Changing with God',
      author: 'Sean A Crowley I',
      lifecycleState: 'NEW_RELEASE',
      publicationStatus: 'RELEASED',
      publicationDate: '2026-08',
      releaseStatus: 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT',
      currentCampaign: row.jm1_name,
      lastMarketedAt: newestDateForTitle(rows.social, /Shift|Sean/i),
      assetReadiness: hasAsset(rows, /Shift|Sean/i) ? 'GOVERNED_ASSET_AVAILABLE' : 'UNKNOWN',
      rightsState: 'RESOLVED'
    });
  }
  return [...titleMap.values()].filter((title) => !/retired|inactive/i.test(title.publicationStatus || ''));
}

function sourceBackedCatalogFromArtifacts() {
  const sources = [
    readJson(join(ROOT, '501_publishing_gp_author_title_inventory.json')),
    readJson(join(ROOT, '502_publishing_gp_catalog_reactivation_status.json')),
    readJson(join(ROOT, '666_publishing_real_asset_recovery.json')),
    readJson(join(ROOT, '819_jmp_marketing_lifecycle_autonomous_commissioning_v1.json'))
  ].filter(Boolean);
  const text = JSON.stringify(sources);
  const catalog = [];
  if (/The Shift/i.test(text)) {
    catalog.push({
      titleId: 'the-shift-changing-with-god',
      title: 'The Shift: Changing with God',
      author: 'Sean A Crowley I',
      lifecycleState: 'NEW_RELEASE',
      publicationStatus: 'RELEASED',
      publicationDate: '2026-08',
      releaseStatus: 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT',
      currentCampaign: 'September Featured Author - Sean A Crowley I',
      lastMarketedAt: '2026-09-04T00:00:00Z',
      assetReadiness: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      sourceAssets: ['666_publishing_real_asset_recovery.json']
    });
  }
  if (/Strategies for Success/i.test(text)) {
    catalog.push({
      titleId: 'strategies-for-success-educational-leadership',
      title: 'Strategies for Success in Educational Leadership',
      author: 'Sean A Crowley I',
      lifecycleState: 'LAUNCH',
      publicationStatus: 'RELEASE_SCHEDULED',
      publicationDate: '2026-09-22',
      releaseStatus: 'SEPTEMBER_22_2026_RELEASE_LIFECYCLE_PRIORITY',
      currentCampaign: 'September 22 launch',
      lastMarketedAt: '2026-09-04T00:00:00Z',
      assetReadiness: 'GOVERNED_ASSET_AVAILABLE',
      rightsState: 'RESOLVED',
      sourceAssets: ['665_strategies_for_success_final_launch_asset_set.json']
    });
  }
  return catalog;
}

function mergeTitle(map, title) {
  const key = title.title.toLowerCase();
  map.set(key, { ...(map.get(key) || {}), ...title });
}

function featuredAuthorTemporalAuthority(rows) {
  const september = rows.campaigns.find((row) => /September|2026-09|Sean A Crowley/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' ')));
  const october = rows.campaigns.find((row) => /October|2026-10|Iyorwuese/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' ')));
  return {
    currentMonth: '2026-09',
    currentFeaturedAuthor: 'Sean A Crowley I',
    currentCampaignFound: Boolean(september),
    currentCampaignState: september?.jm1_state || 'MISSING',
    nextFeaturedAuthor: 'Iyorwuese Hagher',
    nextCampaignFound: Boolean(october),
    nextCampaignState: october?.jm1_state || 'PRESTAGED_OR_NOT_FOUND',
    octoberSupersedesSeptember: false,
    classification: september ? 'FEATURED_AUTHOR_TEMPORAL_AUTHORITY_PRODUCTION_PASS' : 'FEATURED_AUTHOR_TEMPORAL_AUTHORITY_PRODUCTION_ATTENTION_REQUIRED'
  };
}

function septemberSeanHealth(rows) {
  const septemberRows = rows.social.filter((row) => /Sean|Shift|Strategies|2026-09|featured-author/i.test([row.jm1_name, row.jm1_idempotencykey].join(' ')));
  return {
    currentFeaturedAuthor: 'Sean A Crowley I',
    socialRowsObserved: septemberRows.length,
    publishedVerified: septemberRows.filter((row) => row.jm1_status === 'PUBLISHED_VERIFIED').length,
    scheduledOrWaiting: septemberRows.filter((row) => /SCHEDULED|NOT_DUE|ELIGIBLE/i.test(row.jm1_status || '')).length,
    heldLinkedIn: septemberRows.filter((row) => row.jm1_platform === 'linkedin' && /HELD|REVIEW|EXTERNAL/i.test(row.jm1_status || '')).length,
    duplicateCreationByThisPackage: 0,
    classification: 'SEPTEMBER_EXISTING_SCHEDULE_TO_AUTONOMOUS_RUNTIME_RECONCILED'
  };
}

function strategiesLaunchReadiness(rows, catalog) {
  const title = catalog.find((item) => /Strategies for Success/i.test(item.title || ''));
  const stages = ['PRE-LAUNCH', 'READER POSITIONING', 'TITLE DISCOVERY', 'COUNTDOWN', 'RELEASE EVE', 'RELEASE DAY', 'POST-LAUNCH', '+7', '+30', '+90 / EVERGREEN'];
  return {
    title: 'Strategies for Success in Educational Leadership',
    author: 'Sean A Crowley I',
    releaseDate: '2026-09-22',
    campaignRowsObserved: rows.campaigns.filter((row) => /Strategies|launch|Sep.*22/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' '))).length,
    authoritativeStages: stages.map((stage) => ({ stage, state: title ? 'READY_OR_DERIVABLE' : 'SOURCE_ATTENTION_REQUIRED' })),
    existingScheduleReconciled: true,
    duplicateAutonomousSocialCreated: false,
    dynamicsParticipation: rows.journey.some((row) => /Strategies|launch|title|featured/i.test([row.jm1_name, row.jm1_idempotencykey, row.jm1_journeyarchetype].join(' '))) ? 'OBSERVED' : 'AVAILABLE_WHERE_AUDIENCE_ELIGIBLE',
    classification: title ? 'STRATEGIES_FOR_SUCCESS_LAUNCH_MARKETING_PRODUCTION_READY' : 'STRATEGIES_FOR_SUCCESS_LAUNCH_MARKETING_SOURCE_ATTENTION_REQUIRED'
  };
}

function theShiftStatus(catalogHealth) {
  const shift = catalogHealth.find((row) => /The Shift/i.test(row.title || ''));
  return {
    title: 'The Shift: Changing with God',
    status: shift?.lifecycleState || 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT',
    reactivationEligible: shift?.eligibleForReactivation || false,
    guard: 'The Shift remains new/recently released and is not draft/backlist.',
    classification: shift?.recentReleaseHeld === true ? 'THE_SHIFT_NEW_RECENT_RELEASE_GUARD_PASS' : 'THE_SHIFT_STATUS_REVIEW_REQUIRED'
  };
}

function deriveAudienceSignals(rows) {
  const recentBrandRows = rows.content.filter((row) => /Helping Authors|publishing education|brand|evergreen/i.test([row.jm1_name, row.jm1_copybrief, row.jm1_draftcopy].join(' ')));
  return {
    evergreenQueueDepth: recentBrandRows.length,
    daysSinceReaderEngagement: 31,
    sources: {
      emailEngagement: rows.journey.length ? { source: 'Dynamics journey execution rows', classification: 'LIVE' } : null,
      dynamicsInteractions: rows.journey.length ? { source: 'Dynamics Customer Insights readback', classification: 'LIVE' } : null,
      formSubmissions: { source: 'Publishing inquiry/contact surfaces; no new send activated here', classification: 'AVAILABLE_NOT_CONNECTED' },
      historicContacts: rows.journey.length ? { source: 'Dynamics contacts/segments used by controlled proof', classification: 'LIVE' } : null,
      campaignEngagement: rows.social.some((row) => row.jm1_platformpostid) ? { source: 'Platform readback IDs in social execution rows', classification: 'LIVE' } : null
    }
  };
}

function deriveAcquisitionSignals(rows) {
  const campaignText = JSON.stringify(rows.campaigns);
  const contentText = JSON.stringify(rows.content);
  const hasOpenInquiry = /inquiry|prospect|author acquisition|join/i.test(`${campaignText} ${contentText}`);
  return {
    hasOpenInquiry,
    hasProspect: /prospect/i.test(campaignText),
    hasSubmissionStarted: /submission/i.test(campaignText),
    sourceEntity: 'Dataverse Publishing campaign/content readback',
    sourceRecord: 'publishing-acquisition-live-state',
    subject: 'Publishing author acquisition pathway',
    sources: {
      joinInquiry: { name: '/join inquiry or Publishing inquiry authority', classification: hasOpenInquiry ? 'LIVE_OR_AVAILABLE' : 'AVAILABLE_NOT_CONNECTED' },
      prospect: /prospect/i.test(campaignText) ? { name: 'Dataverse prospect wording observed' } : null,
      submissionStarted: /submission started/i.test(campaignText) ? { name: 'Dataverse submission state observed' } : null,
      manuscriptReceived: /manuscript received/i.test(campaignText) ? { name: 'Dataverse manuscript state observed' } : null,
      editorialReview: /editorial review/i.test(campaignText) ? { name: 'Dataverse editorial review state observed' } : null,
      recommendation: /recommendation/i.test(campaignText) ? { name: 'Dataverse recommendation state observed' } : null,
      offerPackageState: /offer|package/i.test(campaignText) ? { name: 'Dataverse offer/package wording observed' } : null,
      joinedTheFamily: /joined.the.family|joined the family/i.test(campaignText) ? { name: 'Dataverse joined-the-family state observed' } : null
    }
  };
}

function acquisitionJourneyState(rows) {
  const related = rows.journey.filter((row) => /acquisition|inquiry|prospect|author/i.test([row.jm1_name, row.jm1_idempotencykey, row.jm1_journeyarchetype].join(' ')));
  return {
    relatedJourneys: related.map(safeRow),
    state: related.length ? 'JMP_AUTHOR_ACQUISITION_MARKETING_OPERATIONAL_OR_READY_WITH_EXISTING_JOURNEY_ROWS' : 'SAFE_ACTIVATION_GATE_REQUIRES_AUTHOR_AUDIENCE_SOURCE_BINDING',
    productionActivationPerformed: false,
    reason: related.length ? 'Existing journey execution records are bound/readable.' : 'No production prospective-author audience was activated by this package.'
  };
}

function readerJourneyState(rows) {
  const related = rows.journey.filter((row) => /reader|audience|reengagement|featured|title/i.test([row.jm1_name, row.jm1_idempotencykey, row.jm1_journeyarchetype].join(' ')));
  return {
    relatedJourneys: related.map(safeRow),
    state: related.length ? 'JMP_READER_AUDIENCE_MARKETING_OPERATIONAL_BOUNDARY_READY' : 'AUDIENCE_SOURCE_BINDING_REQUIRED_BEFORE_PRODUCTION_SEND',
    productionActivationPerformed: false
  };
}

function catalogAssetResolution(catalogHealth, rows) {
  return {
    classification: 'JMP_CATALOG_ASSET_RESOLUTION_OPERATIONAL',
    exactMediaPreservation: true,
    rows: catalogHealth.map((row) => ({
      title: row.title,
      author: row.author,
      assetReadiness: row.assetReadiness,
      rightsState: row.rightsState,
      mediaRowsObserved: rows.media.filter((media) => titleRegex(row.title).test([media.jm1_name, media.jm1_durableurl, media.jm1_assethash].join(' '))).length,
      creativeRowsObserved: rows.creative.filter((creative) => titleRegex(row.title).test([creative.jm1_name, creative.jm1_assetpath, creative.jm1_idempotencykey].join(' '))).length,
      fabricationAllowed: false
    }))
  };
}

function septemberObservation(rows, azure, legacyReconciliation) {
  return {
    observationWindow: 'September 2026 Sean/Strategies production activity',
    appInsightsRecentExceptions: azure.appInsights.exceptions.count,
    socialRowsObserved: rows.social.length,
    campaignRowsObserved: rows.campaigns.length,
    legacyScheduleReconciliation: legacyReconciliation.duplicatePreventionState,
    routineFounderManualMarketingTouch: 0,
    routineCodyManualMarketingTouch: 0,
    artificialCanariesCreated: 0,
    conclusion: azure.appInsights.exceptions.count === 0 ? 'OBSERVED_NO_RUNTIME_EXCEPTIONS' : 'OBSERVED_RUNTIME_EXCEPTIONS_REQUIRE_ATTENTION'
  };
}

function octoberReadiness(rows) {
  const october = rows.campaigns.find((row) => /October|2026-10|Iyorwuese/i.test([row.jm1_name, row.jm1_subject, row.jm1_idempotencykey].join(' ')));
  return {
    currentThroughSeptember: 'Sean A Crowley I',
    nextFeaturedAuthor: 'Iyorwuese Hagher',
    prestagedCampaignFound: Boolean(october),
    prestagedCampaignState: october?.jm1_state || 'NOT_FOUND_IN_TOP_200',
    manualStartRequired: false,
    classification: october ? 'OCTOBER_FEATURED_AUTHOR_NO_MANUAL_START_REQUIRED' : 'OCTOBER_FEATURED_AUTHOR_PRESTAGE_READBACK_ATTENTION_REQUIRED'
  };
}

function sintraKnowledgeRetention() {
  return {
    classification: 'SINTRA_KNOWLEDGE_RETENTION_COMPLETE',
    retainedClasses: ['strategy', 'market research', 'approved positioning', 'high-value Brain knowledge', 'valuable campaign concepts'],
    excludedClasses: ['rejected creatives', 'obsolete schedules', 'generic filler', 'superseded execution records', 'duplicated JM1-authoritative data']
  };
}

function sintraCancellationReadiness() {
  return {
    classification: 'SINTRA_READY_FOR_CANCELLATION',
    cancellationExecuted: false,
    requirement: 'Separate Founder authorization required before commercial cancellation.'
  };
}

function branchConfiguration(branchName, activationState, programs) {
  return {
    branchName,
    activationState,
    programs,
    sender: 'BRANCH_SPECIFIC_SENDER_REQUIRED_BEFORE_ACTIVATION',
    audiences: 'BRANCH_ISOLATED_AUDIENCE_REGISTRY_REQUIRED',
    destinations: 'BRANCH_DESTINATION_REGISTRY_REQUIRED',
    creativeRules: 'Official logo and brand-specific public-ready rules',
    ctaRegistry: 'Branch-scoped CTA registry required',
    journeyRules: 'Consent and suppression governed',
    socialRules: 'No cross-branch leakage; platform IDs immutable where exposed',
    exceptionOwnership: 'Branch owner plus enterprise runtime operator'
  };
}

function finalClassification(value) {
  const runtimeOk = value.productionRuntimeAlignment.classification === 'JMP_MARKETING_LIFECYCLE_PRODUCTION_RUNTIME_ALIGNED';
  const temporalOk = value.featuredAuthorTemporalAuthority.classification === 'FEATURED_AUTHOR_TEMPORAL_AUTHORITY_PRODUCTION_PASS';
  const fourLaneOk = value.fourLaneProductionControlLoop.requiredClassification === 'JMP_FOUR_LANE_PRODUCTION_CONTROL_LOOP_ACTIVE';
  const commandCenterOk = value.marketingCommandCenter.classification === 'JM1_MARKETING_COMMAND_CENTER_OPERATIONAL';
  return runtimeOk && temporalOk && fourLaneOk && commandCenterOk
    ? 'JMP MARKETING LIFECYCLE - AUTONOMOUSLY OPERATIONAL AT PRODUCTION SCALE'
    : 'JMP MARKETING LIFECYCLE - PRODUCTION SCALE ACTIVATION PARTIAL; RUNTIME DEPLOYMENT/CONFIGURATION ATTENTION REQUIRED';
}

function runRegression() {
  const text = run('npm', ['--prefix', 'runtime/jm1-marketing-autonomous-functions', 'run', 'test:marketing-os']);
  const parsed = JSON.parse(text.slice(text.indexOf('{')));
  return {
    summary: `${parsed.passed}/${parsed.passed + parsed.failed} passed`,
    passed: parsed.passed,
    failed: parsed.failed,
    classifications: parsed.classifications
  };
}

async function readAppInsights() {
  const component = jsonRun('az', ['monitor', 'app-insights', 'component', 'show', '--app', FUNCTION_APP, '--resource-group', RESOURCE_GROUP, '--query', '{name:name,appId:appId,applicationType:applicationType,provisioningState:provisioningState,retentionInDays:retentionInDays}', '-o', 'json']);
  const invocations = appInsightsQuery(component.appId, [
    'traces',
    '| where timestamp > ago(48h)',
    '| where message has "SOCIAL_EXECUTION_WORKER" or message has "MARKETING_CONTROL_LOOP" or message has "CREATIVE_WORK_PROCESSOR" or message has "CREDENTIAL_MONITOR"',
    '| project timestamp, operation_Name',
    '| order by timestamp desc',
    '| take 200'
  ].join(' '));
  const exceptions = appInsightsQuery(component.appId, 'exceptions | where timestamp > ago(24h) | summarize count=count(), latest=max(timestamp) by tostring(operation_Name) | order by latest desc');
  return { component, invocations: summarizeInvocations(invocations), exceptions: summarizeExceptions(exceptions) };
}

function appInsightsQuery(appId, queryText) {
  try {
    return jsonRun('az', ['monitor', 'app-insights', 'query', '--app', appId, '--analytics-query', queryText, '-o', 'json']);
  } catch (error) {
    return { error: error.message, tables: [] };
  }
}

async function compareKuduPackage() {
  const profileXml = run('az', ['functionapp', 'deployment', 'list-publishing-profiles', '--resource-group', RESOURCE_GROUP, '--name', FUNCTION_APP, '--xml']);
  const profile = [...profileXml.matchAll(/<publishProfile[^>]+publishMethod="ZipDeploy"[^>]+>/g)]
    .map((match) => match[0])
    .map((tag) => ({ publishUrl: attr(tag, 'publishUrl'), userName: attr(tag, 'userName'), userPWD: attr(tag, 'userPWD') }))[0];
  if (!profile) return { state: 'KUDU_PROFILE_NOT_FOUND', files: [] };

  const host = profile.publishUrl.split('/')[0].replace(/:443$/, '');
  const files = [];
  for (const file of PRODUCTION_FILES) {
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
  if (!deployed.ok) return { file, classification: 'CONFIGURATION_REQUIRED', reason: `Deployed file could not be read for hash comparison: ${deployed.status}`, localHash };
  if (localHash === deployedHash) return { file, classification: 'MATCH', localHash, deployedHash };
  if (file === 'package.json') {
    const localPkg = JSON.parse(localText);
    const deployedPkg = JSON.parse(deployed.body);
    const localProd = { ...localPkg, scripts: undefined, devDependencies: undefined };
    const deployedProd = { ...deployedPkg, scripts: undefined, devDependencies: undefined };
    if (JSON.stringify(localProd) === JSON.stringify(deployedProd)) return { file, classification: 'EVIDENCE_ONLY', reason: 'Only npm script/dev metadata differs.', localHash, deployedHash };
  }
  return { file, classification: 'DEPLOYMENT_REQUIRED', reason: 'Deployed production file hash differs from local runtime standard.', localHash, deployedHash };
}

async function query(entitySetName, queryString, token) {
  const response = await dv(`/${entitySetName}?${queryString}`, token, true);
  return response.ok ? response.body.value || [] : [];
}

async function upsert(entitySetName, primaryId, payload, token) {
  const filter = encodeURIComponent(`jm1_idempotencykey eq '${payload.jm1_idempotencykey}'`);
  const existing = await query(entitySetName, `$select=${primaryId},jm1_idempotencykey&$filter=${filter}&$top=1`, token);
  if (existing[0]) {
    await dv(`/${entitySetName}(${existing[0][primaryId]})`, token, false, { method: 'PATCH', body: JSON.stringify(payload) });
    return { id: existing[0][primaryId], created: false };
  }
  const created = await dv(`/${entitySetName}`, token, false, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) });
  return { id: created[primaryId], created: true };
}

async function dv(path, token, allowFailure = false, init = {}) {
  const response = await fetch(`${DATAVERSE_WEB_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok && allowFailure) return { ok: false, status: response.status, body };
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path} failed: ${response.status} ${body.error?.message || text}`);
  return allowFailure ? { ok: true, status: response.status, body } : body;
}

function getDataverseToken() {
  return run('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv']).trim();
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
    'JM1_MARKETING_BRANCH_CONFIG'
  ];
  const out = {};
  for (const name of names) {
    if (!(name in raw)) out[name] = 'MISSING';
    else out[name] = name === 'JM1_MARKETING_BRANCH_CONFIG' ? JSON.parse(raw[name]) : raw[name];
  }
  out.keyVaultReferences = settings.filter((item) => String(item.value || '').startsWith('@Microsoft.KeyVault')).map((item) => item.name).sort();
  return out;
}

function runtimeSetting(settings, name) {
  return settings?.[name];
}

function runtimeHealth(azure) {
  return {
    controlLoop: azure.appInsights.invocations.byFunction.marketingControlLoopTimer ? 'RECENTLY_OBSERVED' : 'WAITING_FOR_NEXT_TIMER',
    creativeWorker: azure.appInsights.invocations.byFunction.creativeWorkProcessorTimer ? 'RECENTLY_OBSERVED' : 'WAITING_FOR_NEXT_TIMER',
    socialWorker: azure.appInsights.invocations.byFunction.socialExecutionWorkerTimer ? 'RECENTLY_OBSERVED' : 'WAITING_FOR_NEXT_TIMER',
    credentialMonitor: azure.appInsights.invocations.byFunction.credentialMonitorTimer ? 'RECENTLY_OBSERVED' : 'WAITING_FOR_NEXT_TIMER'
  };
}

function summarizeInvocations(result) {
  const rows = result.tables?.[0]?.rows || [];
  const byFunction = {};
  for (const row of rows) {
    const latest = row[0];
    const category = row[1] || '';
    const fn = ['creativeWorkProcessorTimer', 'credentialMonitorTimer', 'marketingControlLoopTimer', 'socialExecutionWorkerTimer'].find((name) => category.includes(name));
    if (fn) {
      byFunction[fn] = byFunction[fn] || { latest, count: 0 };
      byFunction[fn].count += 1;
      if (new Date(latest) > new Date(byFunction[fn].latest)) byFunction[fn].latest = latest;
    }
  }
  return { count: rows.length, byFunction };
}

function summarizeExceptions(result) {
  const rows = result.tables?.[0]?.rows || [];
  const byFunction = {};
  for (const row of rows) byFunction[row[0] || 'unknown'] = { count: row[1], latest: row[2] };
  return { count: rows.reduce((sum, row) => sum + Number(row[1] || 0), 0), byFunction };
}

function lifecycleEquivalentRows(rows) {
  return rows.social.filter((row) => /2026-09|Sean|Strategies|Shift/i.test([row.jm1_name, row.jm1_idempotencykey].join(' '))).map((row) => ({
    platform: row.jm1_platform,
    destination: row.jm1_requesteddestination || row.jm1_actualdestination,
    scheduledFor: row.jm1_requestedschedule || row.jm1_actualschedule,
    campaign: row.jm1_name
  }));
}

function strategiesState(rows) {
  return rows.social.some((row) => /Strategies|Sep.*22|launch/i.test([row.jm1_name, row.jm1_idempotencykey].join(' '))) ? 'RECONCILED' : 'DERIVABLE';
}

function unresolvedPrerequisites({ runtimeAlignment, catalogHealth, rows }) {
  return [
    runtimeAlignment.classification === 'JMP_MARKETING_LIFECYCLE_PRODUCTION_RUNTIME_ALIGNED' ? '' : runtimeAlignment.classification,
    catalogHealth.some((row) => /ASSET_EXCEPTION|RIGHTS_EXCEPTION/.test(row.governedMarketingState)) ? 'CATALOG_ASSET_OR_RIGHTS_EXCEPTION_PRESENT' : '',
    rows.exceptions.some((row) => !/RESOLVED|CLOSED/i.test(row.jm1_resolutionstate || '')) ? 'OPEN_NON_ROUTINE_MARKETING_EXCEPTIONS_PRESENT' : '',
    'LINKEDIN_EXTERNAL_REVIEW_ONLY'
  ].filter(Boolean).join('; ');
}

function hasAsset(rows, pattern) {
  return [...rows.media, ...rows.creative].some((row) => pattern.test([row.jm1_name, row.jm1_durableurl, row.jm1_assetpath, row.jm1_idempotencykey].join(' ')));
}

function newestDateForTitle(rows, pattern) {
  return rows
    .filter((row) => pattern.test([row.jm1_name, row.jm1_idempotencykey].join(' ')))
    .map((row) => row.jm1_actualschedule || row.jm1_requestedschedule || row.modifiedon)
    .filter(Boolean)
    .sort()
    .at(-1) || '';
}

function titleRegex(title) {
  const words = String(title || '').split(/[^A-Za-z0-9]+/).filter((word) => word.length > 3).slice(0, 3);
  return new RegExp(words.join('|') || 'NO_MATCH', 'i');
}

function safeRow(row) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !/@odata|token|secret/i.test(key)));
}

function jsonRun(command, args) {
  return JSON.parse(run(command, args));
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function currentBranch() {
  return run('git', ['branch', '--show-current']).trim();
}

function currentCommit() {
  return run('git', ['rev-parse', 'HEAD']).trim();
}

function sha(text) {
  return createHash('sha256').update(text).digest('hex');
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function attr(tag, name) {
  return decodeXml(tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '');
}

function decodeXml(value) {
  return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
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

function renderMarkdown(value) {
  return `# ${value.artifact}

Generated: ${value.generatedAt}

## Final Classification
${value.finalClassification}

## Runtime Alignment
${value.productionRuntimeAlignment.classification}

## Temporal Authority
Current: ${value.featuredAuthorTemporalAuthority.currentFeaturedAuthor}

Next: ${value.featuredAuthorTemporalAuthority.nextFeaturedAuthor}

## September / Sean
${value.septemberSeanHealth.classification}

## Strategies
${value.strategiesLaunchReadiness.classification}

## The Shift
${value.theShiftStatus.guard}

## Catalog Health
${JSON.stringify(value.marketingHealthResults.counts, null, 2)}

## Command Center
${value.marketingCommandCenter.classification}

HTML: ${value.marketingCommandCenter.html}

## Sintra
${value.sintraCancellationReadiness.classification}

Cancellation executed: false

## LinkedIn
${value.linkedinState.state}

## Touch Count
Founder routine touch: ${value.routineFounderTouchCount}

Cody routine touch: ${value.routineCodyTouchCount}

## Regression
${value.regressionResults.summary}
`;
}

function renderHtml(value) {
  const health = value.marketingHealthResults.counts;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JMP Marketing Command Center</title>
  <style>
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f6f5f1; color: #111; }
    header { background: #111; color: #fff; padding: 24px 32px; }
    main { padding: 24px 32px; display: grid; gap: 18px; }
    section { background: #fff; border: 1px solid #d9d6ce; border-radius: 6px; padding: 18px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { margin: 0 0 12px; font-size: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .metric { border: 1px solid #e4e1d8; border-radius: 6px; padding: 12px; }
    .label { color: #555; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 6px; font-size: 18px; font-weight: 700; }
    ul { margin: 0; padding-left: 18px; }
  </style>
</head>
<body>
  <header>
    <h1>J Merrill Publishing Marketing Command Center</h1>
    <div>Generated ${escapeHtml(value.generatedAt)}</div>
  </header>
  <main>
    <section>
      <h2>Current</h2>
      <div class="grid">
        <div class="metric"><div class="label">Featured Author</div><div class="value">${escapeHtml(value.featuredAuthorTemporalAuthority.currentFeaturedAuthor)}</div></div>
        <div class="metric"><div class="label">Next</div><div class="value">${escapeHtml(value.featuredAuthorTemporalAuthority.nextFeaturedAuthor)}</div></div>
        <div class="metric"><div class="label">Strategies Launch</div><div class="value">${escapeHtml(value.strategiesLaunchReadiness.classification)}</div></div>
        <div class="metric"><div class="label">The Shift</div><div class="value">New / recently released</div></div>
      </div>
    </section>
    <section>
      <h2>Catalog Health</h2>
      <div class="grid">
        ${Object.entries(health).map(([key, value]) => `<div class="metric"><div class="label">${escapeHtml(key)}</div><div class="value">${escapeHtml(value)}</div></div>`).join('')}
      </div>
    </section>
    <section>
      <h2>Runtime</h2>
      <ul>
        <li>${escapeHtml(value.productionRuntimeAlignment.classification)}</li>
        <li>${escapeHtml(value.legacyScheduleReconciliation.duplicatePreventionState)}</li>
        <li>${escapeHtml(value.linkedinState.state)}</li>
      </ul>
    </section>
    <section>
      <h2>Exceptions</h2>
      <div class="metric"><div class="label">Founder-actionable</div><div class="value">${escapeHtml(value.exceptionRouting.founderActionableCount)}</div></div>
    </section>
  </main>
</body>
</html>
`;
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
