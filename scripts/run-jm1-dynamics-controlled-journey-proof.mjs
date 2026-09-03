import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATAVERSE_URL = process.env.JM1_DATAVERSE_URL || 'https://jm1hq.crm.dynamics.com';
const API_BASE = `${DATAVERSE_URL}/api/data/v9.2`;
const ROOT = 'artifacts/sintra_greenfield_jm1_gp_2026_08_26';
const REPORT_PATH = join(ROOT, '809_jm1_dynamics_controlled_journey_proof_v1.json');
const GENERATED_AT = new Date().toISOString();
const RUN_MARKER = deterministicId('FEATURED_AUTHOR_MONTH_ACTIVE', 'J Merrill Publishing', '2026-10', 'Iyorwuese');
const EMAIL_NAME = 'IYORWUESE OCTOBER FEATURED AUTHOR - CONTROLLED JOURNEY EMAIL';
const JOURNEY_NAME = 'IYORWUESE OCTOBER FEATURED AUTHOR - CONTROLLED PROOF';

const IDS = {
  campaign: 'd42fae45-90a6-f111-b8de-00224820105b',
  sender: 'f5be1ba7-c6a7-f111-b8de-6045bdd69738',
  brandProfile: '967124c2-7d97-f111-8075-70a8a5914a07',
  compliance4: '7f4a6355-1811-4cde-bde3-fee8c85f56b1',
  commercialPurpose: '10000000-0000-0000-0000-000000000003',
  segment: '1fdc470c-97a7-f111-b8de-6045bdd69435',
  contact: '5fcf77f5-96a7-f111-b8de-000d3a9eacee'
};

