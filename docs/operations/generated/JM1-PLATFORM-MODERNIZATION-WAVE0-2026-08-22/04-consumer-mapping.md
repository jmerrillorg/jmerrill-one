# Consumer Mapping

## Confirmed / Strong Signals

- jm1-ed-functions references the J Merrill One HQ Power BI application ID and Power BI secret setting names; the visible Power BI credential is expired.
- One App Service has Dataverse and Graph credential setting names.
- Publishing App Service has Dataverse, SharePoint, and Azure Storage settings, mostly through Key Vault references.
- Diagnostic AI runner has Dataverse credential setting names.
- Financial function has Financial public intake credential setting names.
- AIC active workflow uses azure/login OIDC-style inputs with JM1_AZURE_CLIENT_ID but the checked github-deploy-aic app registrations have no federated credentials.

## Evidence Limits

- GitHub secrets expose names/update timestamps only, not values.
- Absence of recent Graph sign-in rows is not definitive orphan proof for infrequent workloads.
- Power Platform connection references and Key Vault secret metadata need separate admin/metadata export for final owner binding.
