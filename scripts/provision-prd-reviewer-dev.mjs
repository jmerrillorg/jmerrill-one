// Provision schema in Enterprise-Dev only; export the resulting solution for reviewed promotion.
const base = 'https://jm1enterprisedev.crm.dynamics.com/api/data/v9.2';
const token = process.env.DATAVERSE_TOKEN;
if (!token) throw new Error('DATAVERSE_TOKEN is required');
const solution = 'JM1ProductionsBP09InquiryReview';

async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`, Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'OData-Version': '4.0', 'OData-MaxVersion': '4.0',
      'MSCRM.SolutionUniqueName': solution,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function label(value) {
  return { '@odata.type': 'Microsoft.Dynamics.CRM.Label',
    LocalizedLabels: [{ '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
      Label: value, LanguageCode: 1033 }] };
}

async function table(schema, singular, plural, description) {
  const logical = schema.toLowerCase();
  try {
    await request(`/EntityDefinitions(LogicalName='${logical}')?$select=LogicalName`);
    return;
  } catch (error) {
    if (!String(error).includes('404')) throw error;
  }
  await request('/EntityDefinitions', 'POST', {
    '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata',
    SchemaName: schema, DisplayName: label(singular),
    DisplayCollectionName: label(plural), Description: label(description),
    OwnershipType: 'OrganizationOwned', IsActivity: false,
    HasActivities: false, HasNotes: false,
    Attributes: [{ '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
      AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
      SchemaName: 'jm1_Name', DisplayName: label('Name'),
      IsPrimaryName: true, RequiredLevel: { Value: 'None' },
      FormatName: { Value: 'Text' }, MaxLength: 120 }],
  });
}

async function textColumn(schema, display, maxLength = 120) {
  const logical = schema.toLowerCase();
  try {
    await request(`/EntityDefinitions(LogicalName='jm1_productionsinquiryaction')/Attributes(LogicalName='${logical}')?$select=LogicalName`);
    return;
  } catch (error) {
    if (!String(error).includes('404')) throw error;
  }
  await request("/EntityDefinitions(LogicalName='jm1_productionsinquiryaction')/Attributes", 'POST', {
    '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
    AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
    SchemaName: schema, DisplayName: label(display),
    RequiredLevel: { Value: 'None' }, FormatName: { Value: 'Text' }, MaxLength: maxLength,
  });
}

await table('jm1_ProductionsInquiryAction', 'Productions Inquiry Action',
  'Productions Inquiry Actions', 'Minimal BP-09 operator action evidence; no inquiry body or Contact profile.');
await table('jm1_ProductionsReviewPermit', 'Productions Review Permit',
  'Productions Review Permits', 'Privilege anchor for the bounded BP-09 reviewer action. No business rows.');
try {
  await request("/EntityDefinitions(LogicalName='lead')/Attributes(LogicalName='jm1_bp09intakereceiptid')?$select=LogicalName");
} catch (error) {
  if (!String(error).includes('404')) throw error;
  await request("/EntityDefinitions(LogicalName='lead')/Attributes", 'POST', {
    '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
    AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
    SchemaName: 'jm1_BP09IntakeReceiptId', DisplayName: label('BP-09 intake receipt ID'),
    Description: label('Accepted intake receipt reference; no message content.'),
    RequiredLevel: { Value: 'None' }, FormatName: { Value: 'Text' }, MaxLength: 36,
  });
}
for (const [schema, display] of [
  ['jm1_LeadId', 'Lead ID'], ['jm1_ReceiptId', 'Accepted receipt ID'],
  ['jm1_ActorId', 'Actor system user ID'], ['jm1_ActorObjectId', 'Actor Entra object ID'],
  ['jm1_ActionId', 'Action ID'], ['jm1_Key', 'Idempotency key'],
  ['jm1_Before', 'Prior state'], ['jm1_After', 'New state'],
  ['jm1_ExpectedVersion', 'Expected Lead version'],
  ['jm1_CorrelationId', 'Correlation ID'], ['jm1_Outcome', 'Outcome'],
]) await textColumn(schema, display);

const status = await request("/EntityDefinitions(LogicalName='lead')/Attributes(LogicalName='statuscode')/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options)");
if (!status.OptionSet.Options.some(option => option.Value === 730000001)) {
  await request('/InsertStatusValue', 'POST', {
    EntityLogicalName: 'lead', AttributeLogicalName: 'statuscode', StateCode: 0,
    Value: 730000001, Label: label('Follow-up Required'), SolutionUniqueName: solution,
  });
}
await request('/PublishAllXml', 'POST', {});
console.log('Enterprise-Dev BP-09 reviewer tables and Lead status published');
