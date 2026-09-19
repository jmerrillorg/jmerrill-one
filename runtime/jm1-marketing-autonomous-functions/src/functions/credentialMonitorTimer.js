import { app } from '@azure/functions';
import {
  META_TOKEN_EXPIRES_AT,
  META_TOKEN_ISSUED_AT,
  META_TOKEN_ROTATION_DUE_AT,
  META_TOKEN_SECRET_REFERENCE,
  META_TOKEN_SECRET_VERSION,
  META_SYSTEM_USER_TOKEN,
  LINKEDIN_ACCESS_TOKEN,
  LINKEDIN_CLIENT_SECRET_REFERENCE,
  LINKEDIN_OAUTH_STATE_SECRET_REFERENCE,
  LINKEDIN_TOKEN_EXPIRES_AT,
  LINKEDIN_TOKEN_SECRET_REFERENCE,
  SYNTHETIC_CREDENTIAL_MONITOR_ENABLED
} from '../lib/config.js';
import { entitySet, upsertByIdempotency } from '../lib/dataverse.js';
import { buildCredentialMonitorRecords, executeCredentialMonitorScan } from '../lib/credentialMonitor.js';
import { currentFeaturedAuthorMarker, deterministicId, runEnvelope } from '../lib/runtime.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';

app.timer('credentialMonitorTimer', {
  schedule: process.env.JM1_CREDENTIAL_MONITOR_CRON || '0 7 12 * * *',
  handler: async (timer, context) => {
    const envelope = runEnvelope('AUTONOMOUS_CREDENTIAL_MONITOR', timer, context);
    return withDistributedTimerLease('credential-monitor', envelope, context, async () => {
    const credentialSet = await entitySet('jm1_credentialmonitor');
    const marker = currentFeaturedAuthorMarker(new Date(envelope.startedAt))
      || deterministicId('JM1_MARKETING', 'credential-monitor', 'global');
    const records = buildCredentialMonitorRecords({
      marker,
      verifiedAt: envelope.startedAt,
      meta: {
        present: Boolean(META_SYSTEM_USER_TOKEN),
        reference: META_TOKEN_SECRET_REFERENCE,
        secretVersion: META_TOKEN_SECRET_VERSION,
        issuedAt: META_TOKEN_ISSUED_AT,
        expiresAt: META_TOKEN_EXPIRES_AT,
        rotationDueAt: META_TOKEN_ROTATION_DUE_AT
      },
      linkedin: {
        present: Boolean(LINKEDIN_ACCESS_TOKEN),
        reference: LINKEDIN_TOKEN_SECRET_REFERENCE,
        expiresAt: LINKEDIN_TOKEN_EXPIRES_AT
      }
    });
    const scan = await executeCredentialMonitorScan(
      records,
      (payload) => upsertByIdempotency(credentialSet, 'jm1_credentialmonitorid', payload)
    );
    const governedDebt = scan.results.filter((result) => /EXPIRING|EXPIRED|UNKNOWN|INVALID|FAILED/.test(result.state));
    if (governedDebt.length > 0) {
      context.warn(JSON.stringify({
        event: 'CREDENTIAL_MONITOR_GOVERNED_DEBT',
        credentials: governedDebt.map((result) => ({ key: result.key, state: result.state })),
        founderAlertRequired: false,
        tokenValueLogged: false
      }));
    }

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
        credentials: scan.results,
        synthetic: syntheticWrite,
        syntheticException: syntheticExceptionWrite
      },
      credentialSummary: {
        processed: scan.processed,
        succeeded: scan.succeeded,
        failed: scan.failed,
        states: scan.results.map((result) => ({ key: result.key, state: result.state })),
        linkedinClientSecretReference: LINKEDIN_CLIENT_SECRET_REFERENCE,
        linkedinOauthStateSecretReference: LINKEDIN_OAUTH_STATE_SECRET_REFERENCE
      },
      tokenValueLogged: false
    }));
    if (scan.failed > 0) throw new Error(`Credential monitor completed with ${scan.failed} failed Dataverse write(s)`);
    });
  }
});
