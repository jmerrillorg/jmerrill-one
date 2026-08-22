# Runtime Matrix

| Workload | Host | Observed Runtime | Declared Policy | Status | Target |
| --- | --- | --- | --- | --- | --- |
| One repo local validation | Codex shell | Node v26.0.0 | Node 24 LTS primary; Node 26 compatibility lane | RUNTIME_DRIFT | Use Node 24 for production validation; keep Node 26 lane documented |
| One package.json | Repository | engines node >=24 <25, npm >=11 <12 | Node 24 | CURRENT | No change |
| One App Service workflow | GitHub Actions | NODE_VERSION 24 | Node 24 | CURRENT | No change |
| One SWA rollback workflow | GitHub Actions | Node 20 | Rollback-only | SUPPORTED_BUT_LEGACY | Keep manual rollback-only or retire after approval |
| Premium App Services | Azure App Service | NODE/24-lts | Node 24 | CURRENT | No runtime migration |
| Linux Consumption Functions | Azure Functions | Node/22 where explicit | Node 22 exception only | RETIREMENT_ANNOUNCED | Flex Consumption then Node 24 |


## Authoritative Support Sources

- Node.js official releases: https://nodejs.org/en/about/previous-releases
- Azure Functions runtime/language support: https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions
- Azure Functions Linux Consumption retirement: https://learn.microsoft.com/en-us/azure/azure-functions/consumption-plan
- Azure Functions Consumption to Flex migration: https://learn.microsoft.com/en-us/azure/azure-functions/migration/migrate-plan-consumption-to-flex
- Azure App Service Node configuration: https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- Azure App Service language support policy: https://learn.microsoft.com/en-us/azure/app-service/language-support-policy
- GitHub Actions Node 20 transition: https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/
- GitHub Actions runner deprecations: https://github.blog/changelog/2024-08-19-notice-of-upcoming-deprecations-and-breaking-changes-in-github-actions-runners/
