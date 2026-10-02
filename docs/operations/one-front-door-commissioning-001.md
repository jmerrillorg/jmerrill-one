# ONE-FRONT-DOOR-COMMISSIONING-001 readback

Readback date: 2026-10-02. Repository: `jmerrillorg/jmerrill-one`. Meta rotation remains `jm1-ops / JM1-MPI-002` (due 2026-10-17, expiry 2026-11-01).

## Released and verified

- PRs [#51](https://github.com/jmerrillorg/jmerrill-one/pull/51), [#52](https://github.com/jmerrillorg/jmerrill-one/pull/52), and [#53](https://github.com/jmerrillorg/jmerrill-one/pull/53) merged. The application and Function runtime both deployed and reported `e21970a7eef8855c18014ab2d828c0dd78d5d4a2`; #53 changed only the PR validation workflow.
- The intake route creates a caller-keyed Dataverse execution-log receipt before Contact/Lead writes. The receipt binds consent, channel, destination, state, attempt, and record references. Contact and Lead creation use deterministic IDs. A five-minute Function timer retries stale receipts; Application Insights logged successful timer runs with `failed:0` and no matching exceptions.
- A local injected failure after Lead creation but before receipt completion was replayed with one receipt, one Contact, and one Lead. A lost response after Lead commit was also recovered without a second Lead. These are controlled local fault tests, not a live injected production outage.
- Production synthetic submissions through `https://jmerrill.one/api/intake` returned 202; identical replays returned 202 with `idempotentReplay:true`. Dataverse readback found one receipt and one Contact for each path, one Lead only where current business semantics call for it, consent evidence, correct destination label, and `COMPLETED` state. No synthetic request carried a deliverable client email address.

| Path | Synthetic request ID | Receipts | Contacts | Leads | Destination label | Replay |
| --- | --- | ---: | ---: | ---: | --- | --- |
| General | `ae7a3bca-5a85-4955-9827-42c46d33e3c8` | 1 | 1 | 0 | J Merrill One | No duplicate |
| Publishing | `8abb879f-ccfe-452d-9f78-3e153864f122` | 1 | 1 | 1 | J Merrill Publishing | No duplicate |
| Financial | `fdd72886-49e3-4cb3-aee0-c2e6ddab6a74` | 1 | 1 | 1 | J Merrill Financial | No duplicate |
| Foundation | `48875027-bde1-4908-ac20-3107d61d66a4` | 1 | 1 | 0 | J Merrill Foundation | No duplicate |
| Productions | `7bf5a58f-51c3-432d-a90f-0addc24b273e` | 1 | 1 | 1 | J Merrill Productions | No duplicate |

- The active package manager is npm. `pnpm-lock.yaml` was retired; Next.js and eslint-config-next resolve to 16.3.8, and `baseline-browser-mapping` resolves to 2.11.27. `npm audit --omit=dev` found zero advisories. The remaining full-tree advisories are in developer tooling, not shipped dependencies; do not conflate them with production exposure.
- The direct App Service `CLIENT_SECRET` setting was confirmed unused and removed. Dataverse, command-center sign-in, and NextAuth secrets remain Key Vault references. Web health, sign-in session, and an intake replay passed after the removal.
- The existing credential critical-state alert now matches `CREDENTIAL_MONITOR_GOVERNED_DEBT` and targets the enabled `jm1-marketing-ops` action group. This proves configuration match, not a delivered test notification. Post-Meta-rotation validation is documented separately; no Meta credential was changed here.
- The Function package now mounts from a private blob using its system-assigned identity and no package SAS. GitHub OIDC has narrow release-container and Function-site roles. `main` requires a PR and the universal `validate` check, with zero mandatory reviews; the production environment accepts protected branches only. No paid-plan control was used.
- The prior detached checkout's sole modification was generated timestamp refresh in artifact `795_jm1_social_post_publish_reconciliation_regression_v1.json`. It was classified and preserved. Clean local `main` and the commissioning worktree were reconciled. Legacy PRs #6 and #7 were closed as preserved artifact-only history; #19 remains open with enterprise policy ownership explicitly unresolved.

## Remaining commissioning gap

The five Dataverse destination labels and Lead/Contact semantics are proven, but a separate team queue, mailbox delivery, or recipient readback for each brand is **not** proven. The current route does not itself send a notification. Do not call `BRAND_ROUTING`, `JM1_FRONT_DOOR_END_TO_END`, or the full commissioning wave PASS from the matrix above. Reconcile the transport/queue contract with the canonical owner of the shared ACS relay (`jmerrill-pub`) and enterprise control plane (`jm1-ops`) without copying sister-brand rules into this repository. No Jackie decision is identified for the technical remediation.

The live 2,000-character execution-log detail field currently requires a 700-character form-message limit, with a visible fallback email on validation or availability failure. Longer-message support is a separate data-contract improvement, not grounds to bypass durable receipt creation.
