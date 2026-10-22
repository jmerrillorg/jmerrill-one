import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const html = readFileSync(new URL('../powerplatform/webresources/jm1_jsj_inquiry_queue.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const reviewer = '5adf7e12-f093-f011-b4cb-6045bdeb7c0e';

function element(tag = 'div') {
  return { tag, children: [], dataset: {}, attributes: {}, listeners: {}, textContent: '', className: '',
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.listeners[name] = handler; },
  };
}

async function harness({ userId = reviewer, results = [], fail = false } = {}) {
  const elements = Object.fromEntries(['status', 'list', 'refreshed', 'refresh'].map((name) => [name, element()]));
  const tabs = ['open', 'overdue', 'completed'].map((view) => Object.assign(element('button'), { dataset: { view } }));
  let reads = 0;
  let shouldFail = fail;
  const xrm = { Utility: { getGlobalContext: () => ({ userSettings: { userId }, getClientUrl: () => 'https://jm1hq.crm.dynamics.com' }) },
    WebApi: { retrieveMultipleRecords: async () => { reads++; if (shouldFail) throw new Error('unavailable'); return { entities: results, nextLink: null }; } } };
  runInNewContext(script, { document: {
    getElementById: (id) => elements[id], querySelectorAll: () => tabs,
    createElement: (tag) => element(tag),
  }, window: {}, parent: { Xrm: xrm }, Intl, Date, Map, Number, String, Object, Array, encodeURIComponent });
  await new Promise((resolve) => setImmediate(resolve));
  return { elements, tabs, reads: () => reads, setFail: (value) => { shouldFail = value; } };
}

function flatten(item) { return [item.textContent, ...item.children.flatMap(flatten)].join(' '); }

test('private queue denies non-reviewer before reading any inquiry', async () => {
  const ui = await harness({ userId: '00000000-0000-0000-0000-000000000000' });
  assert.equal(ui.reads(), 0);
  assert.match(ui.elements.status.textContent, /only to Jackie/);
});

test('queue groups exact repeat submissions and renders original text without HTML injection', async () => {
  const base = { jm1_contactname: '<script>untrusted</script>', jm1_email: 'test@example.com', jm1_message: '<img src=x onerror=alert(1)>',
    jm1_inquirytype: 'Speaking', jm1_receivedat: '2026-10-16T09:05:30Z', jm1_deliverystate: 'DELIVERED',
    jm1_closedat: null, jm1_transferredat: null, jm1_authoritativerecord: null, jm1_reviewdueat: null,
    _ownerid_value: reviewer };
  const ui = await harness({ results: [
    { ...base, jm1_name: 'JSJ-ONE', jm1_jsjinquiryid: '11111111-1111-1111-1111-111111111111' },
    { ...base, jm1_name: 'JSJ-TWO', jm1_jsjinquiryid: '22222222-2222-2222-2222-222222222222' },
  ] });
  assert.equal(ui.reads(), 1);
  assert.match(ui.elements.status.textContent, /2 open inquiries/);
  assert.equal(ui.elements.list.children.length, 1);
  const content = flatten(ui.elements.list);
  assert.match(content, /2 matching submissions/);
  assert.match(content, /<img src=x onerror=alert\(1\)>/);
  assert.match(content, /JSJ-ONE/);
  assert.match(content, /JSJ-TWO/);
  assert.match(content, /records an intention; it does not send a message/);
  assert.doesNotMatch(html, /innerHTML|document\.write|localStorage/);
});

test('failed retrieval exposes no stale private list and reports unavailability', async () => {
  const ui = await harness({ results: [{ jm1_name: 'private', jm1_receivedat: '2026-10-01T00:00:00Z', _ownerid_value: reviewer }] });
  assert.equal(ui.elements.list.children.length, 1);
  ui.setFail(true);
  ui.elements.refresh.listeners.click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(ui.elements.status.textContent, /Current inquiries are unavailable/);
  assert.equal(ui.elements.list.children.length, 0);
  assert.match(ui.elements.refreshed.textContent, /list unavailable/);
});

test('queue script parses and only uses the existing Dataverse reviewer table', () => {
  assert.ok(script);
  assert.doesNotThrow(() => new Function(script));
  assert.match(script, /retrieveMultipleRecords\("jm1_jsjinquiry"/);
  assert.match(script, /pagetype=entityrecord&etn=jm1_jsjinquiry/);
});
