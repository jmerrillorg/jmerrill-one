# Productions BP-09 Notice Pilot

Owner: J Merrill One intake Function. This is an internal synthetic pilot, not approval to reopen the Productions public form or assign an inquiry operator. Source authority is OPS PR #269; the restricted relay is Publishing PR #924 at release `f139497c9fed2ccd81e463b04431f1050f6fba4c`.

The existing `websiteIntakeReconciliationTimer` is off by default. It accepts only one explicitly configured receipt:

- `JM1_PRODUCTIONS_BP09_NOTICE_MODE=off|probe|send|replay` (default `off`).
- `JM1_PRODUCTIONS_BP09_NOTICE_RECEIPT_ID=<existing eligible synthetic receipt GUID>`.

Use `probe` first. It reads the completed BP-09 receipt and exact Contact/Lead binding, then calls the relay's no-send authority probe using the Function's system-assigned managed identity. It must return the expected caller, brand, template, recipient, reference and derived idempotency key. No ledger reservation or email results from this mode.

Before `send`, read the relay ledger for the selected receipt and confirm no accepted or ambiguous prior notice. Change only the mode to `send` through approved runtime configuration. The Function persists an `ATTEMPTING` notice state on the existing receipt before invoking the relay. Exact replay uses the relay-derived key `bp09:productions:notice:<receiptId>`; transport uncertainty and conflicts become `HELD`, without a new key or blind resend. Provider acceptance persists both relay and provider message IDs, but is not mailbox delivery or human follow-up. A failed final receipt write can be retried with the same payload after the bounded wait. The third preserved receipt, whose channel is `jmerrill.one/contact`, is ineligible and must not be repaired for this pilot.

Acceptance requires readback of the unchanged receipt/Lead/Contact, the relay ledger and provider IDs, one destination-mailbox message with the same synthetic reference, exact replay with no second message, and an alertable failure signal. Do not put an inquiry body, personal details or message content in logs or email. Return mode to `off` after the bounded pilot, preserving all receipt and relay evidence. A `HELD` state requires transport-owner reconciliation; never clear it to force another send.

`replay` is a one-time verification mode only after `PROVIDER_ACCEPTED` is saved. It probes authority again, records `ATTEMPTING` before the same relay payload/key, and requires an accepted replay with the same durable IDs. A mismatch or uncertain result is held and cannot be automatically retried. It cannot initiate a first notice. Turn it off after ledger and mailbox counts confirm no second provider effect.

## Continuous mode after approved cutover

The founder-approved Productions inquiry operator is Jackie Smith Jr.; `productions@jmerrill.one` remains the internal notification inbox. The approved business retention rule is in Productions' `reports/prd-bp09-inquiry-record-policy.md`. This mode is separate from the one-receipt pilot and remains off until ordinary reviewer access and synthetic acceptance pass.

- ONE intake can bind future Productions Leads to the dedicated reviewer team with `JM1_PRODUCTIONS_FOLLOWUP_TEAM_ID`. The existing `JM1_PRODUCTIONS_FOLLOWUP_OWNER_ID` remains a compatibility fallback until a governed team cutover. A same-key retry after a configuration change resolves to the original receipt and original owner only when the complete visitor payload matches; changed content remains a conflict. Never reassign older Leads by configuration inference.
- Set `JM1_PRODUCTIONS_BP09_NOTICE_MODE=continuous` and `JM1_PRODUCTIONS_BP09_NOTICE_START_AT=<exact UTC ISO timestamp>` through governed Function configuration. The start timestamp is the cutover boundary; never backdate it to force notices for the three preserved synthetic receipts. Remove the one-receipt pilot ID after readback.
- Every timer pass scans completed BP-09 receipts accepted after that timestamp, in Dataverse pages. It skips other brands, older receipts, and accepted notices. Each eligible notice re-verifies response consent, source, digest, unique Lead/Contact relationship, and relay authority before sending the opaque-reference template. The relay's receipt-derived key prevents a second provider effect on exact replay.
- Held or overdue notices and invalid bindings appear by opaque receipt ID and code in the timer's failure signal. Scan capacity overflow and invalid configuration fail closed rather than silently omitting receipts. An uncertain send remains held for transport-owner reconciliation; do not clear it blindly.
- At commissioning, read back a fresh synthetic receipt, exactly one Lead, relay/provider IDs, destination mailbox receipt, exact replay count, and a deliberate failure/retry test. Provider acceptance alone is not mailbox proof. Keep `off` and the public email/phone route if any of these fail.
