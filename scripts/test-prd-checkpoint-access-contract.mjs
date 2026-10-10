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
  assert.match(source, /prvWritejm1_ProductionsReviewPermit/);
}
const humanApi = readFileSync(new URL('jm1_AcceptProductionsInquiry/customapi.xml', apiRoot), 'utf8');
assert.match(humanApi, /prvReadjm1_ProductionsReviewPermit/);
assert.doesNotMatch(humanApi, /prvWritejm1_ProductionsReviewPermit/);
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
assert.match(roleScript, /const allowedPrivilege = 'prvWritejm1_ProductionsReviewPermit'/);
assert.match(roleScript, /DATAVERSE_ROOT_BUSINESS_UNIT_ID/);
assert.match(roleScript, /businessunits\?\$select=businessunitid,name,_parentbusinessunitid_value/);
assert.match(roleScript, /rootBusinessUnits\.length !== 1/);
assert.doesNotMatch(roleScript, /b589d1e7-e690-f011-b4cc-7c1e525b3eb3/);
assert.match(roleScript, /const unexpectedTeams = teams\.filter/);
assert.match(roleScript, /!team\.isdefault \|\| team\.teamtype !== 0/);
assert.match(roleScript, /team\.teamroles_association\.length > 0/);
assert.match(roleScript, /unexpectedRoles/);
assert.match(roleScript, /RetrieveUserPrivileges\(\)/);
assert.match(roleScript, /RetrieveRolePrivilegesRole\(RoleId=\$\{roleId\}\)/);
assert.match(roleScript, /teamroles_association/);
assert.match(roleScript, /RemovePrivilegeRole/);
assert.match(roleScript, /effectiveAccessExact/);
assert.match(roleScript, /apply && !exactPrivileges/);
assert.match(roleScript, /System Administrator.*System Customizer/);
assert.match(schema, /<Name>jm1_bp09reviewcheckpoint<\/Name>[\s\S]*?<IsSecured>1<\/IsSecured>/);
assert.match(schema, /<Name>jm1_bp09receivedat<\/Name>[\s\S]*?<ValidForUpdateApi>0<\/ValidForUpdateApi>/);
console.log('Productions checkpoint execute-only access, receipt boundary, secured state, and one-field write contract PASS');
