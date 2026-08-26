# ACS and DNS Evidence

Last verified: 2026-08-26T23:14:51Z

## ACS Email Domain

Resource group: `rg-jm1-communications`

Email service: `email-jm1-core`

Domain: `email.agapeic.org`

Provisioning state: `Succeeded`

Verification states:

| Record | Status |
| --- | --- |
| Domain | Verified |
| SPF | Verified |
| DKIM | Verified |
| DKIM2 | Verified |
| DMARC | NotStarted |

## DNS Records Added

Azure DNS zone: `agapeic.org`

Resource group: `agape-international-cathedral-rg`

| Name | Type | Value |
| --- | --- | --- |
| `email.agapeic.org` | TXT | `ms-domain-verification=c3f0cfbe-c8e3-4c08-8a79-a75b1b3062ae` |
| `email.agapeic.org` | TXT | `v=spf1 include:spf.protection.outlook.com -all` |
| `selector1-azurecomm-prod-net._domainkey.email.agapeic.org` | CNAME | `selector1-azurecomm-prod-net._domainkey.azurecomm.net` |
| `selector2-azurecomm-prod-net._domainkey.email.agapeic.org` | CNAME | `selector2-azurecomm-prod-net._domainkey.azurecomm.net` |

## ACS Sender Username

Sender username: `aic`

Display name: `Agape International Cathedral`

From address: `aic@email.agapeic.org`

Provisioning state: `Succeeded`

## Communication Service Linkage

Communication Service: `acs-jm1-core`

Linked domains after update:

- `email.jmerrill.one`
- `email.agapeic.org`

The AIC domain is linked to the existing shared JM1 Communication Service; no separate AIC communication service was created.
