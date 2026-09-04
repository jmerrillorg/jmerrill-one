# 815 - JM1 LinkedIn Activation Readiness

Generated: 2026-09-04T13:03:00Z

## Classification

`LINKEDIN_FOUNDER_ACTION_REQUIRED`

Exact action: confirm/save the LinkedIn Developer app privacy URL and OAuth redirect URL, then resolve or classify the business-email notice from the authenticated Founder/admin LinkedIn Developer session.

This package does **not** claim `LINKEDIN_EXTERNAL_REVIEW_ONLY - ALL JM1 PREREQUISITES COMPLETE` because the LinkedIn portal saved URL configuration and business-email notice were not reliably completed/read back in the current browser session.

## 1. Live Product Review State

- App: `JM1 Organization Publisher`
- App URL ID: `266134085`
- Client ID: `78hqh0jqrb4y06`
- Organization: `J Merrill Publishing, Inc.`
- Organization ID: `13048648`
- Product: Community Management API
- Runtime state: `COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING`
- Previously observed portal state: Review in progress

## 2. Privacy URL Deployment

- URL: `https://jmerrill.one/privacy`
- HTTP status: `200`
- Production hostname: `jmerrill.one`
- Deployed commit: `2881b0424950f8b98a95be3d251a1c5e3840ed31`
- Privacy surface: enterprise JM1 privacy page, not a LinkedIn-only legal island.

## 3. OAuth Callback Deployment

- Callback URL: `https://jmerrill.one/api/linkedin/oauth/callback`
- Ready probe: `200`, `LINKEDIN_OAUTH_CALLBACK_READY`
- Bad-state probe: `400`, `LINKEDIN_OAUTH_STATE_VALIDATION_FAILED`
- OAuth start route: `307` redirect to LinkedIn authorization with signed state.
- Deployment run: `33874179290`
- Deployment status ID: `edb56860-fe63-45ff-a081-1030e2712441`

## 4. LinkedIn App Saved URL Configuration

Required values:

- Privacy policy URL: `https://jmerrill.one/privacy`
- OAuth redirect URL: `https://jmerrill.one/api/linkedin/oauth/callback`

State: `FOUNDER_ACTION_TIME_CONFIRMATION_REQUIRED_BEFORE_PERSISTENT_LINKEDIN_DEVELOPER_SAVE`

Reason: saving these fields changes persistent LinkedIn Developer app configuration. Cody requested action-time confirmation and did not receive it before this evidence package.

## 5. Business Email Notice

State: `LINKEDIN_BUSINESS_EMAIL_FOUNDER_ACTION_REQUIRED`

Exact action: inspect the authenticated LinkedIn Developer app Settings notice and confirm whether LinkedIn permits saving/verifying `jm1-admin@jmerrill.one`; complete any Founder identity or email-verification step LinkedIn requires.

## 6. App/Page/Org Association

- App is associated to `J Merrill Publishing, Inc.`
- Organization ID is `13048648`
- Runtime verification state is `VERIFIED_WITH_PUBLISHING_PAGE`
- Scope boundary remains Publishing only.

## 7. Community Management Review Completeness

Known state: `PENDING_LINKEDIN_REVIEW`

No currently actionable review feedback was observed in the prior portal readback. Current portal refresh was not reliable because Microsoft Edge did not focus in the desktop capture.

## 8. OAuth Runtime Readiness

- Client ID configured.
- Organization ID configured.
- Callback route deployed.
- OAuth start route deployed.
- HMAC-signed expiring state/CSRF protection deployed.
- Authorization code and tokens are not logged.
- Token exchange remains held until LinkedIn product approval and governed client-secret storage.

## 9. Key Vault Contract

- Vault: `jm1-core-vault`
- OAuth state secret reference: `jm1-core-vault/JM1-LINKEDIN-ORGANIZATION-PUBLISHER-OAUTH-STATE-SECRET`
- Client secret reference: `jm1-core-vault/JM1-LINKEDIN-ORGANIZATION-PUBLISHER-CLIENT-SECRET`
- Access token reference: `jm1-core-vault/JM1-LINKEDIN-ORGANIZATION-PUBLISHER-ACCESS-TOKEN`
- Secret values recorded in evidence: `false`

## 10. LinkedIn Adapter State

- Organization image-post adapter: implemented.
- Dataverse Social Execution worker wiring: implemented.
- Idempotency/reconciliation protections: regression pass.
- API version: `202608`, configuration-controlled by `JM1_LINKEDIN_API_VERSION`.
- Autonomous execution: `false`.

## 11. Azure Configuration

Production web app:

- `JM1_LINKEDIN_CLIENT_ID` configured.
- `JM1_LINKEDIN_ORGANIZATION_ID=13048648`.
- `JM1_LINKEDIN_REDIRECT_URI=https://jmerrill.one/api/linkedin/oauth/callback`.
- `JM1_LINKEDIN_OAUTH_SCOPES=w_organization_social r_organization_social`.
- OAuth state secret uses a Key Vault reference.

Function App:

- App: `func-jm1-marketing-runtime`
- State: Running
- HTTPS only: true
- Timers visible: 4
- `JM1_LINKEDIN_AUTONOMOUS_EXECUTION_ENABLED=false`
- `JM1_LINKEDIN_PRODUCT_STATE=COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING`

## 12. LinkedIn Row Hold State

Latest observed social worker tick: `2026-09-04T13:00:01.9737987Z`

- LinkedIn rows: `4`
- Hold state: `COMMUNITY_MANAGEMENT_PRODUCT_REVIEW_PENDING`
- LinkedIn autonomous execution: `false`
- Platform objects created: `0`
- Browser execution: `0`
- Meta Business Suite UI publishing: `false`
- Sintra publishing: `false`
- LinkedIn native UI publishing: `false`

## 13. Regression Results

- `npm --prefix runtime/jm1-marketing-autonomous-functions run check`: PASS
- `npm --prefix runtime/jm1-marketing-autonomous-functions run test:linkedin-runtime`: 7 passed, 0 failed
- `npm --prefix runtime/jm1-marketing-autonomous-functions run test:marketing-os`: 10 passed, 0 failed
- GitHub production build/deploy: PASS

## 14. Local Toolchain Classification

`LOCAL_TOOLCHAIN_ALIGNMENT_REQUIRED`

The repository expects Node `>=24` and npm `>=11`. The current local shell reports Node `v22.23.1` and npm `10.9.8`. Production validation used GitHub Actions Node `24.20.0` and npm `11.19.0`.

Local Next docs referenced by `AGENTS.md` were unavailable because root dependencies were not installed locally.

## Final LinkedIn Classification

`LINKEDIN_FOUNDER_ACTION_REQUIRED - confirm/save LinkedIn Developer app privacy URL and OAuth redirect URL; inspect/resolve business-email notice`

