# BP-12 Human Admin Action Packet

1. Create environment group: Power Platform Admin Center -> Environment groups -> create JM1 Enterprise -> add JM1-Enterprise-Dev, JM1-Test, JM1-Core. Validate group membership afterward.

2. Export actual DLP policies: Power Platform Admin Center -> Policies -> Data policies. Capture policy IDs, scopes, connector groups, HTTP/custom connector handling, and endpoint restrictions. Do not change policy until impact analysis is reviewed.

3. Configure Pipelines: Power Platform Admin Center / Pipelines app -> configure host and stages for JM1-Enterprise-Dev -> JM1-Test -> JM1-Core. Validate with pac pipeline list before any deployment proof.

4. Confirm tenant environment creation control: Tenant settings still show disableEnvironmentCreationByNonAdminUsers = false after PAC update attempt. Set to true or document the exception.
