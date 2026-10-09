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
