import { execFileSync } from 'node:child_process';

const orgUrl = process.env.DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const api = `${orgUrl.replace(/\/$/, '')}/api/data/v9.2`;
const apply = process.argv.includes('--apply');
const runtimeObjectId = '38b09d6f-34d9-48b3-9627-f04c047fd534';
const roleName = 'JM1 Productions BP09 Checkpoint Runtime';
const teamId = '36ee36cf-6ebf-f111-aaaf-6045bdd69435';
const allowedPrivilege = 'prvReadjm1_ProductionsReviewPermit';
const depthName = (depth) => {
  if (typeof depth === 'number') return ['Basic', 'Local', 'Deep', 'Global'][depth] || `UNKNOWN_${depth}`;
  const key = String(depth || '').split('.').pop().replace(/^PrivilegeDepth/i, '').toLowerCase();
  return ({ basic: 'Basic', local: 'Local', deep: 'Deep', global: 'Global' })[key] || `UNKNOWN_${depth}`;
};
const token = execFileSync('az', ['account', 'get-access-token', '--resource', orgUrl, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const users = (await request(`/systemusers?$select=systemuserid,applicationid,azureactivedirectoryobjectid,isdisabled,accessmode,_businessunitid_value&$filter=azureactivedirectoryobjectid eq ${runtimeObjectId}`)).value;
if (users.length > 1) throw new Error('Duplicate Function managed-identity Dataverse users');
const user = users[0] || null;
const teams = user ? (await request(`/systemusers(${user.systemuserid})?$select=systemuserid&$expand=teammembership_association($select=teamid,name)`)).teammembership_association : [];
const roles = user ? (await request(`/systemusers(${user.systemuserid})?$select=systemuserid&$expand=systemuserroles_association($select=roleid,name)`)).systemuserroles_association : [];
if (user && (user.isdisabled || user.accessmode !== 4)) throw new Error('Function identity is not an enabled non-interactive application user');
if (teams.length) throw new Error(`Function identity has team-derived access (${teams.map(({ name, teamid }) => `${name}:${teamid}`).join(', ')}); refusing role mutation`);
if (roles.some((item) => item.name === 'System Administrator' || item.name === 'System Customizer'))
  throw new Error('Function identity currently has an overbroad administrative role; preserve and resolve before assignment');

let role = null;
if (user) {
  const matches = (await request(`/roles?$select=roleid,name,_businessunitid_value&$filter=${encodeURIComponent(`name eq '${roleName}'`)}`)).value
    .filter((item) => item._businessunitid_value === user._businessunitid_value);
  if (matches.length > 1) throw new Error('Duplicate checkpoint runtime roles in the identity business unit');
  role = matches[0] || null;
  const unexpectedRoles = roles.filter((item) => item.roleid !== role?.roleid);
  if (unexpectedRoles.length) throw new Error(`Function identity has other assigned roles (${unexpectedRoles.map(({ name, roleid }) => `${name}:${roleid}`).join(', ')}); refusing role mutation`);
  if (!role && apply) {
    const created = await request('/roles', { method: 'POST', body: {
      name: roleName, 'businessunitid@odata.bind': `businessunits(${user._businessunitid_value})`
    } });
    role = { roleid: created.id, name: roleName, _businessunitid_value: user._businessunitid_value };
  }
  if (role && apply) {
    const privilege = (await request(`/privileges?$select=privilegeid,name&$filter=name eq '${allowedPrivilege}'`)).value;
    if (privilege.length !== 1) throw new Error('Checkpoint Custom API execute privilege is not uniquely provisioned');
    const current = (await request(`/roles(${role.roleid})/Microsoft.Dynamics.CRM.RetrieveRolePrivilegesRole()`)).RolePrivileges || [];
    if (current.length === 0) {
      await request(`/roles(${role.roleid})/Microsoft.Dynamics.CRM.ReplacePrivilegesRole`, { method: 'POST', body: {
        Privileges: [{ Depth: 'Global', PrivilegeId: privilege[0].privilegeid,
          PrivilegeName: allowedPrivilege, BusinessUnitId: user._businessunitid_value }]
      } });
    }
  }
}

const actualPrivileges = role
  ? (await request(`/roles(${role.roleid})/Microsoft.Dynamics.CRM.RetrieveRolePrivilegesRole()`)).RolePrivileges || []
  : [];
const rolePrivilegeSet = actualPrivileges.map(({ PrivilegeName, Depth }) => ({ name: PrivilegeName, depth: depthName(Depth) }));
const exactPrivileges = rolePrivilegeSet.length === 1 && rolePrivilegeSet[0].name === allowedPrivilege && rolePrivilegeSet[0].depth === 'Global';
const assigned = Boolean(user && role && roles.some((item) => item.roleid === role.roleid));
if (user && role && apply && !exactPrivileges) throw new Error('Checkpoint runtime role is not exactly the approved single privilege; refusing assignment');
if (user && role && apply && !assigned) {
  await request(`/systemusers(${user.systemuserid})/systemuserroles_association/$ref`, {
    method: 'POST', body: { '@odata.id': `${api}/roles(${role.roleid})` }
  });
}
const assignedReadback = user && role
  ? (await request(`/systemusers(${user.systemuserid})?$select=systemuserid&$expand=systemuserroles_association($select=roleid,name)`)).systemuserroles_association.some((item) => item.roleid === role.roleid)
  : false;
const effectivePrivileges = user
  ? (await request(`/systemusers(${user.systemuserid})/Microsoft.Dynamics.CRM.RetrieveUserPrivileges()`)).RolePrivileges || []
  : [];
const effectivePrivilegeSet = effectivePrivileges.map(({ PrivilegeName, Depth }) => ({ name: PrivilegeName, depth: depthName(Depth) }));
const effectiveAccessExact = effectivePrivilegeSet.length === 1 &&
  effectivePrivilegeSet[0].name === allowedPrivilege && effectivePrivilegeSet[0].depth === 'Global';
const report = {
  mode: apply ? 'APPLY' : 'READ_ONLY',
  runtimeIdentity: { objectId: runtimeObjectId, systemUserId: user?.systemuserid || null,
    accessMode: user?.accessmode ?? null, enabled: user ? !user.isdisabled : null },
  appUserExists: Boolean(user),
  teamMembership: teams.length ? teams.map(({ teamid, name }) => ({ id: teamid, name })) : 'NONE',
  inheritedAdministrativeRole: roles.some((item) => item.name === 'System Administrator' || item.name === 'System Customizer'),
  runtimeRole: { id: role?.roleid || null, name: roleName, privileges: rolePrivilegeSet, exactSinglePrivilege: exactPrivileges, assigned: assignedReadback },
  effectivePrivileges: effectivePrivilegeSet,
  effectiveAccessExact,
  expectedPrivilege: { name: allowedPrivilege, depth: 'Global', purpose: 'Execute the three identity-gated checkpoint Custom APIs only' }
};
console.log(JSON.stringify(report, null, 2));
if (apply && (!user || !role || !exactPrivileges || !assignedReadback || !effectiveAccessExact)) process.exitCode = 1;

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json',
      'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) })
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Dataverse checkpoint role ${init.method || 'GET'} failed (${response.status}): ${text.slice(0, 250)}`);
  return { ...(text ? JSON.parse(text) : {}), id: response.headers.get('OData-EntityId')?.match(/\(([0-9a-f-]{36})\)/i)?.[1] };
}
