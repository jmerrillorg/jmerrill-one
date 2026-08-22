# Node Version Audit

Node policy baseline: PRIMARY NODE LTS = 24. Node 22 is permitted only where Azure hosting constraints require it. Node 26 is compatibility lane only until LTS and JM1 validation.

## Findings

- Node 24: One repo engines, .nvmrc, App Service deployment workflow, six Premium v3 App Services.
- Node 22: three Linux Consumption Function Apps: ACS relay, diagnostic AI runner, Financial function. This is an Azure exception because Microsoft states Node 22 is the last Node version for Linux Consumption.
- Node 26: active local shell used for this audit. Build passed but emitted DEP0205 deprecation warning. Treat as compatibility-lane evidence, not production baseline.


## Authoritative Support Sources

- Node.js official releases: https://nodejs.org/en/about/previous-releases
- Azure Functions runtime/language support: https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions
- Azure Functions Linux Consumption retirement: https://learn.microsoft.com/en-us/azure/azure-functions/consumption-plan
- Azure Functions Consumption to Flex migration: https://learn.microsoft.com/en-us/azure/azure-functions/migration/migrate-plan-consumption-to-flex
- Azure App Service Node configuration: https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- Azure App Service language support policy: https://learn.microsoft.com/en-us/azure/app-service/language-support-policy
- GitHub Actions Node 20 transition: https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/
- GitHub Actions runner deprecations: https://github.blog/changelog/2024-08-19-notice-of-upcoming-deprecations-and-breaking-changes-in-github-actions-runners/
