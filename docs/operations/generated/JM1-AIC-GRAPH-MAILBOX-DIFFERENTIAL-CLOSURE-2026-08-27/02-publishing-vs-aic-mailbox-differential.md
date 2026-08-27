# Publishing vs AIC Mailbox Differential

Last verified: 2026-08-27T18:52:30Z

| Attribute | Publishing | AIC | Match / Difference | Operational Significance |
| --- | --- | --- | --- | --- |
| RecipientType | UserMailbox | UserMailbox | MATCH | Both are mailbox-backed user objects in Exchange. |
| RecipientTypeDetails | UserMailbox | SharedMailbox | DIFFERENCE | Expected: Publishing is a normal mailbox; AIC is a shared mailbox. Not causal because AIC Graph folder readback now passes. |
| PrimarySmtpAddress | `publishing@jmerrill.one` | `aic@agapeic.org` | DIFFERENCE | Expected brand/domain difference. Not causal because object ID, UPN, and primary SMTP routing were tested. |
| UserPrincipalName | `publishing@jmerrill.one` | `aic@jmerrill.one` | DIFFERENCE | Expected UPN/SMTP split for AIC. Not causal because primary SMTP now reads successfully. |
| ExternalDirectoryObjectId | `8a519ced-ddf5-4d1d-92ce-66a79de23ed4` | `516ec810-7be4-4bfe-97b4-7d7756732111` | DIFFERENCE | Normal different objects. |
| ExchangeGuid | `cb943bf2-9401-4eea-9582-aa2e13f438b9` | `6e135ebb-0e16-4059-9e91-9a2d9fefdbe4` | DIFFERENCE | Both present; proves mailbox backing exists. |
| MailboxGuid | `cb943bf2-9401-4eea-9582-aa2e13f438b9` | `6e135ebb-0e16-4059-9e91-9a2d9fefdbe4` | DIFFERENCE | Both present; proves mailbox-store backing exists. |
| Database | `namprd15.prod.outlook.com/9ce71a9d-521e-45a4-90c1-7b45c4ae1d54` | `namprd15.prod.outlook.com/f72a11e0-8e14-4b73-93c0-413c3795c80a` | DIFFERENCE | Both assigned. Not a defect. |
| ServerName | `ds4ppf2e1cc441b` | `ph7pr15mb6081` | DIFFERENCE | Normal Exchange Online placement difference. |
| IsMailboxEnabled | true | true | MATCH | AIC is mailbox-enabled. |
| IsDirSynced | false | false | MATCH | Both cloud-managed. |
| AccountDisabled | false | true | DIFFERENCE | Expected for shared mailbox. Not causal because app-only Graph mail read now passes. |
| HiddenFromAddressListsEnabled | false | false | MATCH | Not a cause. |
| WindowsEmailAddress | `publishing@jmerrill.one` | `aic@agapeic.org` | DIFFERENCE | Expected public reply identity difference. |
| ExchangeUserAccountControl | None | AccountDisabled | DIFFERENCE | Expected shared-mailbox sign-in posture. Not causal to app-only mail read. |
| IsSoftDeletedByRemove | false | false | MATCH | Not soft-deleted. |
| IsSoftDeletedByDisable | false | false | MATCH | Not soft-deleted by disable. |
| LitigationHoldEnabled | false | false | MATCH | Not causal. |
| RetentionHoldEnabled | false | false | MATCH | Not causal. |
| MailboxPlan | `ExchangeOnline-66035873-8358-49e2-af1e-b65342b7ad93` | `ExchangeOnline-66035873-8358-49e2-af1e-b65342b7ad93` | MATCH | Same mailbox plan. |
| Quota | 100 GB send/receive | 50 GB send/receive | DIFFERENCE | Expected license/shared mailbox difference; not causal. |
| ItemCount | 3194 | 6 | DIFFERENCE | AIC has small mailbox content but folders are readable. |
| TotalItemSize | 675.2 MB | 339.4 KB | DIFFERENCE | AIC is well below shared-mailbox licensing threshold. |

