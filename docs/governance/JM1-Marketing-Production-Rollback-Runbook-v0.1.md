# JM1 Marketing Production Rollback Runbook v0.1

Status: CANON CANDIDATE - FOUNDER RATIFICATION REQUIRED

## Invariants

- Preserve Dataverse campaign authority, execution history, platform IDs, media hashes, and idempotency keys.
- Never delete or blank a platform ID to make a retry possible.
- Disable the smallest affected adapter before changing deployment or configuration.
- Reconcile platform state before resuming a worker.

## Function Deployment

1. Disable only the affected autonomous feature flag when platform execution is at risk.
2. Capture the active `JM1_RELEASE_SHA`, immutable `WEBSITE_RUN_FROM_PACKAGE` URL, package SHA-256, package-blob identity, package managed-identity setting, open claims, and deployed Function trigger inventory before changing settings.
3. Require the prior package name to bind to its recorded 40-character release SHA in the governed `function-releases` container; download it read-only and verify its bytes before deployment.
4. Restore the prior package URL, release SHA, and package managed-identity setting exactly. Sync triggers and compare deployed trigger names and types to the captured pre-release inventory. Do not assume the prior release has the current source inventory.
5. The current source-owned inventory contains seven timers and one storage-queue trigger: `catalogMarketingHealthTimer`, `credentialMonitorTimer`, `creativeWorkProcessorTimer`, `marketingControlLoopTimer`, `publishingAssetEventOutboxTimer`, `socialExecutionWorkerTimer`, `websiteIntakeReconciliationTimer`, and `productionAssetRegistrationQueue`. The inventory file in the exact release commit is authoritative for that release; missing, unexpected, duplicate, wrong-type, or wrong-source entries fail validation.
6. After release or rollback, reconcile claimed, accepted, failed, retry-pending, and readback-pending rows before any affected execution is resumed.

## Natural-Run Acceptance

Trigger inventory and settings readback prove deployment configuration only. They do not prove a timer executed. Record the deployed `JM1_RELEASE_SHA`, package SHA-256, deployment-completion time, and each timer's next natural due window. After that window, require an App Insights invocation/readback tied to the deployed release and expected Function name, then reconcile existing schedule/claim state and publication IDs. Never manually invoke a publisher to manufacture acceptance. A future natural tick remains `PENDING` until observed. A queue-trigger function is accepted by a naturally occurring governed queue event or an approved non-effecting diagnostic, not by creating duplicate or synthetic business work.

## Configuration and Credentials

Restore settings by versioned configuration reference. Keep Key Vault versions intact. Validate destination IDs and credential authority with read-only calls before enabling adapters.

## Meta and Journey Execution

Set the relevant execution flag to false; do not delete scheduled or published objects. For Dynamics, stop new enrollment only when required and preserve Journey IDs and interaction history. Resume after requested-versus-actual reconciliation passes.

## Schema Migration

Dataverse migrations are forward-fixed. Additive migrations may be superseded but must not drop populated columns or tables. Record the failed migration, postcondition, and corrective migration ID in the migration ledger.

## Rollback Completion

Rollback is complete only when restored package/SHA/managed-identity settings match the captured pre-state, the live trigger inventory matches the captured pre-release inventory, timer health is current after natural ticks, open claims are reconciled, duplicate count is zero, branch leakage is zero, and preserved evidence points to the active release.
