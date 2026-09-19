# Failure Reproduction

## Production evidence

The scheduled monitor updated the Meta row and then failed while creating the not-yet-issued LinkedIn row. The Dataverse POST to `jm1_credentialmonitors` rejected an invalid year 0001 value in a DateTime field. Seven daily executions were affected before repair.

## Failure class

- Location: credential payload construction and Dataverse writeback.
- Failed field class: nullable credential DateTime fields (`issued`, `expires`, and `rotation due`).
- Input: empty strings for an unissued LinkedIn credential.
- Before: empty strings reached Dataverse, were interpreted as invalid minimum dates, and terminated the whole timer invocation.
- Required semantics: the credential is `NOT_ISSUED`; nullable dates are null. A credential with a missing expiration but otherwise issued is `EXPIRATION_UNKNOWN`.

The defect was reproduced in bounded automated tests without creating a production credential or changing production schema.
