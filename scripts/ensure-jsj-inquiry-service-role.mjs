import { execFileSync } from 'node:child_process';

const url = 'https://jm1hq.crm.dynamics.com';
const api = `${url}/api/data/v9.2`;
const appId = process.env.JSJ_MANAGED_IDENTITY_APP_ID;
if (!appId || !/^[0-9a-f-]{36}$/i.test(appId)) throw new Error('JSJ_MANAGED_IDENTITY_APP_ID is required');
const apply = process.argv.includes('--apply');
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();
const roleName = 'JSJ Inquiry Service';
const expected = ['Create', 'Read', 'Write', 'Delete'].map((action) => `prv${action}jm1_JSJInquiry`);
const who = await request('/WhoAmI()');
const businessUnitId = who.BusinessUnitId;
const roleFilter = encodeURIComponent(`name eq '${roleName}'`);
const roles = (await request(`/roles?$select=roleid,name&$filter=${roleFilter}`)).value;
if (roles.length > 1) throw new Error('Duplicate JSJ service roles');
let roleId = roles[0]?.roleid;
if (!roleId && apply) {
  const created = await request('/roles', {
    method: 'POST',
    body: JSON.stringify({ name: roleName, 'businessunitid@odata.bind': `businessunits(${businessUnitId})` })
  });
  roleId = created.id;
}
const privileges = (await request(`/privileges?$select=name,privilegeid&$filter=${encodeURIComponent("contains(name,'jm1_JSJInquiry')")}`)).value;
const selected = expected.map((name) => {
  const matches = privileges.filter((item) => item.name === name);
  if (matches.length !== 1) throw new Error(`Privilege resolution failed for ${name}`);
  return matches[0];
});
if (roleId && apply) {
  const current = await rolePrivileges(roleId);
  if (current.some((name) => !expected.includes(name))) throw new Error('JSJ service role has unexpected privileges');
  const missing = selected.filter((item) => !current.includes(item.name));
  if (missing.length) {
    await request(`/roles(${roleId})/Microsoft.Dynamics.CRM.AddPrivilegesRole`, {
      method: 'POST',
      body: JSON.stringify({ Privileges: missing.map((item) => ({ Depth: 'Global', PrivilegeId: item.privilegeid, PrivilegeName: item.name, BusinessUnitId: businessUnitId })) })
    });
  }
}
let appUsers = (await request(`/systemusers?$select=systemuserid,applicationid,accessmode&$filter=${encodeURIComponent(`applicationid eq ${appId}`)}`)).value;
if (!appUsers.length && apply) {
  await request('/applicationusers', {
    method: 'POST',
    body: JSON.stringify({ applicationid: appId, applicationname: 'JSJ App Service inquiry identity', applicationtype: 2, canimpersonateassystemuser: false, 'businessunitid@odata.bind': `businessunits(${businessUnitId})` })
  });
  appUsers = (await request(`/systemusers?$select=systemuserid,applicationid,accessmode&$filter=${encodeURIComponent(`applicationid eq ${appId}`)}`)).value;
}
if (appUsers.length > 1) throw new Error('Duplicate JSJ application users');
const userId = appUsers[0]?.systemuserid || null;
if (userId && apply && roleId) {
  const assigned = await userRoles(userId);
  if (!assigned.some((item) => item.roleid === roleId)) {
    await request(`/systemusers(${userId})/systemuserroles_association/$ref`, {
      method: 'POST',
      body: JSON.stringify({ '@odata.id': `${api}/roles(${roleId})` })
    });
  }
  for (const other of await userRoles(userId)) {
    if (other.roleid !== roleId) {
      await request(`/systemusers(${userId})/systemuserroles_association/$ref?$id=${encodeURIComponent(`${api}/roles(${other.roleid})`)}`, { method: 'DELETE' });
    }
  }
}
const actualPrivileges = roleId ? await rolePrivileges(roleId) : [];
const actualRoles = userId ? await userRoles(userId) : [];
const result = {
  mode: apply ? 'APPLY' : 'READ_ONLY', appId, roleId: roleId || null, userId,
  privileges: actualPrivileges.sort(), assignedRoles: actualRoles.map((item) => item.name).sort(),
  roleNarrow: actualPrivileges.length === expected.length && expected.every((name) => actualPrivileges.includes(name)),
  identityNarrow: Boolean(userId && roleId && actualRoles.length === 1 && actualRoles[0].roleid === roleId && appUsers[0].accessmode === 4)
};
console.log(JSON.stringify(result, null, 2));
if (apply && (!result.roleNarrow || !result.identityNarrow)) process.exitCode = 1;

async function rolePrivileges(id) {
  const role = await request(`/roles(${id})?$select=roleid&$expand=roleprivileges_association($select=name)`);
  return role.roleprivileges_association.map((item) => item.name);
}

async function userRoles(id) {
  const user = await request(`/systemusers(${id})?$select=systemuserid&$expand=systemuserroles_association($select=roleid,name)`);
  return user.systemuserroles_association;
}

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse access ${init.method || 'GET'} ${path}: ${response.status} ${body.slice(0, 400)}`);
  return { ...(body ? JSON.parse(body) : {}), id: response.headers.get('OData-EntityId')?.match(/\(([0-9a-f-]{36})\)/i)?.[1] };
}
