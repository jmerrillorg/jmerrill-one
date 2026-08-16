# HOST-02 Closeout v2

Final classification: **HOST-02 CAPACITY DECISION REQUIRED — MIGRATION PREP CONTINUED**

Migration progress remains **1 OF 6**. Publishing is live on App Service; the other five public properties remain on SWA.

Capacity root cause:

- The five non-live target App Services were not carrying production traffic.
- They produced only small Always On/platform request traffic and tiny per-app CPU/memory metrics.
- Always On was disabled on all five non-live target apps to remove placeholder warmup waste.
- After that optimization, the shared S1 plan still measured about **47.0-73.8% CPU** and **77.8-79.0% memory**.

Capacity decision:

- Current plan: `asp-jm1-web-prod-linux`, S1, 1 worker.
- Observed S1 Linux meter: `$0.095/hour`, about `$69.35/month` at 730 hours.
- Recommendation: scale out to **2 S1 workers** before public cutover.
- Estimated incremental cost: about `$69.35/month`.

Financial runtime:

- Financial has five SWA-managed Azure Functions-style API endpoints.
- Recommended target pattern is App Service frontend plus intentional Azure Functions backend or approved equivalent.
- Do not keep SWA as a hidden permanent backend.

No DNS, TLS, custom-domain, workflow, SWA freeze, or SWA deletion changes were made during this continuation. The exact next enterprise action is Founder approval of the capacity expansion or equivalent capacity option.
