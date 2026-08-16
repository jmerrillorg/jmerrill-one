# HOST-02 Final Hosting Matrix

Final classification: **HOST-02 REMEDIATION REQUIRED**

| Brand | Target Host | Actual Host After HOST-02 | Target Resource | State |
|---|---|---|---|---|
| J Merrill One | Azure App Service | Azure Static Web Apps | app-jm1-one-prod | Not cut over |
| J Merrill Publishing | Azure App Service | Azure App Service | app-jm1-pub-prod | Already live |
| J Merrill Financial | Azure App Service | Azure Static Web Apps | app-jm1-fin-prod | Blocked |
| J Merrill Foundation | Azure App Service | Azure Static Web Apps | app-jm1-foundation-prod | Not cut over |
| J Merrill Productions | Azure App Service | Azure Static Web Apps | app-jm1-productions-prod | Not cut over |
| Jackie Smith Jr. | Azure App Service | Azure Static Web Apps | app-jm1-jackiesmithjr-prod | Blocked |

HOST-02 did not perform public DNS, TLS, custom-domain, SWA freeze, or SWA deletion changes.
