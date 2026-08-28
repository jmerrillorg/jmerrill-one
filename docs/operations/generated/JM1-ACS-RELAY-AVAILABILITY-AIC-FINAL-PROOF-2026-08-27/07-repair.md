# Repair

Last verified: 2026-08-28T02:33:47Z

Runtime repair:

1. Preserved the existing ACS service.
2. Preserved the existing Function App.
3. Preserved the existing ACS sender registry.
4. Set the existing Function App runtime stack to `Node|22`.
5. Preserved URL-based run-from-package deployment.
6. Disabled Oryx build during deployment.
7. Disabled placeholder optimization for the existing host path.
8. Restarted the existing Function App.
9. Synced triggers successfully.
10. Verified route-level governed response.

AIC mail-flow repair:

1. Identified temporary Exchange transport rule `AIC | TEMP | Domain Mail Recovery -> iCloud`.
2. Confirmed it redirected all `@agapeic.org` recipients to `agapeic@icloud.com`.
3. Disabled the temporary rule.
4. Did not delete the rule.
5. Did not recreate the AIC mailbox.
6. Did not alter AIC sender or Reply-To authority.

