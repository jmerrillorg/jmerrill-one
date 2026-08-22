# Wave 0 AIC OIDC Remediation Plan

Status: ASSIGNED_AND_SCHEDULED

The AIC production workflow is already shaped for OIDC, but the app registration has no federated credential and the active GitHub secret value is opaque. Cody did not invent the subject binding or app binding.

Plan:

1. Certify the active client ID bound to JM1_AZURE_CLIENT_ID on 2026-08-23.
2. Create the exact GitHub federated credential for jmerrillorg/aic-online only after active app ID and branch/environment subject are confirmed.
3. Run workflow_dispatch deploy proof.
4. Remove the expiring secret path or rotate as fallback before 2026-09-15.

No broad RBAC expansion is authorized.
