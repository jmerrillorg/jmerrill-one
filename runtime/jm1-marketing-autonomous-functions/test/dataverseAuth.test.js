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
});
