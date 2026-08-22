# Azure Functions Hosting

| Function App | Resource Group | Plan | Runtime | HTTPS Only | Managed Identity | Status | Target | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| jm1-ed-functions | jm1-core-services | Flex Consumption FC1 | runtime stack blank in config query | true | none | UNKNOWN | Verify explicit runtime and app settings | P1 |
| func-jm1-acs-email-relay | rg-jm1-communications | Linux Consumption Y1 | Node/22 / Functions ~4 | false | none | RETIREMENT_ANNOUNCED | Flex Consumption + Node 24 + HTTPS-only | P1 |
| func-jm1-diagnostic-ai-runner | rg-jm1-ai | Linux Consumption Y1 | Node/22 / Functions ~4 | false | SystemAssigned | RETIREMENT_ANNOUNCED | Flex Consumption + Node 24 + HTTPS-only | P1 |
| func-jm1-fin-prod | jmerrill-financial_group | Linux Consumption Y1 | Node/22 / Functions ~4 | true | none | RETIREMENT_ANNOUNCED | Flex Consumption + Node 24 | P1 |
| func-jm1-foundation-intake | func-jm1-foundation-intake_group | Flex Consumption FC1 | runtime stack blank in config query | true | none | UNKNOWN | Verify explicit runtime and app settings | P1 |


Secret values were not recorded. App setting evidence was reduced to setting names and risk classes only.


## Authoritative Support Sources

- Node.js official releases: https://nodejs.org/en/about/previous-releases
- Azure Functions runtime/language support: https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions
- Azure Functions Linux Consumption retirement: https://learn.microsoft.com/en-us/azure/azure-functions/consumption-plan
- Azure Functions Consumption to Flex migration: https://learn.microsoft.com/en-us/azure/azure-functions/migration/migrate-plan-consumption-to-flex
- Azure App Service Node configuration: https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- Azure App Service language support policy: https://learn.microsoft.com/en-us/azure/app-service/language-support-policy
- GitHub Actions Node 20 transition: https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/
- GitHub Actions runner deprecations: https://github.blog/changelog/2024-08-19-notice-of-upcoming-deprecations-and-breaking-changes-in-github-actions-runners/
