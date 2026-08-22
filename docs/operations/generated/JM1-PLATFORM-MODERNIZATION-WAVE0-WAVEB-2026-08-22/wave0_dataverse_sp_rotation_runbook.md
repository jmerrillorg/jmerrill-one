# Wave 0 Dataverse Service Principal Rotation Runbook

Status: ROTATION_SCHEDULED

Guardrail: do not delete the expired June 2026 key until active-key usage is proven and every consumer has observed successfully after replacement.

Runbook:

1. Freeze consumer inventory on 2026-09-15.
2. Create a new overlapping credential for JM1-Dataverse-ServicePrincipal.
3. Update each validated secret destination one consumer at a time.
4. Run Dataverse write/read health checks for affected Function and app paths.
5. Observe from 2026-09-22 through 2026-09-29.
6. Retire the superseded expired key only after proof identifies the active replacement key and no residual consumer failures.

Latest safe completion target: 2026-10-15.
