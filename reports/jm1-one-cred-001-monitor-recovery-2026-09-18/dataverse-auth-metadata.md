# Dataverse Authentication Metadata

- Current runtime auth mode: client-secret service principal.
- Application: `JM1-PUB-INTAKE-WEBAPI`.
- Secret material: Key Vault-referenced by the Function app; no value is included here.
- Active credential expirations observed in Entra metadata: `2027-06-11` and `2027-07-15`.
- Dataverse application-user path: present and production-proven by successful read/write.
- Function system-assigned managed identity: available but not used by the current Dataverse library.
- App Service system-assigned managed identity: available.
- Managed-identity cutover: explicitly out of scope; a later identity-hardening packet may evaluate it.
- Dataverse schema change required: no.
