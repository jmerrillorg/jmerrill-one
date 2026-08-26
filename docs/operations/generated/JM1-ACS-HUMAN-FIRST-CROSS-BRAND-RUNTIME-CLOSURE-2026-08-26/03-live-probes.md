# Live Relay Probe Evidence

Last verified: 2026-08-26T21:08:40Z

Endpoint:

`https://func-jm1-acs-email-relay.azurewebsites.net/api/send-enterprise-governed-email`

Unauthorized probe:

| Probe | HTTP | Result |
| --- | --- | --- |
| no relay key | 401 | `UNAUTHORIZED` |

Fail-closed probes:

| Probe | HTTP | Result |
| --- | --- | --- |
| AIC sender request | 400 | `AIC_SENDER_IDENTITY_FOUNDER_DECISION_REQUIRED` |
| Financial request using Publishing sender | 400 | `ACS_BRAND_SENDER_MISMATCH` |

Human-First guard behavior:

Initial synthetic proof copy used internal terms including `runtime` and `governed`; the live route denied those messages with `HUMAN_FIRST_INTERNAL_LANGUAGE_BLOCKED`. The successful proof rerun used plain recipient-safe wording.

Successful synthetic/internal sends:

| Brand | HTTP | Sender | Reply-To | Mailbox authority | Provider |
| --- | --- | --- | --- | --- | --- |
| JM1 | 202 | `one@email.jmerrill.one` | `one@jmerrill.one` | `info@jmerrill.one` | `acs-email` |
| JMP | 202 | `publishing@email.jmerrill.one` | `publishing@jmerrill.one` | `publishing@jmerrill.one` | `acs-email` |
| JMF | 202 | `financial@email.jmerrill.one` | `financial@jmerrill.one` | `financial@jmerrill.one` | `acs-email` |
| JMFN | 202 | `foundation@email.jmerrill.one` | `foundation@jmerrill.one` | `foundation@jmerrill.one` | `acs-email` |
| JMPRODUCTIONS | 202 | `productions@email.jmerrill.one` | `productions@jmerrill.one` | `productions@jmerrill.one` | `acs-email` |

No AIC send was attempted beyond the authorized fail-closed probe.
