# Alert and Failure Visibility Readback

Existing Azure alerts are enabled:

| Alert | Severity | Evaluation | Coverage |
| --- | --- | --- | --- |
| `jm1-marketing-runtime-exceptions` | 1 | Every 5 minutes over 15 minutes | Any Application Insights exception, including a failed credential-monitor invocation. |
| `jm1-marketing-critical-state` | 1 | Every 5 minutes over 15 minutes | Critical bounded states including `CREDENTIAL_FAILURE`; LinkedIn review-pending noise is excluded. |
| `jm1-marketing-social-worker-freshness` | 2 | Every 15 minutes over 45 minutes | Social worker freshness. |

The monitor emits `CREDENTIAL_MONITOR_GOVERNED_DEBT` for expiring, expired, unknown, invalid, and readback-failed states. This keeps security debt visible without raising a Founder alert for every unknown or expected not-issued state. Actual execution/write failures still surface through exception alerting.

No new alert was created. The current critical-state alert does not directly match the governed-debt event name, so enterprise policy should decide whether selected expiration windows or unknown metadata require a dedicated operational notification in a later packet.
