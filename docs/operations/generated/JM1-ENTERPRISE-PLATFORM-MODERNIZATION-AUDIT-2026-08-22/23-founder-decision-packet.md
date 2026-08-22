# Founder Decision Packet

## Decisions Required

1. Authorize Wave A dependency patch for One: update Next.js to a fixed non-major version and validate under Node 24, with Node 26 compatibility lane kept separate.
2. Authorize Wave B planning for Linux Consumption to Flex Consumption migration for ACS relay, diagnostic AI runner, and Financial function.
3. Authorize Wave C credential triage: rotate active expired/expiring credentials, retire dead app registrations, and replace eligible secrets with managed identity/workload identity.
4. Authorize storage TLS remediation planning for jm1core, jm1fin, jm1media, and jm1pub.
5. Authorize separate admin exports for Power Platform flows/apps, Key Vault metadata, Stripe, Bill.com, and detailed Foundry model deployments.
6. Decide whether org-to-foundation-redirect and jm1-book-redirector are canonical redirect infrastructure or candidates for consolidation.
7. Decide AIC inclusion depth in JM1 modernization waves, since AIC has a running Basic App Service with HTTPS-only false and a separate Static Web App orphan candidate.

## Recommendation

Approve bounded modernization waves in this order: Wave C emergency credential triage, Wave A One repo package/runtime warning cleanup, Wave B Function hosting migration design, then Wave F IaC/deployment hardening.

Final classification: JM1_PLATFORM_MODERNIZATION_AUDIT_COMPLETE.
