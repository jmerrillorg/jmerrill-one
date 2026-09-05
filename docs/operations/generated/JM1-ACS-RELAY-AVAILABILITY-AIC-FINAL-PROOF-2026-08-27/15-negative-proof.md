# Negative Proof

Last verified: 2026-08-28T02:35:00Z

| Assertion | Count |
| --- | ---: |
| PR22_left_unmerged | 0 |
| AIC_Graph_scope_changed_without_new_evidence | 0 |
| AIC_mailbox_recreated | 0 |
| AIC_sender_changed | 0 |
| AIC_reply_to_changed | 0 |
| new_ACS_service_created | 0 |
| new_Function_App_created | 0 |
| manual_deployment_used_as_normal_path | 0 |
| repeated_proof_send_before_host_repair | 0 |
| duplicate_AIC_proof_send | 0 |
| public_AIC_message_sent | 0 |
| Planning_Center_mutation | 0 |
| sender_registry_regressed | 0 |
| wrong_brand_allowed | 0 |
| ACTIVE_SENDER_DRIFT | 0 |
| 503_hidden_as_send_failure_only | 0 |
| deployment_success_claimed_without_host_health | 0 |

Notes:

- One ACS-accepted proof was routed before the temporary domain redirect was disabled; it was intercepted by Exchange transport and did not land in the canonical mailbox.
- One post-redirect-repair proof was accepted, delivered, and read back.
- The failed validation attempt did not reach ACS send and is not counted as a proof send.

