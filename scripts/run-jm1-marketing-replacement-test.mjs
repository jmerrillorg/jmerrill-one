import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const generatedAt = '2026-09-02T00:00:00-04:00';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, payload) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
}

const evidence = {
  closeout771: join(ROOT, '771_sep25_30_live_rebuild_closeout.json'),
  priorManualTrace745: join(ROOT, '745_jm1_marketing_manual_to_automation_trace_v1.json'),
  marketingArchitecture683: join(ROOT, '683_jmp_marketing_operating_architecture.json'),
  triggerTaxonomy684: join(ROOT, '684_jmp_marketing_trigger_taxonomy.json'),
  eligibility687: join(ROOT, '687_jmp_marketing_eligibility_schema.json'),
  campaignAuthority688: join(ROOT, '688_jmp_campaign_authority_schema.json'),
  socialQueue704: join(ROOT, '704_jmp_social_queue_schema.json'),
  idempotency707: join(ROOT, '707_jm1_social_idempotency_standard.json'),
  exceptionModel708: join(ROOT, '708_jm1_social_execution_exception_model.json'),
  supersession710: join(ROOT, '710_jmp_marketing_supersession_rule.json'),
  lifecycleMapping711: join(ROOT, '711_jmp_current_lifecycle_to_marketing_mapping.json'),
  journeyMapping712: join(ROOT, '712_jmp_campaign_to_journey_mapping.json'),
  performanceLoop713: join(ROOT, '713_jmp_marketing_performance_return_loop.json'),
  implementationPlan715: join(ROOT, '715_jmp_marketing_automation_implementation_plan.json'),
  runtimeProof776: join(ROOT, '776_jm1_marketing_owned_runtime_proof_v1.json'),
  dedicatedDataverse777: join(ROOT, '777_jm1_dedicated_dataverse_marketing_runtime_v1.json'),
  metaApiArchitecture: 'docs/governance/JM1-Meta-Graph-Publishing-Architecture-v0.1.md',
  journeysStandard: 'artifacts/JM1_Customer_Insights_Journeys_Operating_Standard_v1.md',
  septemberBatchBuilder: 'scripts/build-publishing-sep11-30-batch.mjs'
};

const closeout = existsSync(evidence.closeout771) ? readJson(evidence.closeout771) : {};
const dedicatedDataverse = existsSync(evidence.dedicatedDataverse777) ? readJson(evidence.dedicatedDataverse777) : null;

