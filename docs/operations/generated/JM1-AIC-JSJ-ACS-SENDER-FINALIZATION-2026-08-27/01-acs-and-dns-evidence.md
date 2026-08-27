# ACS And DNS Evidence

Last verified: 2026-08-27T00:49:22Z

Azure subscription: `9ee13245-2303-4010-8b6d-35f7cbcfdc0e`

Resource group: `rg-jm1-communications`

ACS Communication Service: `acs-jm1-core`

ACS Email Service: `email-jm1-core`

## Domains

Azure ACS readback:

| Domain | Provisioning | Domain | SPF | DKIM | DKIM2 |
| --- | --- | --- | --- | --- | --- |
| `email.jmerrill.one` | Succeeded | Verified | Verified | Verified | Verified |
| `email.agapeic.org` | Succeeded | Verified | Verified | Verified | Verified |
| `email.jackiesmithjr.com` | Succeeded | Verified | Verified | Verified | Verified |

## JSJ DNS

Azure DNS zone: `jackiesmithjr.com`

Resource group: `jm1-core-services`

Published records:

| Host | Type | Value |
| --- | --- | --- |
| `email.jackiesmithjr.com` | TXT | `ms-domain-verification=c43bee78-2cf1-475f-ace6-c386bb4513de` |
| `email.jackiesmithjr.com` | TXT | `v=spf1 include:spf.protection.outlook.com -all` |
| `selector1-azurecomm-prod-net._domainkey.email.jackiesmithjr.com` | CNAME | `selector1-azurecomm-prod-net._domainkey.azurecomm.net` |
| `selector2-azurecomm-prod-net._domainkey.email.jackiesmithjr.com` | CNAME | `selector2-azurecomm-prod-net._domainkey.azurecomm.net` |

## Sender Usernames

JSJ sender username readback:

| Domain | Username | Display name |
| --- | --- | --- |
| `email.jackiesmithjr.com` | `jackie` | Jackie Smith Jr. |

AIC sender username readback remains:

| Domain | Username | Display name |
| --- | --- | --- |
| `email.agapeic.org` | `aic` | Agape International Cathedral |

## Linked Domains

`acs-jm1-core` linked domains:

- `email.jmerrill.one`
- `email.agapeic.org`
- `email.jackiesmithjr.com`

No new Communication Service was created.
