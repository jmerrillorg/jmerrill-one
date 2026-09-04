# 18 Platform API Path Inventory

Date: 2026-08-28

## Facebook Pages

- First-party API path: Meta Graph API / Pages API.
- Required app registration: JM1-owned Meta developer app with Facebook Login for Business or current equivalent configured for Page publishing.
- Required permissions/scopes: `pages_manage_posts` for publishing, plus Page/account read permissions required for destination discovery and verification.
- Token model: OAuth user/system-user flow resulting in Page access tokens for owned Pages.
- Refresh/lifetime behavior: must be documented from the final token flow selected in Meta Business settings; long-lived token custody belongs in Azure Key Vault, not source control.
- Ownership requirement: Page must be owned/administered by the JM1 Business portfolio and available to the app/system user.
- Media upload flow: upload exact approved image/video asset to the Page media endpoint, record returned media/post IDs, and do not transform the file.
- Publishing endpoint: Page feed/posts/photos endpoints under the explicit Graph API version.
- Scheduling support: use JM1-owned delayed execution from Dataverse schedule unless native endpoint scheduling is intentionally selected and recorded.
- Rate limits: enforce adapter-level rate/backoff handling from platform response headers/errors.
- Review/approval: app permissions and business verification may require Meta review before production access.
- Status: HOLD - no JM1-owned app credential/token proof is currently recorded.

## Instagram Business/Creator

- First-party API path: Instagram Graph API / Meta Graph API content publishing.
- Required app registration: JM1-owned Meta developer app connected to the Instagram professional account through the owning Facebook Page/Business portfolio.
- Required permissions/scopes: Instagram content publishing permission plus account/page read permissions needed to resolve the IG user and owning Page.
- Token model: OAuth user/system-user flow authorized for the connected Facebook Page and Instagram professional account.
- Refresh/lifetime behavior: must be documented from the final Meta token flow; long-lived token custody belongs in Azure Key Vault.
- Ownership requirement: Instagram account must be Business or Creator and linked to the correct Facebook Page/Business assets.
- Media upload flow: create media container from the exact approved asset reference, verify processing where required, then publish the container.
- Publishing endpoint: `/{ig-user-id}/media` then `/{ig-user-id}/media_publish` under the explicit Graph API version.
- Scheduling support: JM1-owned delayed execution from Dataverse schedule; do not rely on Sintra/Soshie as execution authority.
- Rate limits: enforce adapter-level rate/backoff handling from platform response headers/errors.
- Review/approval: Meta app permissions and business verification may require review before production access.
- Status: HOLD - Financial IG asset exists, but Page-to-IG connection and JM1-owned API credential proof are not complete.

## LinkedIn Organization Pages

- First-party API path: LinkedIn organization/community-management Posts API.
- Required app registration: JM1-owned LinkedIn developer application with the required products enabled.
- Required permissions/scopes: `w_organization_social` for organization publishing and `r_organization_social` for readback, subject to LinkedIn product access and organization role requirements.
- Token model: OAuth member authorization by a LinkedIn member who has an eligible admin/content role on the target organization.
- Refresh/lifetime behavior: must be documented after LinkedIn app/product approval; store token material in Azure Key Vault.
- Ownership requirement: authenticated member must administer or have eligible content role on the organization Page.
- Media upload flow: upload image/video/document through LinkedIn media APIs to obtain URNs, then reference those URNs in the Posts API payload.
- Publishing endpoint: `POST https://api.linkedin.com/rest/posts` with `Linkedin-Version` and `X-Restli-Protocol-Version` headers.
- Scheduling support: no durable JM1 scheduling should depend on browser UI; use Dataverse scheduled execution and post at execution time unless LinkedIn-approved native scheduling is explicitly available.
- Rate limits: enforce adapter-level rate/backoff handling from LinkedIn API responses.
- Review/approval: LinkedIn API product access may require external review; do not assume it is automatically granted.
- Status: HOLD - J Merrill Financial organization Page exists, but LinkedIn API product/permission access is not yet proven.

## Separation Of Authority

- SINTRA CONNECTION = Sintra-authorized access to social accounts.
- JM1 API CONNECTION = JM1-owned application credentials, token custody, platform API authority, execution logs, post IDs, and Dataverse readback.

These are not interchangeable and must not be conflated in evidence.
