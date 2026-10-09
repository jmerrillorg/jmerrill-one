#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function validateSourceInventory(inventory, sourceRoot) {
  const expected = normalizeExpected(inventory);
  const registrations = scanRegistrations(sourceRoot);
  compareFunctions(expected, registrations, 'source');
  return registrations;
}

export function normalizeRuntimeInventory(runtimeFunctions) {
  if (!Array.isArray(runtimeFunctions)) throw new Error('Runtime Functions readback must be a JSON array.');
  const seen = new Set();
  return runtimeFunctions.map((item) => {
    const name = String(item?.name || '').split('/').at(-1);
    let config = item?.config;
    if (typeof config === 'string') config = JSON.parse(config);
    const bindings = config?.bindings ?? item?.bindings;
    if (!name || !Array.isArray(bindings)) throw new Error('Runtime Function is missing its name or binding list.');
    if (seen.has(name)) throw new Error(`Runtime contains duplicate Function ${name}.`);
    seen.add(name);
    const triggers = bindings.filter((binding) => binding?.direction === 'in' && /Trigger$/i.test(String(binding?.type || '')));
    if (triggers.length !== 1) throw new Error(`Runtime Function ${name} must have exactly one input trigger; found ${triggers.length}.`);
    return { name, triggerType: triggers[0].type };
  });
}

export function validateRuntimeInventory(inventory, runtimeFunctions) {
  const expected = normalizeExpected(inventory).map(({ name, triggerType }) => ({ name, triggerType }));
  const actual = normalizeRuntimeInventory(runtimeFunctions);
  compareFunctions(expected, actual, 'deployed runtime');
  return actual;
}

export function compareRuntimeInventories(expectedFunctions, actualFunctions) {
  const expected = normalizeExpected({ schemaVersion: 1, functions: expectedFunctions }).map(({ name, triggerType }) => ({ name, triggerType }));
  const actual = normalizeRuntimeInventory(actualFunctions);
  compareFunctions(expected, actual, 'restored runtime');
  return actual;
}

function normalizeExpected(inventory) {
  if (!inventory || inventory.schemaVersion !== 1 || !Array.isArray(inventory.functions) || inventory.functions.length === 0) {
    throw new Error('Expected a non-empty schemaVersion 1 Function inventory.');
  }
  const seen = new Set();
  return inventory.functions.map((entry) => {
    if (!entry?.name || !entry?.triggerType || (entry.source !== undefined && !entry.source)) {
      throw new Error('Each inventory entry requires name and triggerType, and source when validating source.');
    }
    if (seen.has(entry.name)) throw new Error(`Duplicate Function inventory name: ${entry.name}.`);
    seen.add(entry.name);
    return { name: entry.name, triggerType: entry.triggerType, ...(entry.source ? { source: entry.source } : {}) };
  });
}

