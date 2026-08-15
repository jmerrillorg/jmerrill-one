# HOST-02 Closeout v5

Final classification: **HOST-02 ONE CUTOVER COMPLETE — MIGRATION PROGRESS 2 OF 6**

J Merrill One now runs live on Azure App Service at `https://www.jmerrill.one/`.

Validated:

1. Stale Kudu deployment state cleared.
2. Coherent standalone artifact deployed without Oryx dependency.
3. Staging App Service default host passed.
4. Production slot swap completed at `2026-08-15T11:32:36.149000Z`.
5. Production default host passed 20 repeated route checks.
6. `www.jmerrill.one` DNS now CNAMEs to `app-jm1-one-prod.azurewebsites.net`.
7. App Service hostname binding is verified for `www.jmerrill.one`.
8. Managed TLS is SNI-enabled for `www.jmerrill.one`.
9. Public `www` host passed 20 repeated route checks.
10. Public BP-09 intake proof passed: POST 202, replay 202, malformed POST 400, Dataverse Contact 1, Lead 1, Execution Log 1.
11. Customer Voice survey still returns HTTP 200.
12. Superseded Static Web Apps workflow is frozen to manual rollback dispatch only.

The Static Web App resource was not deleted. It retains the apex `jmerrill.one` binding and exists only as retained rollback/legacy infrastructure for this cutover state.

HOST-02 progress is now **2 OF 6** live on App Service. Remaining sites: J Merrill Financial, J Merrill Foundation, J Merrill Productions, Jackie Smith Jr.
