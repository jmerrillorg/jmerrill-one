# AIC Folder Probe

Last verified: 2026-08-27T10:14:30Z

## Outlook Connector Probe

Mailbox: `aic@agapeic.org`

| Probe | Result |
| --- | --- |
| Folder list | FAILED |
| HTTP status | 404 |
| Error code | `ErrorItemNotFound` |
| Error message | `The specified object was not found in the store., Default folder Root not found.` |

Mailbox: `aic@jmerrill.one`

| Probe | Result |
| --- | --- |
| Folder list | FAILED |
| HTTP status | 404 |
| Error code | `ErrorItemNotFound` |
| Error message | `The specified object was not found in the store., Default folder Root not found.` |

## Microsoft Graph Folder Probe

Mailbox identity: `aic@jmerrill.one`

| Folder | HTTP status | Error code | Error message |
| --- | --- | --- | --- |
| Inbox | 403 | `ErrorAccessDenied` | `Access is denied. Check credentials and try again.` |
| Sent Items | 403 | `ErrorAccessDenied` | `Access is denied. Check credentials and try again.` |

Mailbox identity: `aic@agapeic.org`

| Folder | HTTP status | Error code | Error message |
| --- | --- | --- | --- |
| Inbox | 403 | `ErrorAccessDenied` | `Access is denied. Check credentials and try again.` |
| Sent Items | 403 | `ErrorAccessDenied` | `Access is denied. Check credentials and try again.` |

Disposition:

The prior `ErrorFolderNotFound` caveat was re-tested. The current result is more specific: Graph can resolve the mailbox object by mail/proxy, but the current credential/connector path cannot read mailbox folders. This is a delegated Graph/folder-access blocker, not an ACS sender identity defect.

