# Post-Repair Health

Last verified: 2026-08-28T02:33:47Z

| Probe | Result |
| --- | --- |
| Root `/` | 200 Azure Functions homepage |
| POST `/api/send-enterprise-governed-email` without key | 401 governed `UNAUTHORIZED` |
| POST `/api/send-author-acknowledgment` without key | 401 governed `UNAUTHORIZED` |
| `syncfunctiontriggers` | success |
| Function trigger list | expected relay triggers present |
| Function App state | Running |
| Function App availability | Normal |

The remaining 401 responses are expected safe failures because no relay key was supplied for health probing.

