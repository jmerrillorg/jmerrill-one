# Credential State Model

| State | Meaning |
| --- | --- |
| `KNOWN_VALID` | Known future expiration is outside the 60-day governed window. |
| `EXPIRING_60D` | Expiration is more than 30 and no more than 60 days away. |
| `EXPIRING_30D` | Expiration is more than 14 and no more than 30 days away. |
| `EXPIRING_14D` | Expiration is more than 7 and no more than 14 days away. |
| `EXPIRING_7D` | Expiration is in the next 7 days. |
| `EXPIRED` | Known expiration is at or before evaluation time. |
| `EXPIRATION_UNKNOWN` | Credential exists, but expiration metadata is missing, null, or empty. |
| `NONEXPIRING_PROVEN` | Provider or credential class explicitly proves nonexpiring semantics. |
| `INVALID_METADATA` | A nonempty timestamp is malformed or metadata is contradictory. |
| `READBACK_FAILED` | Provider or persistence readback failed. |
| `NOT_ISSUED` | Credential lifecycle has not produced a token. |

All boundary calculations use UTC. Nonempty timestamps must be RFC3339 with an explicit timezone. Contradictory issued, expiration, or rotation dates fail closed as `INVALID_METADATA`.