const manualOperations = [
  op('Determine what to market', 'September required human judgment to choose Sean A Crowley I, The Shift, Strategies for Success, publishing inquiries, and brand education lanes.', ['Founder directives', 'Publishing catalog facts', 'September Featured Author authority'], 'Promote only source-backed titles/authors and approved Publishing programs.', 'Campaign candidates and daily themes.', ['stale campaign content', 'inaccurate title classification'], 'Campaign Authority Engine + Portfolio Marketing Health', 'DESIGNED'),
  op('Determine timing', 'The live month needed daily platform timing and launch-runway ordering.', ['release dates', 'platform cadence', 'Founder priorities'], 'Protect launch dates and avoid overloading one author/title lane.', 'ScheduledFor values by platform.', ['partial platform completion', 'manual date-picker error risk'], 'Lifecycle Trigger Registry + Execution Schedule Validation', 'DESIGNED'),
  op('Find real cover assets', 'Rejected creative had to be replaced with real source-backed book covers.', ['Publishing-owned asset folders', 'Amazon/public retailer proof where appropriate'], 'Use actual cover only; do not AI-edit or approximate book covers.', 'Cover asset reference with provenance.', ['source assets assumed missing too early', 'fake/weak visual substitutes'], 'Asset Resolver', 'PARTIAL'),
  op('Find real author assets', 'Author creative required governed portraits or a rights-safe fallback.', ['author asset folders', 'source provenance register'], 'Use governed author imagery only; otherwise hold likeness-specific creative.', 'Author asset status and fallback path.', ['risk of fabricated likeness', 'missing author portrait evidence'], 'Asset Resolver + Rights Gate', 'DESIGNED'),
  op('Find approved logos', 'Every new image must include the correct J Merrill logo, not a fake mark or placeholder.', ['official JM1 logo asset', 'branch logo rules'], 'Use official approved logo asset only.', 'Logo reference bound to creative.', ['fake logo', 'incorrect day-one logo', 'unexplained gray-circle/header mark'], 'Brand Asset Resolver', 'PARTIAL'),
  op('Validate source facts', 'Copy needed correction when a title was treated as draft/backlist instead of newly released.', ['Founder correction', 'retailer/public title status', 'campaign ledger'], 'New/recent releases cannot be classified as backlist or draft.', 'Corrected factual framing.', ['The Shift misclassified as backlist', 'The Shift misclassified as draft'], 'Public Fact Validator', 'DESIGNED'),
  op('Normalize media', 'Meta uploads exposed RGB/export constraints and exact-file handling issues.', ['approved PNG/SVG', 'dimensions', 'MIME type', 'SHA-256'], 'Normalize only technical format; preserve approved visual content exactly.', 'Upload-ready exact file with checksum.', ['RGB normalization blocker', 'malformed platform variant'], 'Media Normalization Service', 'PARTIAL'),
  op('Create creative', 'Manual rebuild produced higher-quality People-First/Why-First creative after rejecting registry-card output.', ['campaign brief', 'real assets', 'brand system'], 'Create public art that supports the reason to care, not internal process labels.', 'Approved local creative artifacts.', ['rejected Sintra creative', 'generic/registry-card creative'], 'Creative Production Engine', 'PARTIAL'),
  op('Reject weak creative', 'The operator manually blocked bad, malformed, or off-brand outputs.', ['visual inspection', 'brand requirements', 'content quality gate'], 'Reject if fake asset, malformed layout, missing logo, poor public quality, or wrong framing.', 'Hold/rebuild decision.', ['malformed LinkedIn wide export', 'weak generated assets'], 'Creative Quality Scoring + Public-Ready Gate', 'DESIGNED'),
  op('Apply factual corrections', 'Founder corrections changed The Shift status and current marketing language.', ['Founder correction', 'existing artifacts'], 'Authoritative Founder correction supersedes stale generated classification.', 'Corrected campaign/copy rule.', ['inaccurate title classification', 'stale campaign content'], 'Instruction/Authority Resolver', 'DESIGNED'),
  op('Write platform-specific copy', 'Meta allows Facebook and Instagram details inside the same flow, but captions may differ by platform.', ['campaign voice', 'platform constraints', 'destination registry'], 'Use channel-appropriate copy without changing facts or CTA authority.', 'Facebook, Instagram, and LinkedIn variants.', ['one-size-fits-all copy', 'platform detail mismatch'], 'Channel-Aware Assembly Engine', 'DESIGNED'),
  op('Run People-First gate', 'September replacement had to shift from calendar filler to audience-centered public posts.', ['copy draft', 'creative draft', 'branch voice'], 'Public post must make the person/audience reason clear.', 'People-First pass/hold.', ['automation filled a calendar but weakened judgment'], 'Public-Ready Gate', 'DESIGNED'),
  op('Run Why-First gate', 'Each post needed a clear reason to exist beyond posting cadence.', ['campaign objective', 'reader/author value', 'launch context'], 'Publish only when the post explains why this matters now.', 'Why-First pass/hold.', ['generic filler', 'technical count outranking quality'], 'Public-Ready Gate', 'DESIGNED'),
  op('Set public language boundaries', 'Internal governance terms and rights metadata had to stay backstage.', ['branch public voice rules', 'campaign authority'], 'No internal governance vocabulary in public copy.', 'Public-safe caption.', ['public exposure of internal governance language'], 'Public Language Boundary Filter', 'DESIGNED'),
  op('Select destination', 'Wrong workspace/page context was a live risk across Sintra, Meta, and LinkedIn.', ['destination registry', 'visible admin/page context'], 'Use immutable destination IDs where available; never infer from similar names.', 'Destination-bound social post.', ['wrong Sintra workspace', 'wrong destination risk'], 'Destination Authority Registry', 'PARTIAL'),
  op('Schedule Facebook', 'Facebook had to be rebuilt through Meta Business Suite UI with exact creative.', ['Facebook destination', 'caption', 'media', 'scheduledFor'], 'Schedule only after exact file, destination, story state, and time preflight pass.', 'Facebook scheduled item/readback.', ['Meta picker failure', 'FB Story default ON'], 'MetaAdapter automation requirement: Facebook Page publishing/media upload/readback', 'MANUAL_UI_PROVEN_TARGET_API_NOT_PROVEN'),
  op('Schedule Instagram', 'Instagram had to be rebuilt through Meta Business Suite UI with exact creative and separate platform proof.', ['Instagram destination', 'caption', 'media', 'scheduledFor'], 'Planner presence alone is not publication proof; require IG-specific confirmation/readback.', 'Instagram scheduled item/readback.', ['partial platform completion', 'Meta planner ambiguity'], 'MetaAdapter automation requirement: Instagram Graph publishing/media upload/readback', 'MANUAL_UI_PROVEN_TARGET_API_NOT_PROVEN'),
  op('Schedule LinkedIn', 'LinkedIn native organization UI was used because owned LinkedIn API publishing was not yet proven.', ['LinkedIn organization destination', 'caption', 'media', 'alt text', 'scheduledFor'], 'Schedule to Publishing organization only and verify requested-vs-actual state before certification.', 'LinkedIn scheduled item/readback.', ['LinkedIn snapback', 'malformed variant', 'time/date retry'], 'LinkedInAdapter automation requirement: organization publishing/media upload/readback', 'MANUAL_UI_PROVEN_TARGET_API_NOT_PROVEN_EXTERNAL_PERMISSION_RISK'),
  op('Disable Facebook Story', 'Meta defaulted Facebook Story behavior in a way that could create unintended placements.', ['Meta composer state', 'preflight screenshots'], 'Facebook Story must be off unless explicitly approved.', 'FB feed-only schedule proof.', ['FB Story default ON', 'unclean Sep28 story-off evidence'], 'Placement Control Rule', 'DESIGNED'),
  op('Add LinkedIn alt text', 'LinkedIn accessibility metadata was manually entered.', ['asset description', 'platform metadata field'], 'Attach approved alt text to every LinkedIn image post.', 'Alt-text-bearing LinkedIn post.', ['manual omission risk'], 'Accessibility Metadata Generator', 'DESIGNED'),
  op('Perform preflight/readback', 'Every platform needed evidence beyond draft presence.', ['composer review', 'scheduled list', 'platform confirmation'], 'Verify destination, creative, caption, date, time, and platform state.', 'Execution evidence artifact.', ['platform confirmation ambiguity', 'treating planner presence as proof'], 'Preflight + Readback Service', 'PARTIAL'),
  op('Retry partial failures', 'Some days/platforms completed while others held or needed retry.', ['execution status per platform', 'failure reason'], 'Retry only failed/held platform execution without duplicating passed records.', 'Per-platform pass/hold/retry state.', ['partial platform completion', 'blind retry duplicate risk'], 'Retry + Dead-Letter Engine', 'DESIGNED'),
  op('Preserve fallback until replacement', 'Old Soshie items stayed until exact-file replacements were scheduled and verified.', ['old queue item', 'replacement proof'], 'Never remove executable fallback before replacement is confirmed.', 'Fallback preservation or safe removal.', ['execution gap risk'], 'Supersession Engine', 'MANUAL_PROVEN_TARGET_DESIGNED'),
  op('Delete Soshie executor after replacement', 'Soshie duplicates had to be retired once Meta/LinkedIn native replacements existed.', ['Soshie calendar', 'replacement evidence'], 'Delete only superseded platform item with matching date/destination/campaign.', 'Residual executable item removed.', ['duplicate scheduler', 'wrong-item deletion risk'], 'Supersession Reconciliation', 'MANUAL_PROVEN_TARGET_DESIGNED'),
  op('Prevent duplicates', 'The rebuild needed a single authoritative scheduler per platform/date/item.', ['replacement ledger', 'old queue inventory'], 'One platform item per campaign occurrence unless explicitly split.', 'duplicates = 0.', ['Sintra + Meta duplicate path', 'Sintra + LinkedIn duplicate path'], 'Idempotency Standard', 'DESIGNED'),
  op('Verify status', 'Scheduled, published, held, and deleted states had to be classified separately.', ['platform UI/readback', 'evidence screenshots', 'validation JSON'], 'Do not promote state without direct platform evidence.', 'Status ledger.', ['draft treated as scheduled', 'scheduled treated as published'], 'Publication State Model', 'PARTIAL'),
  op('Capture evidence', 'The September rescue depended on screenshot and JSON evidence to remain auditable.', ['screenshots', 'checksums', 'validation artifacts'], 'Capture enough evidence to support every pass/hold/deleted claim.', 'Evidence package.', ['missing readback', 'ambiguous state proof'], 'Dataverse Execution Evidence + Observability', 'PARTIAL'),
  op('Decide next action', 'Operator had to choose rebuild, retry, hold, preserve, or delete on each exception.', ['state ledger', 'guardrails', 'Founder corrections'], 'Choose the least risky action that preserves public quality and avoids duplicate execution.', 'Next action and owner.', ['manual branching load', 'stale assumption carryover'], 'Next-Best-Marketing-Action Engine', 'DESIGNED'),
  op('Replenish queue', 'The system must keep marketing moving after September without a new manual calendar build.', ['campaign eligibility', 'performance loop', 'portfolio health'], 'Generate only eligible next items with source-backed assets and approved campaign authority.', 'Next queue candidates.', ['manual queue exhaustion', 'October manual-calendar temptation'], 'Queue Replenishment Runtime', 'DESIGNED')
];

