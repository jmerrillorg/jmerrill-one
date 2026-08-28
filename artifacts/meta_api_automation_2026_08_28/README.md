# JM1 Meta API Automation Evidence Package

Date: 2026-08-28

This package implements the evidence structure required by the controlling instruction for JM1 Social API Automation, J Merrill Financial Instagram provisioning, and J Merrill Financial LinkedIn Page creation.

The current package is an implementation foundation and live-state readback, not a completion claim.

Key findings:

- Stop expanding Computer Use as the production posting engine.
- Use Computer Use only for bridge, admin, verification, and troubleshooting.
- Financial Facebook Page exists in JM1 Meta Business Settings: `J Merrill Financial`, Page ID `1270611542802820`.
- Financial Instagram exists in JM1 Meta Business Settings: `@jmerrillfin`, Instagram account ID `17841438473100276`.
- Financial Page to Instagram connected-assets relationship is not confirmed.
- J Merrill Financial LinkedIn Page was created from the authenticated Founder/admin session: organization ID `146207089`, public slug `jmerrillfinancial`.
- The existing 30-day Publishing run was scheduled through Sintra/Soshie UI, not through a JM1-owned API pipeline.
- Completion requires Dataverse -> Power Automate/Azure Function -> JM1 Social Orchestrator -> platform API -> platform post ID/readback -> Dataverse evidence without browser interaction.
