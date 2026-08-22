# Migration Waves


## Wave A - Runtime Baseline

Node 24 remains the production baseline. Align local development/Codex validation away from accidental Node 26 for production checks. Keep Node 26 as compatibility lane only.

## Wave B - Azure Hosting Modernization

Migrate Linux Consumption Function Apps to Flex Consumption where feasible, then adopt Node 24. Preserve the Financial function boundary in the Financial repo.

## Wave C - Identity / Secrets

Triage expired app credentials, rotate active integrations, retire dead credentials, and replace eligible secrets with managed identity or workload identity.

## Wave D - SDK / API Modernization

Patch Next.js to a fixed non-major release, then audit division repos for Graph, Azure, Stripe, Functions, and Business Central SDK/API versions.

## Wave E - Power Platform

Export actual flows/apps/connection references using admin scope, classify owner risk, disabled flows, legacy connectors, classic workflows, and unmanaged solution debt.

## Wave F - Deployment / IaC

Move manual portal-created resources into Bicep/Terraform or governed CLI manifests. Replace expiring run-from-package URL patterns with canonical package deployment pipelines.

## Wave G - Observability / EOL Automation

Implement monthly support/expiration audit with 180/90/30-day warnings for service retirements, credentials, certificates, and package URLs.