const manualTrace = {
  packageId: 772,
  artifact: 'JM1-MARKETING-MANUAL-TRACE-v1',
  generatedAt,
  status: 'RATIFIED',
  basis: 'September Publishing remediation is a manual trace for replacement, not the new operating procedure.',
  correctedSeptemberExecutionTruth: {
    facebook: 'Meta Business Suite UI',
    instagram: 'Meta Business Suite UI',
    linkedin: 'LinkedIn native organization UI',
    sintraSoshie: 'Superseded execution objects removed during remediation; not the authoritative final scheduler for the completed September run',
    replacementTarget: 'Replace browser-operated Meta and LinkedIn steps with JM1-owned platform adapters; do not give Sintra replacement credit for final September execution.'
  },
  supersedesForCompleteness: evidence.priorManualTrace745,
  preservesHistoricalTruth: true,
  founderCorrectionsPreserved: [
    'The Shift was released last month relative to the September 2026 campaign; classify as new/recent, not backlist and not draft.',
    'All new images must include the official J Merrill logo asset.',
    'Meta post details may be Facebook-specific or Instagram-specific within the same Meta scheduling surface.'
  ],
  manualOperations,
  observedFailureModesBecomeRequirements: [
    'wrong Sintra workspace',
    'rejected Sintra creative',
    'duplicate scheduler',
    'Meta picker failure',
    'RGB normalization',
    'FB Story default ON',
    'LinkedIn snapback',
    'malformed variant',
    'partial platform completion',
    'inaccurate title classification',
    'stale campaign content'
  ],
  closureRule: 'Future routine Publishing execution must convert this trace into Dataverse-governed system behavior before replacing manual/browser scheduling.'
};

