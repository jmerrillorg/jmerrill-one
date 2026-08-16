# HOST-02 Retirement Deletion Manifest

Classification: HOST-02 RETIREMENT READY — FOUNDER DELETION CONFIRMATION REQUIRED

Do not delete until Founder confirmation is received.

## A. Superseded App Services
- app-jm1-one-prod (rg-jm1-web-prod-appsvc) -> replacement app-jm1-one-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- app-jm1-fin-prod (rg-jm1-web-prod-appsvc) -> replacement app-jm1-fin-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- app-jm1-foundation-prod (rg-jm1-web-prod-appsvc) -> replacement app-jm1-foundation-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- app-jm1-productions-prod (rg-jm1-web-prod-appsvc) -> replacement app-jm1-productions-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- app-jm1-jackiesmithjr-prod (rg-jm1-web-prod-appsvc) -> replacement app-jm1-jackiesmithjr-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- app-jm1-pub-prod (rg-jm1-pub-prod-appsvc) -> replacement app-jm1-pub-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.

## B. Superseded App Service Plans
- asp-jm1-web-prod-linux (rg-jm1-web-prod-appsvc) -> replacement asp-jm1-web-prod-premium; READY TO DELETE AFTER ATTACHED OLD APPS ARE REMOVED; delete after attached old apps are removed.
- asp-jm1-pub-prod-linux (rg-jm1-pub-prod-appsvc) -> replacement asp-jm1-web-prod-premium; READY TO DELETE AFTER ATTACHED OLD APPS ARE REMOVED; delete after attached old apps are removed.

## C. Superseded Static Web Apps
- jmerrill-one (jmerrill-one) -> replacement app-jm1-one-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- jmerrill-financial (jmerrill-financial_group) -> replacement app-jm1-fin-prod-v2 + func-jm1-fin-prod; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- foundation-main (jm1-core-services) -> replacement app-jm1-foundation-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- jmerrill-productions (jmerrill-productions-rg) -> replacement app-jm1-productions-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.
- jackiesmithjr (jm1-core-services) -> replacement app-jm1-jackiesmithjr-prod-v2; READY TO DELETE; NO ACTIVE DNS; NO CUSTOM DOMAIN; NO PRODUCTION TRAFFIC.

## D. Other Transition Resources
- None proposed.
