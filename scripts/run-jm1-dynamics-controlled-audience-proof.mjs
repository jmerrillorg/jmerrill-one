import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const API_BASE = `${DATAVERSE_URL}/api/data/v9.2`;
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '804_jm1_dynamics_controlled_audience_boundary_v1.json');
const TEST_EMAIL = process.env.JM1_DYNAMICS_INTERNAL_TEST_EMAIL || 'jackie@jmerrill.one';
const TEST_NAME = 'JM1 INTERNAL MARKETING TEST CONTACT';
const SEGMENT_NAME = 'JM1 INTERNAL MARKETING TEST AUDIENCE';
const MARKER = 'JM1_INTERNAL_MARKETING_RUNTIME_TEST_2026_09_03';
const token = execFileSync('az', ['account', 'get-access-token', '--resource', DATAVERSE_URL, '--query', 'accessToken', '-o', 'tsv'], { encoding: 'utf8' }).trim();

const report = {
  packageId: 804,
  artifact: 'JM1-DYNAMICS-CONTROLLED-AUDIENCE-BOUNDARY-v1',
  generatedAt: new Date().toISOString(),
  environment: DATAVERSE_URL,
  sourceDocs: [
    'https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-api-segment',
    'https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-email',
    'https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-overview'
  ],
  selectedInternalRecipient: TEST_EMAIL,
  contact: null,
  segmentDefinition: null,
  segment: null,
  staticMembership: null,
  senderInspection: null,
  classifications: [],
  blocked: []
};

const contact = await ensureInternalContact();
report.contact = contact;

const groupId = stableGroupId(contact.id);
const segmentDefinition = await ensureSegmentDefinition(groupId);
report.segmentDefinition = segmentDefinition;

const segment = await ensureSegment(segmentDefinition.id);
report.segment = segment;

const addMembers = await dv('/msdynmkt_AddStaticMembers', {
  method: 'POST',
  body: JSON.stringify({
    SegmentId: segment.id,
    GroupId: groupId,
    EntityIds: [contact.id]
  })
}, true);

const members = await dv('/msdynmkt_ListGroupMembers', {
  method: 'POST',
  body: JSON.stringify({
    SegmentId: segment.id,
    GroupId: groupId,
    PageNo: 1,
    PageSize: 25
  })
}, true);
const memberList = parseMembers(members.body?.Response || members.body?.ResultText || '');
report.staticMembership = {
  addMembersStatus: addMembers.status,
  addMembersOk: addMembers.ok,
  listMembersStatus: members.status,
  listMembersOk: members.ok,
  memberIds: memberList,
  containsInternalContact: memberList.map((id) => id.toLowerCase()).includes(contact.id.toLowerCase()),
  addMembersError: addMembers.ok ? null : addMembers.body?.error?.message || addMembers.body,
  listMembersError: members.ok ? null : members.body?.error?.message || members.body
};

report.senderInspection = await inspectSenderState();

if (report.staticMembership.containsInternalContact) {
  report.classifications.push('DYNAMICS_TEST_AUDIENCE_PROVEN');
}

if (!report.senderInspection.governedPublishingSenderValidated) {
  report.blocked.push({
    dependency: 'DYNAMICS_GOVERNED_PUBLISHING_SENDER_IDENTITY_REQUIRED',
    finding: 'Customer Insights currently exposes only the default generated Dynamics sender; no validated J Merrill Publishing sender/domain was found through Dataverse readback.',
    observedBrandSenders: report.senderInspection.brandSenders,
    observedDomains: report.senderInspection.domains
  });
}

report.classifications.push(
  report.blocked.length === 0
    ? 'DYNAMICS_SAFE_RUNTIME_BOUNDARY_READY_FOR_JOURNEY_BUILD'
    : 'DYNAMICS_JOURNEY_HELD_GOVERNED_SENDER_IDENTITY_REQUIRED'
);

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications: report.classifications,
  contact: report.contact,
  segment: report.segment,
  membership: report.staticMembership,
  blocked: report.blocked.map((item) => item.dependency)
}, null, 2));

async function ensureInternalContact() {
  const filter = encodeURIComponent(`emailaddress1 eq '${TEST_EMAIL}'`);
  const existing = await dv(`/contacts?$select=contactid,fullname,emailaddress1&$filter=${filter}&$top=1`);
  if (existing.value?.[0]) {
    return {
      id: existing.value[0].contactid,
      email: existing.value[0].emailaddress1,
      fullName: existing.value[0].fullname,
      state: 'REUSED'
    };
  }

  const created = await dv('/contacts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      firstname: 'JM1',
      lastname: 'Internal Marketing Test',
      fullname: TEST_NAME,
      emailaddress1: TEST_EMAIL,
      description: 'Founder-authorized internal Customer Insights Journeys runtime test contact only.'
    })
  });
  return {
    id: created.contactid,
    email: created.emailaddress1,
    fullName: created.fullname,
    state: 'CREATED'
  };
}

