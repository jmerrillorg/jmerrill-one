# Enterprise Resource Inventory

## Master Modernization Ledger

| Brand | Repo | Resource | Service | Runtime | Current Version/Plan | Support Status | End Date | Target | Priority | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| J Merrill One | jmerrill-one | app-jm1-one-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | 2028-04-30 for Node 24 Azure Functions; App Service follows supported stacks | No runtime migration; add managed identity review | P2 | One |
| J Merrill Publishing | jmerrill-pub | app-jm1-pub-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | See Node 24 support lifecycle | Managed identity present; continue standardization | P2 | Publishing |
| J Merrill Financial | jmerrill-financial | app-jm1-fin-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | See Node 24 support lifecycle | No runtime migration; identity review | P2 | Financial |
| J Merrill Foundation | jmerrillfoundation | app-jm1-foundation-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | See Node 24 support lifecycle | No runtime migration; identity review | P2 | Foundation |
| J Merrill Productions | jmerrill-productions | app-jm1-productions-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | See Node 24 support lifecycle | No runtime migration; identity review | P2 | Productions |
| Jackie Smith Jr. | jackiesmithjr | app-jm1-jackiesmithjr-prod-v2 | App Service Linux | NODE/24-lts | CURRENT | See Node 24 support lifecycle | No runtime migration; identity review | P2 | Personal |
| Agape International Cathedral | aic-online | aic-app-service-prod | App Service Linux B1 | runtime not captured in detailed pass | UNKNOWN | Unknown | Inspect runtime, HTTPS-only false | P1 | AIC |
| Shared/Core | unknown | jm1-ed-functions | Azure Functions Flex Consumption | runtime stack blank; app settings incomplete | UNKNOWN | Unknown | Set explicit runtime/worker inventory; verify Flex config | P1 | Shared |
| Shared Communications | unknown | func-jm1-acs-email-relay | Azure Functions Linux Consumption | Node/22, Functions ~4 | RETIREMENT_ANNOUNCED | Linux Consumption retires 2028-09-30; Node 22 ends 2027-04-30 | Migrate to Flex Consumption, then Node 24 | P1 | Communications |
| Shared AI | unknown | func-jm1-diagnostic-ai-runner | Azure Functions Linux Consumption | Node/22, Functions ~4 | RETIREMENT_ANNOUNCED | Linux Consumption retires 2028-09-30; Node 22 ends 2027-04-30 | Migrate to Flex Consumption, then Node 24 | P1 | AI |
| J Merrill Financial | jmerrill-financial | func-jm1-fin-prod | Azure Functions Linux Consumption | Node/22, Functions ~4 | RETIREMENT_ANNOUNCED | Linux Consumption retires 2028-09-30; Node 22 ends 2027-04-30 | Migrate to Flex Consumption, then Node 24 | P1 | Financial |
| J Merrill Foundation | jmerrillfoundation | func-jm1-foundation-intake | Azure Functions Flex Consumption | runtime stack blank; app settings incomplete | UNKNOWN | Unknown | Set explicit runtime/worker inventory; verify Flex config | P1 | Foundation |

## Azure Resource Counts

- Total resources: 147
- Resource groups: 39
- Web Apps: 7
- Function Apps: 5
- Static Web Apps: 3
- Storage accounts: 11
- Key Vaults: 2
- Cognitive Services/Azure AI accounts: 2

## Evidence Boundary

Azure inventory was collected from the authenticated subscription only. Stripe, Bill.com, detailed Power Automate flow inventory, and full M365 admin audit require separate app/API/admin exports.
