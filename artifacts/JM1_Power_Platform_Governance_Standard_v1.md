# JM1 Power Platform Governance Standard v1

Status: CANON — v1.0

## Authority

Founder & CEO remains the governance authority for JM1 as a single-person enterprise. Human authority does not remove evidence requirements.

## Environment Strategy

Canonical lifecycle: `JM1-Enterprise-Dev -> JM1-Test -> JM1-Core`.

`JM1-CRM-Core` is the default environment and must be restricted. `JM1-Dev` is a legacy/other sandbox until formally assigned or retired. `One Dynamics Environment` is a legacy/parallel production candidate until its role is verified.

## Managed Environments

DEV, TEST, and PROD should use Managed Environments where entitlement permits. Recommended controls include usage insights, maker onboarding, sharing limits, solution checker enforcement, weekly digest, and admin visibility.

## DLP

Business/Trusted connectors include Dataverse, Outlook, Teams, SharePoint, approved Dynamics capabilities, approved Azure/Microsoft services, and governed Copilot Studio usage.

Limited connectors include Excel and OneDrive for Business unless justified for a governed workload.

Blocked connectors include consumer OneDrive, unapproved third-party SaaS, unapproved generative AI connectors, consumer services, and generic HTTP without exception.

## HTTP and Custom Connectors

Generic HTTP must not become an uncontrolled escape hatch around DLP. Approved use requires endpoint ownership, authentication, logging, data classification, owner, rollback, and documented exception.

## Maker and Sharing Governance

No casual production edits. No Everyone sharing. Production connections should prefer service/application/shared mailbox identities where available. Default environment is not an enterprise workload target.

## Solution Governance

Unmanaged development occurs in DEV. TEST and PROD should receive managed solutions where supported. Existing unmanaged production solutions are migration candidates, not precedent for new unmanaged production work.

## Environment Variables and Connection References

Environment-specific config belongs in environment variables. Secrets belong in approved secret stores. Solution flows use connection references with named owner and production-readiness status.

## Pipelines

Target pipeline: `JM1-Enterprise-Dev -> JM1-Test -> JM1-Core`. Pipelines must be configured before broad Microsoft workload expansion.

## Deployment, Rollback, Evidence

Every production deployment records package, version, source, target, actor, timestamp, run/pipeline ID, validation, and rollback state. Rollback uses prior managed solution version where available or source-controlled/exported recovery.

## Telemetry

Use Managed Environment insights, flow failures, app/connector usage, capacity visibility, audit logs, and Application Insights where appropriate. Do not build Power BI/Fabric dashboards under BP-10.

## Architecture Exceptions

Exceptions require business justification, data risk, owner, scope, expiration/review date, validation, and rollback.
