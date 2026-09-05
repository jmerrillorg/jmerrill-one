# Authorization Model

Last verified: 2026-08-27T17:15:42Z

## Production Readback Identity

| Field | Value |
| --- | --- |
| Runtime | `func-jm1-diagnostic-ai-runner` |
| App ID | `dc8d1429-8c1b-473b-83ca-f9545fad8074` |
| Service principal ID | `e8c51a80-bdb0-46fa-b398-9109719d6427` |
| Service principal type | ManagedIdentity |

## Existing Graph App Roles

| Role | App role ID |
| --- | --- |
| `Mail.Read` | `810c84a8-4a9e-49e6-bf7d-12d183f40d01` |
| `Files.Read.All` | `01d4889c-1287-42c6-ac1f-5d1e02578ef6` |
| `Files.ReadWrite.All` | `75359482-378d-4052-8f01-80520e7db3cd` |

The readback route uses Microsoft Graph application access from the managed identity. It does not require or expose mailbox content bodies.

## Delegated Troubleshooting Identity

`jm1-admin@jmerrill.one` was used for Exchange Online administration and delegated troubleshooting. This delegated access is not the production runtime readback identity.

