import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../powerplatform/webresources/jm1_prd_bp09_review.js', import.meta.url), 'utf8');
const leadId = '6f1d1f4b-99cd-4c1e-83da-9fff7ec96fed';
const receiptId = 'c7172220-d12c-4baf-bcdd-a335182489c4';

async function runAccept({ outcome, failure }) {
  const calls = { requests: [], console: [], alerts: [] };
  const Xrm = {
    WebApi: {
      retrieveRecord: async () => ({ leadid: leadId, statuscode: 1, versionnumber: 42, jm1_bp09intakereceiptid: receiptId }),
      online: {
        execute: async request => {
          calls.requests.push(request);
          if (failure) throw failure;
          return { ok: true, json: async () => ({ Outcome: outcome, AuditId: receiptId }) };
        }
      }
    },
    Navigation: {
      openConfirmDialog: async () => ({ confirmed: true }),
      openAlertDialog: async options => calls.alerts.push(options.text)
    }
  };
  const context = {
    Xrm,
    console: { error: (...args) => calls.console.push(args) },
    String,
    RegExp
  };
  vm.runInNewContext(source, context);
  const form = {
    data: {
      entity: { getId: () => `{${leadId}}` },
      refresh: async () => {}
    }
  };
  await context.Jm1ProductionsBp09Review.accept(form);
  return calls;
}

const accepted = await runAccept({ outcome: 'ACCEPTED' });
assert.equal(accepted.requests.length, 1);
assert.deepEqual(Object.keys(accepted.requests[0]).sort(),
  ['ActionId', 'ExpectedVersion', 'IdempotencyKey', 'LeadId', 'ReceiptId'].sort());
assert.equal(accepted.requests[0].ActionId, 'ACCEPT_FOR_FOLLOW_UP');
assert.equal(accepted.requests[0].LeadId, leadId);
assert.equal(accepted.requests[0].ReceiptId, receiptId);
assert.equal(accepted.requests[0].IdempotencyKey, receiptId);
assert.equal(accepted.requests[0].ExpectedVersion, '42');
assert.deepEqual(accepted.console, []);
assert.equal(accepted.alerts.at(-1), 'Inquiry accepted for follow-up. The action is recorded.');

const safeMessage = 'PRD_REVIEW_INTERNAL_FAILURE stage=action_audit_create type=FaultException`1 code=0x80040224';
const failed = await runAccept({ outcome: null, failure: Object.assign(new Error(`${safeMessage} personal@example.invalid`), { errorCode: '0x80040224' }) });
assert.equal(failed.console.length, 1);
assert.equal(failed.console[0][2], safeMessage);
assert.equal(JSON.stringify(failed.console).includes('personal@example.invalid'), false);
assert.equal(failed.alerts.at(-1), 'The action could not be verified. Refresh the inquiry before retrying or contact operations.');

const opaque = await runAccept({ outcome: null, failure: Object.assign(new Error('untrusted details'), { errorCode: '0x80040224' }) });
assert.equal(opaque.console[0][2], 'diagnostic unavailable');
assert.equal(JSON.stringify(opaque.console).includes('untrusted details'), false);

console.log('BP09 reviewer client positive response and diagnostic redaction tests passed.');
