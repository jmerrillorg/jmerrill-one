import { classifyCredentialMetadata } from './runtime.js';

export function buildCredentialMonitorRecords({
  marker,
  verifiedAt,
  meta,
  linkedin
}) {
  const metaClassification = classifyCredentialMetadata({
    issuedAt: meta.issuedAt,
    expiresAt: meta.expiresAt,
    rotationDueAt: meta.rotationDueAt,
    readbackAvailable: meta.present
  }, new Date(verifiedAt));

  const linkedinClassification = classifyCredentialMetadata({
    expiresAt: linkedin.expiresAt,
    notIssued: !linkedin.present,
    readbackAvailable: true
  }, new Date(verifiedAt));

  return [
    credentialRecord({
      key: 'meta',
      marker,
      verifiedAt,
      name: 'Meta Social Publisher system-user token',
      platform: 'Meta',
      credentialReference: meta.reference,
      credentialType: 'MetaSystemUserAccessToken',
      secretVersion: meta.secretVersion,
      replacementState: 'NOT_STARTED',
      classification: metaClassification
    }),
    credentialRecord({
      key: 'linkedin',
      marker,
      verifiedAt,
      name: 'LinkedIn Organization Publisher OAuth credential contract',
      platform: 'LinkedIn',
      credentialReference: linkedin.reference,
      credentialType: 'LinkedInOrganizationOAuthAccessToken',
      secretVersion: '',
      replacementState: linkedin.present ? 'NOT_STARTED' : 'WAITING_FOR_LINKEDIN_PRODUCT_APPROVAL_AND_OAUTH',
      classification: linkedinClassification,
      exceptionCode: linkedin.present ? undefined : 'LINKEDIN_CREDENTIAL_NOT_ISSUED_PRODUCT_REVIEW_PENDING'
    })
  ];
}

export async function executeCredentialMonitorScan(records, writeCredential) {
  const results = [];

  for (const record of records) {
    try {
      const write = await writeCredential(record.payload);
      results.push({ key: record.key, state: record.state, write, error: null });
    } catch (error) {
      results.push({
        key: record.key,
        state: 'READBACK_FAILED',
        write: null,
        error: boundedError(error)
      });
    }
  }

  return {
    results,
    processed: results.length,
    succeeded: results.filter((result) => !result.error).length,
    failed: results.filter((result) => result.error).length
  };
}

function credentialRecord({
  key,
  marker,
  verifiedAt,
  name,
  platform,
  credentialReference,
  credentialType,
  secretVersion,
  replacementState,
  classification,
  exceptionCode
}) {
  return {
    key,
    state: classification.state,
    payload: {
      jm1_name: name,
      jm1_branch: 'J Merrill Publishing',
      jm1_platform: platform,
      jm1_credentialreference: credentialReference,
      jm1_credentialtype: credentialType,
      jm1_secretversion: secretVersion || '',
      jm1_issuedat: classification.issuedAt,
      jm1_expiresat: classification.expiresAt,
      jm1_rotationdueat: classification.rotationDueAt,
      jm1_lastverifiedat: verifiedAt,
      jm1_currentcredentialstate: classification.state,
      jm1_replacementcredentialstate: replacementState,
      jm1_exceptioncode: exceptionCode ?? classification.exceptionCode,
      jm1_idempotencykey: `${marker}:credential:${key === 'meta' ? 'meta:system-user-token' : 'linkedin:organization-oauth-token'}`
    }
  };
}

function boundedError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[\r\n]+/g, ' ').slice(0, 300);
}
