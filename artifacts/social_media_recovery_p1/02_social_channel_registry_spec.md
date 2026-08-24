# Social Channel Registry Specification

Status: CANON-CANDIDATE
Owner: J Merrill One enterprise governance

## Purpose

The Social Channel Registry is the authoritative enterprise inventory of public social channels, native execution surfaces, ownership metadata, profile accuracy state, and remediation requirements across JM1 brands.

It is a proposed specification only. No Dataverse table or schema change is created by this package.

## Repository Boundary

The enterprise registry standard belongs in J Merrill One. Division-specific implementation records, if later created, belong in the appropriate division repository or Dataverse solution while preserving One as the cross-brand governance authority.

## Proposed Dataverse Mapping

Logical name prefix: `jm1_`

| Field | Proposed logical name | Type | Notes |
| --- | --- | --- | --- |
| ChannelId | `jm1_channelid` | Text / alternate key candidate | Stable registry identifier. |
| Brand | `jm1_brand` | Choice | One, Publishing, Financial, Foundation, Productions, AIC/future. |
| LegalEntity | `jm1_legalentity` | Text | Legal or operating entity owner. |
| Platform | `jm1_platform` | Choice | Facebook, Instagram, LinkedIn, YouTube, TikTok, X, Threads, Website, Other. |
| AccountName | `jm1_accountname` | Text | Public account/page name. |
| Handle | `jm1_handle` | Text | Public username/handle. |
| PublicUrl | `jm1_publicurl` | URL | Public profile URL. |
| BusinessPortfolio | `jm1_businessportfolio` | Text | Native platform business portfolio/container. |
| BusinessManagerId | `jm1_businessmanagerid` | Text | Meta Business Manager/Portfolio ID when applicable. |
| PageId | `jm1_pageid` | Text | Native platform page/channel ID. |
| ConnectedInstagramAccount | `jm1_connectedinstagramaccount` | Text | Instagram account or ID. |
| ConnectedLinkedInAccount | `jm1_connectedlinkedinaccount` | Text | LinkedIn org/member relationship. |
| ConnectedYouTubeAccount | `jm1_connectedyoutubeaccount` | Text | YouTube channel relationship. |
| CurrentFollowers | `jm1_currentfollowers` | Whole number | Audit snapshot only. |
| CurrentFollowing | `jm1_currentfollowing` | Whole number | Audit snapshot only. |
| ProfileCategory | `jm1_profilecategory` | Text | Native profile category. |
| ProfileBio | `jm1_profilebio` | Multiline text | Current or approved profile language. |
| WebsiteUrl | `jm1_websiteurl` | URL | Canonical public website. |
| PublicPhone | `jm1_publicphone` | Phone | Public number if approved. |
| PublicEmail | `jm1_publicemail` | Email | Public shared mailbox if approved. |
| PublicAddress | `jm1_publicaddress` | Text | Must follow address visibility policy. |
| BusinessHours | `jm1_businesshours` | Text / JSON | Native hours display. |
| PrimaryCTA | `jm1_primarycta` | Text | Public call to action. |
| ProfileImageStatus | `jm1_profileimagestatus` | Choice | Current, needs update, missing, unknown. |
| CoverImageStatus | `jm1_coverimagestatus` | Choice | Current, needs update, missing, unknown. |
| VerificationStatus | `jm1_verificationstatus` | Choice | Verified, unverified, ineligible, unknown. |
| AdminOwnershipStatus | `jm1_adminownershipstatus` | Choice | Confirmed, partial, missing, unknown. |
| LastPublishedDate | `jm1_lastpublisheddate` | Date | Last observed public post. |
| CurrentOperationalStatus | `jm1_currentoperationalstatus` | Choice | Active, dormant, inconsistent, legacy, unknown. |
| ProfileAccuracyStatus | `jm1_profileaccuracystatus` | Choice | Accurate, needs update, inaccurate, unknown. |
| RequiredRemediation | `jm1_requiredremediation` | Multiline text | Required corrections. |
| RemediationPriority | `jm1_remediationpriority` | Choice | P0, P1, P2, P3. |
| LastAuditDate | `jm1_lastauditdate` | Date | Last registry audit. |
| Notes | `jm1_notes` | Multiline text | Evidence notes. |

## Required Meta Audit Fields

Before any Meta asset change, capture:

- Facebook Page
- connected Instagram account
- Business Portfolio ownership
- Page ID
- Instagram account ID
- admin/full-control assignments
- partial-access assignments
- connected ad accounts
- pixels/datasets
- domains
- existing integrations
- current page/Instagram pairings
- duplicate or legacy business portfolios
- orphaned assets

## Operating Rule

Do not create replacement Meta assets until the existing J Merrill One Business Portfolio has been audited and rationalized.