async function ensureSegmentDefinition(groupId) {
  const filter = encodeURIComponent(`msdynmkt_name eq '${MARKER}'`);
  const existing = await dv(`/msdynmkt_segmentdefinitions?$select=msdynmkt_segmentdefinitionid,msdynmkt_name&$filter=${filter}&$top=1`);
  if (existing.value?.[0]) return { id: existing.value[0].msdynmkt_segmentdefinitionid, state: 'REUSED', groupId };

  const created = await dv('/msdynmkt_segmentdefinitions', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      msdynmkt_name: MARKER,
      msdynmkt_segmentquery: '',
      statecode: 0,
      statuscode: 723270001,
      msdynmkt_staticlistmembers: JSON.stringify([{ groupId, includeType: 'Include', name: 'Founder-authorized internal test recipients', inputType: 'manualSelect' }]),
      msdynmkt_disablesegmentrefresh: true,
      msdynmkt_segmentrefreshintervalminutes: 15
    })
  });
  return { id: created.msdynmkt_segmentdefinitionid, state: 'CREATED', groupId };
}

async function ensureSegment(segmentDefinitionId) {
  const filter = encodeURIComponent(`msdynmkt_sourcesegmentuid eq '${segmentDefinitionId}'`);
  const existing = await dv(`/msdynmkt_segments?$select=msdynmkt_segmentid,msdynmkt_displayname,msdynmkt_sourcesegmentuid&$filter=${filter}&$top=1`);
  if (existing.value?.[0]) {
    return {
      id: existing.value[0].msdynmkt_segmentid,
      displayName: existing.value[0].msdynmkt_displayname,
      state: 'REUSED'
    };
  }

  const created = await dv('/msdynmkt_segments', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      msdynmkt_displayname: SEGMENT_NAME,
      msdynmkt_type: 10,
      msdynmkt_source: 12,
      msdynmkt_baseentitylogicalname: 'contact',
      statecode: 1,
      statuscode: 2,
      msdynmkt_sourcesegmentuid: segmentDefinitionId
    })
  });
  return { id: created.msdynmkt_segmentid, displayName: created.msdynmkt_displayname, state: 'CREATED' };
}

async function inspectSenderState() {
  const brandSenders = await dv('/msdynmkt_brandsenders?$select=msdynmkt_name,msdynmkt_fromname,msdynmkt_fromemail,msdynmkt_replytoemail,statuscode&$top=20');
  const domains = await dv('/msdynmkt_domains?$select=msdynmkt_name,msdynmkt_ownershipvalidationstatus,msdynmkt_domainalignmentvalidationstatus,msdynmkt_emaildnsrecord1status,msdynmkt_emaildnsrecord2status,statuscode,statecode&$top=20');
  const senderRows = brandSenders.value || [];
  const domainRows = domains.value || [];
  return {
    brandSenders: senderRows.map((row) => ({
      name: row.msdynmkt_name,
      fromName: row.msdynmkt_fromname,
      fromEmail: row.msdynmkt_fromemail,
      replyToEmail: row.msdynmkt_replytoemail,
      statuscode: row.statuscode
    })),
    domains: domainRows.map((row) => ({
      name: row.msdynmkt_name,
      ownershipValidationStatus: row.msdynmkt_ownershipvalidationstatus,
      domainAlignmentValidationStatus: row.msdynmkt_domainalignmentvalidationstatus,
      emailDnsRecord1Status: row.msdynmkt_emaildnsrecord1status,
      emailDnsRecord2Status: row.msdynmkt_emaildnsrecord2status,
      statuscode: row.statuscode,
      statecode: row.statecode
    })),
    governedPublishingSenderValidated: senderRows.some((row) => /J Merrill Publishing/i.test(row.msdynmkt_fromname || row.msdynmkt_name || '') && /jmerrill\.(pub|one)$/i.test(String(row.msdynmkt_fromemail || '').split('@')[1] || ''))
  };
}

async function dv(path, init = {}, allowFailure = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-Version': '4.0',
      'OData-MaxVersion': '4.0',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok && allowFailure) return { ok: false, status: response.status, body };
  if (!response.ok) throw new Error(`Dataverse ${init.method || 'GET'} ${path} failed: ${response.status} ${body.error?.message || text}`);
  return allowFailure ? { ok: true, status: response.status, body } : body;
}

function parseMembers(text) {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return parsed.entityIds || parsed.members || [];
  } catch {
    return [];
  }
}

function stableGroupId(seed) {
  const hex = seed.replace(/-/g, '').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
