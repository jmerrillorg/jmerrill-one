import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const plugin = readFileSync(new URL('../runtime/jm1-productions-bp09-reviewer-plugin/ProductionsReviewCheckpointAccess.cs', import.meta.url), 'utf8');
const roleScript = readFileSync(new URL('./ensure-prd-checkpoint-runtime-role.mjs', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../powerplatform/solutions/JM1ProductionsBP09InquiryReview/Entities/Lead/Entity.xml', import.meta.url), 'utf8');
const apiRoot = new URL('../powerplatform/solutions/JM1ProductionsBP09InquiryReview/customapis/', import.meta.url);
const apiFiles = [
  'jm1_ListProductionsReviewCheckpointCandidates/customapi.xml',
  'jm1_GetProductionsReviewCheckpoint/customapi.xml',
  'jm1_SaveProductionsReviewCheckpoint/customapi.xml',
];

for (const path of apiFiles) {
  const source = readFileSync(new URL(path, apiRoot), 'utf8');
  assert.match(source, /prvReadjm1_ProductionsReviewPermit/);
}
assert.equal((plugin.match(/public sealed class (?:ListProductionsReviewCheckpointCandidates|GetProductionsReviewCheckpoint|SaveProductionsReviewCheckpoint) : IPlugin/g) || []).length, 3);
assert.match(plugin, /RuntimeObjectId = new Guid\("38b09d6f-34d9-48b3-9627-f04c047fd534"\)/);
assert.match(plugin, /detail\.Channel != "jmerrill\.productions\/contact"/);
assert.match(plugin, /detail\.Consent\.Purpose != "respond_to_inquiry"/);
assert.match(plugin, /owner\.Id != ReviewerTeam/);
assert.match(plugin, /query\.Criteria\.AddCondition\("jm1_receiptid", ConditionOperator\.Equal, receiptId\.ToString\("D"\)\)/);
assert.match(plugin, /query\.Criteria\.AddCondition\("jm1_leadid", ConditionOperator\.Equal, leadId\.ToString\("D"\)\)/);
assert.match(plugin, /update\["jm1_bp09reviewcheckpoint"\] = normalized/);
assert.match(plugin, /ConcurrencyBehavior\.IfRowVersionMatches/);
assert.match(plugin, /IsAttributableReviewerAction\(service, actions\[0\]\)/);
assert.match(plugin, /azureactivedirectoryobjectid/);
assert.match(plugin, /teammembership/);
assert.doesNotMatch(plugin, /update\["(?:subject|description|statuscode|ownerid)"\]/);
assert.match(roleScript, /const allowedPrivilege = 'prvReadjm1_ProductionsReviewPermit'/);
assert.match(roleScript, /if \(teams\.length\) throw new Error/);
assert.match(roleScript, /unexpectedRoles/);
assert.match(roleScript, /RetrieveUserPrivileges\(\)/);
assert.match(roleScript, /effectiveAccessExact/);
assert.match(roleScript, /apply && !exactPrivileges/);
assert.match(roleScript, /System Administrator.*System Customizer/);
assert.match(schema, /<Name>jm1_bp09reviewcheckpoint<\/Name>[\s\S]*?<IsSecured>1<\/IsSecured>/);
assert.match(schema, /<Name>jm1_bp09receivedat<\/Name>[\s\S]*?<ValidForUpdateApi>0<\/ValidForUpdateApi>/);
console.log('Productions checkpoint execute-only access, receipt boundary, secured state, and one-field write contract PASS');
