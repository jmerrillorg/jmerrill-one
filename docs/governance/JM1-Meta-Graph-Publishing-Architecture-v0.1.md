# JM1 Social API Publishing Architecture v0.2

Status: implementation foundation, LinkedIn page creation certified
Date: 2026-08-28
Authority: Founder implementation instruction, JM1 Microsoft-first governance

## Operating Model

Dataverse is the authority for social content, approval, schedule, state, and audit evidence. Platform APIs are execution channels. Sintra/Soshie and Computer Use are temporary administration, strategy, scheduling, and verification surfaces, not the production publishing mechanism.

Target flow:

```text
Dataverse -> Human Approval -> Publishing Queue -> Power Automate/Azure Function -> JM1 Social Orchestrator -> Platform Adapter -> Platform Post ID and Readback -> Dataverse
```

## Channel Scope

Initial supported brands:

- J Merrill One
- J Merrill Publishing
- J Merrill Financial

J Merrill Financial LinkedIn was created from the authenticated Founder session on 2026-08-28. Financial LinkedIn execution remains disabled until Founder verifies the public Page and LinkedIn API product/permission access is approved.

Do not treat a Sintra connector as JM1-owned API authority. A Sintra connection is third-party tool access. A JM1 API connection is JM1-owned platform application credentials, token custody, deterministic execution, and Dataverse evidence.

## API Boundary

Power Automate or an Azure Function must call the JM1 Social Orchestrator with authoritative record references, not raw publishable content.

```http
POST /api/social/publish
Content-Type: application/json

{
  "socialPostId": "JM1SOC-000123"
}
```

The API must retrieve the approved Dataverse record, resolve brand/account/media configuration, enforce eligibility, enforce idempotency, call the destination platform, classify failures, and persist platform execution results.

## Dataverse Model

Primary entity: `jm1_socialpost`

Required fields include:

- SocialPostId
- Brand
- CampaignId
- AuthorId
- TitleId
- ContentType
- Caption
- Headline
- CallToAction
- MediaAssetId
- ScheduledFor
- ApprovalStatus
- ApprovedBy
- ApprovedAt
- PublishingStatus
- Platform
- DestinationId
- DestinationName
- FacebookEnabled
- InstagramEnabled
- LinkedInEnabled
- FacebookStatus
- InstagramStatus
- LinkedInStatus
- FacebookPostId
- InstagramMediaId
- LinkedInPostId
- PublishedAt
- FailureCode
- FailureMessage
- AttemptCount
- LastAttemptAt
- AnalyticsSyncStatus
- CreatedOn
- ModifiedOn

Platform-level execution records are required so Facebook, Instagram, and LinkedIn do not behave as one atomic operation.

Recommended child entity: `jm1_socialpostexecution`

- SocialPostId
- Platform
- ExternalAccountId
- ExecutionStatus
- ExternalPostId
- AttemptCount
- LastAttemptAt
- PublishedAt
- FailureCode
- FailureMessage
- PayloadHash

## Lifecycle States

Publishing lifecycle:

- DRAFT
- AI_GENERATED
- REVIEW_REQUIRED
- APPROVED
- SCHEDULED
- PUBLISHING
- PUBLISHED
- PARTIALLY_PUBLISHED
- RETRY_REQUIRED
- AUTH_REQUIRED
- FAILED
- CANCELLED

Authentication health states:

- AUTH_OK
- AUTH_EXPIRING
- AUTH_REQUIRED
- PERMISSION_REQUIRED
- ASSET_ACCESS_DENIED

Failure codes:

- META_AUTH_REQUIRED
- META_PERMISSION_DENIED
- META_ASSET_RESTRICTED
- MEDIA_UNAVAILABLE
- MEDIA_PROCESSING_FAILED
- RATE_LIMITED
- PUBLISH_FAILED
- TEMPORARY_META_ERROR
- LINKEDIN_PERMISSION_REQUIRED
- LINKEDIN_AUTH_REQUIRED
- INVALID_PAYLOAD
- RETRY_REQUIRED

## Meta API Version Anchor

Official Meta documentation currently identifies Graph API v26.0 as the latest version, introduced July 29, 2026. The architecture should use explicit API versioning and record the version in configuration.

Instagram publishing must use the Meta-supported creation-container then publish-container flow. Facebook publishing must use Facebook Page identity and Page publishing permissions. LinkedIn organization publishing must use LinkedIn's organization Posts API only after JM1 has app product access and an authenticated member/admin permission grant for the organization.

Official references:

- https://developers.facebook.com/documentation/instagram-platform/content-publishing
- https://developers.facebook.com/documentation/pages-api/posts
- https://developers.facebook.com/docs/graph-api/changelog/
- https://developers.facebook.com/docs/graph-api/changelog/versions/

## Secrets

Secrets must not be committed to Git or embedded in Power Automate. The preferred execution path is:

```text
Power Automate -> Azure Function / API -> Azure Key Vault -> Meta Graph API
```

The API host should use managed identity to retrieve platform application credentials and token material from Azure Key Vault. Power Automate should not know Meta, Instagram, or LinkedIn secrets.

## Idempotency

Before every external publish call, the API must check whether the specific platform execution has already succeeded.

Idempotency key:

```text
SocialPostId + Platform + DestinationAccountId + PayloadHash
```

Retrying a failed Instagram execution must never republish a successful Facebook execution.

## Exact Media Preservation

Approved creative files must be uploaded without AI transformation between approval and platform upload. The execution layer must record SHA-256, MIME type, dimensions, asset ID, brand, approval state, and content version before upload.

## Cutover

Existing posts scheduled through Sintra/Soshie UI or Computer Use must be inventoried and reconciled into Dataverse. The current Publishing 30-day run is classified as Sintra/Soshie UI-based scheduling, not JM1-owned API publishing. A cutover timestamp is required. Before cutover, existing scheduled posts may remain under their current scheduler. After cutover, new approved posts must enter through JM1 automation. No dual scheduling.

## Completion Standard

Completion requires an approved Dataverse social post to travel through Dataverse, Power Automate/Azure Function, JM1 Social Orchestrator, platform API, external publication ID capture, and Dataverse result persistence without browser interaction.

Financial completion additionally requires successful API publication through the official connected Financial platform accounts. LinkedIn completion is independent and may remain in HOLD if LinkedIn product access is not yet granted.
