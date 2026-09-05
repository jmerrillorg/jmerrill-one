# Delegated Access

Last verified: 2026-08-27T17:15:42Z

Delegated FullAccess was granted to `jm1-admin@jmerrill.one` for the AIC shared mailbox to support governed troubleshooting/readback.

| Item | Result |
| --- | --- |
| Delegated mailbox | `aic@jmerrill.one` / `aic@agapeic.org` |
| Delegated user | `jm1-admin@jmerrill.one` |
| Access right | FullAccess |
| SendAs granted | NO |

Delegated Graph PowerShell and the Outlook connector still produced shared-mailbox folder readback failures. This delegated limitation is not treated as the production runtime authority because the intended production readback identity is the Diagnostic Runner managed identity.