const inventoryCapabilities = [
  cap('Enterprise Marketing Operating System', 'DESIGNED', [evidence.marketingArchitecture683], 'Reusable architecture exists, but runtime no-manual-touch execution is not proven.'),
  cap('Publishing Program Authority', 'DESIGNED', [evidence.marketingArchitecture683, evidence.campaignAuthority688], 'Authority needs explicit four-program ratification in the enterprise MOS.'),
  cap('Marketing Eligibility', dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'PROVEN' : 'DESIGNED', [evidence.eligibility687, evidence.dedicatedDataverse777], dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'Dedicated Dataverse Marketing Eligibility table write/readback/idempotency proven.' : 'Schema exists; Dataverse table/mutation proof is not present in this worktree.'),
  cap('Campaign Authority', dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'PROVEN' : 'DESIGNED', [evidence.campaignAuthority688, evidence.dedicatedDataverse777], dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'Dedicated Dataverse Campaign Authority table write/readback/idempotency proven.' : 'Schema exists; campaign conflict runtime is not proven.'),
  cap('Lifecycle Trigger Registry', 'DESIGNED', [evidence.triggerTaxonomy684, evidence.lifecycleMapping711], 'Trigger taxonomy is source-backed but production event ingestion is not proven.'),
  cap('Customer Insights Journeys', 'PARTIAL', [evidence.journeysStandard, evidence.journeyMapping712], 'Operating standard exists; production journey activation remains gated by tenant proof/consent controls.'),
  cap('Asset Resolver', 'PARTIAL', [evidence.septemberBatchBuilder, join(ROOT, '721_jmp_exact_creative_asset_pipeline.json')], 'Real assets were manually resolved and scripted into creative generation; no service endpoint/table implementation is proven.'),
  cap('Creative Production Engine', 'PARTIAL', [evidence.septemberBatchBuilder, join(ROOT, '741_sep11_30_creative_register.json')], 'Batch generation exists for September but is campaign-specific, not a reusable production service.'),
  cap('Public-Ready Gate', 'DESIGNED', [join(ROOT, '701_jmp_public_ready_gate.json'), evidence.closeout771], 'Manual QA was effective; deterministic automated scoring is not proven.'),
  cap('Social Queue Schema', dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'PARTIAL' : 'DESIGNED', [evidence.socialQueue704, evidence.dedicatedDataverse777], dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? 'Dedicated Social Execution table exists with held FB/IG/LN rows; platform API execution remains unproven.' : 'Dataverse target schema is documented but not implemented in this worktree.'),
  cap('Meta Facebook API Execution', 'PARTIAL', [evidence.metaApiArchitecture], 'Architecture exists; owned app/token/canary evidence is not present here.'),
  cap('Instagram Graph API Execution', 'PARTIAL', [evidence.metaApiArchitecture], 'Architecture exists; owned app/token/canary evidence is not present here.'),
  cap('LinkedIn Organization API Execution', 'EXTERNAL_DEPENDENCY', [evidence.metaApiArchitecture], 'LinkedIn organization publishing may require app product permission/review; native UI scheduling is not API proof.'),
  cap('Native Scheduler Bridge', 'PROVEN', [evidence.closeout771], 'Meta native and LinkedIn native September execution evidence exists; this is a bridge, not target automation.'),
  cap('Exact Media Preservation', 'PARTIAL', [join(ROOT, '721_jmp_exact_creative_asset_pipeline.json'), evidence.closeout771], 'Exact-file scheduling was manually proven; API upload/readback is not proven.'),
  cap('Destination Authority Registry', 'PARTIAL', [join(ROOT, '728_jmp_marketing_configuration_registry.json'), evidence.closeout771], 'Publishing destinations were manually verified; immutable API IDs remain required.'),
  cap('Idempotency', 'DESIGNED', [evidence.idempotency707], 'Rule exists; runtime duplicate prevention is not implemented/proven.'),
  cap('Retry and Dead Letter', 'DESIGNED', [evidence.exceptionModel708], 'Exception model exists; no orchestrator implementation is proven.'),
  cap('Supersession', 'PARTIAL', [evidence.supersession710, evidence.closeout771], 'Manual Soshie retirement worked; system-driven supersession is not implemented.'),
  cap('Analytics Return Loop', 'DESIGNED', [evidence.performanceLoop713], 'Inputs/outputs defined; platform API metric ingestion is not proven.'),
  cap('Daily Control Loop', 'DESIGNED', [join(ROOT, '726_jmp_daily_marketing_control_loop.json')], 'Model exists; scheduled autonomous daily run is not proven.'),
  cap('Founder Digest', 'DESIGNED', [join(ROOT, '727_jmp_founder_marketing_digest_model.json')], 'Model exists; exception-only digest delivery is not proven.'),
  cap('October Featured Author Controlled Test', 'NOT_PRESENT', [join(ROOT, '724_jmp_featured_author_runtime.json')], 'Iyorwuese test not yet executed in this worktree.'),
  cap('No Manual Touch Acceptance Test', 'NOT_PRESENT', [], 'No routine campaign has yet passed from trigger to platform readback without browser/manual execution.')
];

