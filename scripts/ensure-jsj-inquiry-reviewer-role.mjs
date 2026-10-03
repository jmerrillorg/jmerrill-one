import { execFileSync } from 'node:child_process';

const url = 'https://jm1hq.crm.dynamics.com';
const api = `${url}/api/data/v9.2`;
const apply = process.argv.includes('--apply');
const reviewerEmail = 'jackie@jmerrill.one';
const reviewerObjectId = '9586f34b-b5f3-437b-bc64-3e44d2518427';
const roleName = 'JSJ Inquiry Reviewer';
const expected = ['prvReadjm1_JSJInquiry', 'prvWritejm1_JSJInquiry'];
const token = execFileSync('az', ['account', 'get-access-token', '--resource', url, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const reviewerFilter = encodeURIComponent(`internalemailaddress eq '${reviewerEmail}'`);
const users = (await request(`/systemusers?$select=systemuserid,fullname,internalemailaddress,azureactivedirectoryobjectid,accessmode,_businessunitid_value&$filter=${reviewerFilter}`)).value;
if (users.length !== 1 || users[0].azureactivedirectoryobjectid?.toLowerCase() !== reviewerObjectId || users[0].accessmode !== 0) {
  throw new Error('Exact active Jackie Smith Jr. reviewer identity is not established');
}
const reviewer = users[0];
const roleFilter = encodeURIComponent(`name eq '${roleName}'`);
const roles = (await request(`/roles?$select=roleid,name,_businessunitid_value&$filter=${roleFilter}`)).value
  .filter((item) => item._businessunitid_value === reviewer._businessunitid_value);
if (roles.length > 1) throw new Error('Duplicate reviewer roles in Jackie business unit');
let roleId = roles[0]?.roleid;
if (!roleId && apply) {
  const created = await request('/roles', {
    method: 'POST',
    body: JSON.stringify({ name: roleName, 'businessunitid@odata.bind': `businessunits(${reviewer._businessunitid_value})` })
  });
  roleId = created.id;
}
if (roleId && apply) {
  const privileges = (await request(`/privileges?$select=name,privilegeid&$filter=${encodeURIComponent("contains(name,'jm1_JSJInquiry')")}`)).value;
  const selected = expected.map((name) => {
    const matches = privileges.filter((item) => item.name === name);
    if (matches.length !== 1) throw new Error(`Cannot resolve ${name}`);
    return matches[0];
  });
  await request(`/roles(${roleId})/Microsoft.Dynamics.CRM.ReplacePrivilegesRole`, {
    method: 'POST',
    body: JSON.stringify({ Privileges: selected.map((item) => ({
      Depth: 'Global', PrivilegeId: item.privilegeid, PrivilegeName: item.name, BusinessUnitId: reviewer._businessunitid_value
    })) })
  });
  const currentPrivileges = (await request(`/roles(${roleId})?$select=roleid&$expand=roleprivileges_association($select=name,privilegeid)`)).roleprivileges_association;
  for (const privilege of currentPrivileges.filter((item) => !expected.includes(item.name))) {
    await request(`/roles(${roleId})/Microsoft.Dynamics.CRM.RemovePrivilegeRole`, {
      method: 'POST',
      body: JSON.stringify({ Privilege: { privilegeid: privilege.privilegeid, name: privilege.name } })
    });
  }
  const assigned = await userRoles(reviewer.systemuserid);
  if (!assigned.some((item) => item.roleid === roleId)) {
    await request(`/systemusers(${reviewer.systemuserid})/systemuserroles_association/$ref`, {
      method: 'POST', body: JSON.stringify({ '@odata.id': `${api}/roles(${roleId})` })
    });
  }
}
const actualPrivileges = roleId ? (await request(`/roles(${roleId})?$select=roleid&$expand=roleprivileges_association($select=name)`)).roleprivileges_association.map((item) => item.name) : [];
const assignedRoles = await userRoles(reviewer.systemuserid);
const narrow = actualPrivileges.length === expected.length && expected.every((name) => actualPrivileges.includes(name));
const assigned = Boolean(roleId && assignedRoles.some((item) => item.roleid === roleId));
console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'READ_ONLY', reviewer: { id: reviewer.systemuserid, name: reviewer.fullname, email: reviewerEmail, objectId: reviewerObjectId }, roleId: roleId || null, rolePrivileges: actualPrivileges.sort(), roleNarrow: narrow, roleAssigned: assigned, inheritedSystemAdministrator: assignedRoles.some((item) => item.name === 'System Administrator') }, null, 2));
if (apply && (!narrow || !assigned)) process.exitCode = 1;

async function userRoles(id) {
  const row = await request(`/systemusers(${id})?$select=systemuserid&$expand=systemuserroles_association($select=roleid,name)`);
  return row.systemuserroles_association;
}

async function request(path, init = {}) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0', ...init.headers }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Dataverse reviewer ${init.method || 'GET'} failed (${response.status}): ${body.slice(0, 300)}`);
  return { ...(body ? JSON.parse(body) : {}), id: response.headers.get('OData-EntityId')?.match(/\(([0-9a-f-]{36})\)/i)?.[1] };
}
