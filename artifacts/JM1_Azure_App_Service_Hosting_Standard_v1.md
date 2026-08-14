# JM1 Azure App Service Hosting Standard v1

Status: **CANON-CANDIDATE — PENDING FOUNDER & CEO APPROVAL**

This standard records the current intended hosting decision for JM1 public properties: Azure App Service is the target production host for the six public properties, with Publishing already live and the remaining five pending remediation.

The standard is not yet promoted to CANON because HOST-02 did not complete operational migration. Promotion requires capacity clearance, successful default-host validation, domain/TLS cutover, production smoke, Customer Voice regression, BP-09 regression for J Merrill One, SWA deployment freeze, rollback evidence, and retirement readiness.

Current reference implementation:

- `app-jm1-pub-prod`
- Linux App Service
- managed identity
- HTTPS-only
- HTTP/2
- Always On
- `node server.js`
- health check endpoint
- GitHub Actions OIDC deployment
- staging validation and promotion

Repository ownership remains per brand repository. J Merrill One owns enterprise orchestration evidence and standards. Jackie Smith Jr. is classified as a JM1 Founder Brand, not an operating division.

Future hosting exceptions remain allowed when supported by architecture evidence. This standard does not claim App Service must be used forever regardless of future architecture.