const currentStateInventory = {
  packageId: 773,
  artifact: 'JM1-MARKETING-CURRENT-STATE-INVENTORY-v1',
  generatedAt,
  status: 'RATIFIED_CURRENT_STATE',
  inspectedEvidence: Object.values(evidence).filter(Boolean),
  classificationScale: ['DESIGNED', 'IMPLEMENTED', 'PROVEN', 'PARTIAL', 'NOT_PRESENT', 'EXTERNAL_DEPENDENCY'],
  capabilities: inventoryCapabilities,
  explicitTruths: {
    septemberPublishingRunCreatedThroughJm1OwnedApi: false,
    septemberOriginalOrSupersededObjectsCreatedThroughSintraSoshieUi: true,
    septemberFinalAuthoritativeFacebookScheduler: 'Meta Business Suite UI',
    septemberFinalAuthoritativeInstagramScheduler: 'Meta Business Suite UI',
    septemberFinalAuthoritativeLinkedInScheduler: 'LinkedIn native organization UI',
    septemberFinalAuthoritativeSintraSoshieScheduler: false,
    sep25To30OperationalCloseout: closeout.finalClassification ?? 'SEE_771',
    routineFounderManualMarketingTouchTarget: 0,
    computerUseRole: 'ONE_TIME_SETUP_DEBUG_EXCEPTION_HANDLING_ONLY'
  },
  gapsThatBlockNoManualTouch: [
    'Dataverse social queue/table mutation not proven from this worktree.',
    'JM1-owned Meta app credentials/tokens and posting canary are not present in repo evidence.',
    'LinkedIn organization API permission remains an external dependency until product access is verified.',
    'Customer Insights Journeys production criteria are not yet proven for Publishing programs.',
    'Reusable creative quality scoring/service runtime is not yet implemented.'
  ]
};

