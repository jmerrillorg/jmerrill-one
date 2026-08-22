# Credential Remediation

No credential was rotated or deleted in Wave 0. This is intentional. The critical safety rule requires consumer, replacement, rollback, health test, and secret destination proof before mutation.

## Immediate Rotation Queue

- J Merrill One HQ Power BI: expired and referenced by jm1-ed-functions. Rotate or replace, then validate Power BI path from the actual consumer.
- JM1-Dataverse-ServicePrincipal: active cross-brand Dataverse path; rotate the 2026-11-08 credential with overlap before 2026-10-15, then retire superseded expired 2026-06-07 key after proof.
- github-deploy-aic: either add federated credential for AIC workflow and retire secret path, or rotate before 2026-09-15.
- jm1-hq-app-sp: identify jm1-core-services consumer or prove orphan status; rotate if active.

## Deletion Queue

None authorized until consumer proof is conclusive.
