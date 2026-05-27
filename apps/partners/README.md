# Qentrah Partners App

Partners is the developer portal for people building Qentrah partner integrations.
It owns partner developer identity, app drafts, submission flow, review state,
published app catalog, partner-facing documentation, and the sandbox OAuth
experience.

Partners is the source of truth for partner apps, redirect URIs, scopes, review
status, and published catalog data. Workspace remains the source of truth for
workspace permissions, organization consent, organization partner
authorizations, and Workspace-side partner resource APIs.

## Local Development

From the repository root:

```bash
npm run dev:partners
```

From this app folder:

```bash
npm run dev
```

Default local URL: `http://localhost:3002`. The local dev script selects the
next available port if `3002` is busy.

## Responsibilities

- Partner developer sign-up and sign-in.
- Developer account and programmer organization profile.
- App draft creation, editing, scopes, redirect URIs, and submission.
- Admin review APIs and platform APIs used by Workspace.
- Partner docs powered by MDX/Fumadocs.
- Sandbox OAuth endpoints for docs and local exploration.
- Partner integration contracts under `lib/qentrah-integration`.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `app/(marketing)` | Public Partners landing, pricing, security, policies, and support |
| `app/(auth)` | Partner sign-in and sign-up |
| `app/(portal)/dashboard` | Authenticated portal shell, account, apps, status |
| `app/docs/[[...slug]]/page.tsx` | Partner docs route |
| `app/api/admin/partner-apps` | Admin Review service API for app review |
| `app/api/platform/published-apps` | Workspace service API for published app catalog |
| `app/api/platform/verify-authorization` | Workspace service API for authorization verification |
| `app/api/partner-signup/route.ts` | Protected sign-up bridge |
| `app/api/partner-signin/route.ts` | Protected sign-in bridge |
| `app/sandbox/oauth` | Sandbox OAuth authorize/token endpoints |
| `content/docs` | Partner-facing MDX docs |
| `components/docs` | MDX docs components |
| `prisma/schema.prisma` | Partners-owned Postgres schema |
| `server` | Prisma repositories and integration boundary |
| `lib/qentrah-integration` | Workspace integration contracts |

## Environment

Partners uses Postgres through Prisma. Configure `DATABASE_URL` for local and
production persistence.

Common variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `PARTNER_SIGNUP_BRIDGE_SECRET`
- `PARTNERS_PLATFORM_SERVICE_TOKEN`
- `PARTNERS_ADMIN_SERVICE_TOKEN`
- `QENTRAH_WORKSPACE_SERVICE_TOKEN`
- `QENTRAH_WORKSPACE_API_URL`

See:

- [Environment variables](../../docs/operations/environment.md)
- [Setup and configuration](../../docs/operations/setup-and-configuration.md)

## Docs System

Partner-facing docs live in `content/docs` and render through the app docs
route. MDX components must be registered in `components/docs/mdx.tsx`.

Useful docs files:

- `content/docs/index.mdx`
- `content/docs/quickstart.mdx`
- `content/docs/register-an-app.mdx`
- `content/docs/oauth-flow.mdx`
- `content/docs/api-usage.mdx`
- `content/docs/ai-agent-implementation.mdx`

Run a build after changing partner MDX or docs components:

```bash
npm --workspace @qentrah/partners run build
```

## App Registration Flow

1. Partner developer signs up in Partners.
2. Developer creates an app draft with redirect URIs and requested scopes.
3. Admin Review reads pending submissions from Partners.
4. Admin Review approves, rejects, or suspends the app through Partners.
5. Partners publishes approved OAuth runtime metadata to Workspace.
6. Workspace fetches published catalog data from Partners and stores only organization authorization records.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm test
npm run prisma:generate
npm run prisma:migrate
```

From the repository root:

```bash
npm --workspace @qentrah/partners run typecheck
npm --workspace @qentrah/partners test
npm --workspace @qentrah/partners run build
```

## Related Documentation

- [Root README](../../README.md)
- [Architecture](../../docs/architecture/system-architecture.md)
- [Apps and packages](../../docs/architecture/apps-and-packages.md)
- [Partner platform flow](../../docs/partner-platform/README.md)
- [Partner implementation guide](../../docs/partner-platform/partner-implementation-guide.md)
- [AI agent implementation prompt](./content/docs/ai-agent-implementation.mdx)