const enterpriseMos = {
  packageId: 774,
  artifact: 'JM1-ENTERPRISE-MARKETING-OPERATING-SYSTEM-v1',
  generatedAt,
  status: 'RATIFIED_DESIGN_READY_FOR_IMPLEMENTATION',
  owner: 'J Merrill One',
  firstProductionBranch: 'J Merrill Publishing',
  governingPrinciple: 'Branch strategy and public voice stay branch-isolated; shared One infrastructure handles eligibility, assembly, execution, evidence, and exception routing.',
  doNotDo: [
    'Do not manually build another October social calendar.',
    'Do not use September browser workflow as the routine operating procedure.',
    'Do not classify Sintra/Soshie scheduling as JM1-owned API publishing.',
    'Do not give Sintra/Soshie replacement credit for the final remediated September execution.',
    'Do not classify The Shift as backlist or draft.'
  ],
  sharedServices: [
    'Marketing Eligibility Service',
    'Campaign Authority Service',
    'Lifecycle Trigger Registry',
    'Asset Resolver',
    'Creative Production Engine',
    'Public-Ready Gate',
    'Dataverse Social Queue',
    'Platform Adapter Layer',
    'Execution Evidence Store',
    'Idempotency and Supersession Engine',
    'Retry and Dead-Letter Engine',
    'Analytics Return Loop',
    'Next-Best-Marketing-Action Engine',
    'Founder Digest'
  ],
  publishingProgramAuthority: [
    'Title/Author Marketing',
    'Author Acquisition/Inquiry',
    'Publishing Brand Marketing',
    'Reader/Audience Engagement'
  ],
  branchIsolationRules: [
    'Publishing campaigns publish only to certified Publishing destinations.',
    'Financial, Foundation, One, Productions, AIC, and personal destinations are not fallback destinations for Publishing.',
    'Shared infrastructure may be reused, but branch facts, logos, compliance boundaries, CTAs, and voice must be loaded from the active branch configuration.'
  ],
  targetRuntime: {
    authority: 'Dataverse',
    orchestration: 'Azure Function / Logic App / Power Automate as appropriate',
    executionAdapters: ['Meta Graph API -> Facebook Pages', 'Instagram Graph API -> Instagram Business/Creator', 'LinkedIn Organization API -> LinkedIn Company Pages after permission proof'],
    exactMediaRule: 'Upload approved creative file by asset reference/checksum with no AI transformation between approval and platform upload.',
    proofRule: 'Published or scheduled state requires platform response plus platform object ID/readback where supported.',
    idempotencyKey: 'SocialPostId + Platform + DestinationAccountId + PayloadHash'
  },
  publishingLifecycleTriggerRegistry: [
    'COVER_APPROVED',
    'LAUNCH_DATE_LOCKED',
    'DISTRIBUTION_LIVE',
    'LAUNCH_DAY',
    'LAUNCH_PLUS_7',
    'LAUNCH_PLUS_30',
    'LAUNCH_PLUS_90',
    'TITLE_ANNIVERSARY',
    'NEW_FORMAT',
    'AUDIOBOOK_RELEASED'
  ],
  acceptanceLevels: [
    { level: 'L0', name: 'Manual trace captured', currentState: 'PROVEN_BY_772' },
    { level: 'L1', name: 'Current architecture inventoried', currentState: 'PROVEN_BY_773' },
    { level: 'L2', name: 'Enterprise MOS ratified', currentState: 'PROVEN_BY_774' },
    { level: 'L3', name: 'Lifecycle trigger produces eligible campaign candidate without manual calendar build', currentState: 'HARNESS_PROVEN_DESIGN_ONLY_BY_775' },
    { level: 'L4', name: 'Dataverse queue writes and approvals execute in tenant', currentState: 'NOT_PRESENT' },
    { level: 'L5', name: 'Owned API canary publishes exact file and stores platform ID/readback', currentState: 'NOT_PRESENT' },
    { level: 'L6', name: 'Routine Founder manual marketing touch equals zero except exceptions', currentState: 'NOT_PRESENT' }
  ],
  octoberControlledTest: {
    featuredAuthor: 'Iyorwuese',
    permittedActionNow: 'Create system-driven eligibility/campaign candidate and hold before live execution until API/Journeys proof exists.',
    prohibitedActionNow: 'Manual October 30-day calendar rebuild.'
  }
};

