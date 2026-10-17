import assert from 'node:assert/strict';
import {
  buildSafeValueQuery,
  buildSettingNameQuery,
  serializeSafeFunctionAppMetadata,
  summarizeFunctionAppSettings
} from './lib/safe-function-app-metadata.mjs';

const fixture = [
  { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=stexample;AccountKey=never-print-this' },
  { name: 'JM1_META_SYSTEM_USER_TOKEN', value: 'token-never-print-this' },
  { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' },
  { name: 'JM1_RELEASE_SHA', value: 'abc123' },
  { name: 'JM1_META_TOKEN_SECRET_REFERENCE', value: 'jm1-core-vault/JM1-META-SOCIAL-PUBLISHER-SYSTEM-USER-TOKEN' },
  { name: 'UNREVIEWED_SETTING', value: 'unreviewed-never-print-this' }
];

const result = summarizeFunctionAppSettings(fixture, {
  resourceGroup: 'rg-jm1-ai',
  functionApp: 'func-jm1-marketing-runtime'
});
assert.equal(result.secretSettingPresence.AzureWebJobsStorage, true);
assert.equal(result.secretSettingPresence.JM1_META_SYSTEM_USER_TOKEN, true);
assert.equal(result.safeSettings.FUNCTIONS_EXTENSION_VERSION, '~4');
assert.equal(result.safeSettings.JM1_RELEASE_SHA, 'abc123');
assert.equal(result.safeSettings.UNREVIEWED_SETTING, undefined);

const serialized = serializeSafeFunctionAppMetadata(fixture, {
  resourceGroup: 'rg-jm1-ai',
  functionApp: 'func-jm1-marketing-runtime'
});
for (const forbidden of ['AccountKey=', 'never-print-this', 'token-never-print-this', 'unreviewed-never-print-this', 'stexample']) {
  assert.equal(serialized.includes(forbidden), false, `output must exclude ${forbidden}`);
}
assert.match(serialized, /"AzureWebJobsStorage": true/);
assert.equal(buildSettingNameQuery().includes("name=='AzureWebJobsStorage'") && !buildSettingNameQuery().includes('.value'), true);
assert.equal(buildSafeValueQuery().includes('AzureWebJobsStorage'), false);
assert.equal(buildSafeValueQuery().includes('JM1_META_SYSTEM_USER_TOKEN'), false);
process.stdout.write('Safe Function App metadata tests passed (12 checks).\n');
