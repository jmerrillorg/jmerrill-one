# Modernization Priorities


## P0

- Expired Entra credentials/certificates exist for Graph, Bookings, Business Central, portal, Power BI, Dataverse, and intake registrations. Values were not printed. These are either broken integrations or dead credentials that must be retired/rotated under owner control.
- npm audit reports high vulnerabilities in the active One web dependency tree, including Next.js fixed by a non-major update to 16.3.2.

## P1

- Three Linux Consumption Function Apps remain: func-jm1-acs-email-relay, func-jm1-diagnostic-ai-runner, func-jm1-fin-prod. Microsoft retirement date: 2028-09-30. Node 22 is documented as the last Node version on Linux Consumption and ends 2027-04-30 in Azure Functions.
- Four storage accounts report minimum TLS TLS1_0: jm1core, jm1fin, jm1media, jm1pub.
- ACS relay uses WEBSITE_RUN_FROM_PACKAGE with a SAS-like package URL expiring in 2036. Long horizon, but still an expiring deployment dependency and the same failure class as the prior package incident.
- Three Entra secrets expire within 90 days: github-deploy-aic, jm1-hq-app-sp, JM1-Dataverse-ServicePrincipal.
- AIC App Service has httpsOnly false and runtime not captured in this pass.

## P2

- App Service identity is missing on five of six JM1 Premium v3 web apps; Publishing has SystemAssigned identity. Candidate for managed identity/keyless configuration where app dependencies support it.
- One repo build passes but local validation runtime is Node 26, producing DEP0205 warning. Node 26 should stay compatibility lane until LTS and validation.
- Static Web App aic-public has no repo URL and no custom domains; classify as orphan candidate until owner confirms.
- Application Insights components sampled are classic/non-workspace-based or returned no workspace id in CLI query; review workspace-based migration standard.

## P3

- Retained SWA rollback workflow in jmerrill-one uses Node 20 and Azure/static-web-apps-deploy@v1. It is manual-only and intentional after HOST-02, but should remain documented as rollback-only or be retired after a founder-approved hold period.
- Several resource groups and managed workspaces have sparse tags; complete owner/purpose tagging.
