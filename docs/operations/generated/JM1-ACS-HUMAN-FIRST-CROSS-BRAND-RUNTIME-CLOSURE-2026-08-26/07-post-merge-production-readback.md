# Post-Merge Production Readback

Last verified: 2026-08-26T21:14:00Z

Publishing runtime PR:

`https://github.com/jmerrillorg/jmerrill-pub/pull/653`

Publishing merge SHA:

`4b5ae02fba557f7e83f70829f973236754641bdd`

Enterprise evidence PR:

`https://github.com/jmerrillorg/jmerrill-one/pull/15`

Enterprise evidence merge SHA:

`25d219cec583d07aa3c462af168e14d5ff223dab`

Production Function App:

`func-jm1-acs-email-relay`

Production app setting:

`JM1_RUNTIME_RELEASE_SHA=4b5ae02fba557f7e83f70829f973236754641bdd`

Post-merge route probes:

| Probe | HTTP | Result |
| --- | --- | --- |
| AIC sender request | 400 | `AIC_SENDER_IDENTITY_FOUNDER_DECISION_REQUIRED` |
| Financial request using Publishing sender | 400 | `ACS_BRAND_SENDER_MISMATCH` |
| JM1 synthetic/internal send | 202 | `one@email.jmerrill.one` / `one@jmerrill.one` / `info@jmerrill.one` |
| JMP synthetic/internal send | 202 | `publishing@email.jmerrill.one` / `publishing@jmerrill.one` / `publishing@jmerrill.one` |
| JMF synthetic/internal send | 202 | `financial@email.jmerrill.one` / `financial@jmerrill.one` / `financial@jmerrill.one` |
| JMFN synthetic/internal send | 202 | `foundation@email.jmerrill.one` / `foundation@jmerrill.one` / `foundation@jmerrill.one` |
| JMPRODUCTIONS synthetic/internal send | 202 | `productions@email.jmerrill.one` / `productions@jmerrill.one` / `productions@jmerrill.one` |

No AIC live send, public deployment, client communication, author communication, or mailbox redesign was performed.
