import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.DATAVERSE_AUTH_MODE = 'system_assigned_managed_identity';
process.env.DATAVERSE_RESOURCE_URL = 'https://jm1hq.crm.dynamics.com';

const { createDataverseTokenProvider, DATAVERSE_ENTITY_SETS } = await import('../src/lib/dataverse.js');
const { entitySet } = await import('../src/lib/dataverse.js');

test('managed identity uses only the Dataverse .default scope and never calls client-credential endpoint', async () => {
  const calls = [];
  class Credential {
    async getToken(scope) { calls.push(scope); return { token: 'mi-token', expiresOnTimestamp: Date.now() + 3600000 }; }
  }
  const provider = createDataverseTokenProvider({
    mode: 'system_assigned_managed_identity', resource: 'https://org.crm.dynamics.com',
    fetchImpl: async () => { throw new Error('unexpected OAuth client-credential request'); },
    managedCredentialFactory: () => new Credential()
  });
  assert.equal(await provider(), 'mi-token');
  assert.deepEqual(calls, ['https://org.crm.dynamics.com/.default']);
});

test('existing client-credential mode remains explicit and cacheable', async () => {
  let requests = 0;
  const provider = createDataverseTokenProvider({
    mode: 'client_credentials', resource: 'https://org.crm.dynamics.com', tenantId: 'tenant',
    clientId: 'client', clientSecret: 'secret',
    fetchImpl: async (_url, init) => {
      requests++;
      const form = new URLSearchParams(init.body);
      assert.equal(form.get('client_secret'), 'secret');
      return { ok: true, json: async () => ({ access_token: 'app-token', expires_in: 3600 }) };
    }
  });
  assert.equal(await provider(), 'app-token');
  assert.equal(await provider(), 'app-token');
  assert.equal(requests, 1);
});

test('unsupported auth mode and unconfigured identity fail closed without fallback', async () => {
  let requests = 0;
  const denied = createDataverseTokenProvider({ mode: 'default_credential_chain', fetchImpl: async () => { requests++; } });
  await assert.rejects(denied(), /Unsupported Dataverse auth mode/);
  const missingIdentity = createDataverseTokenProvider({ mode: 'system_assigned_managed_identity', resource: '' });
  await assert.rejects(missingIdentity(), /requires a resource URL/);
  assert.equal(requests, 0);
});

test('entity-set mapping accepts only reviewed logical names', async () => {
  assert.equal(await entitySet('jm1_campaignauthority'), 'jm1_campaignauthorities');
  assert.equal(await entitySet('jm1pub_title'), 'jm1pub_titles');
  assert.equal(await entitySet('jm1_executionlog'), 'jm1_executionlogs');
  assert.equal(await entitySet('contact'), 'contacts');
  await assert.rejects(entitySet('jm1_unreviewedentity'), /not allowlisted/);
});

test('permission contract enumerates each registered Function trigger once', () => {
  const contract = JSON.parse(readFileSync(new URL('../dataverse-access-contract.json', import.meta.url), 'utf8'));
  const inventory = JSON.parse(readFileSync(new URL('../function-inventory.json', import.meta.url), 'utf8'));
  assert.deepEqual(DATAVERSE_ENTITY_SETS, contract.verifiedEntitySetMap);
  const names = contract.functions.map((item) => item.name).sort();
  const triggers = inventory.functions.map((item) => item.name).sort();
  assert.equal(names.length, 8);
  assert.deepEqual(names, triggers);
  assert.equal(contract.status, 'SOURCE_CONTRACT_ONLY_NOT_PRODUCTION_AUTHORITY');
  assert.equal(contract.contractVersion, 3);
  assert.equal(contract.adoptionContract.status, 'PROPOSAL_PENDING_DATAVERSE_SECURITY_OWNER_REVIEW_AND_ACTUAL_IDENTITY_TESTS');
  assert.equal(contract.liveOwnershipInventory.ownedRowCounts.jm1_executionlogs, 55299);
  assert.equal(contract.liveOwnershipInventory.ownedRowCounts.leads, 91);
  assert.equal(contract.liveEffectivePrivilegeReadback.effectivePrivilegeEntries, 19705);
  assert.equal(contract.liveEffectivePrivilegeReadback.depthCounts.Global, 19665);
  assert.equal(contract.auth.functionResource.systemAssignedClientId, 'e6a47c11-b42c-424a-8e4b-241be8f1050a');
  assert.equal(contract.liveOwnershipInventory.entityOwnershipTypes.OrganizationOwned.length, 4);
  assert.match(contract.adoptionContract.liveSecurityConstraints.contactAlternateKey, /not normalized email/);
  assert.match(contract.adoptionContract.proposedRoles[1].contactScopeDecision, /Option A: accept Deep Contact Read/);
  assert.match(contract.adoptionContract.proposedRoles[1].leadScope, /do not establish a query need/);
  assert.match(contract.adoptionContract.liveSecurityConstraints.assignment, /Do not grant Assign/);
  assert.deepEqual(contract.adoptionContract.liveSecurityConstraints.organizationOwnedPrivilegeUnion, {
    jm1pub_titlemarketinghealths: ['Read', 'Create', 'Write'],
    jm1pub_productionassets: ['Read', 'Create', 'Write'],
    jm1pub_editorialapprovalgates: ['Read'],
    jm1pub_editorialartifacts: ['Read']
  });
  assert.equal(contract.adoptionContract.sourceOwnershipAndArtifactGate.status, 'BLOCKED_PROVENANCE_AND_ADOPTION');
  assert.deepEqual(Object.keys(contract.adoptionContract.actualCallerAcceptance).sort(), ['functionHost', 'oneWebHost', 'testData']);
  assert.match(contract.adoptionContract.perHostRollback.function, /restore func-jm1-marketing-runtime/);
  assert.match(contract.adoptionContract.perHostRollback.oneWeb, /restore app-jm1-one-prod-v2/);
  assert.equal(contract.adoptionContract.requiredPreCutoverProof.length, 5);
});
