# Expiring Credential Inventory

Total <90-day credential records discovered as of 2026-08-22: 3

| Application | App ID | Type | Credential ID | Expires | Classification | Action |
| --- | --- | --- | --- | --- | --- | --- |
| github-deploy-aic | 11f925d2-bdf6-40a0-baeb-511fe71b24ec | secret | 5e2d7f56-9925-4970-89be-84eafb630370 | 2026-10-05 | ACTIVE_EXPIRING / OIDC_CANDIDATE | AIC workflow uses azure/login OIDC style and this app has Contributor on AIC resource group, but app has no federated credentials and no owner metadata. Schedule AIC repo OIDC fix or rotate before 2026-09-15. |
| jm1-hq-app-sp | aaabfafa-635f-444b-b4a5-e684edf831c0 | secret | 8cbba58b-5367-4858-99df-f8529478d827 | 2026-11-03 | ACTIVE_EXPIRING / UNKNOWN_CONSUMER | Has Contributor on jm1-core-services; no owner/federated credential/recent sign-ins. Identify HQ consumer or retire with proof. |
| JM1-Dataverse-ServicePrincipal | abaed7aa-944f-4c41-8947-bf1bb6b9b111 | secret | 469dd743-604a-49ca-b463-2fa2b7db13df | 2026-11-08 | ACTIVE_EXPIRING | Cross-brand Dataverse consumers exist. Controlled zero-downtime rotation required before 2026-10-15. |


Explicit named cases are included: github-deploy-aic, jm1-hq-app-sp, and JM1-Dataverse-ServicePrincipal.
