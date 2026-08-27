# JM1 AIC Mailbox Readback Authorization Closure

Last verified: 2026-08-27T17:15:42Z

## Objective

Close the remaining AIC mailbox folder/readback authorization gap without redesigning ACS sender identity, creating another mailbox, or resending proof mail merely because readback was blocked.

## Result

| Item | Result |
| --- | --- |
| PR #20 prior evidence | MERGED |
| AIC Exchange mailbox object | EXISTS |
| AIC primary SMTP | `aic@agapeic.org` |
| AIC UPN | `aic@jmerrill.one` |
| AIC object ID | `516ec810-7be4-4bfe-97b4-7d7756732111` |
| AIC ACS From | `aic@email.agapeic.org` |
| AIC Reply-To / reply authority | `aic@agapeic.org` |
| Diagnostic Runner route | IMPLEMENTED / MERGED / DEPLOYED |
| Production release | `206d9653d1413287db1a208f2f063e93f43b8c33` |
| Exchange Application Access Policy | GRANTED for AIC and Publishing; DENIED for unrelated admin mailbox |
| Publishing control mailbox readback | PASS |
| AIC mailbox folder readback | BLOCKED / Graph `ErrorAccessDenied` |
| Outlook connector AIC readback | KNOWN LIMITATION / `Default folder Root not found` |
| Sender regression | PASS |

## Classification

`AIC_MAILBOX_READBACK_CONTROLLED_COMMISSIONING`

Reason: the narrow authorization repair was performed and Exchange now reports the Diagnostic Runner managed identity as granted for AIC, but live production Graph folder probes still return `ErrorAccessDenied` for all governed AIC identifiers. The gap is no longer route implementation or sender configuration; it remains live Graph/Exchange mailbox folder authorization enforcement or propagation for the newly-scoped AIC shared mailbox.

Enterprise ACS sender identity remains controlled rather than fully commissioned because AIC is part of the final sender matrix and AIC mailbox folder readback did not pass.

## Mutations Performed

- Added AIC to the existing Exchange Application Access Policy scope group.
- Granted delegated FullAccess to `jm1-admin@jmerrill.one` for AIC mailbox troubleshooting/readback.
- Updated the Diagnostic Runner with a read-only enterprise mailbox health route.
- Deployed the Diagnostic Runner production package from canonical main.

## Mutations Not Performed

- No AIC mailbox recreation.
- No ACS sender identity change.
- No AIC proof resend.
- No SendAs grant.
- No tenant-wide mail access relaxation.
- No DNS mutation.
- No Dataverse mutation.
- No SharePoint mutation.
- No Business Central mutation.
- No public member communication.

