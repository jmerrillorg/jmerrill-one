# Permission Repair

Last verified: 2026-08-27T17:15:42Z

## Repairs Performed

1. Added `aic@jmerrill.one` / `aic@agapeic.org` to the existing `JM1 Publishing Mail Read Scope` group.
2. Updated the existing Application Access Policy description to reflect governed JM1 shared mailbox readback, rather than Publishing-only readback.
3. Granted delegated FullAccess to `jm1-admin@jmerrill.one` for AIC mailbox troubleshooting.
4. Implemented and deployed the Diagnostic Runner enterprise mailbox readback health route.

## Repairs Not Performed

- No additional ACS Communication Service.
- No new mailbox.
- No tenant-wide mail-read relaxation.
- No SendAs permission.
- No AIC proof resend.

## Residual Condition

Exchange `Test-ApplicationAccessPolicy` reports AIC as `Granted`, but production Graph folder readback still returns `ErrorAccessDenied`. This is preserved as the active residual condition.

