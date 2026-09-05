# JM1 ACS Relay Availability + AIC Final Proof

Last verified: 2026-08-28T02:35:00Z

## Result

PR #22 was merged to canonical `jmerrill-one` main. The ACS relay 503 condition was repaired on the existing Function App. The final AIC controlled proof was sent through the governed enterprise ACS relay, delivered to the AIC Microsoft mailbox, and read back from Outlook using the mailbox UPN path.

## Key evidence

| Item | Result |
| --- | --- |
| PR #22 | MERGED |
| PR #22 merge SHA | `5c2238703a6117e4d1bfd1ebae8afa6e8918b068` |
| ACS relay Function App | `func-jm1-acs-email-relay` |
| Original HTTP state | 503 Site Unavailable |
| Exact 503 root cause | `NODE24_LINUX_CONSUMPTION_HOST_UNAVAILABLE` |
| Runtime repair | Existing Function App set to `Node|22`; no new Function App |
| Runtime PR | jmerrill-pub PR #677 |
| Runtime merge SHA | `0fb3ce01b60a891e37c74b661fee985b654aecbf` |
| Protected deployment run | `33135589379` / SUCCESS |
| Post-repair route proof | POST `/api/send-enterprise-governed-email` returns governed `401 UNAUTHORIZED` without key |
| AIC From | `aic@email.agapeic.org` |
| AIC Reply-To | `aic@agapeic.org` |
| AIC proof accepted | 2026-08-28T02:30:11Z / HTTP 202 |
| Exchange delivery | Delivered at 2026-08-28T02:30:22Z |
| Recipient mailbox readback | PASS using `aic@jmerrill.one` shared mailbox UPN |

## Important chronology

The first relay proof attempt after host repair was validation-blocked because the message text repeated the AIC signature name. No ACS send was accepted for that blocked request.

The next accepted proof at 2026-08-28T02:23:23Z was received by Exchange but intercepted by the temporary domain-wide transport rule `AIC | TEMP | Domain Mail Recovery -> iCloud`, then redirected away from the canonical mailbox path.

That temporary rule was disabled, not deleted. The post-repair proof at 2026-08-28T02:30:11Z was accepted by ACS, delivered by Exchange to `aic@agapeic.org`, and visible in the AIC mailbox when read through the mailbox UPN `aic@jmerrill.one`.

## Final classifications

| Lane | Classification |
| --- | --- |
| AIC | `AIC_ACS_SENDER_FULLY_COMMISSIONED` |
| Enterprise ACS | `JM1_ACS_SENDER_IDENTITY_FULLY_COMMISSIONED` |
| ACS CI/CD | `ACS_RELAY_CICD_COMMISSIONED` |
| JM1 ACS operational mode | `FULLY_COMMISSIONED / DRIFT_MONITORED / MAINTENANCE` |

