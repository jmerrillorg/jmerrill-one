# JM1 Marketing Production Rollback Runbook v0.1

Status: CANON CANDIDATE - FOUNDER RATIFICATION REQUIRED

## Invariants

- Preserve Dataverse campaign authority, execution history, platform IDs, media hashes, and idempotency keys.
- Never delete or blank a platform ID to make a retry possible.
- Disable the smallest affected adapter before changing deployment or configuration.
- Reconcile platform state before resuming a worker.

## Function Deployment

1. Disable only the affected autonomous feature flag when platform execution is at risk.
2. Record the active `JM1_RELEASE_SHA`, package hash, open claims, and last successful timer readback.
3. Redeploy the previous verified package by immutable commit/package identity.
4. Confirm all four timers are visible and App Insights receives a successful natural run.
5. Reconcile claimed, accepted, and readback-pending rows before re-enabling execution.

## Configuration and Credentials

Restore settings by versioned configuration reference. Keep Key Vault versions intact. Validate destination IDs and credential authority with read-only calls before enabling adapters.

## Meta and Journey Execution

Set the relevant execution flag to false; do not delete scheduled or published objects. For Dynamics, stop new enrollment only when required and preserve Journey IDs and interaction history. Resume after requested-versus-actual reconciliation passes.

## Schema Migration

Dataverse migrations are forward-fixed. Additive migrations may be superseded but must not drop populated columns or tables. Record the failed migration, postcondition, and corrective migration ID in the migration ledger.

## Rollback Completion

Rollback is complete only when timer health is current, open claims are reconciled, duplicate count is zero, branch leakage is zero, and the preserved evidence points to the active release.
