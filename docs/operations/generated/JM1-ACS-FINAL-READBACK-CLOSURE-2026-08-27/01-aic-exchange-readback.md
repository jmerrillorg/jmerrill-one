# AIC Exchange / Graph Object Readback

Last verified: 2026-08-27T10:16:14Z

Evidence sources:

- Microsoft Graph user lookup by `mail eq 'aic@agapeic.org'`
- Microsoft Graph user lookup by `proxyAddresses/any(... 'SMTP:aic@agapeic.org')`
- Outlook shared-mailbox folder probe for `aic@agapeic.org`
- Outlook shared-mailbox folder probe for `aic@jmerrill.one`

## Object Readback

| Field | Value |
| --- | --- |
| ADDRESS_EXISTS | YES |
| MAILBOX_TYPE | Exchange recipient object / shared-mailbox-style disabled user object |
| SHARED_MAILBOX | YES, inferred from disabled account object and governed mailbox designation |
| PRIMARY_SMTP | `aic@agapeic.org` |
| EXCHANGE_OBJECT_ID | `516ec810-7be4-4bfe-97b4-7d7756732111` |
| GRAPH_USER_ID / MAILBOX ID | `516ec810-7be4-4bfe-97b4-7d7756732111` |
| USER PRINCIPAL NAME | `aic@jmerrill.one` |
| MAIL_ENABLED | YES |
| DELEGATION_STATE | NOT PROVEN THROUGH CURRENT CONNECTOR |
| FOLDER_VISIBILITY | NOT PROVEN |
| INBOX_AVAILABLE | NOT PROVEN |
| SENT_ITEMS_AVAILABLE | NOT PROVEN |

Observed proxy addresses:

- `smtp:aic@jmerrillfoundation.onmicrosoft.com`
- `smtp:aic@jmerrill.one`
- `SMTP:aic@agapeic.org`

Direct `/users/aic@agapeic.org` lookup returned `Request_ResourceNotFound` because the mailbox UPN is `aic@jmerrill.one`; lookup by `mail` and by primary SMTP proxy resolves successfully.

Current gap classification:

`GRAPH_PERMISSION_MISSING`

