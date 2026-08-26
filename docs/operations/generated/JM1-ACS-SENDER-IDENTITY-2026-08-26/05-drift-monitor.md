# Drift Monitor

Last verified: 2026-08-26T16:13:13Z

The drift monitor must surface `ACS_SENDER_IDENTITY_ATTENTION_REQUIRED` when it detects:

- wrong From;
- wrong Reply-To;
- wrong mailbox authority;
- missing sender configuration;
- duplicate sender;
- sender not configured or verified in ACS;
- alias missing;
- alias attached to the wrong mailbox;
- hardcoded Publishing sender in a cross-brand path;
- unknown brand;
- duplicate footer;
- sender registry/runtime mismatch.

Required diagnostic fields:

- brand;
- expected;
- actual;
- runtime;
- next action.

Current relay tests cover the core wrong-brand, wrong reply-to, unknown-brand, AIC undecided, missing archive, and duplicate signature cases.
