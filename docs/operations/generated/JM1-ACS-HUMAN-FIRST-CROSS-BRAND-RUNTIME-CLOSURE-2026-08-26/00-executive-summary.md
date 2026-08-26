# JM1 ACS + Human-First Cross-Brand Runtime Closure

Last verified: 2026-08-26T21:14:00Z

Enterprise repo: `jmerrillorg/jmerrill-one`

Runtime repo: `jmerrillorg/jmerrill-pub`

Runtime branch/head: `codex/jm1-acs-crossbrand-runtime-20260826` / `2bac48a42cbc79be9ec733ced71a976dabbd7f82`

Runtime PR: `https://github.com/jmerrillorg/jmerrill-pub/pull/653`

Runtime merge SHA / production release: `4b5ae02fba557f7e83f70829f973236754641bdd`

Enterprise evidence PR: `https://github.com/jmerrillorg/jmerrill-one/pull/15`

Enterprise evidence merge SHA: `25d219cec583d07aa3c462af168e14d5ff223dab`

Production Function App: `func-jm1-acs-email-relay`

Production route: `https://func-jm1-acs-email-relay.azurewebsites.net/api/send-enterprise-governed-email`

## Result

The shared ACS outbound relay is commissioned for the decided JM1 brand senders:

| Brand | ACS sender | Reply-To | Mailbox authority | Live proof |
| --- | --- | --- | --- | --- |
| JM1 | `one@email.jmerrill.one` | `one@jmerrill.one` | `info@jmerrill.one` | PASS |
| JMP | `publishing@email.jmerrill.one` | `publishing@jmerrill.one` | `publishing@jmerrill.one` | PASS |
| JMF | `financial@email.jmerrill.one` | `financial@jmerrill.one` | `financial@jmerrill.one` | PASS |
| JMFN | `foundation@email.jmerrill.one` | `foundation@jmerrill.one` | `foundation@jmerrill.one` | PASS |
| JMPRODUCTIONS | `productions@email.jmerrill.one` | `productions@jmerrill.one` | `productions@jmerrill.one` | PASS |

AIC remains `FOUNDER_DECISION_REQUIRED` and is excluded from the commissioned sender denominator.

## Classification

ACS:

`JM1_ACS_SENDER_IDENTITY_COMMISSIONED_FOR_DECIDED_BRANDS`

Human-First / Why-First:

`JM1_HUMAN_FIRST_WHY_FIRST_ENTERPRISE_POLICY_COMMISSIONED`

## Boundary

This closeout did not authorize AIC sender identity, unrelated public deployment, marketing campaigns, client communications, mailbox redesign, or branch-specific product/runtime changes. Synthetic/internal proof emails were sent only to governed internal JM1 mailbox authorities.
