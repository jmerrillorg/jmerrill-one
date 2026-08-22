# ACS Communications

Resources observed: acs-jm1-core, email-jm1-core, email.jmerrill.one domain, stjm1acsrelay storage, func-jm1-acs-email-relay.

Findings:

- ACS relay Function is Linux Consumption, Node 22, HTTPS-only false, no managed identity.
- It uses WEBSITE_RUN_FROM_PACKAGE with a package URL. The URL expiration is long dated, but the pattern is still EXPIRING_PACKAGE_DEPLOYMENT_RISK.
- Target is Flex Consumption, Node 24 when supported, HTTPS-only, managed identity/keyless storage where feasible, and non-expiring canonical deployment pipeline.
