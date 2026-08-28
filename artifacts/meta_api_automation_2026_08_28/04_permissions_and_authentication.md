# 04 Permissions And Authentication

Date: 2026-08-28

## Required Permission Families

The implementation must request only the permissions required for the governed publishing and analytics workflow.

Initial expected permissions and capabilities:

- Facebook Page read and publish capability for selected JM1 Pages
- Instagram Professional account read capability
- Instagram content publishing capability
- Engagement/insights read capability where analytics return path is enabled

Exact Meta permission names must be finalized against the current app setup and Meta App Review surface.

## Auth Health States

The JM1 API must expose and persist these health states:

- AUTH_OK
- AUTH_EXPIRING
- AUTH_REQUIRED
- PERMISSION_REQUIRED
- ASSET_ACCESS_DENIED

Authentication failures must never silently drop eligible scheduled posts.

## Token Rules

Production credentials must not depend on:

- browser cookies
- Jackie interactive login
- manually copied short-lived tokens
- secrets embedded in Power Automate
- secrets committed to source control
- local-machine-only authentication state

Secrets belong in Azure Key Vault and should be accessed by the API host through managed identity.
