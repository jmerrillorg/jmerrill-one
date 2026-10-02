import { execFileSync } from 'node:child_process';

const url = 'https://jm1hq.crm.dynamics.com';
const api = `${url}/api/data/v9.2`;
const apply = process.argv.includes('--apply');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const allowed = new Set(['System Administrator', 'JSJ Inquiry Service']);
const privilegeRows = (await request(`/privileges?$select=name,privilegeid&$filter=${encodeURIComponent("contains(name,'jm1_JSJInquiry')")}`)).value;
if (privilegeRows.length !== 8) throw new Error(`Expected 8 JSJ table privileges, found ${privilegeRows.length}`);
const privilegeById = new Map(privilegeRows.map((item) => [item.privilegeid, item.name]));
const filter = privilegeRows.map((item) => `privilegeid eq ${item.privilegeid}`).join(' or ');

async function assignments() {
  const rows = await request(`/roleprivilegescollection?$select=roleid,privilegeid&$filter=${encodeURIComponent(filter)}&$top=500`);
  if (rows['@odata.nextLink']) throw new Error('JSJ role inventory exceeds one page');
  const roleIds = [...new Set(rows.value.map((item) => item.roleid))];
  const roles = new Map();
  for (const id of roleIds) roles.set(id, await request(`/roles(${id})?$select=roleid,name,_businessunitid_value`));
  return rows.value.map((item) => ({ roleId: item.roleid, role: roles.get(item.roleid).name, businessUnit: roles.get(item.roleid)._businessunitid_value, privilegeId: item.privilegeid, privilege: privilegeById.get(item.privilegeid) }));
}

const before = await assignments();
const excess = before.filter((item) => !allowed.has(item.role));
if (apply) {
  for (const item of excess) {
    await request(`/roles(${item.roleId})/Microsoft.Dynamics.CRM.RemovePrivilegeRole`, {
      method: 'POST', body: JSON.stringify({ Privilege: { privilegeid: item.privilegeId, name: item.privilege } })
    });
  }
}
const after = await assignments();
const remaining = after.filter((item) => !allowed.has(item.role));
console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'READ_ONLY', found: before.length, excessBefore: excess.map(({ role, privilege }) => ({ role, privilege })), remainingExcess: remaining.map(({ role, privilege }) => ({ role, privilege })), isolated: remaining.length === 0 }, null, 2));
if (apply && remaining.length) process.exitCode = 1;

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse JSJ role isolation ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 400)}`);
  return body ? JSON.parse(body) : {};
}
