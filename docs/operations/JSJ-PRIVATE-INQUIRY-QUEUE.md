# JSJ private inquiry queue

Owner: Jackie Smith Jr. The queue is a JM1-Core HTML web resource, not another
inquiry store. It reads `jm1_jsjinquiries` through the signed-in Dataverse
session and refuses to query unless the current system user is the existing
Jackie JSJ reviewer. JM1 administrators retain their separate platform
break-glass access; this queue does not grant or revoke it.

Private URL: `https://jm1hq.crm.dynamics.com/main.aspx?pagetype=webresource&webresourceName=jm1_jsj_inquiry_queue.html`

The Open, Overdue, and Completed views are calculated on every successful
refresh. Overdue means an open row passed its explicit review due time, or,
without one, 24 hours since receipt. This matches the JSJ contact-health
policy. Exact sender-address and message matches appear together but remain
separate receipts. The interface does not classify spam, send mail, book a
service, or change records when opened. It renders all submitted text through
`textContent` and does not log message bodies.

Each record opens the existing authenticated JM1-Core reviewer form. There,
Dismiss means `CLOSE_NO_FURTHER_ACTION` with a reason; Follow up means `WAIT`
with an intended next action and future due time; Keep open means `WAIT` or
`DEFER` with a next action and future due time. Follow up does **not** send a
message. That form's `jm1_ReviewJSJInquiry` API supplies actor attribution,
idempotent replay, stale-version rejection, and body-free history. This queue
does not invoke the API itself or preselect a decision.

Deploy after protected merge and validation with
`node scripts/ensure-jsj-inquiry-queue.mjs --apply` under the existing
JM1-Core authority. The script publishes and verifies the exact source bytes.
Run without `--apply` for readback. Rollback may remove or replace this web
resource without altering any inquiry or review history. Confirm access in
Jackie's own sign-in and denial for another account before calling the human
review experience accepted; an administrator-delegated test is not that proof.
