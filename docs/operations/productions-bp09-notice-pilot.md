# Productions BP-09 Notice Pilot

Owner: J Merrill One intake Function. This is an internal synthetic pilot, not approval to reopen the Productions public form or assign an inquiry operator. Source authority is OPS PR #269; the restricted relay is Publishing PR #924 at release `f139497c9fed2ccd81e463b04431f1050f6fba4c`.

The existing `websiteIntakeReconciliationTimer` is off by default. It accepts only one explicitly configured receipt:

- `JM1_PRODUCTIONS_BP09_NOTICE_MODE=off|probe|send|replay` (default `off`).
- `JM1_PRODUCTIONS_BP09_NOTICE_RECEIPT_ID=<existing eligible synthetic receipt GUID>`.

Use `probe` first. It reads the completed BP-09 receipt and exact Contact/Lead binding, then calls the relay's no-send authority probe using the Function's system-assigned managed identity. It must return the expected caller, brand, template, recipient, reference and derived idempotency key. No ledger reservation or email results from this mode.

Before `send`, read the relay ledger for the selected receipt and confirm no accepted or ambiguous prior notice. Change only the mode to `send` through approved runtime configuration. The Function persists an `ATTEMPTING` notice state on the existing receipt before invoking the relay. Exact replay uses the relay-derived key `bp09:productions:notice:<receiptId>`; transport uncertainty and conflicts become `HELD`, without a new key or blind resend. Provider acceptance persists both relay and provider message IDs, but is not mailbox delivery or human follow-up. A failed final receipt write can be retried with the same payload after the bounded wait. The third preserved receipt, whose channel is `jmerrill.one/contact`, is ineligible and must not be repaired for this pilot.

Acceptance requires readback of the unchanged receipt/Lead/Contact, the relay ledger and provider IDs, one destination-mailbox message with the same synthetic reference, exact replay with no second message, and an alertable failure signal. Do not put an inquiry body, personal details or message content in logs or email. Return mode to `off` after the bounded pilot, preserving all receipt and relay evidence. A `HELD` state requires transport-owner reconciliation; never clear it to force another send.

`replay` is a one-time verification mode only after `PROVIDER_ACCEPTED` is saved. It probes authority again, sends the same relay payload/key, and requires an accepted replay with the same durable IDs. It cannot initiate a first notice. Turn it off after ledger and mailbox counts confirm no second provider effect.
