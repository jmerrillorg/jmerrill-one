# GitHub / CI-CD

GitHub authentication is active for jmerrillorg. Repositories visible: 19.

| Repo | Brand | Language | Framework/Role | Deployment Target | Runtime Status | Status |
| --- | --- | --- | --- | --- | --- | --- |
| jmerrill-one | One | TypeScript | Next.js 16 | App Service Premium v3; old SWA rollback workflow retained | Node 24 declared; local Node 26 warning | ACTIVE |
| jmerrill-pub | Publishing | JavaScript | unknown from GitHub list | App Service Premium v3 | Needs repo-level runtime audit in division repo | ACTIVE |
| jmerrill-financial | Financial | JavaScript | unknown from GitHub list | App Service Premium v3 + Function | Needs repo-level runtime audit in division repo | ACTIVE |
| jmerrill-productions | Productions | TypeScript | unknown from GitHub list | App Service Premium v3 | Needs repo-level runtime audit in division repo | ACTIVE |
| jmerrillfoundation | Foundation | TypeScript | unknown from GitHub list | App Service Premium v3 + Function | Needs repo-level runtime audit in division repo | ACTIVE |
| jackiesmithjr | Personal | MDX | unknown from GitHub list | App Service Premium v3 | Needs repo-level runtime audit in division repo | ACTIVE |
| jm1-ops | Shared | Shell | ops/runbooks | Not direct hosting | Governance source candidate | ACTIVE |
| jm1-book-redirector | Shared | HTML | redirector | Static Web App | Small canonical redirect app | ACTIVE |
| org-to-foundation-redirect | Shared | HTML | redirector | Static Web App | Canonical status needs founder confirmation | ACTIVE |
| jm-productions-redirect | Productions | HTML | redirector | none observed | Archived repository | ARCHIVED |


One repo workflows:

- azure-app-service-premium.yml: push to main and workflow_dispatch, Node 24, azure/login@v2, App Service deploy, health probe. CURRENT.
- azure-static-web-apps.yml: workflow_dispatch only with rollback_reason, Node 20, Azure/static-web-apps-deploy@v1. SUPPORTED_BUT_LEGACY rollback path.


## Authoritative Support Sources

- Node.js official releases: https://nodejs.org/en/about/previous-releases
- Azure Functions runtime/language support: https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions
- Azure Functions Linux Consumption retirement: https://learn.microsoft.com/en-us/azure/azure-functions/consumption-plan
- Azure Functions Consumption to Flex migration: https://learn.microsoft.com/en-us/azure/azure-functions/migration/migrate-plan-consumption-to-flex
- Azure App Service Node configuration: https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- Azure App Service language support policy: https://learn.microsoft.com/en-us/azure/app-service/language-support-policy
- GitHub Actions Node 20 transition: https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/
- GitHub Actions runner deprecations: https://github.blog/changelog/2024-08-19-notice-of-upcoming-deprecations-and-breaking-changes-in-github-actions-runners/
