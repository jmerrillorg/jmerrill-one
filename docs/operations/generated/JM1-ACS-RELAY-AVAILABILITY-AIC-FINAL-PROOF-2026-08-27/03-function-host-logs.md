# Function Host Logs

Last verified: 2026-08-28T02:18:00Z

Azure diagnostic evidence:

- ARM state: `Running`
- Function App availability state: `Normal`
- App Insights request/trace/exception queries for the outage window returned no route-handler telemetry.
- SCM/Kudu was unavailable with 503, preventing normal filesystem logstream access during the outage.
- `syncfunctiontriggers` returned `BadRequest` with host runtime `ServiceUnavailable` while the app was on `Node|24`.
- After changing the existing Function App to `Node|22`, trigger sync returned `success`.

The absence of handler telemetry and the failed trigger sync classify the outage as host/runtime availability rather than ACS sender-policy failure.

