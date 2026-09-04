# JM1-LINKEDIN-RUNTIME-FINALIZATION-v1

Generated: 2026-09-04T02:42:56Z

## Classification

LINKEDIN API PRODUCT REVIEW PENDING - JM1 ADAPTER AND WEB PREREQUISITES PREPARED IN SOURCE; LIVE DEPLOYMENT AND LINKEDIN PORTAL SETTINGS STILL REQUIRED

## Live LinkedIn State

- App: JM1 Organization Publisher
- Client ID: 78hqh0jqrb4y06
- App URL ID: 266134085
- Organization: J Merrill Publishing, Inc.
- Organization ID: 13048648
- Company verification: verified with Publishing Page, observed Sep 2, 2026
- Product: Community Management API, Development Tier
- Product status: Review in progress
- OAuth scopes visible: none
- Authorized redirect URLs visible: none
- Privacy policy URL visible: none
- Business email update notice: visible

## JM1-Controlled Work Completed In Source

- Added public privacy policy route: `app/privacy/page.tsx`
- Added LinkedIn OAuth callback readiness route: `app/api/linkedin/oauth/callback/route.ts`
- Added LinkedIn config placeholders and secret reference metadata in `runtime/jm1-marketing-autonomous-functions/src/lib/config.js`
- Implemented LinkedIn organization image post adapter in `runtime/jm1-marketing-autonomous-functions/src/lib/linkedin.js`
- Wired LinkedIn rows into the autonomous social execution worker with the execution flag still held
- Added offline LinkedIn runtime regression coverage

## Runtime Semantics

The LinkedIn adapter is built around the current LinkedIn REST flow:

1. Verify configured app, product, scopes, token, and organization authority.
2. Fetch the exact approved image asset without transformation.
3. Initialize image upload and upload the exact binary.
4. Create a LinkedIn organization post through `/rest/posts`.
5. Capture `x-restli-id`.
6. Read back the post.
7. Compare destination, caption, media URN, and visibility.
8. Update Dataverse.

Idempotency now covers already-certified LinkedIn rows, active claim leases, stale claim recovery, post-create Dataverse write recovery, and duplicate readback refusal.

## Validation

- PASS: `npm --prefix runtime/jm1-marketing-autonomous-functions run check`
- PASS: `npm --prefix runtime/jm1-marketing-autonomous-functions run test:linkedin-runtime`
- PASS: `npm --prefix runtime/jm1-marketing-autonomous-functions run test:marketing-os`

Root lint was not rerun after this slice because the root install is absent locally and the workspace metadata requires Node >=24/npm >=11 while the local shell reports Node 22/npm 10.

## External Boundary

LinkedIn live execution cannot be certified yet because Community Management API remains in review and no OAuth scopes are visible in the app. The following JM1-controlled actions remain before the boundary can be classified as external-review-only:

- Deploy `https://jmerrill.one/privacy`
- Deploy `https://jmerrill.one/api/linkedin/oauth/callback`
- Save the privacy policy URL in LinkedIn Developer settings
- Save the OAuth redirect URL in LinkedIn Developer auth settings
- Resolve or document the business email update notice

After those settings are live and saved, the remaining product approval is LinkedIn-controlled. OAuth token exchange, Key Vault storage, live canary, readback, idempotency, and autonomous LinkedIn enablement remain blocked until LinkedIn approval and scopes are available.

## References

- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-08
- LinkedIn Images API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api?view=li-lms-2026-08
- LinkedIn Organization Access Control: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-access-control-by-role?view=li-lms-2026-08
- LinkedIn Increasing Access: https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access?view=li-lms-2026-08
