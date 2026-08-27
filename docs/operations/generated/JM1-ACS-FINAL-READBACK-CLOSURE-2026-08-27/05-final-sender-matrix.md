# Final Sender Matrix

Last verified: 2026-08-27T10:16:14Z

Source:

- `docs/governance/JM1-ACS-SENDER-IDENTITY-v1.policy.json`
- Microsoft Graph mailbox-authority object lookup
- ACS sender username readback for `email.agapeic.org`
- Prior live ACS proof evidence retained in commissioning packages

| Brand | FROM | REPLY-TO | MAILBOX AUTHORITY | ADDRESS TYPE | ACS DOMAIN | LIVE SEND | READBACK | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JM1 | `one@email.jmerrill.one` | `one@jmerrill.one` | `info@jmerrill.one` | ALIAS | `email.jmerrill.one` | PROVEN | OBJECT READBACK | COMMISSIONED |
| JMP | `publishing@email.jmerrill.one` | `publishing@jmerrill.one` | `publishing@jmerrill.one` | MAILBOX | `email.jmerrill.one` | PROVEN | OBJECT / MAILBOX READBACK PROVEN IN PUBLISHING EVIDENCE | COMMISSIONED |
| JMF | `financial@email.jmerrill.one` | `financial@jmerrill.one` | `financial@jmerrill.one` | MAILBOX | `email.jmerrill.one` | PROVEN | OBJECT READBACK | COMMISSIONED |
| JMFN | `foundation@email.jmerrill.one` | `foundation@jmerrill.one` | `foundation@jmerrill.one` | MAILBOX | `email.jmerrill.one` | PROVEN | OBJECT READBACK | COMMISSIONED |
| JMPRODUCTIONS | `productions@email.jmerrill.one` | `productions@jmerrill.one` | `productions@jmerrill.one` | MAILBOX | `email.jmerrill.one` | PROVEN | OBJECT READBACK | COMMISSIONED |
| AIC | `aic@email.agapeic.org` | `aic@agapeic.org` | `aic@agapeic.org` | SHARED MAILBOX | `email.agapeic.org` | PROVEN | OBJECT READBACK ONLY / FOLDER READBACK BLOCKED | CONTROLLED |
| JSJ | `jackie@email.jackiesmithjr.com` | `jackie@jmerrill.one` | `jackie@jmerrill.one` | PRIMARY MAILBOX | `email.jackiesmithjr.com` | PROVEN | OBJECT READBACK | COMMISSIONED |

The enterprise sender architecture remains settled:

`REGISTRY_DRIVEN + BRAND_DOMAIN_AWARE + SHARED_ACS_TRANSPORT + BRAND_SPECIFIC_REPLY_AUTHORITY`

