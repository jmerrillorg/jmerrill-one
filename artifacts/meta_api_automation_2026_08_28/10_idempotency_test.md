# 10 Idempotency Test

Date: 2026-08-28

Status: design required, test pending

## Required Key

Use:

```text
SocialPostId + Platform + DestinationAccountId + PayloadHash
```

## Required Test

Scenario:

1. Facebook publish succeeds.
2. Instagram publish times out or returns a retry-safe failure.
3. Power Automate retries the social post.
4. API must skip Facebook as `SKIP_ALREADY_PUBLISHED`.
5. API must retry only Instagram.

Passing condition:

- no duplicate Facebook external post ID
- Instagram receives one retry attempt
- SocialPost overall status becomes `PARTIALLY_PUBLISHED` or `PUBLISHED` according to final platform results
