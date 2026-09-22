# JM1 Content Object Specification

Status: CANON-CANDIDATE
Owner: J Merrill One enterprise governance

## Purpose

The JM1 Content Object is the canonical content record. It captures the approved idea, authority, purpose, compliance state, and reuse rules before the idea becomes platform-specific posts.

Facebook, Instagram, LinkedIn, YouTube, email, and website posts are derivatives, not separate canonical truth records.

## Canonical Content Object

| Field | Purpose |
| --- | --- |
| ContentId | Stable unique identifier. |
| CanonicalTitle | Plain-language internal title. |
| BrandOwner | Primary brand accountable for the content. |
| ContributingBrands | Other JM1 brands materially involved. |
| ContentType | Education, story, announcement, invitation, proof, campaign, service, leadership, other. |
| Topic | Human-readable topic. |
| ContentPillar | Brand editorial pillar. |
| PrimaryAudience | Main audience. |
| SecondaryAudience | Secondary audience, if applicable. |
| JourneyStage | Awareness, consideration, decision, onboarding, stewardship, retention, advocacy. |
| Campaign | Related campaign or initiative. |
| Purpose | Business/human reason for the content. |
| WhyStatement | Why the audience should care. |
| SourceAuthority | Approved source owner or artifact. |
| CanonicalSource | Link/reference to source material. |
| FactCheckStatus | Not started, in review, verified, rejected, expired. |
| ComplianceStatus | Not required, pending, approved, rejected, restricted. |
| ApprovalStatus | Idea, draft, review, approved, rejected, archived. |
| FounderApprovalRequired | Yes/no with reason. |
| PrimaryCTA | Intended next action. |
| LandingPage | Target URL or owned destination. |
| AssetReferences | Approved assets connected to the content. |
| CreatedDate | Creation date. |
| PublishStartDate | Earliest use date. |
| PublishEndDate | Expiration date where applicable. |
| Evergreen | Whether reuse is permitted after initial campaign. |
| SensitivityLevel | Low, medium, high, regulated, crisis. |
| AITransformAllowed | Whether AI may draft derivative variants. |
| AutoPublishEligible | Must remain false during recovery phase. |
| ArchiveStatus | Active, retired, superseded, archived. |

## Content Derivative Object

| Field | Purpose |
| --- | --- |
| ContentDerivativeId | Stable derivative identifier. |
| ParentContentId | Required parent canonical content ID. |
| Platform | Facebook, Instagram, LinkedIn, YouTube, email, website, other. |
| Format | Post, Reel, Story, carousel, article, short, email, graphic, video, other. |
| Caption | Platform-specific caption. |
| Headline | Platform-specific headline or opening hook. |
| Asset | Approved asset used. |
| AspectRatio | Format requirement. |
| ScheduledDate | Planned channel-native scheduling date. |
| PublishedDate | Actual publish date. |
| PlatformPostId | Native platform ID after publication. |
| Status | Draft, reviewed, scheduled, published, failed, retired. |
| ApprovalStatus | Pending, approved, rejected, revised. |
| PerformanceData | Snapshot or link to metrics. |

## Core Controls

- AI may draft derivatives only when `AITransformAllowed` is true.
- AI-generated derivatives may not silently alter canonical facts.
- `AutoPublishEligible` remains false during this P1 recovery phase.
- Sensitive Financial, Foundation assistance, legal/compliance, crisis, and founder-positioning content requires explicit human approval.
