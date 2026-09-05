# Graph Permissions

Last verified: 2026-08-27T17:15:42Z

The Diagnostic Runner managed identity already had Microsoft Graph `Mail.Read` application permission before this closure run.

Live control result:

| Brand | Mailbox | Folder readback |
| --- | --- | --- |
| JMP | `publishing@jmerrill.one` | PASS |
| AIC | `aic@agapeic.org` / `aic@jmerrill.one` / `516ec810-7be4-4bfe-97b4-7d7756732111` | FAIL / `ErrorAccessDenied` |

Graph `/users` profile read returns `Authorization_RequestDenied` because the managed identity does not have `User.Read.All`. That is not the commissioning gate. The gate is mailbox folder readback through `Mail.Read` constrained by Exchange Application Access Policy.

