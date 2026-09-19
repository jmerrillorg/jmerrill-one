# Legacy Direct CLIENT_SECRET Classification

Classification: `SUPERSEDED`

The production App Service still contains a direct `CLIENT_SECRET` setting that is not Key Vault-backed. Canonical source contains no reference to `process.env.CLIENT_SECRET` or the generic setting name in application/runtime code. Current NextAuth secret handling uses its named Key Vault reference.

The setting was not removed or changed. Removal requires a separate, bounded configuration-cleanup packet with rollback and production readback.
