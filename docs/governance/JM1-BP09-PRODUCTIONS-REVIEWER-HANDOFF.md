# Productions BP-09 reviewer implementation handoff

Status: ONE-owned reviewer solution staged in Enterprise-Dev on 2026-10-04;
public Productions contact form remains off. Core import, non-admin access
proof, and human sign-in are not yet complete. This record assigns producer
and reviewer runtime to ONE without moving business policy into ONE.

## Current implementation and proof

- Source: `powerplatform/solutions/JM1ProductionsBP09InquiryReview`,
  `runtime/jm1-productions-bp09-reviewer-plugin`, and
  `powerplatform/webresources/jm1_prd_bp09_review.js`.
- Enterprise-Dev solution ID `9629f740-99bf-f111-aaaf-0022480b3175`;
  model-driven app ID `3b9e5a4d-99bf-f111-aaaf-000d3a5c9558`;
  Custom API `jm1_AcceptProductionsInquiry`. The app shows only Leads in its
  navigation; scoped role enforcement is still required.
- A synthetic button run changed Lead
  `da7a11de-c441-4318-9643-093fd8dd8599` from New to Follow-up Required,
  and action row `1483110f-011d-ec0e-bdd4-07fd76256e73` names its receipt,
  actor, expected version, correlation, and outcome. Direct sandbox tests
  covered wrong action, stale version, unlinked receipt, replay, changed key,
  and other-brand denial. These used an administrator and do not prove the
  non-admin boundary or production readiness.
- The app-specific command calls the Custom API. The API checks authenticated
  team membership, exact team ownership, completed consented Productions
  receipt, linked Lead, state, expected row version, and idempotency key. The
  Lead transition and minimal action row run in one Dataverse transaction.
  No inquiry body is copied into the action row.
- The solution has a `msdynce_LeadManagement` dependency. Enterprise-Dev has
  that package; JM1-Core readback showed version `9.0.4.0066`. JM1-Dev lacks
  Lead and cannot host this solution as currently configured. The test-only
  execution-log fixture table in Enterprise-Dev is not part of the exported
  reviewer solution.

Do not deploy the ONE producer change before the Core Lead receipt column is
imported. Do not enable public contact or continuous internal notices until
OPS has proved the least-privilege human reviewer path and the owner can see
and accept a synthetic Core inquiry. OPS owns the staged non-admin principal,
role, app share, and revocation tests. Initial sign-in/MFA for that principal
requires the human operator. Production cutover still requires the governed
notice and live release readbacks.

## Existing authority

- [ONE PR #58](https://github.com/jmerrillorg/jmerrill-one/pull/58)
  implemented strict Productions-origin intake, a durable `jm1_executionlogs`
  receipt, replay/payload-conflict behavior, and one linked Lead per eligible
  accepted receipt. This is producer proof, not reviewer-action proof.
- [Productions PR #18](https://github.com/jmerrillorg/jmerrill-productions/pull/18)
  authorizes only `ACCEPT_FOR_FOLLOW_UP`: an eligible `NEW` Lead moves to
  `FOLLOW_UP_REQUIRED`. It does not mean client contact, conversion, project
  approval, or retention disposition.
- [OPS scoped audit contract](https://github.com/jmerrillorg/jm1-ops/blob/main/docs/governance/enterprise-orchestration/productions-bp09-audit-equivalence.md)
  permits an attributable application-level action trail after its proof;
  JM1-Core global Dataverse Audit stays off.
- OPS team `36ee36cf-6ebf-f111-aaaf-6045bdd69435` and role
  `654979be-6ebf-f111-aaaf-7c1e525b15c2` exist. The role has only Basic
  Lead Read/Write. Its current member is Jackie's administrator system user,
  which cannot prove non-admin isolation. OPS staged separate Entra principal
  `da2195e5-8369-4a08-aa67-bc80aaa1160a` disabled, unlicensed, and without
  directory roles; it has no current Dataverse/app access.

## ONE-owned implementation

1. Keep the existing receipt-first intake and its timer reconciliation.
   Bind the accepted Productions Lead to the exact reviewer team through
   `JM1_PRODUCTIONS_FOLLOWUP_TEAM_ID` after source/config validation. Current
   code also accepts `JM1_PRODUCTIONS_FOLLOWUP_OWNER_ID` as a user fallback;
   do not use administrator ownership as ordinary reviewer authority.
2. Establish a version-controlled, Productions-scoped reviewer app/action
   surface in the ONE-owned Dataverse/runtime solution. Return exact solution,
   appmodule, action endpoint, and table/column IDs to OPS before app sharing
   or license allocation. Do not reuse the empty historical
   `JM1ProductionCommandCenter` solution by name alone or assume the
   first-party Sales app is covered by a Power Apps per-app pass.
3. Accept only a completed, response-consented BP-09 receipt for channel
   `jmerrill.productions/contact` linked to exactly one team-owned Productions
   Lead. Derive the actor from authenticated context, not a caller field.
   Enforce expected `NEW` state, row version, exact action ID, and an
   idempotency key. Duplicate requests must not produce a second transition;
   stale, revoked, other-brand, and changed-key requests fail closed.
4. Persist the Lead transition with a minimal append-only action receipt in
   the same transaction, or prove an equivalent no-gap recovery model.
   Preserve actor, Lead/accepted-receipt IDs, before/after state, timestamp,
   correlation, and outcome; do not copy inquiry body or Contact data into
   general telemetry. Follow the OPS audit-equivalence contract and prove
   write failure rollback, replay, and independent readback.
5. Build a reference-only internal notice after the accepted receipt, with
   `productions@jmerrill.one` derived from governed sender/routing authority.
   Keep the private body out of email and alerts. Prove caller grant,
   idempotency, bounded retry, terminal alert, transport readback, and owner
   work-item visibility. A mailbox test alone is not notice commissioning.

## Cross-owner acceptance and cutover

OPS owns the exact non-admin principal, team/role, app share, existing per-app
capacity allocation, and allow/deny/revoke proof after ONE returns the app
identity. Productions owns public form, action semantics, business follow-up,
and the cutover decision. ONE owns the receipt/Lead producer and reviewer
runtime; the shared communications owner owns relay transport authority.

Use synthetic records first. Require own Lead allow, other-brand Lead and
unrelated Activity denial, revoked-team denial, replay, failure recovery,
reference-only notice, and audit readback. Keep email/phone public continuity;
do not enable the form, message a client, or count a synthetic acceptance as
follow-up until all owning gates pass.
