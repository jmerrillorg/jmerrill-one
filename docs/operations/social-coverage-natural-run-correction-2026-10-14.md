# Natural Marketing Run Evidence Correction — 2026-10-14

This correction supplements, and does not rewrite, `social-coverage-readback-natural-runs-2026-10-14.md`. The earlier report's timer identities and planner counts remain supported. Its claim of 153 creative-worker processed entries is corrected below: it summed successive cumulative trace fragments as if each were a separate result set.

## Runtime and deployment identity

- Function App: `func-jm1-marketing-runtime`, resource group `rg-jm1-ai`.
- Telemetry source: Log Analytics `AppTraces`, workspace customer ID `d265988d-f1fb-4cf0-b978-9045f66a913c`. The similarly named classic Application Insights component returned no traces for this interval and was not the source used for this verification.
- At both timer invocations, the latest successful Marketing Functions deployment was commit `df15ac41b9194286710bf17cc57ed220a32fd4dd`, GitHub Actions run `38533883639`, completed `2026-10-14T08:17:18Z`. The next successful deployment in this repository was commit `33f098e8b8a244e930f77bcc39edf9d0087f1e52`, run `38586445728`, completed `2026-10-14T15:08:22Z`, after these runs.
- The worker-created Dataverse rows show creator `JM1-PUB-INTAKE-WEBAPI` / systemuser `bc60cbc3-6b65-f111-a826-000d3a14673b`, application ID `71ec4dd0-d261-4ffc-9f5a-626d885ecc85`. That application ID matches the value resolved in memory from the Function App's configured `DATAVERSE_CLIENT_ID` Key Vault reference. The display name is unusual, but the creator is not evidence of a separate application from the configured runtime.

## Natural invocations and persisted effects

| Timer | Invocation / operation | Persisted result | Boundary |
|---|---|---|---|
| `marketingControlLoopTimer` | Run `AUTONOMOUS_DAILY_MARKETING_CONTROL_LOOP:2026-10-14T12:17:00.008Z:2bbe9678-b671-4614-9147-39261b5d1ff7`; invocation/correlation `4ac29825-1ea8-45ea-93cf-697646cc3e5a`; operation `e0b2ff989e5f6e63aeb393093e4feac7` | Final trace contains 22 output observations: 19 `created=true`, 3 `created=false`. Dataverse independently shows 19 `jm1_contentworks` rows created by the runtime user from 12:17:00Z through 12:18:00Z. | Natural planning/content preparation through Oct 28; no native booking or publication proof. |
| `creativeWorkProcessorTimer` | Run `AUTONOMOUS_CREATIVE_WORK_PROCESSOR:2026-10-14T12:22:00.008Z:1d8f8f9d-25d1-438c-92eb-8bb98eb22e9d`; invocation/correlation `885e3dd2-7f95-46e5-bdad-b81016617be3`; operation `b510453cf5b241dd41daa916f7295695` | Function host invocation succeeded in 18.778 seconds. Dataverse shows 19 `jm1_creativeworks`, 19 `jm1_mediaassets`, and 32 `jm1_socialexecutions` created by the same runtime user in their respective 12:22 processing intervals. The final cumulative trace fragment contains 102 result entries (70 true-created, 15 reused, 17 without a `created` field). | Creative/request preparation and state processing; requests are not native bookings or publications. |

The earlier 153 count was the sum of four trace fragments of sizes 16, 22, 13, and 102. Those fragments repeat cumulative result entries; 153 is not a unique-work count. Retain it only as the superseded historical claim, not as an accepted run result.

No evidence from these invocations establishes a due-time post, platform publication ID, or publication reconciliation. No post was published by these natural runs. Future publication checks remain with the existing monitoring path.