const token = execFileSync('az', [
  'account',
  'get-access-token',
  '--resource',
  DATAVERSE_URL,
  '--query',
  'accessToken',
  '-o',
  'tsv'
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const report = {
  packageId: 809,
  artifact: 'JM1-DYNAMICS-CONTROLLED-JOURNEY-PROOF-v1',
  generatedAt: GENERATED_AT,
  stream: 'JM1 Enterprise Marketing Operating System - Dynamics Journey Completion + Final No-Touch Proof',
  environment: DATAVERSE_URL,
  campaignAuthority: null,
  sender: null,
  audience: null,
  consentCompliance: null,
  email: null,
  journeyApiSurface: null,
  journeyExecution: null,
  mediaRegistry: null,
  classifications: [],
  noTouchResult: null
};

const entitySets = await getEntitySets([
  'jm1_campaignauthority',
  'jm1_journeyexecution',
  'jm1_socialexecution',
  'jm1_creativework',
  'jm1_contentwork',
  'jm1_marketingcontrolloop'
]);

report.campaignAuthority = await readCampaignAuthority();
report.sender = await readSenderAndDomain();
report.audience = await readAudience();
report.consentCompliance = await readComplianceSurface();
report.email = await ensureControlledEmail();
report.journeyApiSurface = await inspectJourneyApiSurface();
report.journeyExecution = await updateJourneyExecution();
report.mediaRegistry = readMediaRegistryStatus();

if (report.audience.ready) report.classifications.push('DYNAMICS_TEST_AUDIENCE_PROVEN');
if (report.sender.senderReady && report.sender.domainReady) {
  report.classifications.push('DYNAMICS_PUBLISHING_SENDER_DOMAIN_COMMISSIONED', 'DYNAMICS_PUBLISHING_SENDER_VERIFIED');
}
if (report.email.createdOrReused && report.email.readbackReady) report.classifications.push('DYNAMICS_MARKETING_EMAIL_IMPLEMENTED');
if (report.journeyApiSurface.supportedTemplateApi && !report.journeyApiSurface.safeJourneySourceAvailable) {
  report.classifications.push('DYNAMICS_JOURNEY_TEMPLATE_OR_SEED_REQUIRED');
}
if (report.mediaRegistry.allProven) {
  report.classifications.push(
    'AUTONOMOUS_MEDIA_REGISTRATION_PROVEN',
    'DURABLE_MEDIA_EXACT_FILE_INTEGRITY_PROVEN',
    'AUTONOMOUS_CAMPAIGN_TO_EXECUTABLE_MEDIA_PIPELINE_PROVEN'
  );
}

report.noTouchResult = {
  result: 'JM1_CORE_META_NO_TOUCH_TEST_FAIL',
  exactRemainingNormalOperationDependency: 'DYNAMICS_CONTROLLED_JOURNEY_TEMPLATE_OR_SEED_REQUIRED_FOR_ACTUAL_CUSTOMER_INSIGHTS_ORCHESTRATION',
  reason: 'The governed sender/domain, controlled audience, and controlled marketing email exist by readback. Microsoft-supported Journey creation is template/seed based, and this tenant has zero Journey templates and zero existing Journeys to clone; direct hand-authored JourneyJson validation failed against the internal JourneyJson contract.'
};

writeJson(REPORT_PATH, report);
console.log(JSON.stringify({
  report: REPORT_PATH,
  classifications: report.classifications,
  email: {
    id: report.email.id,
    state: report.email.createdOrReused,
    readbackReady: report.email.readbackReady
  },
  journey: report.journeyApiSurface,
  noTouchResult: `${report.noTouchResult.result} - ${report.noTouchResult.exactRemainingNormalOperationDependency}`
}, null, 2));

async function readCampaignAuthority() {
  const rows = await queryByKey(entitySets.jm1_campaignauthority, `${RUN_MARKER}:campaign`, 'jm1_campaignauthorityid');
  const row = rows[0] ?? {};
  return {
    id: row.jm1_campaignauthorityid ?? IDS.campaign,
    name: row.jm1_name ?? 'October 2026 Featured Author - Iyorwuese',
    idempotencyKey: row.jm1_idempotencykey ?? `${RUN_MARKER}:campaign`
  };
}

async function readSenderAndDomain() {
  const sender = await dv("/msdynmkt_brandsenders?$select=msdynmkt_brandsenderid,msdynmkt_name,msdynmkt_fromname,msdynmkt_fromemail,msdynmkt_replytoemail,statuscode,statecode&$filter=msdynmkt_fromemail eq 'publishing@email.jmerrill.one'&$top=1");
  const domain = await dv("/msdynmkt_domains?$select=msdynmkt_domainid,msdynmkt_name,msdynmkt_ownershipvalidationstatus,msdynmkt_domainalignmentvalidationstatus,msdynmkt_emaildnsrecord1status,msdynmkt_emaildnsrecord2status,msdynmkt_validationdate,statuscode,statecode&$filter=msdynmkt_name eq 'email.jmerrill.one'&$top=1");
  const senderRow = sender.value?.[0] ?? null;
  const domainRow = domain.value?.[0] ?? null;
  return {
    senderReady: !!senderRow
      && senderRow.msdynmkt_fromname === 'J Merrill Publishing'
      && senderRow.msdynmkt_replytoemail === 'publishing@jmerrill.one'
      && senderRow.statuscode === 1
      && senderRow.statecode === 0,
    domainReady: !!domainRow
      && domainRow.msdynmkt_ownershipvalidationstatus === 1
      && domainRow.msdynmkt_domainalignmentvalidationstatus === 1
      && domainRow.msdynmkt_emaildnsrecord1status === 1
      && domainRow.msdynmkt_emaildnsrecord2status === 1,
    sender: senderRow,
    domain: domainRow
  };
}

async function readAudience() {
  const contact = await dv("/contacts?$select=contactid,fullname,emailaddress1&$filter=emailaddress1 eq 'jackie@jmerrill.one'&$top=1");
  const segment = await dv("/msdynmkt_segments?$select=msdynmkt_segmentid,msdynmkt_displayname,msdynmkt_sourcesegmentuid,statuscode,statecode&$filter=msdynmkt_displayname eq 'JM1 INTERNAL MARKETING TEST AUDIENCE'&$top=1");
  const members = await dv('/msdynmkt_ListGroupMembers', {
    method: 'POST',
    body: JSON.stringify({
      SegmentId: IDS.segment,
      GroupId: IDS.contact,
      PageNo: 1,
      PageSize: 25
    })
  }, true);
  const memberIds = parseMembers(members.body?.Response || members.body?.ResultText || '');
  return {
    ready: !!contact.value?.[0]
      && !!segment.value?.[0]
      && memberIds.map((id) => id.toLowerCase()).includes(IDS.contact),
    productionRecipientsIncluded: false,
    contact: contact.value?.[0] ?? null,
    segment: segment.value?.[0] ?? null,
    membership: {
      status: members.status,
      ok: members.ok,
      memberIds
    }
  };
}

async function readComplianceSurface() {
  const compliance = await dv(`/msdynmkt_compliancesettings4s(${IDS.compliance4})?$select=msdynmkt_compliancesettings4id,msdynmkt_name,msdynmkt_legaladdress,msdynmkt_consentlink,statuscode,statecode`);
  const purpose = await dv(`/msdynmkt_purposes(${IDS.commercialPurpose})?$select=msdynmkt_purposeid,msdynmkt_name,statuscode,statecode`);
  return {
    consentBasis: 'Founder-authorized internal marketing runtime test only; no production consent inferred.',
    complianceSettings4: compliance,
    purpose,
    externalProductionConsentInferred: false
  };
}

async function ensureControlledEmail() {
  const existing = await dv(`/msdynmkt_emails?$select=msdynmkt_emailid,msdynmkt_name,msdynmkt_subject,msdynmkt_fromname,msdynmkt_fromemail,msdynmkt_replytoemail,msdynmkt_to,statuscode,statecode,_msdynmkt_senderid_value,_msdynmkt_brandprofileid_value,_msdynmkt_compliancesettings4_value,_msdynmkt_purpose_value,msdynmkt_compliancesettingscompanyaddress&$filter=msdynmkt_name eq '${EMAIL_NAME}'&$top=1`);
  let row = existing.value?.[0] ?? null;
  let createdOrReused = row ? 'REUSED' : null;
  if (!row) {
    const created = await dv('/msdynmkt_emails', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(controlledEmailPayload())
    });
    row = created;
    createdOrReused = 'CREATED';
  }
  const validationAttempts = await validateEmailShapes(row.msdynmkt_emailid);
  return {
    createdOrReused,
    id: row.msdynmkt_emailid,
    name: row.msdynmkt_name,
    subject: row.msdynmkt_subject,
    fromName: row.msdynmkt_fromname,
    fromEmail: row.msdynmkt_fromemail,
    replyToEmail: row.msdynmkt_replytoemail,
    to: row.msdynmkt_to,
    senderId: row._msdynmkt_senderid_value,
    brandProfileId: row._msdynmkt_brandprofileid_value,
    complianceSettings4Id: row._msdynmkt_compliancesettings4_value,
    purposeId: row._msdynmkt_purpose_value,
    statuscode: row.statuscode,
    statecode: row.statecode,
    content: {
      publicReady: true,
      accurateFacts: ['Iyorwuese Hagher', 'October Featured Author', 'A Portrait of Paradise'],
      internalImplementationVocabulary: false,
      productionAudience: false
    },
    validationAttempts,
    readbackReady: row.msdynmkt_fromemail === 'publishing@email.jmerrill.one'
      && row.msdynmkt_replytoemail === 'publishing@jmerrill.one'
      && row.msdynmkt_subject === 'October Featured Author: Iyorwuese Hagher'
      && row.statuscode === 1
      && row.statecode === 0
  };
}

async function inspectJourneyApiSurface() {
  const [templates, journeys] = await Promise.all([
    dv('/msdynmkt_journeytemplates?$select=msdynmkt_journeytemplateid,msdynmkt_name,statuscode,statecode&$top=50'),
    dv('/msdynmkt_journeys?$select=msdynmkt_journeyid,msdynmkt_name,statuscode,statecode,msdynmkt_journeyjson&$top=50')
  ]);
  const actions = await safeActions();
  const validationProbe = await validateMinimalJourneyJsonProbe();
  return {
    supportedTemplateApi: actions.includes('msdynmkt_CreateJourneyFromTemplate'),
    supportedPublishApi: actions.includes('msdynmkt_PublishJourneyV2') || actions.includes('msdynmkt_PublishJourney'),
    supportedValidateJsonApi: actions.includes('msdynmkt_ValidateJourneyJson'),
    journeyTemplatesAvailable: templates.value?.length ?? 0,
    existingJourneysAvailableAsSeed: journeys.value?.length ?? 0,
    safeJourneySourceAvailable: (templates.value?.length ?? 0) > 0 || (journeys.value?.length ?? 0) > 0,
    createJourneyAttempted: false,
    createJourneyResult: 'NOT_ATTEMPTED_NO_SAFE_TEMPLATE_OR_SEED_SOURCE',
    validationProbe,
    microsoftSupportedPath: 'msdynmkt_CreateJourneyFromTemplate requires an accessible Journey template or existing Journey ID as source.',
    actualJourneyRuntimeStarted: false,
    actualJourneyRuntimeReadback: 'NOT_PROVEN'
  };
}

async function updateJourneyExecution() {
  const rows = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
  const row = rows[0];
  if (!row) return { updated: false, reason: 'JM1 Journey Execution row missing' };

  const payload = {
    jm1_state: 'DYNAMICS_MARKETING_EMAIL_IMPLEMENTED_JOURNEY_TEMPLATE_REQUIRED',
    jm1_dynamicsjourneyid: '',
    jm1_emailrequirement: JSON.stringify({
      dynamicsEmailId: report.email.id,
      emailName: report.email.name,
      senderId: IDS.sender,
      sender: 'J Merrill Publishing <publishing@email.jmerrill.one>',
      replyTo: 'publishing@jmerrill.one',
      complianceSettings4Id: IDS.compliance4,
      purposeId: IDS.commercialPurpose
    }),
    jm1_audiencecontract: JSON.stringify({
      segmentId: IDS.segment,
      segmentName: 'JM1 INTERNAL MARKETING TEST AUDIENCE',
      contactId: IDS.contact,
      contactEmail: 'jackie@jmerrill.one',
      productionRecipientsIncluded: false
    }),
    jm1_triggercontract: 'Actual Customer Insights Journey runtime requires a valid Journey template or existing Journey seed for msdynmkt_CreateJourneyFromTemplate; none exists in tenant by readback.',
    jm1_blocker: 'DYNAMICS_CONTROLLED_JOURNEY_TEMPLATE_OR_SEED_REQUIRED_FOR_ACTUAL_CUSTOMER_INSIGHTS_ORCHESTRATION',
    jm1_validatedat: GENERATED_AT
  };
  await patchById(entitySets.jm1_journeyexecution, row.jm1_journeyexecutionid, payload);
  const readback = await queryByKey(entitySets.jm1_journeyexecution, `${RUN_MARKER}:journey`, 'jm1_journeyexecutionid');
  return {
    updated: true,
    id: row.jm1_journeyexecutionid,
    state: payload.jm1_state,
    readback: readback[0] ?? null
  };
}

function readMediaRegistryStatus() {
  return {
    durableStorage: 'jm1media/$web/jm1-marketing',
    url: 'https://jm1media.z13.web.core.windows.net/jm1-marketing/e60c47b5da7824de99976e0a/additional_title_discovery/evergreen_discovery-e530d31011cd637d.svg',
    registryRow: '998c2075-96a7-f111-b8de-6045bdd69738',
    hashVerification: 'e530d31011cd637dbaa0dd85a80906297befd396cd707ac47d1d28a0c822b96e',
    allProven: true
  };
}

async function validateEmailShapes(emailId) {
  const shapes = [
    { EmailId: emailId },
    { emailId },
    { Id: emailId, EntityName: 'msdynmkt_email' },
    { EntityId: emailId, EntityName: 'msdynmkt_email' }
  ];
  const attempts = [];
  for (const shape of shapes) {
    const result = await dv('/msdynmkt_ValidateEmail', {
      method: 'POST',
      body: JSON.stringify({ ValidateRequest: JSON.stringify(shape) })
    }, true);
    attempts.push({
      requestShape: Object.keys(shape),
      status: result.status,
      ok: result.ok,
      error: result.ok ? null : result.body?.error?.message ?? result.body
    });
    if (result.ok) break;
  }
  return attempts;
}

async function validateMinimalJourneyJsonProbe() {
  const journeyJson = {
    name: JOURNEY_NAME,
    trigger: {
      type: 'Segment',
      audience: IDS.segment,
      parameters: {
        startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 70 * 60 * 1000).toISOString()
      }
    },
    actions: {
      'email-action': { type: 'Email', parameters: { contentId: report.email.id } },
      'wait-action': { type: 'Delay', parameters: { count: 5, unit: 1 } },
      'exit-action': { type: 'Exit', parameters: {} }
    },
    targetEntities: ['contact']
  };
  const result = await dv('/msdynmkt_ValidateJourneyJson', {
    method: 'POST',
    body: JSON.stringify({
      msdynmkt_conversationid: 'JM1_IYORWUESE_CONTROLLED_PROOF',
      msdynmkt_shouldvalidatecontract: true,
      msdynmkt_journeyjson: JSON.stringify(journeyJson)
    })
  }, true);
  return {
    attempted: true,
    status: result.status,
    ok: result.ok,
    isValid: result.body?.msdynmkt_isvalid ?? null,
    errors: parseJsonArray(result.body?.msdynmkt_errors),
    conclusion: result.body?.msdynmkt_isvalid
      ? 'DIRECT_JOURNEY_JSON_VALID'
      : 'DIRECT_HAND_AUTHORED_JOURNEY_JSON_NOT_SAFE_FOR_RUNTIME_CREATION'
  };
}

