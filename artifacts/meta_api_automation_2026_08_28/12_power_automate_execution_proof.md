# 12 Power Automate Execution Proof

Date: 2026-08-28

Status: pending

## Required Flow Responsibility

Power Automate should:

- detect eligible posts
- call the JM1 Marketing Automation API
- route operational notifications
- update orchestration state

Power Automate should not:

- store Meta secrets
- implement Meta-specific publishing details
- publish directly to Meta
- bypass Dataverse approval

## Eligibility Query

```text
ScheduledFor <= current time
AND ApprovalStatus = APPROVED
AND PublishingStatus = SCHEDULED
```

The API must repeat defensive eligibility checks.
