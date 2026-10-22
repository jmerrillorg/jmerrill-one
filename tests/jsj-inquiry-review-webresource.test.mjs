import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID, webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const html = readFileSync(new URL('../powerplatform/webresources/jm1_jsj_inquiry_review.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const id = '12345678-1234-1234-1234-123456789abc';
const storageKey = `jm1-jsj-review-${id}`;
const reference = 'JSJ-TEST-REVIEW';

function harness({ saved = null, execute = async () => 'ACCEPTED' } = {}) {
  const elements = Object.fromEntries(
    ['review', 'status', 'action', 'target', 'submit', 'next', 'due', 'reference', 'reason',
      'target-wrap', 'next-wrap', 'due-wrap', 'reference-wrap', 'reason-wrap']
      .map((name) => [name, { value: '', hidden: false, disabled: false, listeners: {},
        addEventListener(type, fn) { this.listeners[type] = fn; } }]),
  );
  const values = new Map(saved ? [[storageKey, JSON.stringify(saved)]] : []);
  const calls = [];
  const row = { jm1_name: reference, jm1_deliverystate: 'DELIVERED', jm1_closedat: null,
    jm1_reviewhistory: null, versionnumber: 42 };
  const context = {
    document: { getElementById: (name) => elements[name] },
    location: { search: `?id=${id}&typename=jm1_jsjinquiry` },
    parent: { Xrm: { WebApi: {
      retrieveRecord: async () => ({ ...row }),
      online: { execute: async (request) => {
        calls.push(request);
        const result = await execute(request, row);
        return { ok: true, json: async () => ({ Result: result }) };
      } },
    } } },
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    crypto: { subtle: webcrypto.subtle, randomUUID },
    TextEncoder, URLSearchParams, Date,
  };
  runInNewContext(script, context);
  const submit = async () => {
    await new Promise((resolve) => setImmediate(resolve));
    return elements.review.listeners.submit({ preventDefault() {} });
  };
  return { elements, values, calls, row, submit };
}

test('invalid closure never reserves an idempotency key or calls Dataverse', async () => {
  const ui = harness();
  ui.elements.action.value = 'CLOSE_NO_FURTHER_ACTION';
  await ui.submit();
  assert.equal(ui.values.has(storageKey), false);
  assert.equal(ui.calls.length, 0);
});

test('Follow up is an explicit intention backed by the existing WAIT action', async () => {
  const ui = harness({ execute: async (request, row) => {
    row.jm1_reviewhistory = JSON.stringify([{ key: request.IdempotencyKey, state: 'WAITING', at: new Date().toISOString() }]);
    return 'ACCEPTED';
  } });
  ui.elements.action.value = 'FOLLOWUP_INTENT';
  ui.elements.next.value = 'Consider replying to the sender';
  ui.elements.due.value = '2027-01-01T12:00';
  await ui.submit();
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].ActionId, 'WAIT');
  assert.equal(ui.calls[0].NextAction, 'Consider replying to the sender');
  assert.equal(ui.calls[0].ExternalReference, '');
  assert.match(html, /Follow up \(plan only; no message sent\)/);
  assert.match(html, /Dismiss \(no reply sent\)/);
  assert.match(html, /Keep open/);
});

test('legacy blank-reason attempt is replayed under its original key before correction', async () => {
  const payload = {
    InquiryId: id, Reference: reference, ActionId: 'CLOSE_NO_FURTHER_ACTION',
    ExpectedVersion: '42', NextAction: '', DueAt: '', ExternalReference: '',
    Reason: '', TargetState: '', CorrectionOf: '',
  };
  const key = randomUUID();
  const saved = { key, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex') };
  let attempts = 0;
  const ui = harness({ saved, execute: async (request, row) => {
    attempts++;
    if (attempts === 1) throw new Error('JSJ_REVIEW_CLOSURE_INVALID');
    row.jm1_reviewhistory = JSON.stringify([{ key: request.IdempotencyKey, state: 'CLOSED_NO_FURTHER_ACTION', at: new Date().toISOString() }]);
    return 'ACCEPTED';
  } });
  ui.elements.action.value = 'CLOSE_NO_FURTHER_ACTION';
  ui.elements.reason.value = 'NO_RESPONSE_NEEDED';
  await ui.submit();
  assert.equal(ui.calls.length, 1, ui.elements.status.textContent);
  assert.equal(ui.calls[0].IdempotencyKey, key);
  assert.equal(ui.calls[0].Reason, '');
  assert.equal(ui.values.has(storageKey), false);
  assert.equal(JSON.parse(ui.values.get(`${storageKey}-rejected`)).code, 'JSJ_REVIEW_CLOSURE_INVALID');
  await ui.submit();
  assert.equal(ui.calls[1].Reason, 'NO_RESPONSE_NEEDED');
  assert.notEqual(ui.calls[1].IdempotencyKey, key);
  assert.equal(ui.values.has(storageKey), false);
  assert.equal(ui.elements.status.textContent, 'Review action recorded.');
});

test('network uncertainty retries the exact saved payload and key despite later form changes', async () => {
  let attempts = 0;
  const ui = harness({ execute: async (request, row) => {
    attempts++;
    if (attempts === 1) throw new Error('network lost');
    row.jm1_reviewhistory = JSON.stringify([{ key: request.IdempotencyKey, state: 'CLOSED_NO_FURTHER_ACTION', at: new Date().toISOString() }]);
    return 'ACCEPTED';
  } });
  ui.elements.action.value = 'CLOSE_NO_FURTHER_ACTION';
  ui.elements.reason.value = 'NO_RESPONSE_NEEDED';
  await ui.submit();
  assert.equal(ui.values.has(storageKey), true, ui.elements.status.textContent);
  ui.elements.reason.value = 'NOT_PURSUED';
  await ui.submit();
  assert.equal(ui.calls.length, 2);
  assert.equal(ui.calls[1].IdempotencyKey, ui.calls[0].IdempotencyKey);
  assert.equal(ui.calls[1].Reason, 'NO_RESPONSE_NEEDED');
  assert.equal(ui.values.has(storageKey), false);
});
