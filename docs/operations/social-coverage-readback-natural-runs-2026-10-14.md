# Daily Social Readback and Natural Timer Evidence — 2026-10-14

## Current native schedule readback

The [dated native snapshot](social-coverage-native-audit-2026-10-14.json) is the current selection; the October 10 snapshot remains historical. Native list timestamps are retained per account in the snapshot. The [live readback](social-coverage-readback-2026-10-14.json) selected that snapshot automatically, read Dataverse at `2026-10-14T12:28Z` (see exact `liveDataverseObservedAt`), and produced 126 date/channel cells for the committed inclusive Eastern dates October 14–27. October 28 is separately classified as preparation.

All nine production channels have 14/14 observed future schedule dates in their current native lists, with no missing or unverified date. Financial uses Page `104395329284856`, Instagram `@jmerrillfinancial`, and LinkedIn organization `146207089`; legacy/test destinations remain excluded from production coverage. Cell-level evidence source, URL, observation time, native schedule time, status, platform publication IDs, request/hold references, and receipt links are in the readback JSON. A qualifying schedule is not represented as a completed publication.

The eight October 13 past-due claims reconcile to exact linked Dataverse records, production destination/date, and native published-list evidence. Six Meta items expose publication timestamp and platform post ID; two LinkedIn items expose their organization feed post IDs and published date, but the public feed does not expose the actual minute. The report retains that timestamp as unknown instead of reusing the planned time as actual publication time.

The three preserved campaign conflicts remain held and unreleased:

- `16b8ac32-a5c4-f111-aaaf-000d3a1a9efa` — ONE Facebook, October 23.
- `5bc71f56-2ac6-f111-aaaf-6045bdd69678` — ONE Instagram, October 13.
- `ce878706-dcc3-f111-aaaf-000d3a9eacee` — Publishing Instagram, October 13.

The live report separately retains source/copy/booking-provenance review findings; those findings do not convert native scheduled-list evidence into missing daily coverage and are not approvals. No post was created, edited, released, or published for this readback.

## Natural timer readback

Application Insights workspace-backed `AppTraces` was queried after the timers’ due times; no timer was manually invoked.

| Function | Natural invocation | Result |
|---|---|---|
| `marketingControlLoopTimer` | `2026-10-14T12:17:00Z`; run `AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP:2026-10-14T12:17:00.008Z:2bbe9678-b671-4614-9147-39261b5d1ff7`; correlation `4ac29825-1ea8-45ea-93cf-697646cc3e5a` | Invocation completed and persisted 22 output observations: 19 new content rows plus 3 existing/materialized control-loop records. It identified prepared daily content for October 15–28. This is planning/content preparation, not native booking or publication. |
| `creativeWorkProcessorTimer` | `2026-10-14T12:22:00Z`; run `AUTONOMOUS_CREATIVE_WORK_PROCESSOR:2026-10-14T12:22:00.008Z:1d8f8f9d-25d1-438c-92eb-8bb98eb22e9d`; correlation `885e3dd2-7f95-46e5-bdad-b81016617be3` | Function host logged `Succeeded`, duration 18.778 seconds. Its structured trace reports 153 processed result entries (89 created, 30 reused, remainder without a `created` field), including media/content and social-request state. Meta requests were `PUBLIC_READY_SCHEDULED_ELIGIBLE`; LinkedIn requests remained `HELD_NATIVE_LINKEDIN_BOOKING_REQUIRED`. This proves natural processing and request preparation, not native bookings or publication. |

## Readback selection and validation

No-argument readback now selects the latest eligible complete snapshot by embedded per-channel native observation time rather than filename or the historical October 10 default. Its report names the source snapshot, its age, latest observation, per-channel ages, and the live Dataverse read time. Matrix scoring is one qualifying native scheduled or confirmed published placement per brand/channel/Eastern date; surplus cannot offset gaps, pending requests do not count as bookings, duplicate receipts do not create extra placements, and holds remain distinct.

Validation: `node scripts/test-social-coverage-readback.mjs` — 62/62 passed; `node --check scripts/social-coverage-readback.mjs` — passed; the dated snapshot parsed as valid JSON. This is a local source/test result; no production deployment was performed in this read-only commissioning evidence pass.
