# Wave 0 Power BI Credential Remediation Plan

Status: PASS_WITH_REPAIR_SCHEDULED

The expired J Merrill One HQ - Power BI secret must not be blindly rotated because the exact Power BI workspace/report permission path and secret destination must be validated first. The app is referenced by jm1-ed-functions through POWERBI_* settings.

Plan:

1. Validate the current Power BI workspace/report dependency and whether jm1-ed-functions still owns the consumer path on 2026-08-23.
2. Create a replacement credential or replace the consumer with a governed service identity on 2026-08-24.
3. Update only the validated secret destination.
4. Run jm1-ed-functions health and Power BI-path validation, then observe through 2026-08-26.

No seed content, Council canon, or unrelated Power BI/Fabric build is authorized here.
