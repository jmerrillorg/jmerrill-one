import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  compareRuntimeInventories,
  normalizeRuntimeInventory,
  validateRuntimeInventory,
  validateSourceInventory
} from './verify-marketing-function-inventory.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRoot = path.join(repoRoot, 'runtime/jm1-marketing-autonomous-functions');
const inventory = JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'function-inventory.json'), 'utf8'));

function deploymentFunctions(entries = inventory.functions) {
  return entries.map((entry) => ({
    name: `func-jm1-marketing-runtime/${entry.name}`,
    config: { bindings: [{ direction: 'in', type: entry.triggerType }] }
  }));
}

test('source inventory matches all registered trigger names, types, and source files', () => {
  const actual = validateSourceInventory(inventory, runtimeRoot);
  assert.equal(actual.length, 8);
  assert.equal(actual.filter((entry) => entry.triggerType === 'timerTrigger').length, 7);
  assert.equal(actual.filter((entry) => entry.triggerType === 'queueTrigger').length, 1);
});

test('deployed runtime passes only when every expected trigger and type is present', () => {
  assert.equal(validateRuntimeInventory(inventory, deploymentFunctions()).length, 8);
});

test('missing deployed trigger fails', () => {
  assert.throws(() => validateRuntimeInventory(inventory, deploymentFunctions().slice(1)), /missing: catalogMarketingHealthTimer/);
});

test('unexpected deployed trigger fails', () => {
  const actual = deploymentFunctions();
  actual.push({ name: 'func-jm1-marketing-runtime/unownedTimer', config: { bindings: [{ direction: 'in', type: 'timerTrigger' }] } });
  assert.throws(() => validateRuntimeInventory(inventory, actual), /unexpected: unownedTimer/);
});

test('unexpected source trigger type and ownership fail', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'jm1-trigger-owner-'));
  try {
    const functionsDir = path.join(temp, 'src/functions');
    fs.mkdirSync(functionsDir, { recursive: true });
    fs.writeFileSync(path.join(functionsDir, 'new.js'), "app.http('unreviewedEndpoint', {});\n");
    assert.throws(() => validateSourceInventory({ schemaVersion: 1, functions: inventory.functions }, temp), /unexpected: unreviewedEndpoint/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('changed deployed trigger type fails', () => {
  const actual = deploymentFunctions();
  actual.find((entry) => entry.name.endsWith('/productionAssetRegistrationQueue')).config.bindings[0].type = 'timerTrigger';
  assert.throws(() => validateRuntimeInventory(inventory, actual), /trigger type mismatch: productionAssetRegistrationQueue/);
});

test('duplicate runtime names and multiple triggers fail', () => {
  const duplicate = deploymentFunctions();
  duplicate.push(duplicate[0]);
  assert.throws(() => normalizeRuntimeInventory(duplicate), /duplicate Function/);
  const multiple = deploymentFunctions();
  multiple[0].config.bindings.push({ direction: 'in', type: 'queueTrigger' });
  assert.throws(() => normalizeRuntimeInventory(multiple), /exactly one input trigger/);
});

test('source inventory fails closed when a registration is missing or added', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'jm1-trigger-inventory-'));
  try {
    const functionsDir = path.join(temp, 'src/functions');
    fs.mkdirSync(functionsDir, { recursive: true });
    fs.writeFileSync(path.join(functionsDir, 'known.js'), "app.timer('knownTimer', {});\n");
    const fixture = { schemaVersion: 1, functions: [{ name: 'knownTimer', triggerType: 'timerTrigger', source: 'src/functions/known.js' }] };
    assert.equal(validateSourceInventory(fixture, temp).length, 1);
    fs.writeFileSync(path.join(functionsDir, 'added.js'), "app.storageQueue('unownedQueue', {});\n");
    assert.throws(() => validateSourceInventory(fixture, temp), /unexpected: unownedQueue/);
    fs.rmSync(path.join(functionsDir, 'added.js'));
    fs.writeFileSync(path.join(functionsDir, 'known.js'), "app.timer('otherTimer', {});\n");
    assert.throws(() => validateSourceInventory(fixture, temp), /missing: knownTimer; unexpected: otherTimer/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('rollback readback must equal the captured pre-release inventory', () => {
  const snapshot = deploymentFunctions();
  assert.equal(compareRuntimeInventories(inventory.functions, snapshot).length, 8);
  assert.throws(() => compareRuntimeInventories(inventory.functions, snapshot.slice(0, -1)), /missing: websiteIntakeReconciliationTimer/);
});