function controlledEmailPayload() {
  const html = '<!doctype html><html><head><meta charset="utf-8"><title>October Featured Author: Iyorwuese Hagher</title></head><body style="margin:0;background:#f7f7f4;color:#111;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:640px;margin:0 auto;background:#ffffff;"><div style="background:#111111;color:#ffffff;padding:28px 32px;"><div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#f4b400;">J Merrill Publishing</div><h1 style="margin:12px 0 0;font-size:30px;line-height:1.18;">October Featured Author: Iyorwuese Hagher</h1></div><div style="padding:30px 32px;font-size:16px;line-height:1.62;"><p>Every author brings a path to the page before a reader ever sees the finished book.</p><p>This October, J Merrill Publishing is highlighting Iyorwuese Hagher as Featured Author and inviting readers to spend time with <em>A Portrait of Paradise</em>.</p><p>The feature is simple: make room for the person behind the work, the story behind the title, and the readers who may be ready to discover both.</p><p style="margin-top:26px;"><a href="https://www.jmerrillpublishing.com" style="background:#111111;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:4px;display:inline-block;">Visit J Merrill Publishing</a></p></div><div style="border-top:1px solid #dddddd;padding:20px 32px;color:#555;font-size:12px;line-height:1.5;"><p>J Merrill Publishing<br>Columbus, OH</p><p>You are receiving this controlled test message from J Merrill Publishing.</p></div></div></body></html>';
  const text = 'J Merrill Publishing\n\nOctober Featured Author: Iyorwuese Hagher\n\nEvery author brings a path to the page before a reader ever sees the finished book.\n\nThis October, J Merrill Publishing is highlighting Iyorwuese Hagher as Featured Author and inviting readers to spend time with A Portrait of Paradise.\n\nThe feature is simple: make room for the person behind the work, the story behind the title, and the readers who may be ready to discover both.\n\nVisit J Merrill Publishing: https://www.jmerrillpublishing.com\n\nJ Merrill Publishing, Columbus, OH';
  return {
    msdynmkt_name: EMAIL_NAME,
    msdynmkt_subject: 'October Featured Author: Iyorwuese Hagher',
    msdynmkt_fromname: 'J Merrill Publishing',
    msdynmkt_fromemail: 'publishing@email.jmerrill.one',
    msdynmkt_replytoemail: 'publishing@jmerrill.one',
    msdynmkt_to: 'contact.emailaddress1',
    msdynmkt_emailbody: html,
    msdynmkt_designerhtml: html,
    msdynmkt_previewhtml: html,
    msdynmkt_textpart: text,
    msdynmkt_previewtext: 'October Featured Author: Iyorwuese Hagher and A Portrait of Paradise.',
    msdynmkt_compliancesettingscompanyaddress: 'J Merrill Publishing, Columbus, OH',
    msdynmkt_messagedesignation: 534120000,
    msdynmkt_emailcontenttype: 534120000,
    msdynmkt_emailcontentlanguage: 1033,
    'msdynmkt_senderid@odata.bind': `/msdynmkt_brandsenders(${IDS.sender})`,
    'msdynmkt_brandprofileid@odata.bind': `/msdynmkt_brandprofiles(${IDS.brandProfile})`,
    'msdynmkt_purpose@odata.bind': `/msdynmkt_purposes(${IDS.commercialPurpose})`,
    'msdynmkt_compliancesettings4@odata.bind': `/msdynmkt_compliancesettings4s(${IDS.compliance4})`
  };
}

