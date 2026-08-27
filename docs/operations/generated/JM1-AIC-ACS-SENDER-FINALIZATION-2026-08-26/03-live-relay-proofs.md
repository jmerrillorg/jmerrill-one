# Live Relay Proofs

Last verified: 2026-08-26T23:16:24Z

Runtime: `func-jm1-acs-email-relay`

Route: `https://func-jm1-acs-email-relay.azurewebsites.net/api/send-enterprise-governed-email`

## Live Proof Matrix

| Probe | HTTP | Result |
| --- | --- | --- |
| Valid AIC routine proof | 202 | `accepted: true`; sender `aic@email.agapeic.org`; Reply-To `aic@agapeic.org`; mailbox authority `aic@agapeic.org`; provider `acs-email` |
| AIC using Publishing sender | 400 | `ACS_BRAND_SENDER_MISMATCH` |
| AIC using One sender | 400 | `ACS_BRAND_SENDER_MISMATCH` |
| Wrong AIC relationship context | 400 | `ACS_RELATIONSHIP_CONTEXT_MISMATCH` |
| Raw internal system language | 400 | `HUMAN_FIRST_INTERNAL_LANGUAGE_BLOCKED` |
| Routine AIC event reminder | 202 | `accepted: true`; sender `aic@email.agapeic.org`; Reply-To `aic@agapeic.org` |
| Sensitive pastoral context | 409 | `HUMAN_REVIEW_REQUIRED_AIC_SENSITIVE_CONTEXT` |
| Duplicate signature | 400 | `ACS_DUPLICATE_SIGNATURE_BLOCKED` |

## Multipart Signature Correction

Initial AIC proof text repeated `Agape International Cathedral` in body copy and in the signature. The duplicate-signature guard correctly denied that payload.

The runtime was also corrected so a normal multipart email may contain one signature in the plain-text body and one matching signature in the HTML body without being falsely treated as duplicate author-facing signatures.

Regression coverage: `AIC permits one signature in each multipart body representation`.
