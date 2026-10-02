# JSJ inquiry store readiness

Packet: `JSJ-PRODUCTION-HARDENING-001`

## Authority and boundary

JM1-Core owns the proposed `jm1_jsjinquiry` table. JSJ owns the business meaning and 12-month post-closure retention rule. The public contact form remains on FormSubmit until a JSJ-authorized, brand-scoped delivery transport and the complete production path are proven. The JM1 shared mail relay is not authorized by this packet.

`scripts/ensure-jsj-inquiry-table.mjs` is read-only by default. `--apply` creates the user-owned table, one 5,000-character message column, state fields, and a unique submission key. Do not enable JSJ's endpoint until the alternate key is `Active`, the security roles are proven, and the runtime has a managed identity. A migration PR is not deployment proof.

## Required access proof

- Jackie Smith Jr. (`jackie@jmerrill.one`): initial human reviewer and follow-up owner. Verify effective read and update on JSJ inquiry rows.
- JM1 administrators: break-glass access, with audit and role governance. Existing System Administrator access must be acknowledged, not mistaken for a JSJ-specific role.
- JSJ App Service managed identity: application user with create/read/update only on the JSJ table and no cross-brand table access. Do not grant System Administrator or broad environment roles.
- Cross-brand negative test: use the JSJ application identity to attempt reads of a non-JSJ business table and confirm denial. Also confirm another brand's application identity cannot read `jm1_jsjinquiry`.

No application identity or role was provisioned by this migration script. These are deployment preconditions, not inferred results.

## Live access readback, 2026-10-02

The JSJ App Service now has a system-assigned managed identity. Its JM1-Core application user `bc73ca60-91be-f111-aaaf-00224820105b` has exactly one assigned role, `JSJ Inquiry Service`, and that role has only organization-depth Create, Read, Write, and Delete privileges on `jm1_JSJInquiry`. A token obtained inside the production App Service returned HTTP 200 for an empty JSJ inquiry read, HTTP 403 for Contact, and HTTP 403 for the enterprise execution log. This proves the JSJ identity cannot read those two cross-brand tables. It does not prove reciprocal denial for every other enterprise service identity.

JM1-Core created the table with an active unique submission key and a `jm1_message` Memo field with `MaxLength=5000`. Production row count was zero at readback. System Customizer access to the new table was removed. The built-in Support User role (`accessmode=3`) and Microsoft `AuthorizationCore` Service Reader/Writer/Deleter roles retain table privileges; Dataverse rejected changes to those managed roles. Their observed assignees were non-interactive application users, not ordinary human reviewers. This is a platform-reserved access exception, not strict cross-brand isolation, and must remain visible in privacy/security review. No synthetic inquiry has been sent.

## Retention

An inquiry is eligible for physical Dataverse row deletion 12 calendar months after `jm1_closedat` only when `jm1_retentionhold`, `jm1_transferredat`, and `jm1_authoritativerecord` are all empty. A transfer or hold must be recorded before the due date. `scripts/reconcile-jsj-inquiry-retention.mjs` dry-runs by default and deletes eligible rows only with `--apply`. A scheduled system-owned run, deletion readback, failure alert, and hold/transfer tests are still required before commissioning. Purview policy alone does not delete Dataverse rows.

## Capacity and license readback

Power Platform licensing API readback on 2026-10-02: tenant database capacity `37,436 MB`, actual use `2,697.5544 MB` as of 2026-10-01 18:14 UTC, status `Available`. JM1-Core database consumption was `1,249.308 MB` as of 2026-10-02 15:40 UTC. JM1-Core has enabled Azure pay-as-you-go billing policy `JM1CorePayGo2025`; its Database entitlement response showed pay-as-you-go consumption `0 MB` at that snapshot. The new table will consume database capacity and API requests, but its incremental usage and billed amount cannot be measured before deployment and traffic. No `$0` claim is made. Jackie reviewer licensing must be confirmed against her assigned license and access path; Dataverse application users are non-interactive but their role scope still requires proof.

## Commissioning gates

1. Review and apply schema, then read back all columns and active alternate key.
2. Prove Jackie-only human review, admin break-glass, JSJ service role, and cross-brand denial.
3. Establish a JSJ-authorized delivery route with sender-scoped enforcement. Direct resource-wide ACS write access does not meet this boundary.
4. Prove bounded retry, reconciliation, owner follow-through, physical retention deletion, mailbox delivery, operational alert, and rollback preserving accepted receipts.
5. Run a controlled non-sensitive production synthetic only after access and transport preflight. Read back Dataverse and destination, then switch the public form through the JSJ review/deployment workflow.
