# JM1 Power Platform Governance Standard v1.1 Addendum

Status: CANON-CANDIDATE - PENDING FOUNDER & CEO APPROVAL

This addendum clarifies BP-12 findings without replacing JM1 Power Platform Governance Standard v1.0.

- Canonical DEV/TEST/PROD environments must use Managed Environments Standard. BP-12 enabled Standard for JM1-Enterprise-Dev and JM1-Test; JM1-Core was already Standard.
- Environment grouping target is JM1 Enterprise with JM1-Enterprise-Dev, JM1-Test, and JM1-Core. Group creation remains human-admin action.
- DLP must be changed only from actual policy evidence. Consumer OneDrive is blocked/removed; HTTP/webcontents requires endpoint-specific exception and evidence.
- Non-admin trial, developer, and Teams environment creation should remain disabled. Connection sharing with Everyone should remain disabled.
- Power Platform Pipelines are the preferred Dataverse solution release path after host/stage setup. Website deployments remain governed through GitHub/Azure where appropriate.
- Unmanaged production JM1 solutions are migration backlog, not precedent for new direct PROD changes.
- Founder & CEO may be approver, administrator, release authority, and operator in a single-person enterprise, but evidence, rollback, and canon still apply.
