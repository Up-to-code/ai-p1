# Qentrah Demo Partner App

The Demo Partner App is a deployable Next.js reference implementation for
external partners integrating with Qentrah Workspace WorkOS partner keys and
resource APIs.

It demonstrates:

- a public setup-token gate for demo deployments
- `Authorize with Qentrah`
- Workspace organization grant handoff
- server-side storage for a Workspace-issued WorkOS partner API key
- encrypted HttpOnly cookie session storage for demo use
- Workspace resource API calls for organization, clients, and properties
- safe server-side create/update calls through Workspace APIs

Production partner apps should store WorkOS partner API keys in a durable
server-side vault or database with rotation and audit logging. This demo uses
encrypted cookies so it can run without an extra database.

## Local Development

From the repository root:

```bash
npm run dev:demo
```

From this app folder:

```bash
npm run dev
```

Default local URL: `http://localhost:3004`.

Open the app, unlock with `DEMO_ACCESS_TOKEN`, then click `Authorize with Qentrah`.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Entry page and unlock redirect |
| `app/unlock/page.tsx` | Demo setup-token form |
| `app/dashboard/page.tsx` | Authorized demo dashboard |
| `app/api/unlock/route.ts` | Demo unlock route |
| `app/api/auth/qentrah/start/route.ts` | Sends the user to Workspace integrations |
| `app/api/auth/qentrah/callback/route.ts` | Stores the WorkOS partner key issued by Workspace |
| `app/api/qentrah/me/route.ts` | Organization/account resource call |
| `app/api/qentrah/clients/route.ts` | Client list/create proxy |
| `app/api/qentrah/clients/[clientId]/route.ts` | Client update proxy |
| `app/api/qentrah/properties/route.ts` | Property list proxy |
| `lib/partner-key-auth.ts` | WorkOS partner key callback helpers |
| `lib/workspace-api.ts` | Workspace resource API client |
| `lib/config.ts` | Environment loading |

## Environment

Create `.env.local` locally and set matching production values in Vercel:

```bash
QENTRAH_WORKSPACE_API_URL=http://localhost:3000
QENTRAH_CLIENT_ID=partners_client_local
QENTRAH_CLIENT_SECRET=
PARTNER_APP_URL=http://localhost:3004
DEMO_ACCESS_TOKEN=local-demo-access
SESSION_SECRET=replace-with-a-local-random-value
```

`QENTRAH_CLIENT_SECRET` is no longer required by this demo. Keep it unset unless
you are testing a legacy client registration.

See:

- [Environment variables](../../docs/operations/environment.md)
- [Setup and configuration](../../docs/operations/setup-and-configuration.md)
- [Partner implementation guide](../../docs/partner-platform/partner-implementation-guide.md)

## Partners Registration

Use these values when creating the app in Qentrah Partners:

- Partner app URL: `${PARTNER_APP_URL}`
- Redirect URI: `${PARTNER_APP_URL}/api/auth/qentrah/callback`
- CTA copy: `Authorize with Qentrah`
- Requested scopes commonly used by the demo:
  - `calendar:read`
  - `client:create`
  - `client:read`
  - `client:update`
  - `media:read`
  - `organization:read`
  - `project:read`
  - `property:read`
  - `task:read`

After review approval, copy the issued partner client ID into
`QENTRAH_CLIENT_ID`.

## Vercel Deployment

1. Create a Vercel project with root directory `apps/demo-partner-app`.
2. Add the environment variables above.
3. Set `PARTNER_APP_URL` to the deployed production URL.
4. Add `${PARTNER_APP_URL}/api/auth/qentrah/callback` to the Partners app redirect
   URIs.
5. Submit the Partners app for review and approve it through Admin Review.
6. Visit the deployed URL, unlock the demo, and authorize a Workspace
   organization.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm test
```

From the repository root:

```bash
npm --workspace @qentrah/demo-partner-app run typecheck
npm --workspace @qentrah/demo-partner-app test
```
