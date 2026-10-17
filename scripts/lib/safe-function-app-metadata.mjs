const SAFE_VALUE_SETTINGS = new Set([
  'FUNCTIONS_EXTENSION_VERSION',
  'FUNCTIONS_WORKER_RUNTIME',
  'JM1_RELEASE_SHA',
  'JM1_META_TOKEN_SECRET_REFERENCE',
  'JM1_META_TOKEN_SECRET_VERSION',
  'JM1_META_TOKEN_ISSUED_AT_UTC',
  'JM1_META_TOKEN_EXPIRES_AT_UTC',
  'JM1_META_TOKEN_ROTATION_DUE_UTC'
]);

const SECRET_SETTING_NAMES = new Set([
  'AzureWebJobsStorage',
  'JM1_META_SYSTEM_USER_TOKEN',
  'META_TOKEN'
]);

export const DIAGNOSTIC_SETTING_NAMES = [
  ...SAFE_VALUE_SETTINGS,
  ...SECRET_SETTING_NAMES
];

export function buildSettingNameQuery() {
  return `[?${DIAGNOSTIC_SETTING_NAMES.map((name) => `name=='${name}'`).join(' || ')}].name`;
}

export function buildSafeValueQuery() {
  return `[?${[...SAFE_VALUE_SETTINGS].map((name) => `name=='${name}'`).join(' || ')}].{name:name,value:value}`;
}

export function summarizeFunctionAppSettings(settings, { resourceGroup, functionApp }) {
  const rows = Array.isArray(settings) ? settings : [];
  const names = new Set(rows.map((row) => String(row?.name || '')).filter((name) => DIAGNOSTIC_SETTING_NAMES.includes(name)));
  const safeSettings = {};

  for (const row of rows) {
    const name = String(row?.name || '');
    if (SAFE_VALUE_SETTINGS.has(name) && typeof row.value === 'string') {
      safeSettings[name] = row.value;
    }
  }

  return {
    resourceGroup,
    functionApp,
    settingNames: [...names].sort(),
    secretSettingPresence: Object.fromEntries(
      [...SECRET_SETTING_NAMES].map((name) => [name, names.has(name)])
    ),
    safeSettings
  };
}

export function serializeSafeFunctionAppMetadata(settings, identity) {
  return `${JSON.stringify(summarizeFunctionAppSettings(settings, identity), null, 2)}\n`;
}
