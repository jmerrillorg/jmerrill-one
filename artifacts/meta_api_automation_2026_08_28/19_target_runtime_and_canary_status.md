# 19 Target Runtime And Canary Status

Date: 2026-08-28

## Target Runtime

```text
Dataverse Social Queue
  -> JM1 Social Orchestrator
  -> Approval State
  -> Azure Function / Logic App / Power Automate
  -> Platform Adapter
     -> Meta Graph API -> Facebook
     -> Instagram Graph API -> Instagram
     -> LinkedIn API -> LinkedIn
  -> Platform Post ID
  -> Dataverse Execution Evidence
  -> Performance / Error Readback
```

## Minimum Social Queue Fields

- socialPostId
- brand
- workspace/source
- platform
- destinationId
- destinationName
- caption
- media asset reference
- scheduledFor
- approvalState
- publicationState
- platformPostId
- attemptCount
- lastAttemptAt
- publishedAt
- errorCode
- errorMessage
- provenance
- contentVersion

## Exact Media Preservation

The runtime must preserve exact approved media files. Required checks:

- SHA-256
- MIME type
- dimensions
- asset ID
- brand
- approval state
- no AI transformation between approved creative and platform upload

## Idempotency And Retry

Use:

- idempotency key
- platform/post state reconciliation
- retry policy
- dead-letter or attention state

Do not retry blindly. Do not mark a post `PUBLISHED_VERIFIED` until the API response, platform object/post ID, and readback/public verification are recorded where supported.

## Canary

- Platform: not executed through JM1-owned API in this run
- Destination: not selected
- Result: HOLD - no JM1-owned platform credentials/token authority is currently verified
- Platform post ID: none
- Live/readback validation: not applicable

Existing Publishing scheduled posts remain live under their current Sintra/Soshie/UI scheduling path and are not API canaries.
