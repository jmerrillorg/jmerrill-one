# JM1 Azure App Service Hosting Standard v1

Status: **CANON-CANDIDATE — IMPLEMENTATION PROVEN — READY FOR FOUNDER APPROVAL**

This standard records the proven HOST-02 hosting implementation for JM1 public properties: all six public properties run on Azure App Service in one consolidated Premium v3 production estate.

The standard is not yet promoted to CANON because Founder approval is still required for canon promotion and destructive retirement of superseded rollback infrastructure.

Current reference implementation:

- `rg-jm1-web-prod-premium`
- `asp-jm1-web-prod-premium`
- Linux App Service
- `P1mv3`
- `1` worker initially
- `NODE|24-lts`
- HTTPS-only
- HTTP/2
- `node server.js`
- managed certificates and SNI TLS
- App Service health endpoints where implemented
- Financial frontend on App Service with Azure Functions backend preserved
- completed-estate capacity classification: `P1MV3 x1 = ACCEPTABLE — MONITOR`
- superseded App Services, old plans, and SWAs retained only for bounded rollback pending deletion confirmation

Final production app matrix:

- J Merrill One: `app-jm1-one-prod-v2`
- J Merrill Publishing: `app-jm1-pub-prod-v2`
- J Merrill Financial: `app-jm1-fin-prod-v2`
- J Merrill Foundation: `app-jm1-foundation-prod-v2`
- J Merrill Productions: `app-jm1-productions-prod-v2`
- Jackie Smith Jr.: `app-jm1-jackiesmithjr-prod-v2`

Repository ownership remains per brand repository. J Merrill One owns enterprise orchestration evidence and standards. Jackie Smith Jr. is classified as a JM1 Founder Brand, not an operating division.

Future Node major changes require compatibility testing, build validation, production regression, and an explicit runtime baseline update. Future hosting exceptions remain allowed when supported by architecture evidence. This standard does not claim App Service must be used forever regardless of future architecture.
