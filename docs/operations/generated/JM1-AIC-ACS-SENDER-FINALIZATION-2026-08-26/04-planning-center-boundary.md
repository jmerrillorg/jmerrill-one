# Planning Center Boundary

Last verified: 2026-08-26T23:16:24Z

AIC uses the shared JM1 ACS relay for outbound transport identity only.

Planning Center remains the ministry, event, service, registration, and participant context authority.

ACS sender policy must never be treated as authority for:

- ministry participation;
- event registration;
- service attendance;
- volunteer assignment;
- pastoral care facts;
- family or household relationships;
- giving records.

Runtime guard:

`planningCenterAsSenderAuthority = true`

must fail closed with:

`ACS_PLANNING_CENTER_AUTHORITY_MISMATCH`

Relationship-context conflict:

`relationshipContextValid = false`

must fail closed with:

`ACS_RELATIONSHIP_CONTEXT_MISMATCH`

No Planning Center write, mutation, campaign activation, or message send was performed under this pass.
