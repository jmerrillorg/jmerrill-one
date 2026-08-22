# Storage TLS Remediation

| Storage | Before | After | Validation | Rollback |
| --- | --- | --- | --- | --- |
| jm1core | TLS1_0 | TLS1_2 | PASS: app/function state readback; public health unaffected | Rollback: set min TLS back to TLS1_0 if a proven legacy consumer fails |
| jm1pub | TLS1_0 | TLS1_2 | PASS: jmerrill.pub /api/health 200; App Insights exceptions 0 | Rollback: set min TLS back to TLS1_0 if a proven legacy consumer fails |
| jm1fin | TLS1_0 | TLS1_2 | PASS: jmerrill.financial /api/health 200; Function running; App Insights exceptions 0 | Rollback: set min TLS back to TLS1_0 if a proven legacy consumer fails |
| jm1media | TLS1_0 | TLS1_2 | PASS: config readback TLS1_2; public health unaffected | Rollback: set min TLS back to TLS1_0 if a proven legacy consumer fails |


Production resources changed:

- rg-jm1-core/jm1core minimum TLS: TLS1_0 -> TLS1_2
- jmerrill-pub/jm1pub minimum TLS: TLS1_0 -> TLS1_2
- jmerrill-financial_group/jm1fin minimum TLS: TLS1_0 -> TLS1_2
- rg-jm1-core/jm1media minimum TLS: TLS1_0 -> TLS1_2
