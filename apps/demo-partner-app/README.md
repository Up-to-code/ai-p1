# Anan Demo Partner App

The Demo Partner App is a deployable Next.js reference implementation for
external partners integrating with Anan Workspace OAuth and resource APIs.

It demonstrates:

- a public setup-token gate for demo deployments
- `Authorize with Anan`
- OAuth 2.1 authorization code flow with PKCE
- server-side authorization code exchange
- encrypted HttpOnly cookie session storage for demo use
- Workspace resource API calls for organization, clients, and properties
- safe server-side create/update calls through Workspace APIs

Production partner apps should store OAuth tokens in a durable server-side token
vault or database with rotation and audit logging. This demo uses encrypted
cookies so it can run without an extra database.

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

Open the app, unlock with `DEMO_ACCESS_TOKEN`, then click `Authorize with Anan`.

## Important Routes And Files

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Entry page and unlock redirect |
| `app/unlock/page.tsx` | Demo setup-token form |
| `app/dashboard/page.tsx` | Authorized demo dashboard |
| `app/api/unlock/route.ts` | Demo unlock route |
| `app/api/auth/anan/start/route.ts` | Starts OAuth with state and PKCE |
| `app/api/auth/anan/callback/route.ts` | Exchanges authorization code server-side |
| `app/api/anan/me/route.ts` | Organization/account resource call |
| `app/api/anan/clients/route.ts` | Client list/create proxy |
| `app/api/anan/clients/[clientId]/route.ts` | Client update proxy |
| `app/api/anan/properties/route.ts` | Property list proxy |
| `lib/oauth.ts` | OAuth, PKCE, state, and token helpers |
| `lib/workspace-api.ts` | Workspace resource API client |
| `lib/config.ts` | Environment loading |

## Environment

Create `.env.local` locally and set matching production values in Vercel:

```bash
ANAN_WORKSPACE_API_URL=http://localhost:3000
ANAN_CLIENT_ID=partners_client_local
ANAN_CLIENT_SECRET=
PARTNER_APP_URL=http://localhost:3004
DEMO_ACCESS_TOKEN=local-demo-access
SESSION_SECRET=replace-with-a-local-random-value
```

`ANAN_CLIENT_SECRET` is optional for public PKCE clients. Leave it empty when
testing a public client.

See:

- [Environment variables](../../docs/ENVIRONMENT.md)
- [Setup and configuration](../../SETUP_AND_CONFIGURATION.md)
- [Partner implementation guide](../../docs/partner-platform/partner-implementation-guide.md)

## Partners Registration

Use these values when creating the app in Anan Partners:

- Partner app URL: `${PARTNER_APP_URL}`
- Redirect URI: `${PARTNER_APP_URL}/api/auth/anan/callback`
- CTA copy: `Authorize with Anan`
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

After review approval, copy the issued OAuth client ID into `ANAN_CLIENT_ID`.

## Vercel Deployment

1. Create a Vercel project with root directory `apps/demo-partner-app`.
2. Add the environment variables above.
3. Set `PARTNER_APP_URL` to the deployed production URL.
4. Add `${PARTNER_APP_URL}/api/auth/anan/callback` to the Partners app redirect
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
npm --workspace @anan/demo-partner-app run typecheck
npm --workspace @anan/demo-partner-app test
```
