# JSJ inquiry review action

JM1-Core hosts the Jackie Smith Jr. reviewer form and the bounded
`jm1_ReviewJSJInquiry` Custom API. JSJ owns the review semantics and customer
follow-up. This does not change the public contact route, send a message,
book a service, invoice, or collect payment.

The API accepts only the exact active Jackie reviewer system user and Entra
object ID. It derives the actor and UTC time from Dataverse execution context,
checks the exact JSJ row ID, reference, owner, delivery state, and row version,
then makes one optimistic-concurrency update. The same key and payload replay
returns `REPLAY`; reuse of a key with changed content fails. An update-step
guard rejects direct writes to the review, closure, and action-history fields
outside this API. Platform-administrator override and plug-in removal remain
residual governance risks, not immutable auditing.

The inquiry row retains its original receipt and message. New fields hold
current next action, due time, reported external reference, and a bounded
body-free review-action history. They share the existing JSJ inquiry deletion
rule: 12 calendar months after closure, unless a hold or authoritative-record
transfer is present. An ordinary communication/booking reference is **not**
written to `jm1_authoritativerecord`, because that field excludes a row from
the retention job. No FIN or Productions audit table or retention policy is
reused.

Supported actions:

- `WAIT` and `DEFER` require a future due time and next action and keep the
  inquiry open.
- `FOLLOWUP_REPORTED` requires a communication or booking record reference,
  plus a next action and future due time.
  This records Jackie's report and the reference; it does not establish that a
  message was delivered or a booking completed.
- `CLOSE_NO_FURTHER_ACTION` requires an explicit reason and closes the review
  without asserting customer contact.
- `CORRECT` targets the latest action key, requires a reason, appends a new
  history entry, and can reopen the row. It never overwrites receipt fields.

The embedded HTML web resource is part of the existing authenticated JSJ
inquiry form. It receives only the row identity, reads the row via the signed-in
Dataverse session, and invokes the API. It does not display or email the
message body. The original `Closed at` field becomes read-only to route
ordinary closure through the action. The form, Custom API, guard, and new
columns are JSJ-scoped changes in the ONE-owned JM1-Core solution.

Release sequence: merge source after build/tests; create the four columns;
register the assembly and Custom API; publish the guarded web resource/form;
exercise synthetic allow/deny, stale-version, changed-key/replay, correction,
and no-wrong-record tests; then activate the Update guard and rerun those
tests. Release the JSJ due-aware owner-wait check only after its Dataverse
column exists. A genuine inquiry must not be changed for acceptance.

Jackie's personal click on one controlled synthetic remains a distinct human
acceptance step. Administrator `CallerObjectId` impersonation is not that
click. Neither synthetic nor saved disposition proves customer response or
service completion.
