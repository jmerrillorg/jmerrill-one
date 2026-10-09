# JSJ inquiry reviewer form

JM1-Core owns the Dataverse form for `jm1_jsjinquiry`; Jackie Smith Jr. owns
the business review and follow-up. The JSJ website owns the reference-only
notice and record link. This form change does not delegate founder judgment or
send a customer reply.

The guarded `scripts/ensure-jsj-inquiry-review-form.mjs` script targets the
existing active main form `d04a3990-b6d3-46c6-a351-4024f45c39a9`. Its
default mode reads and validates the live baseline. `--apply` adds contact
name, email, inquiry type, message, received time, and delivery state as
read-only controls, plus an editable `Closed at` control. It refuses an
unrecognized form layout or changed row version, publishes only the JSJ
entity, and reads back the published XML. `--restore` removes exactly these
rows only when the form still matches this governed change.

The read-only controls prevent casual edits in the form; they are not a field
security boundary. The `JSJ Inquiry Reviewer` table role remains narrow
Read/Write, while Jackie's inherited platform administrator privileges remain
a governance residual. The form must be opened with Jackie's own sign-in and
an actual synthetic reviewed and saved before claiming human review proof.
Closing a row records completion of the inquiry workflow only after Jackie
has made and carried out the appropriate follow-up decision. It does not
itself prove an email reply, booking, or service delivery.

The direct record route is:

`https://jm1hq.crm.dynamics.com/main.aspx?etn=jm1_jsjinquiry&pagetype=entityrecord&id=%7B<row-guid>%7D`

The JSJ owner notice should supply that URL for each accepted receipt. The
notice must not contain the inquiry body. On rollback, restore the prior form
only after preserving accepted receipts and a usable Jackie review path;
do not delete or close a real inquiry as a technical test.

## Recorded disposition

The table also carries a bounded disposition, decision maker, optional actual
decision time, decision source, recording actor, and recording time. The guarded
review form displays these fields read-only. `record-jsj-inquiry-disposition.mjs`
accepts an exact row ID and reference, checks that the delivered inquiry is
open and undispositioned, and uses its current ETag for a single-row update.
The only supported outcome in this packet is `JUNK`; it sets `Closed at` to the
recording time without claiming the founder personally operated the form or
that a customer was answered. Its default mode is read-only. Source and actor
are required, and an unknown decision time stays null.
The form `--restore` operation rolls back only the new disposition display
fields, retaining the original inquiry review fields.

These fields inherit the JSJ inquiry's existing 12-month-after-closure deletion
rule and hold/transfer exceptions. They do not form an immutable audit log:
JM1-Core organization-wide auditing is not enabled, and this change does not
expand it. Record the before/after row version and precise decision provenance
in packet evidence; later administrator edits remain a governance residual.
