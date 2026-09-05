# Commissioning Register

Last verified: 2026-08-26T16:39:16Z

| Branch | Policy bound | Brand overlay | Tests | Deployed | Live proof | Runtime send commissioned | Classification |
| --- | --- | --- | --- | --- | --- |
| Publishing | YES | YES | PASS | YES | ACS relay live safe-fail probe | YES | COMMISSIONED_REFERENCE_IMPLEMENTATION |
| Financial | YES | YES | PASS | YES | App Service health 200; Function OPTIONS 204; `JM1_RELEASE_SHA=434824e2bf8d6a191b19c78d350408909659c6a5` | PARTIAL: existing communication gate bound; external send still governed by pilot/runtime switches | CONTROLLED_RUNTIME_COMMISSIONING |
| Foundation | YES | YES | PASS | YES | App Service health 200; `JM1_RELEASE_SHA=51707fa29a4182990dce4afcdbbfb5f0448d1d32` | NO_RUNTIME_FOUND | PRE_PUBLISH_GUARD_DEPLOYED |
| Productions | YES | YES | PASS | YES | App Service health 200 with `humanFirstPolicy=JM1-HUMAN-FIRST-WHY-FIRST-v1`; `JM1_RELEASE_SHA=30fee677973594e7d6665dd3e530db1ad37031d6` | NO_RUNTIME_FOUND | PRE_PUBLISH_GUARD_DEPLOYED |
| AIC | YES | YES | PASS | YES | App Service health 200 with `humanFirstPolicy=JM1-HUMAN-FIRST-WHY-FIRST-v1`; `GITHUB_SHA=36c79fb912552a141e0be33065e26c24400b86e5` | NO_RUNTIME_FOUND | PRE_PUBLISH_GUARD_DEPLOYED |

Enterprise final classification: `JM1_HUMAN_FIRST_WHY_FIRST_CONTROLLED_COMMISSIONING`

Reason: the enterprise policy is canonical, Publishing is proven, and the branch adoption code is deployed, but Foundation, Productions, and AIC still do not have an actual governed outbound send runtime to commission. Financial has an existing communication gate bound in the production Function App, but external client sends remain governed by the pilot/runtime switches and were not live-sent under this pass.
