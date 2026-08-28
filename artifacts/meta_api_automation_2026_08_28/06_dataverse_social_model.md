# 06 Dataverse Social Model

Date: 2026-08-28

## Primary Entity

Recommended logical name:

- `jm1_socialpost`

This entity is the authority for caption, schedule, approval state, publishing state, media reference, and analytics sync state.

## Platform Execution Entity

Recommended logical name:

- `jm1_socialpostexecution`

Purpose:

- Track Facebook, Instagram, and LinkedIn independently
- Enforce idempotency per destination
- Persist external IDs and failure evidence
- Prevent a retry on one platform from republishing a platform that already succeeded

## Required Human Gate

No post may enter the publishing executor until Dataverse shows the required human approval.

Required approval fields:

- ApprovalStatus
- ApprovedBy
- ApprovedAt

## Financial LinkedIn

Financial LinkedIn Page was created on 2026-08-28 as `J Merrill Financial`, organization ID `146207089`.

Do not enable Financial LinkedIn execution by default yet. `LinkedInEnabled` must remain false until both conditions are met:

- Founder verifies the public LinkedIn Page.
- JM1-owned LinkedIn API product/permission access is approved and tested.

LinkedIn destination records may be staged as inactive/certification-pending with immutable organization ID `146207089`.
