# 503 Runtime State

Last verified: 2026-08-28T02:16:54Z

Before repair, the ACS relay Function App reported ARM `Running` / availability `Normal`, but every public host route returned platform-level 503.

| Probe | Result |
| --- | --- |
| `/` | 503 Site Unavailable |
| `/api/health` | 503 Site Unavailable |
| `/api/send-enterprise-governed-email` | 503 Site Unavailable |
| `/api/send-approved-author-response` | 503 Site Unavailable |
| SCM/Kudu deployment API | 503 Site Unavailable |
| SCM log download/tail | 503 Site Unavailable |

This was not a governed relay validation failure. It occurred before the route handler could execute.

