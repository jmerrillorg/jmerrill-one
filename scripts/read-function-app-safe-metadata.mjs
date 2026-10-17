import { execFileSync } from 'node:child_process';
import {
  buildSafeValueQuery,
  buildSettingNameQuery,
  serializeSafeFunctionAppMetadata
} from './lib/safe-function-app-metadata.mjs';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const resourceGroup = args.get('--resource-group');
const functionApp = args.get('--function-app');
const allowedApps = new Set(['func-jm1-marketing-runtime', 'func-jm1-diagnostic-ai-runner']);

if (!resourceGroup || !allowedApps.has(functionApp)) {
  process.stderr.write('Usage: node scripts/read-function-app-safe-metadata.mjs --resource-group <group> --function-app <approved-function-app>\n');
  process.exit(2);
}

try {
  const sharedArgs = [
    'functionapp', 'config', 'appsettings', 'list',
    '--resource-group', resourceGroup,
    '--name', functionApp
  ];
  const nameRows = JSON.parse(execFileSync('az', [
    ...sharedArgs,
    '--query', buildSettingNameQuery(),
    '--output', 'json'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  const safeValues = JSON.parse(execFileSync('az', [
    ...sharedArgs,
    '--query', buildSafeValueQuery(),
    '--output', 'json'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  const settings = [
    ...nameRows.map((name) => ({ name })),
    ...safeValues
  ];
  process.stdout.write(serializeSafeFunctionAppMetadata(settings, { resourceGroup, functionApp }));
} catch {
  process.stderr.write('Unable to read Function App settings metadata; no setting values were emitted.\n');
  process.exit(1);
}
