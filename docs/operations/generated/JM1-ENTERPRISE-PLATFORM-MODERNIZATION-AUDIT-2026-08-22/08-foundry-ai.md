# Foundry / Azure AI

Observed resources:

| Resource | Kind | Resource Group | Region | SKU | Public Network |
| --- | --- | --- | --- | --- | --- |
| oai-jm1-diagnostic | OpenAI | rg-jm1-ai | eastus | S0 | Enabled |
| ais-jm1-foundry | AIServices | rg-jm1-ai | eastus2 | S0 | Enabled |
| ais-jm1-foundry/jm1-editorial-foundry | AIServices project | rg-jm1-ai | eastus2 | inherited | not captured |


Model deployments, model versions, quotas, and per-deployment retirement dates were not enumerated by the available Azure CLI pass. Follow-up requires Azure AI Foundry/Cognitive Services deployment export. No deletion or model changes performed.
