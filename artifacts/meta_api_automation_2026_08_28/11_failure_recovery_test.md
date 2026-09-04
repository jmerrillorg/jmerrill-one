# 11 Failure Recovery Test

Date: 2026-08-28

Status: design required, test pending

## Required Failure Classes

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

## Required Persistence

For each failed platform execution, persist:

- FailureCode
- FailureMessage
- HTTP status
- Meta error code
- Meta trace/request identifier where available
- AttemptCount
- LastAttemptAt
- NextRetryAt

Retry only failures classified as retry-safe.
