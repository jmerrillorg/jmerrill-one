// Enterprise-Dev-only receipt fixture. This table is not part of the deployable reviewer solution.
const base = 'https://jm1enterprisedev.crm.dynamics.com/api/data/v9.2';
const token = process.env.DATAVERSE_TOKEN;
if (!token) throw new Error('DATAVERSE_TOKEN is required');
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json',
  'Content-Type': 'application/json; charset=utf-8', 'OData-Version': '4.0', 'OData-MaxVersion': '4.0' };
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}
const label = value => ({ '@odata.type': 'Microsoft.Dynamics.CRM.Label',
  LocalizedLabels: [{ '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
    Label: value, LanguageCode: 1033 }] });
try {
  await request("/EntityDefinitions(LogicalName='jm1_executionlog')?$select=LogicalName");
} catch (error) {
  if (!String(error).includes('404')) throw error;
  await request('/EntityDefinitions', 'POST', {
    '@odata.type': 'Microsoft.Dynamics.CRM.EntityMetadata', SchemaName: 'jm1_ExecutionLog',
    DisplayName: label('BP-09 Development Receipt Fixture'),
    DisplayCollectionName: label('BP-09 Development Receipt Fixtures'),
    Description: label('Synthetic-only fixture for isolated reviewer plug-in testing.'),
    OwnershipType: 'OrganizationOwned', IsActivity: false, HasActivities: false, HasNotes: false,
    Attributes: [{ '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
      AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
      SchemaName: 'jm1_Name', DisplayName: label('Name'), IsPrimaryName: true,
      RequiredLevel: { Value: 'None' }, FormatName: { Value: 'Text' }, MaxLength: 120 }],
  });
}
for (const [schema, max] of [['jm1_ActionType', 120], ['jm1_ActionDescription', 4000]]) {
  try {
    await request(`/EntityDefinitions(LogicalName='jm1_executionlog')/Attributes(LogicalName='${schema.toLowerCase()}')?$select=LogicalName`);
  } catch (error) {
    if (!String(error).includes('404')) throw error;
    await request("/EntityDefinitions(LogicalName='jm1_executionlog')/Attributes", 'POST', {
      '@odata.type': 'Microsoft.Dynamics.CRM.StringAttributeMetadata',
      AttributeType: 'String', AttributeTypeName: { Value: 'StringType' },
      SchemaName: schema, DisplayName: label(schema), RequiredLevel: { Value: 'None' },
      FormatName: { Value: 'Text' }, MaxLength: max,
    });
  }
}
await request('/PublishAllXml', 'POST', {});
console.log('Enterprise-Dev receipt fixture published outside reviewer solution');
