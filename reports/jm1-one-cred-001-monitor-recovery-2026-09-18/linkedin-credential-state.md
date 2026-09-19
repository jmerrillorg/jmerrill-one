# LinkedIn Credential State

- Access token: `NOT_ISSUED`.
- Autonomous execution: blocked externally.
- Product state: `COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING`.
- OAuth state secret: present.
- Organization publisher access token: absent.
- Nullable issued, expiration, and rotation dates: stored as null.
- Natural-run Dataverse state: `NOT_ISSUED`.
- Exception code: `LINKEDIN_CREDENTIAL_NOT_ISSUED_PRODUCT_REVIEW_PENDING`.

Absence of the access token is a governed lifecycle state, not a monitor failure. No LinkedIn authorization or publishing was attempted.
