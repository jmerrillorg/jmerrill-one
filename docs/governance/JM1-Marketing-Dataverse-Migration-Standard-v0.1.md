# JM1 Marketing Dataverse Migration Standard v0.1

Status: CANON CANDIDATE - FOUNDER RATIFICATION REQUIRED

Every production schema change uses a lexically ordered migration ID, an environment allowlist, explicit preconditions and postconditions, idempotent apply behavior, and evidence readback. Migrations are additive by default and recorded in `jm1_MarketingSchemaMigration`.

Applied migrations are never edited or rerun under a new meaning. A failed production migration is repaired through a later forward-fix migration. Destructive rollback is prohibited when it could remove campaign authority, execution evidence, platform IDs, media identity, consent, or idempotency state.

The migration runner must stop when order is invalid, the environment is not explicitly allowed, a precondition fails, or a postcondition cannot be verified. Evidence records the migration ID, checksum, environment, start/completion timestamps, result, and sanitized error state.
