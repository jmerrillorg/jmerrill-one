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

- Track Facebook and Instagram independently
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

Because Financial has no LinkedIn page, do not create Financial LinkedIn execution records by default. LinkedInEnabled should remain false or absent for Financial until a founder-approved page exists.
