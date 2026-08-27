# Direct Graph Probes

Last verified: 2026-08-27T17:15:04Z

## Production Route

Route: `POST /api/run-enterprise-mailbox-readback-health`

Runtime release: `206d9653d1413287db1a208f2f063e93f43b8c33`

The route is read-only, GET-only against Graph, and returns safe metadata only.

## AIC Probe

| Principal attempted | User object | Mail folders | Inbox | Sent Items |
| --- | --- | --- | --- | --- |
| `aic@agapeic.org` | 403 / `Authorization_RequestDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` |
| `aic@jmerrill.one` | 403 / `Authorization_RequestDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` |
| `516ec810-7be4-4bfe-97b4-7d7756732111` | 403 / `Authorization_RequestDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` | 403 / `ErrorAccessDenied` |

Result: `ENTERPRISE_MAILBOX_READBACK_HEALTH_FAIL`

## Publishing Control Probe

| Mailbox | Mail folders | Inbox | Sent Items |
| --- | --- | --- | --- |
| `publishing@jmerrill.one` | 200 / PASS | 200 / PASS | 200 / PASS |

Publishing control result proves the runtime route and managed identity Graph `Mail.Read` path are working generally. The residual failure is AIC-specific.

