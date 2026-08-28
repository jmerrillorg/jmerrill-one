# Graph User Differential

Last verified: 2026-08-27T18:53:01Z

| Attribute | Publishing | AIC |
| --- | --- | --- |
| id | `8a519ced-ddf5-4d1d-92ce-66a79de23ed4` | `516ec810-7be4-4bfe-97b4-7d7756732111` |
| displayName | J Merrill Publishing | Agape International Cathedral |
| userPrincipalName | `publishing@jmerrill.one` | `aic@jmerrill.one` |
| mail | `publishing@jmerrill.one` | `aic@agapeic.org` |
| mailNickname | publishing | aic |
| accountEnabled | true | false |
| userType | Member | Member |
| assignedLicenses | 4 assigned licenses | none |
| createdDateTime | `2025-09-13T16:33:38Z` | `2026-08-26T22:43:12Z` |
| proxyAddresses | `SMTP:publishing@jmerrill.one` | `smtp:aic@jmerrillfoundation.onmicrosoft.com`; `smtp:aic@jmerrill.one`; `SMTP:aic@agapeic.org` |
| onPremisesSyncEnabled | null | null |

## Interpretation

AIC's disabled account and absence of direct license are expected for a shared mailbox and are not proven causal, because the production app-only Graph mail read currently succeeds for AIC folders.

The UPN/primary SMTP distinction is also not causal because the selected production read principal was `aic@agapeic.org` and the current folder probe passed.

