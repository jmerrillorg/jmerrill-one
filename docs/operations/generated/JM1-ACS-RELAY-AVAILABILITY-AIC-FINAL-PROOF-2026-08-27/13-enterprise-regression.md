# Enterprise Regression

Last verified: 2026-08-28T02:22:02Z

Runtime tests:

- ACS relay tests: 91 / 91 PASS
- ACS relay lint: PASS
- Protected deployment: PASS
- Route-health guard: PASS

Sender policy coverage includes:

- JM1
- J Merrill Publishing
- J Merrill Financial
- J Merrill Foundation
- J Merrill Productions
- AIC
- Jackie Smith Jr. personal brand

Regression-relevant assertions preserved:

- AIC sender identity is governed by `aic@email.agapeic.org`.
- AIC Reply-To remains `aic@agapeic.org`.
- AIC cannot use another JM1 brand sender.
- Planning Center cannot act as AIC sender authority.
- Sensitive AIC pastoral/legal/financial contexts fail closed for human review.
- Wrong-brand sender mismatch fails closed.
- Missing/unknown brands fail closed.

