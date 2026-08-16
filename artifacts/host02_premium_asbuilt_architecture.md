# HOST-02 Premium As-Built Architecture

Classification: HOST-02 COMPLETE — ALL SIX SITES CONSOLIDATED ON P1mv3; RETIREMENT CONFIRMATION REQUIRED

```text
GitHub repositories
  |
  v
GitHub Actions / Azure OIDC
  |
  v
rg-jm1-web-prod-premium
  |
  +-- asp-jm1-web-prod-premium (P1mv3 x 1)
        |
        +-- app-jm1-one-prod-v2 -> jmerrill.one / www.jmerrill.one
        +-- app-jm1-pub-prod-v2 -> jmerrill.pub / www.jmerrill.pub
        +-- app-jm1-fin-prod-v2 -> jmerrill.financial / www.jmerrill.financial
        +-- app-jm1-foundation-prod-v2 -> jmerrill.foundation / www.jmerrill.foundation
        +-- app-jm1-productions-prod-v2 -> jmerrill.productions / www.jmerrill.productions
        +-- app-jm1-jackiesmithjr-prod-v2 -> jackiesmithjr.com

Financial
  |
  +-- func-jm1-fin-prod Azure Functions backend

Required integrations
  +-- Dataverse where runtime requires it
  +-- Customer Voice public entry routes
  +-- Existing Key Vault URI / server-side settings patterns
  +-- Azure Monitor / Application Insights
```

Old App Services, S1 plans, and SWAs are retained only for bounded rollback/retirement pending explicit Founder deletion confirmation.