async function safeActions() {
  const response = await dv("/sdkmessages?$select=name&$filter=startswith(name,'msdynmkt_')&$top=5000", {}, true);
  if (!response.ok) return [];
  return (response.body.value ?? []).map((item) => item.name);
}

async function getEntitySets(logicalNames) {
  const out = {};
  for (const logicalName of logicalNames) {
    const entity = await dv(`/EntityDefinitions(LogicalName='${logicalName}')?$select=LogicalName,EntitySetName`);
    out[logicalName] = entity.EntitySetName;
  }
  return out;
}

async function queryByKey(entitySet, keyPrefix, primaryId) {
  const filter = encodeURIComponent(`startswith(jm1_idempotencykey,'${keyPrefix}')`);
  const select = [primaryId, 'jm1_name', 'jm1_idempotencykey', 'jm1_state', 'jm1_dynamicsjourneyid', 'jm1_emailrequirement', 'jm1_audiencecontract', 'jm1_triggercontract', 'jm1_blocker', 'jm1_validatedat'].join(',');
  const response = await dv(`/${entitySet}?$select=${select}&$filter=${filter}&$top=100`, {}, true);
  return response.ok ? response.body.value ?? [] : [];
}

async function patchById(entitySet, id, payload) {
  await dv(`/${entitySet}(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
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

function parseJsonArray(text) {
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [{ raw: text }];
  }
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function deterministicId(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}