const lifecycleCanary = {
  trigger: 'COVER_APPROVED',
  branch: 'J Merrill Publishing',
  program: 'Title/Author Marketing',
  input: {
    titleStatus: 'new_or_active_title_candidate',
    assetRequirement: 'real governed cover asset',
    founderManualTouch: 0
  },
  producedSystemObjects: [
    'marketingEligibilityCandidate',
    'campaignAuthorityCandidate',
    'creativeBriefCandidate',
    'socialQueueDraftCandidate'
  ],
  executionHold: 'HOLD_BEFORE_PLATFORM_EXECUTION_UNTIL_DATAVERSE_WRITE_AND_OWNED_API_CANARY_ARE_PROVEN',
  result: 'PASS_DESIGN_CANARY_ONLY'
};

const replacementMatrix = {
  packageId: 775,
  artifact: 'JM1-MARKETING-CODY-TO-SYSTEM-REPLACEMENT-TEST-MATRIX-v1',
  generatedAt,
  status: 'PARTIAL_PASS_DESIGN_CANARY_ONLY',
  sourceArtifactsCreated: [
    join(ROOT, '772_jm1_marketing_manual_trace_v1.json'),
    join(ROOT, '773_jm1_marketing_current_state_inventory_v1.json'),
    join(ROOT, '774_jm1_enterprise_marketing_operating_system_v1.json')
  ],
  testAssertions: [
    assert('September manual trace captured with required fields', true, '772 contains all requested manual operation mappings.'),
    assert('Final remediated September run was JM1 API-driven', false, 'Final September execution was browser/UI driven, not JM1-owned API.'),
    assert('Final remediated September authoritative FB/IG scheduler was Meta Business Suite UI', true, 'Founder clarification supersedes any shorthand that over-credited Sintra/Soshie.'),
    assert('Final remediated September authoritative LinkedIn scheduler was LinkedIn native organization UI', true, 'LinkedIn native scheduling was the final manual bridge.'),
    assert('Sintra/Soshie was final authoritative September scheduler', false, 'Soshie held superseded execution objects that were removed during remediation.'),
    assert('The Shift classified as new/recent, not backlist/draft', true, 'Founder correction is recorded in 772 and 774.'),
    assert('Dedicated Dataverse marketing table runtime proven', dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN', dedicatedDataverse?.classification === 'DATAVERSE_MARKETING_TABLE_RUNTIME_PROVEN' ? '777 proves dedicated tables, relationships, writes, readback, and idempotency.' : 'Dedicated Dataverse marketing table proof is not present.'),
    assert('One lifecycle trigger worked in harness', true, 'COVER_APPROVED maps to a candidate chain without live execution.'),
    assert('One branch mapping completed', true, 'Publishing branch maps to four ratified programs in 774.'),
    assert('One automation maturity level reached', true, 'L0-L2 are artifact-proven; L3 is design-canary proven.'),
    assert('No-manual-touch runtime proven', false, 'Dataverse marketing table writes, Dynamics Journey runtime, and platform API canaries are not yet proven.'),
    assert('Computer Use removed from routine target path', true, '774 assigns Computer Use to setup/debug/exception only.')
  ],
  lifecycleCanary,
  platformApiState: {
    facebook: {
      ownedApp: 'NOT_PROVEN_IN_REPO_EVIDENCE',
      apiPermissions: 'DESIGNED_META_GRAPH_REQUIRED',
      credentialState: 'NOT_PRESENT_NO_SECRETS_STORED',
      publishCapability: 'PARTIAL_ARCHITECTURE_ONLY',
      scheduleApproach: 'JM1 delayed execution via Dataverse/orchestrator unless platform scheduling endpoint is explicitly available',
      implementationStatus: 'HOLD_PENDING_OWNED_APP_TOKEN_AND_CANARY'
    },
    instagram: {
      ownedApp: 'NOT_PROVEN_IN_REPO_EVIDENCE',
      apiPermissions: 'DESIGNED_INSTAGRAM_GRAPH_REQUIRED',
      credentialState: 'NOT_PRESENT_NO_SECRETS_STORED',
      publishCapability: 'PARTIAL_ARCHITECTURE_ONLY',
      scheduleApproach: 'JM1 delayed execution via Dataverse/orchestrator',
      implementationStatus: 'HOLD_PENDING_OWNED_APP_TOKEN_AND_CANARY'
    },
    linkedin: {
      ownedApp: 'NOT_PROVEN_IN_REPO_EVIDENCE',
      apiPermissions: 'EXTERNAL_PERMISSION_DEPENDENCY',
      credentialState: 'NOT_PRESENT_NO_SECRETS_STORED',
      publishCapability: 'NATIVE_UI_PROVEN_API_NOT_PROVEN',
      scheduleApproach: 'JM1 delayed execution via orchestrator after LinkedIn organization API access is approved',
      implementationStatus: 'HOLD_LINKEDIN_API_EXTERNAL_PERMISSION_DEPENDENCY'
    }
  },
  targetRuntime: enterpriseMos.targetRuntime,
  canary: {
    platform: 'NONE_LIVE',
    destination: 'NONE_LIVE',
    result: 'NOT_EXECUTED_NO_API_AUTHORITY_PRESENT',
    platformPostId: null,
    liveReadbackValidation: 'NOT_AVAILABLE'
  },
  finalClassification: 'POST-SEPTEMBER AUTOMATION REPLACEMENT PHASE STARTED; DESIGN_CANARY_PASS; OWNED_API_RUNTIME_NOT_YET_PROVEN',
  nextFounderDecisions: [
    'Authorize/identify the JM1-owned Meta app and Business asset access to run the first exact-file API canary.',
    'Authorize/identify LinkedIn developer application/product access if LinkedIn organization API publishing is desired beyond native scheduler bridge.',
    'Confirm which Publishing-owned October/Iyorwuese source assets are approved for the controlled lifecycle-trigger test.'
  ]
};

writeJson(join(ROOT, '772_jm1_marketing_manual_trace_v1.json'), manualTrace);
writeJson(join(ROOT, '773_jm1_marketing_current_state_inventory_v1.json'), currentStateInventory);
writeJson(join(ROOT, '774_jm1_enterprise_marketing_operating_system_v1.json'), enterpriseMos);
writeJson(join(ROOT, '775_jm1_marketing_replacement_test_matrix_v1.json'), replacementMatrix);

console.log(JSON.stringify({
  written: [
    join(ROOT, '772_jm1_marketing_manual_trace_v1.json'),
    join(ROOT, '773_jm1_marketing_current_state_inventory_v1.json'),
    join(ROOT, '774_jm1_enterprise_marketing_operating_system_v1.json'),
    join(ROOT, '775_jm1_marketing_replacement_test_matrix_v1.json')
  ],
  finalClassification: replacementMatrix.finalClassification
}, null, 2));

function op(manualAction, whyNecessary, inputs, decisionRule, output, failureModesObserved, futureSystemComponent, currentAutomationMaturity) {
  return {
    manualAction,
    whyNecessary,
    inputs,
    decisionRule,
    output,
    failureModesObserved,
    futureSystemComponent,
    currentAutomationMaturity
  };
}

function cap(capability, classification, evidenceSources, notes) {
  return { capability, classification, evidenceSources, notes };
}

function assert(name, pass, evidenceNote) {
  return { name, pass, evidenceNote };
}
