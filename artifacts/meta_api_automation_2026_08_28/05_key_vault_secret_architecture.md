# 05 Key Vault Secret Architecture

Date: 2026-08-28

## Azure Readback

Azure CLI authenticated as:

- User: jm1-admin@jmerrill.one
- Subscription: JM1 - Nonprofit Core (2025 Grant)
- Subscription ID: 9ee13245-2303-4010-8b6d-35f7cbcfdc0e
- Tenant ID: 352d075e-8e17-4169-9f8e-22e6946ce66d

Observed Key Vault resources:

- `kv-jm1-core` in resource group `rg-jm1-core`
- `jm1-core-vault` in resource group `rg-jm1-core`

Observed storage account relevant to media:

- `jm1media` in resource group `rg-jm1-core`

## Target Secret Flow

```text
Power Automate -> JM1 Marketing Automation API -> Managed Identity -> Azure Key Vault -> Meta Graph API
```

Power Automate must not hold Meta app secrets or token material directly.

## Secret Names

Secret names should be environment-qualified and brand/channel-neutral where possible. Proposed names:

- `meta-marketing-app-id`
- `meta-marketing-app-secret`
- `meta-system-user-token`
- `meta-token-last-verified-at`

Do not commit secret values.
