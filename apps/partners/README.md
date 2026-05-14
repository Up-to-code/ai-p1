# Qentrah Partners App

Partners is the developer portal for people building Qentrah partner integrations.
It owns partner developer identity, app drafts, submission flow, review callback
state, partner-facing documentation, and the sandbox OAuth experience.

Workspace remains the source of truth for workspace permissions, consent,
approved OAuth clients, and Workspace-side partner resource APIs. Partners
communicates with Workspace through explicit integration contracts and service
tokens, not through generated Workspace backend imports.

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
- Review callback handling from Workspace.
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
| `app/api/qentrah-review-callback/route.ts` | Workspace review callback endpoint |
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
- `QENTRAH_PLATFORM_SERVICE_TOKEN`
- `QENTRAH_WORKSPACE_SERVICE_TOKEN`
- `PARTNERS_REVIEW_CALLBACK_TOKEN`
- `QENTRAH_WORKSPACE_API_URL`

See:

- [Environment variables](../../docs/ENVIRONMENT.md)
- [Setup and configuration](../../SETUP_AND_CONFIGURATION.md)

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
3. Partners submits the app to Workspace using `QENTRAH_PLATFORM_SERVICE_TOKEN`.
4. Admin Review approves, rejects, or suspends the app through Workspace.
5. Workspace calls `app/api/qentrah-review-callback/route.ts`.
6. Partners updates portal status and exposes the approved client information.

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
- [Architecture](../../docs/ARCHITECTURE.md)
- [Apps and packages](../../docs/APPS.md)
- [Partner platform flow](../../docs/partner-platform/README.md)
- [Partner implementation guide](../../docs/partner-platform/partner-implementation-guide.md)
- [AI agent implementation prompt](./content/docs/ai-agent-implementation.mdx)
