# Graph Endpoint Matrix

Last verified: 2026-08-27T18:53:36Z

## Production Route

- Route: `POST /api/run-enterprise-mailbox-readback-health`
- Function App: `func-jm1-diagnostic-ai-runner`
- Production package pointer: `diagnostic-ai-runner-a860e7b04d64d4496658df0b69b3e0166ade8c4d.zip`
- Runtime release app setting: `a860e7b04d64d4496658df0b69b3e0166ade8c4d`

## Probe Results

| Mailbox | User object | mailFolders | Inbox | Sent Items |
| --- | --- | --- | --- | --- |
| `publishing@jmerrill.one` | 403 / `Authorization_RequestDenied` | 200 / PASS | 200 / PASS | 200 / PASS |
| `aic@agapeic.org` | 403 / `Authorization_RequestDenied` | 200 / PASS | 200 / PASS | 200 / PASS |

## Notes

The production managed identity intentionally lacks directory-wide user read authority; therefore the user-object probe returns 403 for both mailboxes. That is not the mailbox readback gate.

The mailbox gate is folder/message readback through Graph Mail.Read, and both Publishing and AIC now pass.

The route does not currently return Graph request IDs or diagnostic headers. No raw tokens or message content were logged.

