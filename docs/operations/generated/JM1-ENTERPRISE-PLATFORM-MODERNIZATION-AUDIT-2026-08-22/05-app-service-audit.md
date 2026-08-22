# App Service Audit

| App | Domains | Plan | Runtime | Health | HTTPS Only | Identity | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| app-jm1-one-prod-v2 | jmerrill.one,www.jmerrill.one | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | none | identity candidate |
| app-jm1-pub-prod-v2 | jmerrill.pub,www.jmerrill.pub | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | SystemAssigned | baseline leader |
| app-jm1-fin-prod-v2 | jmerrill.financial,www.jmerrill.financial | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | none | identity candidate |
| app-jm1-foundation-prod-v2 | jmerrill.foundation,www.jmerrill.foundation | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | none | identity candidate |
| app-jm1-productions-prod-v2 | jmerrill.productions,www.jmerrill.productions | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | none | identity candidate |
| app-jm1-jackiesmithjr-prod-v2 | jackiesmithjr.com | P1mv3 PremiumMV3 | NODE/24-lts | /api/health | true | none | identity candidate |
| aic-app-service-prod | agapeic.org,www.agapeic.org,aic.agapeic.org | B1 Basic | not captured | not captured | false | none | HTTPS/runtime review P1 |


All six JM1 Premium v3 web apps are runtime-aligned to Node 24 LTS. AIC is outside the Premium consolidation and needs a focused follow-up.
