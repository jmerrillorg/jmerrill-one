# JM1 AIC + JSJ ACS Sender Finalization Evidence

Last verified: 2026-08-27T00:49:22Z

Program: JM1 ACS cross-brand sender identity finalization

Scope:

- Preserve AIC sender closure on canonical main.
- Add Jackie Smith Jr. personal-brand sender identity.
- Preserve the shared enterprise ACS relay.
- Preserve Human-First / Why-First enforcement.

Final sender matrix:

| Brand | ACS From | Reply-To | Mailbox authority | Runtime status |
| --- | --- | --- | --- | --- |
| JM1 | `one@email.jmerrill.one` | `one@jmerrill.one` | `info@jmerrill.one` | COMMISSIONED |
| JMP | `publishing@email.jmerrill.one` | `publishing@jmerrill.one` | `publishing@jmerrill.one` | COMMISSIONED |
| JMF | `financial@email.jmerrill.one` | `financial@jmerrill.one` | `financial@jmerrill.one` | COMMISSIONED |
| JMFN | `foundation@email.jmerrill.one` | `foundation@jmerrill.one` | `foundation@jmerrill.one` | COMMISSIONED |
| JMPRODUCTIONS | `productions@email.jmerrill.one` | `productions@jmerrill.one` | `productions@jmerrill.one` | COMMISSIONED |
| AIC | `aic@email.agapeic.org` | `aic@agapeic.org` | `aic@agapeic.org` | CONTROLLED COMMISSIONING |
| JSJ | `jackie@email.jackiesmithjr.com` | `jackie@jmerrill.one` | `jackie@jmerrill.one` | COMMISSIONED |

Runtime:

| Item | Result |
| --- | --- |
| AIC PR #17 | MERGED |
| Relay PR #655 | MERGED |
| JSJ relay PR #658 | MERGED |
| Relay release SHA | `f4029127403d26b976fa8a4234824d6f15814d3d` |
| `func-jm1-acs-email-relay` | DEPLOYED / ROUTES ACTIVE |
| JSJ live internal proof | 202 Accepted |
| AIC post-JSJ regression proof | 202 Accepted |
| JSJ wrong sender probe | DENY / `ACS_BRAND_SENDER_MISMATCH` |
| JMP using JSJ sender probe | DENY / `ACS_BRAND_SENDER_MISMATCH` |
| JSJ divisional authority probe | HUMAN_REVIEW_REQUIRED |

Classification:

`JM1_ACS_SENDER_IDENTITY_CONTROLLED_COMMISSIONING`

Reason: JM1/JMP/JMF/JMFN/JMPRODUCTIONS/JSJ runtime sender identity is commissioned. AIC outbound sender runtime remains proven, but AIC shared-mailbox delegated folder readback is still not visible through the Outlook connector, so the whole enterprise sender matrix remains controlled rather than fully commissioned.

Human-First:

`JM1_HUMAN_FIRST_WHY_FIRST_ENTERPRISE_POLICY_COMMISSIONED`
