# HOST-02 Closeout

Final classification: **HOST-02 REMEDIATION REQUIRED**

HOST-02 resumed after Founder approval to scale `asp-jm1-web-prod-linux` from 1 S1 worker to 2 S1 workers. The approved scale-out was applied successfully and no capacity beyond the approved 2 S1 workers was configured.

HOST-02 did not proceed to public cutover. The post-scale baseline still showed material shared-plan pressure during deployment activity, and the J Merrill One staging App Service did not pass default-host validation after both standalone-package and Azure/Linux source-deploy remediation attempts. `/`, `/why-we-exist`, `/divisions`, and `/api/intake` timed out, and `/contact` returned HTTP 503 after restart.

Publishing remains the reference App Service implementation and was not changed.

No public DNS, TLS, custom-domain, SWA workflow freeze, or SWA deletion changes were made.

Required remediation before resuming live migration:

1. Diagnose and remediate `app-jm1-one-prod` staging startup/runtime health for the Next.js App Service target.
2. Re-run One default-host validation for `/`, key public routes, and `/api/intake`.
3. Confirm capacity stability under deployment/runtime load on the approved 2-worker S1 plan.
4. Continue Financial App Service/API migration only after the One gate is healthy or explicitly resequenced by Founder decision.
5. Resume one-site-at-a-time public-domain cutover only after default-host validation passes.
