import { app } from '@azure/functions';
import {
  META_TOKEN_EXPIRES_AT,
  META_TOKEN_ISSUED_AT,
  META_TOKEN_ROTATION_DUE_AT,
  META_TOKEN_SECRET_REFERENCE,
  META_TOKEN_SECRET_VERSION,
  SYNTHETIC_CREDENTIAL_MONITOR_ENABLED
} from '../lib/config.js';
import { entitySet, upsertByIdempotency } from '../lib/dataverse.js';
import { credentialState, isoNow, octoberIyorwueseMarker, runEnvelope } from '../lib/runtime.js';

app.timer('credentialMonitorTimer', {
  schedule: process.env.JM1_CREDENTIAL_MONITOR_CRON || '0 7 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_CREDENTIAL_MONITOR', timer, context);
    const credentialSet = await entitySet('jm1_credentialmonitor');
    const marker = octoberIyorwueseMarker();
    const state = credentialState(META_TOKEN_ROTATION_DUE_AT, META_TOKEN_EXPIRES_AT);

    const productionWrite = await upsertByIdempotency(credentialSet, 'jm1_credentialmonitorid', {
      jm1_name: 'Meta Social Publisher system-user token',
      jm1_branch: 'J Merrill Publishing',
      jm1_platform: 'Meta',
      jm1_credentialreference: META_TOKEN_SECRET_REFERENCE,
      jm1_credentialtype: 'MetaSystemUserAccessToken',
      jm1_secretversion: META_TOKEN_SECRET_VERSION,
      jm1_issuedat: META_TOKEN_ISSUED_AT,
      jm1_expiresat: META_TOKEN_EXPIRES_AT,
      jm1_rotationdueat: META_TOKEN_ROTATION_DUE_AT,
      jm1_lastverifiedat: envelope.startedAt,
      jm1_currentcredentialstate: state,
      jm1_replacementcredentialstate: 'NOT_STARTED',
      jm1_exceptioncode: state === 'META_CREDENTIAL_ROTATION_DUE' ? 'META_CREDENTIAL_ROTATION_DUE' : '',
      jm1_idempotencykey: `${marker}:credential:meta:system-user-token`
    });

    let syntheticWrite = null;
    let syntheticExceptionWrite = null;
    if (SYNTHETIC_CREDENTIAL_MONITOR_ENABLED) {
      syntheticWrite = await upsertByIdempotency(credentialSet, 'jm1_credentialmonitorid', {
        jm1_name: 'Synthetic Meta credential rotation threshold proof',
        jm1_branch: 'J Merrill Publishing',
        jm1_platform: 'Meta',
        jm1_credentialreference: 'SYNTHETIC_NO_SECRET',
        jm1_credentialtype: 'SyntheticCredentialMonitorProof',
        jm1_secretversion: 'synthetic',
        jm1_issuedat: '2026-09-02T00:00:00Z',
        jm1_expiresat: '2026-09-03T00:00:00Z',
        jm1_rotationdueat: '2026-09-02T00:00:00Z',
        jm1_lastverifiedat: envelope.startedAt,
        jm1_currentcredentialstate: 'META_CREDENTIAL_ROTATION_DUE',
        jm1_replacementcredentialstate: 'SYNTHETIC_NO_REAL_TOKEN_REPLACEMENT',
        jm1_exceptioncode: 'META_CREDENTIAL_ROTATION_DUE',
        jm1_idempotencykey: `${marker}:credential:meta:synthetic-rotation-due-proof`
      });

      const exceptionSet = await entitySet('jm1_marketingexception');
      syntheticExceptionWrite = await upsertByIdempotency(exceptionSet, 'jm1_marketingexceptionid', {
        jm1_name: 'Synthetic Meta credential rotation exception proof',
        jm1_branch: 'J Merrill Publishing',
        jm1_campaign: 'October 2026 Featured Author - Iyorwuese',
        jm1_workrecord: `${marker}:credential:meta:synthetic-rotation-due-proof`,
        jm1_exceptiontype: 'CREDENTIAL_ROTATION_DUE',
        jm1_severity: 'P1',
        jm1_reason: 'Synthetic monitor row crossed the configured rotation threshold without altering the real Meta system-user token expiration.',
        jm1_resolutionstate: 'OPEN_GOVERNED_ROTATION_REQUIRED',
        jm1_resolution: 'Rotate the credential through governed secure storage, validate the replacement, then close the exception.',
        jm1_authorityrequired: 'JM1 platform administrator',
        jm1_createdat: envelope.startedAt,
        jm1_idempotencykey: `${marker}:exception:credential:meta:synthetic-rotation-due-proof`
      });
    }

    context.log(JSON.stringify({
      ...envelope,
      dataverseWrite: {
        entitySet: credentialSet,
        production: productionWrite,
        synthetic: syntheticWrite,
        syntheticException: syntheticExceptionWrite
      },
      productionCredentialState: state,
      tokenValueLogged: false
    }));
  }
});
