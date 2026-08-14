# HOST-01 Final Hosting Matrix

Final classification: **HOST-01 COMPLETE — MIXED HOSTING VERIFIED**

Explicit answer: **NO — MIXED HOSTING REMAINS**

| Brand | Public Domain | Actual Live Host Type | Azure Resource | Resource Group | Repo | Production Workflow | Latest Deploy | SWA Exists? | App Service Exists? | Legacy Resource |
|---|---|---|---|---|---|---|---|---|---|---|
| J Merrill One | https://www.jmerrill.one/ | STATIC WEB APPS — LIVE | jmerrill-one | jmerrill-one | jmerrillorg/jmerrill-one | Deploy JM1 Web to Azure Static Web Apps | Run 31698620048, 2026-08-13T12:10:53Z, 5eff8799 | YES | YES | app-jm1-one-prod |
| J Merrill Publishing | https://jmerrill.pub/ | APP SERVICE — LIVE | app-jm1-pub-prod | rg-jm1-pub-prod-appsvc | jmerrillorg/jmerrill-pub | Publishing App Service CI/CD | Run 31727901428, 2026-08-13T17:58:22Z, 603f9cb6 | NO | YES | None |
| J Merrill Financial | https://jmerrill.financial/ | STATIC WEB APPS — LIVE | jmerrill-financial | jmerrill-financial_group | jmerrillorg/jmerrill-financial | Azure Static Web Apps CI/CD | Run 31845568877, 2026-08-14T22:12:38Z, 1754bb94 | YES | YES | app-jm1-fin-prod |
| J Merrill Foundation | https://jmerrill.foundation/ | STATIC WEB APPS — LIVE | foundation-main | jm1-core-services | jmerrillorg/jmerrillfoundation | Deploy jmerrill.foundation | Run 31666910841, 2026-08-13T04:25:41Z, c01ffd68 | YES | YES | app-jm1-foundation-prod |
| J Merrill Productions | https://jmerrill.productions/ | STATIC WEB APPS — LIVE | jmerrill-productions | jmerrill-productions-rg | jmerrillorg/jmerrill-productions | Deploy J Merrill Productions | Run 31666549491, 2026-08-13T04:21:45Z, 44d3f689 | YES | YES | app-jm1-productions-prod |
| Jackie Smith Jr. | https://jackiesmithjr.com/ | STATIC WEB APPS — LIVE | jackiesmithjr | jm1-core-services | jmerrillorg/jackiesmithjr | Azure Static Web Apps CI/CD | Run 30748052613, 2026-08-02T12:35:11Z, 07a39230 | YES | YES | app-jm1-jackiesmithjr-prod |

Non-canonical DNS note: `www.jmerrill.productions` resolves to `victorious-stone-0672d8210.6.azurestaticapps.net`, which was not returned in the scoped Azure SWA inventory. The canonical Productions URL remains `https://jmerrill.productions/`.
