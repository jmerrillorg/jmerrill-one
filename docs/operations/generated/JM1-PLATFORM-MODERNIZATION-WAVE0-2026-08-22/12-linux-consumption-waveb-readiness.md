# Linux Consumption Wave B Readiness

| Function | Plan | Node | Functions Runtime | Dependencies | Purpose | Migration Complexity | Wave B Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| func-jm1-acs-email-relay | Linux Consumption Y1 | Node/22 | ~4 | AzureWebJobsStorage=stjm1acsrelay; WEBSITE_RUN_FROM_PACKAGE signed URL | ACS email relay | Medium | Flex Consumption + Node 24 after Wave B |
| func-jm1-diagnostic-ai-runner | Linux Consumption Y1 | Node/22 | ~4 | AzureWebJobsStorage=stjm1diagrunner; Dataverse/Foundry-related settings | diagnostic/editorial AI runner | High | Flex suitability needs timeout/concurrency review |
| func-jm1-fin-prod | Linux Consumption Y1 | Node/22 | ~4 | AzureWebJobsStorage and content connection strings include jm1fin/jm1finfuncp02 | Financial intake/function boundary | Medium | Financial repo owns implementation; One tracks enterprise item |


No hosting migration was performed in Wave 0.
