# JM1 Marketing Attribution Model

Status: CANON-CANDIDATE

## Purpose

JM1 attribution should connect human-first content, profile recovery, channel activity, website visits, form submissions, conversations, opportunities, service outcomes, donations, volunteer interest, author inquiries, and production leads without treating last click as the whole story.

## Core Entities

| Entity | Purpose |
| --- | --- |
| Campaign | Strategic initiative or recurring content program. |
| Content Object | Canonical idea and approval record. |
| Content Derivative | Platform-specific post, Reel, Story, article, video, email, or page. |
| Channel | Social/network/distribution surface. |
| Interaction | Engagement event, visit, click, response, message, call, form, or meeting. |
| Lead/Inquiry | Qualified business or mission inquiry. |
| Opportunity/Case/Donation/Volunteer Interest | Downstream outcome by division. |
| Consent/Preference | Legal and relational permission state. |

## Required Tracking Fields

- Source platform
- Source account/channel
- Campaign
- ContentId
- ContentDerivativeId
- UTM source
- UTM medium
- UTM campaign
- UTM content
- Native post ID
- Referral URL
- Landing page
- Form/intake source
- Consent source
- First-touch date
- Latest-touch date
- Qualified conversion date
- Division owner
- Human follow-up owner
- Outcome type
- Outcome value where appropriate
- Confidence level
- Attribution notes

## Attribution Principles

- Preserve first touch, latest touch, and meaningful assisted touches.
- Do not overwrite consent or identity context with a social interaction.
- Do not infer a person’s legal, financial, donor, or service need from engagement alone.
- Use channel-native analytics for platform signals and Microsoft/Dynamics for enterprise relationship context.
- Attribution should inform better human follow-up, not replace judgment.
