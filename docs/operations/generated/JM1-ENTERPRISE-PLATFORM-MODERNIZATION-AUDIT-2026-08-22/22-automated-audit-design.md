# Automated Audit Design

## Monthly Schedule

1. Enumerate Azure resources, app services, function apps, storage accounts, Key Vault metadata, app registrations, GitHub repos/workflows, Power Platform environments, and package manifests.
2. Compare observed runtime/service versions against JM1_RUNTIME_SUPPORT_POLICY_v1.0 and JM1_SERVICE_LIFECYCLE_POLICY_v1.0.
3. Flag service retirement, EOL, expired credentials, expiring credentials, package URL/SAS expiration, runtime drift, package advisories, and manual-only deployment drift.
4. Produce a dated evidence package and exception queue.
5. Alert Jackie at 180/90/30 days before known EOL/retirement/expiration.

## Implementation Candidate

- GitHub Actions scheduled workflow in the One repo for repo/package/workflow checks.
- Azure Automation or Function with managed identity for Azure/Entra metadata.
- Power Platform admin export for flows/apps/connection references.
- External connector exports for Stripe/Bill.com.

No automatic remediation without approved wave authorization.
