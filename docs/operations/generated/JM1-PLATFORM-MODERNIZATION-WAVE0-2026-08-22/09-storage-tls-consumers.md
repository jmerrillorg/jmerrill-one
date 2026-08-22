# Storage TLS Consumers

| Storage Account | Resource Group | Purpose | Known Consumers | Shared Key / SAS Notes |
| --- | --- | --- | --- | --- |
| jm1core | rg-jm1-core | JM1 Core backups/logs | jm1-ed-functions AzureWebJobsStorage and DEPLOYMENT_STORAGE_CONNECTION_STRING | Function storage account key connection strings observed |
| jm1pub | jmerrill-pub | Publishing manuscripts/covers/audiobooks/royalties | Publishing App Service AZURE_STORAGE_CONNECTION_STRING through Key Vault reference; containers listed with login | Key Vault app setting reference; shared-key dependency likely until migrated |
| jm1fin | jmerrill-financial_group | Financial client contracts | func-jm1-fin-prod storage settings; clientfiles/contracts/reports containers | Function storage/content account key connection strings observed |
| jm1media | rg-jm1-core | JM1 media/CDN static assets | No direct app-setting consumer found in Wave 0 scan; container list empty through login | No direct app-setting consumer found; public access disabled |
