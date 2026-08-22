# ACS Package Risk

Current model:

- Resource: func-jm1-acs-email-relay
- Hosting: Linux Consumption
- Runtime: Node|22
- Deployment: WEBSITE_RUN_FROM_PACKAGE signed URL in stjm1acsrelay storage
- Expiry model: long-lived signed URL; not imminent but still expiring-package architecture
- Immediate remediation: none required during Wave 0 because expiration is not imminent and function remained running.
- Required control: add package/SAS expiration monitoring with 180/90/30/7-day windows.
- Wave B target: Flex Consumption + Node 24 + durable deployment pipeline without manual long-lived signed URL dependency.
