# Social Readback And Alert Correction — 2026-10-10

## Scope And Provenance

The live coverage run used [the October 10 native evidence snapshot](social-coverage-native-audit-2026-10-10.json) as input to `node scripts/social-coverage-readback.mjs <snapshot> --live-dataverse`. The snapshot records the exact Meta business portfolio and Page/account IDs, Eastern schedule times, caption SHA-256 fingerprints, and a null native booking ID where the Meta UI did not expose one. The historical October 3 LinkedIn Hagher post ID is retained once as published evidence only. LinkedIn scheduled-post views redirected to company admin and remain unavailable; those channels are UNKNOWN, not empty.

The readback reconciles a Dataverse native-booking claim only when same-day native UI evidence matches brand, platform, exact destination ID or handle, UTC schedule, and caption SHA-256. A missing native ID stays null. A mismatch remains unresolved. The live October 10 run read 99 Dataverse rows, classified zero as unclassified, and corrected J Merrill One Instagram's next booking to October 15. No post, approval, booking, campaign state, or runtime was changed.

## Native Coverage Result

| Brand | Platform | Native readback | Verified bookings, Oct 10–24 | Status |
| --- | --- | --- | ---: | --- |
| J Merrill One | Facebook | Verified | 2 | Covered |
| J Merrill One | Instagram | Verified | 2 | Covered |
| J Merrill One | LinkedIn | Unavailable | Unknown | Schedule route redirected |
| J Merrill Publishing | Facebook | Verified | 2 | Covered; 16 held API records remain distinct |
| J Merrill Publishing | Instagram | Verified | 1 | Gap in Oct 10–17 week; next booking Oct 20 |
| J Merrill Publishing | LinkedIn | Unavailable | Unknown | Schedule route redirected |
| J Merrill Financial | Facebook | Verified | 2 | Covered |
| J Merrill Financial | Instagram | Verified | 3 | Covered |
| J Merrill Financial | LinkedIn | Unavailable | Unknown | Schedule route redirected |

No exact duplicate-content risk was detected between current native bookings and API requests. Publishing Meta channels still report mixed execution authority because native cards coexist with Azure-worker-owned API rows. The Publishing campaign `d42fae45-90a6-f111-b8de-00224820105b` remains `SYSTEM_AUTHORITY_CREATED_HELD_FOR_DOWNSTREAM_PROOF`. October 3 Facebook and Instagram rows remain without platform IDs and have `CAMPAIGN_PUBLIC_EXECUTION_APPROVAL_REQUIRED`; they were not released. The observed Publishing Instagram October 15 8 PM composer slot was unsaved and is excluded.

## Telemetry Finding

The Function App connection string matched its Application Insights component. The component is workspace-backed. Runtime `host.json` enables Application Insights sampling and excludes `Request`; no App Insights sampling or log-level app-setting override was configured. The deployed `socialExecutionWorkerTimer` logs JSON envelopes containing the trigger type, `runId`, `correlationId`, and read/write summary.

The old enabled alert `jm1-marketing-social-worker-freshness` queried the classic `traces` schema while scoped to the Application Insights component. The workspace's actual telemetry is in `AppTraces`/`AppRequests`; the direct Application Insights query returned no classic `traces` rows for the Oct 9 interval, while the workspace query returned 1,469 `AppTraces` and 311 `AppRequests` rows for that interval. This was a query/scope mismatch, not a missing Function execution.

Log Analytics readback for Oct 9 12:00–13:00Z found:

- `AUTONOMOUS_SOCIAL_EXECUTION_WORKER`: 4 distinct `runId`s and 4 `correlationId`s; observed 12:00–12:45Z.
- `AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP`: 1 distinct run/correlation pair at 12:17Z; Dataverse control-loop/content outputs are separately read back.
- `AUTONOMOUS_CREATIVE_WORK_PROCESSOR`: 1 distinct run/correlation pair at 12:22Z; Dataverse creative/execution outputs are separately read back.

## Alert Repair And Acceptance

The existing rule's scope is immutable in place. A workspace-scoped replacement was created and query-validated, then the old mismatched rule was disabled to avoid ongoing duplicate alert evaluation:

- Enabled: `jm1-marketing-social-worker-freshness-v2`
- Scope: the existing `DefaultWorkspace-...-EUS` Log Analytics workspace
- Query: exact `AppRoleName`, worker `triggerType`, and non-empty `runId`/`correlationId`; last run older than 30 minutes or absent from the last 45 minutes
- Evaluation: every 15 minutes; 45-minute window; severity 2
- Action group: existing `jm1-marketing-ops`; no receiver or resource added
- Replaced rule: `jm1-marketing-social-worker-freshness` is disabled, not deleted

The query was exercised against real workspace records and a bounded in-memory KQL fixture: a fresh worker row yields zero alert rows; an empty worker dataset yields one alert row. Azure Monitor's action-group sample log-alert notification was received by the enabled internal `jm1-admin@jmerrill.one` mailbox at `2026-10-10T07:40:53Z` from `azure-noreply@microsoft.com`. This proves action-group email delivery, not delivery of a production incident alert. No customer content or inquiry data was used.

No producer tick was forced, no Function redeployed, no Publishing hold released, no LinkedIn API enabled, and no social content created or published. The next natural timer cycle remains the production acceptance check for continued heartbeat visibility and normal query behavior.
