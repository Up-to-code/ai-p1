# Risks

## Dependency risks

- Payload generated GraphQL routes require `graphql` at build time. Omitting it breaks production builds even when public pages do not call GraphQL directly.
- Generated files under `apps/marketing/app/(payload)` may be overwritten by Payload; prefer changes in config/package files unless regeneration is intended.

## Environment/secrets

- `payload.config.ts` falls back to `CHANGE-ME-IN-PRODUCTION` if `PAYLOAD_SECRET` is absent. Production must provide a real `PAYLOAD_SECRET`.
- SQLite database URL currently points to `database.db` under the marketing app working directory. Production persistence and deployment filesystem behavior should be reviewed before relying on CMS writes in production.

## Compatibility

- The app uses Next.js `16.3.0-canary.19`; validate against the local Next docs and actual build behavior before making framework-specific changes.
- Payload dependency versions should remain aligned (`payload`, `@payloadcms/*`) to avoid generated route/import-map incompatibilities.

## Rollback

- If the `graphql` dependency causes issues, remove it from `apps/marketing/package.json` and `package-lock.json`, but the Payload GraphQL route will need to be removed/disabled or builds will fail again.
