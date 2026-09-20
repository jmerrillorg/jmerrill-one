# Production Release Readback

## Release Authority

- Public host: `https://jmerrill.one`
- Health endpoint: `https://jmerrill.one/api/health`
- Health result: `ready`
- Deployed release SHA: `4c636acdbbbc414a465d7e29efcf2cc0dd5f25cf`
- Build/package SHA: `4c636acdbbbc414a465d7e29efcf2cc0dd5f25cf`
- Deployment run: GitHub Actions run `35411529302`
- Deployment result: `success`
- App Service: `app-jm1-one-prod-v2`
- Resource group: `rg-jm1-web-prod-premium`

The deployment workflow checked out, built, packaged, deployed, and health-probed the same commit. No separate retained GitHub artifact exists, but the workflow head, package naming contract, App Service release setting, and health response all bind the deployed artifact to `4c636ac`.

## Runtime

- State: `Running`
- Runtime: `NODE|24-lts`
- Identity: system-assigned managed identity
- Always On: enabled
- HTTP/2: enabled
- Minimum TLS: 1.2
- FTPS: disabled

## Public And Owned Routes

| Surface | Readback |
| --- | --- |
| Public home | HTTP 200 |
| Health endpoint | HTTP 200 / ready |
| Contact/intake entry | HTTP 200 |
| Ecosystem | HTTP 200 |
| Operating model | HTTP 200 |
| Privacy | HTTP 200 |
| Jackie contact card | HTTP 200 |
| Four division pages | HTTP 200 |
| Marketing command center | HTTP 307 to authentication |
| Authentication provider endpoint | HTTP 200; Azure AD provider registered |
| Anonymous session endpoint | HTTP 200; empty session |
| Sign-in page | HTTP 200 |

There is no application-owned `/appointments`, `/schedule`, or `/book` route. Contact/intake is owned here; Microsoft Bookings is identified as the external scheduling authority in the operating model. Those absent paths are not production defects.

Cross-brand links read from the live site successfully reached J Merrill Publishing, J Merrill Financial, and J Merrill Foundation with HTTP 200. Productions is intentionally inquiry-led through `/contact?division=productions`.

No production mutation was performed.
