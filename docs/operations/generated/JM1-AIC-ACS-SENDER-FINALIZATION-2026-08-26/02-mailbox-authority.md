# Mailbox Authority Evidence

Last verified: 2026-08-26T23:16:24Z

## Microsoft 365 Domain

Domain: `agapeic.org`

Microsoft Graph domain readback:

| Field | Value |
| --- | --- |
| `isVerified` | `true` |
| `supportedServices` | `Email` |
| `authenticationType` | `Managed` |

Exchange Online accepted domain:

| Field | Value |
| --- | --- |
| Domain | `agapeic.org` |
| Type | `InternalRelay` |

## Shared Mailbox Created

Mailbox: `aic@agapeic.org`

Display name: `Agape International Cathedral`

Recipient type: `SharedMailbox`

Primary SMTP address: `aic@agapeic.org`

Creation command returned Exchange replication warnings for initial mailbox prepopulation. Follow-up Exchange readback confirmed the shared mailbox object.

## Folder Readback Caveat

Outlook shared-mailbox connector readback immediately after creation returned:

`ErrorFolderNotFound`

Classification: `EXCHANGE_REPLICATION_OR_DELEGATED_FOLDER_VISIBILITY_PENDING`

This is not evidence of ACS sender failure. The mailbox object exists, but delegated folder readback was not yet available through the connector at the time of this pass.
