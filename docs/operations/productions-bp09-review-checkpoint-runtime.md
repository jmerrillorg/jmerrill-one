# Productions BP-09 Review Checkpoint Runtime

Business deadline and customer-facing policy remain owned by J Merrill Productions. This note records the shared runtime contract and access boundary; the Productions inquiry policy is the business source of truth.

## Data and action contract

- Checkpoint v2 is stored on the exact team-owned Lead in secured field `jm1_bp09reviewcheckpoint`; it is not a second checkpoint table or a copy of inquiry text.
- The existing intake path captures the BP-09 receipt's `receivedAt` in immutable Lead field `jm1_bp09receivedat`. The Function timer initializes and updates checkpoint state separately in `jm1_bp09reviewcheckpoint` using its managed identity. The timer does not read `jm1_executionlog.jm1_actiondescription`, which contains inquiry data.
- The existing `jm1_productionsinquiryaction` table is the review-action authority. It is OrganizationOwned and contains no inquiry body. The adapter selects only its action/actor/correlation fields and `createdon`/`createdby` metadata.
- An accepted review is exactly `jm1_actionid=ACCEPT_FOR_FOLLOW_UP`, `jm1_outcome=ACCEPTED`, `jm1_before=NEW`, `jm1_after=FOLLOW_UP_REQUIRED`, bound to exact `jm1_receiptid` and `jm1_leadid`.
- Decision actor is `jm1_actorid` (Dataverse system-user ID) plus `jm1_actorobjectid` (Entra object ID). Recording actor is `createdby`; the timer never substitutes one for the other. The action row GUID is the checkpoint decision ID, and `jm1_key` is the action idempotency key. The production reviewer UI uses the receipt ID as its stable key.
- A checkpoint advances monotonically `PENDING -> OVERDUE -> RESOLVED`. A reviewer correction is not an automatic reversal: action evidence is re-read, and a changed/missing/ambiguous audit yields `CHECKPOINT_DECISION_DRIFT` or `CHECKPOINT_ACTION_AMBIGUOUS` while preserving the resolved snapshot for human reconciliation. The action table is read-only to the runtime.

## Alert and execution contract

- Overdue and resolution notifications have separate durable states on the Lead, stable event IDs, bounded retry metadata, and opaque receipt/Lead IDs only. No inquiry contents, contact details, or names enter a notification payload or timer telemetry.
- `PROVIDER_ACCEPTED` is not `DELIVERED`. Unknown sends are not replayed. Recovery resends only after a status lookup proves the stable event ID was not accepted. The current relay lacks the required PRD templates and delivery-status readback, so production sending stays gated.
- The evaluator is wired into the existing `websiteIntakeReconciliationTimer` under `JM1_PRODUCTIONS_BP09_REVIEW_CHECKPOINT_MODE=continuous`; default is `off`. No new timer, producer, relay, or recurring operator process is introduced.
- The Function uses only its system-assigned managed identity for this feature. The existing client-credential Dataverse principal is explicitly not used.

## Least-privilege matrix

| Resource | Required runtime access | Depth / boundary | Not required |
| --- | --- | --- | --- |
| Lead | Read candidate projection; update secured `jm1_bp09reviewcheckpoint` only | Basic/user depth on Leads owned by `JM1 Productions BP09 Inquiry Review`; matching field-security profile grants read/update for the checkpoint field | Create/delete Leads, status changes, Contacts, Accounts, message-body reads |
| `jm1_productionsinquiryaction` | Read exact receipt/Lead-bound action evidence | Organization depth because the table is OrganizationOwned; the table is PRD action metadata only | Create/update/delete action rows |
| `jm1_executionlog` | None for checkpoint evaluation | None | Read or write receipt descriptions/message bodies |
| `jm1_ProductionsReviewPermit` | None for timer work | The reviewer Custom API separately uses its existing execute privilege | Runtime execution of the reviewer action |

Production metadata readback on 2026-10-09: Lead is UserOwned; `jm1_executionlog` is UserOwned; `jm1_productionsinquiryaction` is OrganizationOwned. Lead currently has `jm1_bp09intakereceiptid` but neither `jm1_bp09receivedat` nor `jm1_bp09reviewcheckpoint`; both fields are schema-release prerequisites. The dedicated human reviewer role currently has `prvReadLead` at Basic depth and `prvReadjm1_ProductionsReviewPermit` at Global depth. That role is not the runtime grant. The Function managed identity has no production Dataverse app-user record.

The runtime grant must be a dedicated app-user/team assignment matching the matrix above. Validate effective team membership, inherited roles, privilege depths, secured-field access, and cross-brand denial before enabling the mode. Do not reuse the client-credential System Administrator principal.
