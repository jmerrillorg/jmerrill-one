import test from 'node:test';
import assert from 'node:assert/strict';
import { createDataverseTokenProvider } from '../lib/dataverse-auth.mjs';

test('ONE intake managed identity uses the App Service resource token and no client secret flow', async () => {
  const requested = [];
  const provider = createDataverseTokenProvider({
    mode: 'system_assigned_managed_identity', resource: 'https://jm1hq.crm.dynamics.com',
    managedCredentialFactory: () => ({ async getToken(scope) {
      requested.push(scope);
      return { token: 'one-mi-token', expiresOnTimestamp: Date.now() + 3600000 };
    } }),
    fetchImpl: async () => { throw new Error('unexpected client credentials flow'); }
  });
  assert.equal(await provider(), 'one-mi-token');
  assert.deepEqual(requested, ['https://jm1hq.crm.dynamics.com/.default']);
});

test('ONE rejects unknown modes and missing identity wiring without fallback', async () => {
  let networkCalls = 0;
  const unsupported = createDataverseTokenProvider({ mode: 'default_credential', fetchImpl: async () => { networkCalls++; } });
  const missing = createDataverseTokenProvider({ mode: 'system_assigned_managed_identity', resource: 'https://jm1hq.crm.dynamics.com' });
  await assert.rejects(unsupported(), /Unsupported Dataverse auth mode/);
  await assert.rejects(missing(), /not configured/);
  assert.equal(networkCalls, 0);
});

test('ONE existing client-credential behavior remains explicit and cacheable', async () => {
  let calls = 0;
  const provider = createDataverseTokenProvider({
    mode: 'client_credentials', resource: 'https://jm1hq.crm.dynamics.com',
    tenantId: 'tenant', clientId: 'client', clientSecret: 'secret',
    fetchImpl: async (_url, init) => {
      calls++;
      assert.equal(new URLSearchParams(init.body).get('client_secret'), 'secret');
      return { ok: true, json: async () => ({ access_token: 'current-token', expires_in: 3600 }) };
    }
  });
  assert.equal(await provider(), 'current-token');
  assert.equal(await provider(), 'current-token');
  assert.equal(calls, 1);
});
