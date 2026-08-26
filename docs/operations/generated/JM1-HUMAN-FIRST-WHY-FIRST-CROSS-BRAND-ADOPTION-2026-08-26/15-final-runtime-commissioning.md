# Final Runtime Commissioning Readback

Last verified: 2026-08-26T16:39:16Z

## PRs Merged

| Repository | PR | Merge SHA |
| --- | --- | --- |
| `jmerrill-one` | `#12` | `b5606a86b5812275a128452546000a6ce4d65ebd` |
| `jmerrill-financial` | `#25` | `434824e2bf8d6a191b19c78d350408909659c6a5` |
| `jmerrillfoundation` | `#8` | `51707fa29a4182990dce4afcdbbfb5f0448d1d32` |
| `jmerrill-productions` | `#4` | `30fee677973594e7d6665dd3e530db1ad37031d6` |
| `aic-online` | `#1` | `36c79fb912552a141e0be33065e26c24400b86e5` |

## Deployments

| Branch | Runtime | Deployment run / proof | Result |
| --- | --- | --- | --- |
| Financial | `app-jm1-fin-prod-v2` | `https://github.com/jmerrillorg/jmerrill-financial/actions/runs/32988757528` | SUCCESS |
| Financial | `func-jm1-fin-prod` | `OPTIONS https://func-jm1-fin-prod.azurewebsites.net/api/pilot/session/bootstrap` | `204 No Content` |
| Foundation | `app-jm1-foundation-prod-v2` | `https://github.com/jmerrillorg/jmerrillfoundation/actions/runs/32988757402` | SUCCESS |
| Productions | `app-jm1-productions-prod-v2` | `https://github.com/jmerrillorg/jmerrill-productions/actions/runs/32988757151` | SUCCESS |
| AIC | `aic-app-service-prod` | `https://github.com/jmerrillorg/aic-online/actions/runs/32988757027` plus forced activation of verified artifact `aic-package-96.zip` | SUCCESS / `RuntimeSuccessful` |

## Live Health Readback

| Branch | URL | Result |
| --- | --- | --- |
| Financial | `https://jmerrill.financial/api/health` | `200`, `{"ok":true,"service":"jmerrill-financial","runtime":"app-service"}` |
| Foundation | `https://jmerrill.foundation/api/health` | `200`, `{"ok":true,"service":"jmerrill-foundation","runtime":"app-service"}` |
| Productions | `https://jmerrill.productions/api/health` | `200`, includes `humanFirstPolicy=JM1-HUMAN-FIRST-WHY-FIRST-v1` and `humanFirstBrandOverlay=JMPRODUCTIONS` |
| AIC | `https://agapeic.org/api/health` | `200`, includes `humanFirstPolicy=JM1-HUMAN-FIRST-WHY-FIRST-v1` and `humanFirstBrandOverlay=AIC` after forced artifact activation |

## Runtime Status By Branch

| Branch | Actual communication runtime | Policy bound | Sender / identity guard | Risk escalation | Live proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Publishing | ACS relay | YES | YES | YES | YES | COMMISSIONED |
| Financial | `api/shared/pilotRuntime.js` communication gate in Function App | YES | YES | YES | SAFE PRE-SEND / FUNCTION SMOKE | CONTROLLED_RUNTIME_COMMISSIONING |
| Foundation | No governed outbound sender runtime found | PRE-PUBLISH | PRE-PUBLISH | PRE-PUBLISH | SITE DEPLOYED | PRE_PUBLISH_GUARD_DEPLOYED |
| Productions | No governed outbound sender runtime found | PRE-PUBLISH | PRE-PUBLISH | PRE-PUBLISH | SITE DEPLOYED | PRE_PUBLISH_GUARD_DEPLOYED |
| AIC | Website + Planning Center read surfaces; no governed outbound sender runtime found | PRE-PUBLISH | PRE-PUBLISH | PRE-PUBLISH | SITE DEPLOYED | PRE_PUBLISH_GUARD_DEPLOYED |

## Remaining Runtime / Live-Proof Gaps

1. Foundation needs a real governed outbound communication runtime or an identified existing platform send boundary before donor/program/volunteer messages can be classified commissioned.
2. Productions needs a real governed outbound communication runtime before talent/vendor logistics can be classified commissioned.
3. AIC needs a real governed send/publish boundary for Planning Center/email/SMS ministry notifications before AIC communications can be classified commissioned.
4. Financial external client sends remain controlled by existing pilot/runtime switches; no unnecessary live client message was sent for commissioning.

## Negative Proof

| Assertion | Value |
| --- | --- |
| `branch_marked_commissioned_without_live_proof` | 0 |
| `wrong_brand_sender_allowed` | 0 |
| `wrong_recipient_allowed` | 0 |
| `wrong_client_title_project_event_allowed` | 0 |
| `internal_system_language_exposed_without_need` | 0 |
| `high_risk_auto_send_allowed` | 0 |
| `routine_low_risk_message_forced_to_human_review` | 0 |
| `person_forced_to_repeat_known_current_information` | 0 |
| `system_failure_blames_recipient` | 0 |
| `service_message_blocked_by_marketing_consent` | 0 |
| `promotional_message_allowed_without_required_consent` | 0 |
| `duplicate_signature_allowed` | 0 |
| `raw_placeholder_allowed` | 0 |
| `broken_HTML_allowed` | 0 |
| `historical_sent_message_rewritten` | 0 |
| `Publishing_regressed` | 0 |
| `real_royalty_payment_sent` | 0 |
| `royalty_payment_response_auto_sent` | 0 |
| `royalty_timing_response_auto_sent` | 0 |
| `royalty_amount_response_auto_sent` | 0 |

Final classification remains `JM1_HUMAN_FIRST_WHY_FIRST_CONTROLLED_COMMISSIONING`.
