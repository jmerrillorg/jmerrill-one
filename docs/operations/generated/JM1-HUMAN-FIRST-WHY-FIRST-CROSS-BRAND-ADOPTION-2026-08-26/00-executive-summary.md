# JM1 Human-First / Why-First Cross-Brand Adoption Evidence

Last verified: 2026-08-26T15:57:26Z

## Scope

Enterprise policy: `JM1-HUMAN-FIRST-WHY-FIRST-v1`

Enterprise source: `docs/governance/JM1-HUMAN-FIRST-WHY-FIRST-v1.md`

Publishing reference implementation: commissioned before this cross-brand pass.

This package records adoption work for J Merrill Financial, J Merrill Foundation, J Merrill Productions, and Agape International Cathedral. It does not redesign the enterprise policy and does not duplicate doctrine.

## Result

| Branch | Result |
| --- | --- |
| J Merrill Publishing | COMMISSIONED_REFERENCE_IMPLEMENTATION |
| J Merrill Financial | CONTROLLED_RUNTIME_COMMISSIONING |
| J Merrill Foundation | PRE_PUBLISH_GUARD_DEPLOYED / SEPARATE_WAVE_REQUIRED_FOR_LIVE_SEND |
| J Merrill Productions | PRE_PUBLISH_GUARD_DEPLOYED / SEPARATE_WAVE_REQUIRED_FOR_LIVE_SEND |
| Agape International Cathedral | PRE_PUBLISH_GUARD_DEPLOYED / SEPARATE_WAVE_REQUIRED_FOR_LIVE_SEND |

Final enterprise classification: `JM1_HUMAN_FIRST_WHY_FIRST_CONTROLLED_COMMISSIONING`

Post-adoption deployment readback was completed on 2026-08-26. Financial, Foundation, Productions, and AIC production App Service runtimes were deployed from their merged adoption heads. Financial Function App smoke passed. Productions and AIC health endpoints expose Human-First policy metadata. Foundation and Financial health endpoints are healthy but do not expose policy metadata.

The enterprise is not classified fully commissioned because Foundation, Productions, and AIC still do not have an actual governed outbound sender runtime to commission. Financial has an existing communication gate bound in production, but external client sends remain controlled by the pilot/runtime switches and no unnecessary live client communication was sent.

## Validation

Focused Human-First / Why-First guard tests passed for Financial, Foundation, Productions, and AIC.

Build validation passed for all four branch repositories after lockfile-based dependency installation.

Publishing reference validation passed:

- `node --test scripts/author_communication_brand_guard.test.mjs scripts/author_review_package_engine.test.mjs`: 37 / 37 PASS
- `npm test` in `azure-functions/acs-email-relay`: 62 / 62 PASS

Publishing mailbox readback found the corrected General's Will message in `publishing@jmerrill.one`, from `publishing@email.jmerrill.one`, to the author, with `publishing@jmerrill.one` copied and attachments present. The already-sent stored message body retains a duplicate signature artifact; current relay validation blocks duplicate author-facing signatures.

Local engine caveat: validation ran under Node 26. Financial, Foundation, and Productions declare Node `>=24 <25`; AIC declares Node `>=20 <23`. The engine mismatch produced warnings only.

AIC build caveat: local build logged Planning Center `401` responses because live Planning Center credentials were not present in the validation environment. The Next build completed successfully.

## Boundary

No author, client, donor, member, talent, vendor, or public communications were sent under this pass.

No mailbox, Dataverse, SharePoint, Stripe, Business Central, DNS, or Microsoft 365 mutations were performed.

No branch was classified as live outbound commissioned unless a real outbound runtime was already proven.
