# 07 JM1 Marketing API Contract

Date: 2026-08-28

## Endpoint

```http
POST /api/social/publish
Content-Type: application/json

{
  "socialPostId": "JM1SOC-000123"
}
```

## Contract

The caller supplies only an authoritative Dataverse record reference. The API must not accept arbitrary raw caption, media URL, or destination account values that bypass approval.

The API must:

1. Retrieve the social post from Dataverse.
2. Verify `ApprovalStatus = APPROVED`.
3. Verify `PublishingStatus = SCHEDULED`.
4. Verify `ScheduledFor <= now`.
5. Resolve destination account configuration.
6. Resolve immutable media asset reference.
7. Compute payload hash.
8. Check platform execution idempotency.
9. Publish only destinations that are enabled and not already successful.
10. Persist normalized result or failure evidence per platform.

## Response Shape

```json
{
  "socialPostId": "JM1SOC-000123",
  "overallStatus": "PUBLISHED",
  "executions": [
    {
      "platform": "Facebook",
      "status": "PUBLISHED",
      "externalPostId": "pageid_postid",
      "attemptCount": 1
    }
  ]
}
```
