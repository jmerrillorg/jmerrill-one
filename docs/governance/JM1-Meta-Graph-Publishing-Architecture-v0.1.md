# JM1 Meta Graph Publishing Architecture v0.1

Status: implementation foundation
Date: 2026-08-28
Authority: Founder implementation instruction, JM1 Microsoft-first governance

## Operating Model

Dataverse is the authority for social content, approval, schedule, state, and audit evidence. Meta is an execution channel. Meta Business Suite and Computer Use are temporary administration and verification surfaces, not the production publishing mechanism.

Target flow:

```text
Dataverse -> Human Approval -> Publishing Queue -> Power Automate -> JM1 Marketing Automation API -> Meta Graph API -> Facebook and Instagram -> Publication Result and Analytics -> Dataverse
```

## Channel Scope

Initial supported brands:

- J Merrill One
- J Merrill Publishing
- J Merrill Financial

J Merrill Financial currently has no LinkedIn page. Financial LinkedIn execution is out of scope until a founder-approved Financial LinkedIn presence exists.

## API Boundary

Power Automate must call the JM1 Marketing Automation API with authoritative record references, not raw publishable content.

```http
POST /api/social/publish
Content-Type: application/json

{
  "socialPostId": "JM1SOC-000123"
}
```

The API must retrieve the approved Dataverse record, resolve brand/account/media configuration, enforce eligibility, enforce idempotency, call Meta, classify failures, and persist platform execution results.

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
- FacebookEnabled
- InstagramEnabled
- FacebookStatus
- InstagramStatus
- FacebookPostId
- InstagramMediaId
- PublishedAt
- FailureCode
- FailureMessage
- AttemptCount
- LastAttemptAt
- AnalyticsSyncStatus
- CreatedOn
- ModifiedOn

Platform-level execution records are required so Facebook and Instagram do not behave as one atomic operation.

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
- INVALID_PAYLOAD
- RETRY_REQUIRED

## Meta API Version Anchor

Official Meta documentation currently identifies Graph API v26.0 as the latest version, introduced July 29, 2026. The architecture should use explicit API versioning and record the version in configuration.

Instagram publishing must use the Meta-supported creation-container then publish-container flow. Facebook publishing must use Facebook Page identity and Page publishing permissions.

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

The API host should use managed identity to retrieve Meta application credentials and token material from Azure Key Vault. Power Automate should not know Meta secrets.

## Idempotency

Before every external publish call, the API must check whether the specific platform execution has already succeeded.

Idempotency key:

```text
SocialPostId + Platform + DestinationAccountId + PayloadHash
```

Retrying a failed Instagram execution must never republish a successful Facebook execution.

## Cutover

Existing posts created through Computer Use must be inventoried and reconciled into Dataverse. A cutover timestamp is required. Before cutover, existing Meta-scheduled posts may remain under Meta execution. After cutover, new approved posts must enter through JM1 automation. No dual scheduling.

## Completion Standard

Completion requires an approved Dataverse social post to travel through Dataverse, Power Automate, JM1 Marketing Automation API, Meta Graph API, external publication ID capture, and Dataverse result persistence without browser interaction.

Financial completion additionally requires successful Instagram API publication through the official connected Financial Instagram account.