function scanRegistrations(sourceRoot) {
  const registrations = [];
  let calls = 0;
  const functionsRoot = path.join(sourceRoot, 'src/functions');
  if (!fs.existsSync(functionsRoot)) throw new Error(`Function source directory not found: ${functionsRoot}`);
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && /\.(?:js|mjs)$/.test(entry.name)) {
        const contents = fs.readFileSync(fullPath, 'utf8');
        calls += [...contents.matchAll(/\bapp\.[A-Za-z][A-Za-z0-9]*\s*\(/g)].length;
        const pattern = /\bapp\.([A-Za-z][A-Za-z0-9]*)\s*\(\s*(['"])([^'"]+)\2/g;
        for (const match of contents.matchAll(pattern)) {
          const triggerType = ({
            timer: 'timerTrigger',
            storageQueue: 'queueTrigger',
            http: 'httpTrigger',
            storageBlob: 'blobTrigger',
            serviceBusQueue: 'serviceBusTrigger',
            serviceBusTopic: 'serviceBusTrigger',
            eventHub: 'eventHubTrigger',
            cosmosDB: 'cosmosDBTrigger'
          })[match[1]] || `unmappedAppMethod:${match[1]}`;
          registrations.push({
            name: match[3],
            triggerType,
            source: path.relative(sourceRoot, fullPath).split(path.sep).join('/')
          });
        }
      }
    }
  };
  visit(functionsRoot);
  if (calls !== registrations.length) throw new Error('Every app.timer/app.storageQueue registration must use a literal name.');
  return registrations;
}

function compareFunctions(expected, actual, label) {
  const expectedByName = new Map(expected.map((entry) => [entry.name, entry]));
  const actualByName = new Map();
  for (const entry of actual) {
    if (actualByName.has(entry.name)) throw new Error(`${label} contains duplicate Function ${entry.name}.`);
    actualByName.set(entry.name, entry);
  }
  const missing = [...expectedByName.keys()].filter((name) => !actualByName.has(name));
  const unexpected = [...actualByName.keys()].filter((name) => !expectedByName.has(name));
  const wrongTypes = [...expectedByName.keys()].filter((name) => actualByName.has(name) && expectedByName.get(name).triggerType !== actualByName.get(name).triggerType);
  const wrongSources = [...expectedByName.keys()].filter((name) => {
    const expectedSource = expectedByName.get(name).source;
    return expectedSource && actualByName.has(name) && expectedSource !== actualByName.get(name).source;
  });
  if (missing.length || unexpected.length || wrongTypes.length || wrongSources.length) {
    const details = [
      missing.length && `missing: ${missing.join(', ')}`,
      unexpected.length && `unexpected: ${unexpected.join(', ')}`,
      wrongTypes.length && `trigger type mismatch: ${wrongTypes.join(', ')}`,
      wrongSources.length && `source ownership mismatch: ${wrongSources.join(', ')}`
    ].filter(Boolean).join('; ');
    throw new Error(`${label} Function inventory mismatch (${details}).`);
  }
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!['--source-root', '--inventory', '--runtime-json', '--capture-runtime', '--compare-runtime'].includes(key)) {
      throw new Error(`Unknown argument: ${key}`);
    }
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${key}`);
    parsed[key.slice(2)] = args[++i];
  }
  return parsed;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args['capture-runtime'] && args['compare-runtime']) throw new Error('Choose capture or compare mode, not both.');
  if (args.inventory && args['source-root']) {
    const inventory = readJson(args.inventory);
    const sourceRoot = path.resolve(args['source-root']);
    const source = validateSourceInventory(inventory, sourceRoot);
    if (!args['capture-runtime'] && !args['compare-runtime']) process.stdout.write(`Source inventory PASS: ${source.length} Functions.\n`);
    if (args['runtime-json'] && !args['capture-runtime'] && !args['compare-runtime']) {
      const runtime = readJson(args['runtime-json']);
      const normalized = validateRuntimeInventory(inventory, runtime);
      process.stdout.write(`Deployed inventory PASS: ${normalized.length} Functions.\n`);
    }
    if (args['compare-runtime']) {
      const expected = readJson(args['compare-runtime']);
      const runtime = readJson(args['runtime-json']);
      const normalized = compareRuntimeInventories(expected.functions, runtime);
      process.stdout.write(`Restored runtime matches captured inventory: ${normalized.length} Functions.\n`);
    }
    if (args['capture-runtime']) {
      const runtime = readJson(args['runtime-json']);
      const normalized = normalizeRuntimeInventory(runtime);
      if (normalized.length === 0) throw new Error('Cannot capture an empty runtime inventory.');
      fs.writeFileSync(args['capture-runtime'], `${JSON.stringify({ schemaVersion: 1, functions: normalized }, null, 2)}\n`, { flag: 'wx' });
      process.stdout.write(`Captured pre-release runtime inventory: ${normalized.length} Functions.\n`);
    }
    return;
  }
  throw new Error('Provide --source-root and --inventory, and a runtime mode requires --runtime-json.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
