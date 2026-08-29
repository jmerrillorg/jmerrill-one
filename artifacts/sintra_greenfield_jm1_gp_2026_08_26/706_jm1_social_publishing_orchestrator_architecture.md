# JM1 Social Publishing Orchestrator Architecture

Status: TARGET ARCHITECTURE / NOT END-TO-END PROVEN

The orchestrator receives only a Dataverse social post reference, retrieves approved queue data, verifies asset hash and approval state, resolves the destination registry, builds a platform-specific payload, checks idempotency, publishes, records platform response, performs readback where supported, and writes execution evidence back to Dataverse.

Required adapters:

- Meta Graph API -> Facebook Pages
- Instagram Graph API / Meta Graph API -> Instagram Business or Creator accounts
- LinkedIn organization publishing API -> LinkedIn Pages, subject to LinkedIn product/permission approval

Secrets must live in Azure Key Vault or equivalent managed secret storage. Power Automate must not store platform secrets. The preferred execution path is Power Automate or Customer Insights event -> Azure Function/API -> Key Vault -> platform adapter -> Dataverse execution record.

Idempotency key: `SocialPostId + Platform + DestinationAccountId + PayloadHash`. A successful Facebook execution must not be retried because Instagram failed.

Completion standard: no browser interaction, approved Dataverse post, exact asset hash, platform response, platform post ID/media ID, readback/public verification, and persisted execution evidence.
