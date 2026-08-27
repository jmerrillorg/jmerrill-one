# Production Token Authority

Last verified: 2026-08-27T18:53:01Z

## Production Runtime

- Runtime: `func-jm1-diagnostic-ai-runner`
- Token acquisition: `DefaultAzureCredential`
- Managed identity application ID: `dc8d1429-8c1b-473b-83ca-f9545fad8074`
- Managed identity service principal object ID: `e8c51a80-bdb0-46fa-b398-9109719d6427`
- Tenant: `352d075e-8e17-4169-9f8e-22e6946ce66d`
- Graph audience/scope: `https://graph.microsoft.com/.default`

## App Role Assignments

| Resource | App role ID | Meaning |
| --- | --- | --- |
| Microsoft Graph | `810c84a8-4a9e-49e6-bf7d-12d183f40d01` | `Mail.Read` |
| Microsoft Graph | `01d4889c-1287-42c6-ac1f-5d1e02578ef6` | Files read permission |
| Microsoft Graph | `75359482-378d-4052-8f01-80520e7db3cd` | Files read/write permission |

## Differential

The same production managed identity and route produced:

- Publishing mailFolders: PASS
- AIC mailFolders: PASS

No alternate token authority was introduced.

