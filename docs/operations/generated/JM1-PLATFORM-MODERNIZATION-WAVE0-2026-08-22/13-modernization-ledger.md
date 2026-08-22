# Modernization Ledger

| Finding ID | Resource | Category | Priority | Current State | Target State | Wave | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W0-CRED-POWERBI | J Merrill One HQ - Power BI | Credential | P0 | Expired secret referenced by jm1-ed-functions | Rotate/validate or replace with service identity | Wave 0 continuation | BLOCKED |
| W0-CRED-DV | JM1-Dataverse-ServicePrincipal | Credential | P0/P1 | Expired old key plus active key expiring 2026-11-08 | Zero-downtime rotation and retire superseded key | Wave 0 continuation | IN_REMEDIATION |
| W0-CRED-AIC | github-deploy-aic | Credential | P1 | Expiring secret; AIC workflow OIDC-shaped but no federated credential found | OIDC federated credential or safe rotation | AIC repo handoff | BLOCKED |
| W0-CRED-HQ | jm1-hq-app-sp | Credential | P1 | Expiring contributor identity, unknown consumer | Identify consumer then rotate/retire | Wave 0 continuation | BLOCKED |
| W0-DEP-ONE | jmerrill-one dependencies | Dependency | P0 | 8 audit findings | 0 audit findings | Wave 0 | REMEDIATED |
| W0-TLS-CORE | jm1core | Storage TLS | P1 | TLS1_0 | TLS1_2 | Wave 0 | VERIFIED |
| W0-TLS-PUB | jm1pub | Storage TLS | P1 | TLS1_0 | TLS1_2 | Wave 0 | VERIFIED |
| W0-TLS-FIN | jm1fin | Storage TLS | P1 | TLS1_0 | TLS1_2 | Wave 0 | VERIFIED |
| W0-TLS-MEDIA | jm1media | Storage TLS | P1 | TLS1_0 | TLS1_2 | Wave 0 | VERIFIED |
| W0-FUNC-LINUX | Linux Consumption Functions | Hosting | P1 | Linux Consumption Node 22 | Flex + Node 24 | Wave B | DEFERRED_TO_WAVE |
