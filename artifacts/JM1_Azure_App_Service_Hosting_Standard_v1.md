# JM1 Azure App Service Hosting Standard v1

Status: **CANON — v1.0**

This standard records the proven HOST-02 hosting implementation for JM1 public properties: all six public properties run on Azure App Service in one consolidated Premium v3 production estate.

Founder approval is recorded in `JM1_Azure_App_Service_Hosting_Standard_v1_approval.json`; superseded rollback infrastructure has been retired under the HOST-02 final deletion manifest.

Current reference implementation:

- `rg-jm1-web-prod-premium`
- `asp-jm1-web-prod-premium`
- Linux App Service
- `P1mv3`
- `1` worker initially
- `NODE|24-lts`
- HTTPS-only
- HTTP/2
- `node server.js`
- managed certificates and SNI TLS
- App Service health endpoints where implemented
- Financial frontend on App Service with Azure Functions backend preserved
- completed-estate capacity classification: `P1MV3 x1 = ACCEPTABLE — MONITOR`
- superseded App Services, old plans, and SWAs retired only after Founder-approved manifest deletion and post-delete inventory proof
- GitHub Actions deployment uses Azure OIDC, not publish profiles, for the proven Premium workflows
- post-deployment health validation is performed through public `/api/health` routes and representative business routes
- Azure CLI startup tracking is not the readiness authority for Linux ZIP deploys; explicit health probes own readiness

Final production app matrix:

- J Merrill One: `app-jm1-one-prod-v2`
- J Merrill Publishing: `app-jm1-pub-prod-v2`
- J Merrill Financial: `app-jm1-fin-prod-v2`
- J Merrill Foundation: `app-jm1-foundation-prod-v2`
- J Merrill Productions: `app-jm1-productions-prod-v2`
- Jackie Smith Jr.: `app-jm1-jackiesmithjr-prod-v2`

Repository ownership remains per brand repository. J Merrill One owns enterprise orchestration evidence and standards. Jackie Smith Jr. is classified as a JM1 Founder Brand, not an operating division.

Final HOST-02 evidence:

- Six remote Premium App Service deployment workflows completed successfully on `main`.
- OIDC variables and environment-scoped federated credentials were configured for the six authorized repositories.
- `asp-jm1-web-prod-premium` remained at `P1mv3 x 1`; no capacity increase was made.
- Final observed P1mv3 telemetry supported `RIGHT-SIZED` for the sampled post-proof window.
- Superseded App Services, S1 plans, and SWAs were retired after Founder deletion confirmation against the HOST-02 deletion manifest.

Future Node major changes require compatibility testing, build validation, production regression, and an explicit runtime baseline update. Future hosting exceptions remain allowed when supported by architecture evidence. This standard does not claim App Service must be used forever regardless of future architecture.
