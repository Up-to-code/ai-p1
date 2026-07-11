# Zapier Platform App

Status: Implemented locally; remote Zapier registration requires developer-account authentication.

## Boundaries

- `apps/zapier` owns the Zapier Platform schema, authentication form, triggers, actions, dynamic dropdowns, tests, and CLI packaging.
- `apps/workspace/src/server/domains/partnerApps` owns the public HTTP boundary under `/api/v1/partner/organizations/:organizationId`.
- `apps/workspace/convex/partnerResourceGateway.ts` owns organization-scoped reads and audited writes.
- `packages/partner-auth-core` owns the shared resource/action vocabulary.

## Security

- Zapier uses Qentrah organization API keys with explicit per-resource actions.
- Keys are accepted only through the Bearer authorization header.
- Every request validates the route organization against the key organization and reserves quota before reading or writing.
- Record IDs are checked against the authenticated organization before updates.
- Task, client, and document writes produce organization audit events.
- Production base URLs must use HTTPS; HTTP is accepted only for localhost development.

## Zapier behavior

- Task, client, and document triggers poll indexed Qentrah collections and return stable record IDs for Zapier deduplication.
- Project, task, client, and document selectors use dynamic dropdowns instead of raw identifier fields.
- Create/update actions call the same Hono-to-Convex partner gateway used by organization API keys.
- Empty values remain predictable through the explicit `cleanInputData: false` app flag.

## Verification

- `npm run build --prefix apps/zapier`
- `npm test --prefix apps/zapier`
- `zapier-platform validate` from `apps/zapier`
- Workspace TypeScript and focused gateway tests
