# JM1 Platform Modernization Wave 0 - Executive Summary

Date: 2026-08-22

Classification: JM1_PLATFORM_WAVE0_CONTROLLED_COMMISSIONING

Wave 0 remediated the bounded One repo dependency security issue and removed TLS 1.0 from the four targeted storage accounts. Credential work reached controlled commissioning: 15 expired and 3 <90-day credentials are now inventoried and classified, but no credential was rotated or deleted because consumer/owner proof is incomplete for several high-impact identities.

## Completed

- One repo direct Next.js security candidate patched from 16.2.0 to 16.3.2.
- Safe non-force npm audit remediation completed.
- npm audit result is 0 vulnerabilities under Node 24.
- CI runtime guard added to fail if the One production workflow is not running Node 24.
- Storage minimum TLS raised from TLS1_0 to TLS1_2 for jm1core, jm1pub, jm1fin, and jm1media.
- Public health checks passed after TLS changes.
- Application Insights sampled checks showed 0 recent exceptions for sampled apps/functions.

## Remaining P0/P1

- Credential rotation/deletion remains blocked by missing owners, missing federated credentials, or incomplete consumer proof.
- J Merrill One HQ Power BI credential appears actively referenced by jm1-ed-functions and expired; classify BROKEN_DEPENDENCY until rotated/validated.
- JM1-Dataverse-ServicePrincipal has active cross-brand consumers and an expiring replacement key on 2026-11-08; controlled rotation is required.

Source audit: ../JM1-ENTERPRISE-PLATFORM-MODERNIZATION-AUDIT-2026-08-22/00-executive-summary.md
