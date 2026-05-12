# Anan Standalone Partner Auth Demo

This is a deployable Next.js partner app that demonstrates organization-level OAuth with Anan.

It shows:

- A custom setup-token gate for public demo URLs.
- `Authorize with Anan` OAuth 2.1 authorization code + PKCE.
- Backend token exchange and encrypted HttpOnly token cookie storage.
- Hub Hono API reads for organization, clients, and properties.
- Safe client create/update calls through Hub Hono APIs.

The OAuth request sends `resource=${ANAN_HUB_API_URL}/api/v1/partner` so Hub returns a JWT access token that the partner resource APIs can verify.

## Environment

Create `.env.local` locally and set the same values in Vercel:

```bash
ANAN_HUB_API_URL=http://localhost:3000
ANAN_CLIENT_ID=partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f
ANAN_CLIENT_SECRET=
PARTNER_APP_URL=http://localhost:3004
DEMO_ACCESS_TOKEN=demo-token
SESSION_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

`ANAN_CLIENT_SECRET` is optional. Leave it empty for public PKCE apps.

## Partners Registration

Use these values when creating the app in Anan Partners:

- Partner app URL: `${PARTNER_APP_URL}`
- Redirect URI: `${PARTNER_APP_URL}/api/auth/anan/callback`
- Local client ID: `partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f`
- CTA copy on your page: `Authorize with Anan`
- Requested scopes:
  - `calendar:read`
  - `client:create`
  - `client:read`
  - `client:update`
  - `media:read`
  - `organization:read`
  - `project:read`
  - `property:read`
  - `task:read`

After admin approval, copy the OAuth client id into `ANAN_CLIENT_ID`.

## Local Development

```bash
npm run dev
```

Open `http://localhost:3004`, unlock with `DEMO_ACCESS_TOKEN`, then click `Authorize with Anan`.

## Vercel

1. Create a new Vercel project using this folder as the project root.
2. Add all environment variables above.
3. Set `PARTNER_APP_URL` to the Vercel production URL.
4. Add `${PARTNER_APP_URL}/api/auth/anan/callback` to the Partners app redirect URIs.
5. Submit the Partners app for review and approve it in Admin.
6. Visit the Vercel URL, unlock with `DEMO_ACCESS_TOKEN`, and authorize a workspace.

## Production Note

This example stores OAuth tokens in an encrypted HttpOnly cookie to avoid requiring a database. A production partner app should store organization tokens in a durable backend token vault or database, keyed by organization id, with rotation and audit logging.

## Scripts

```bash
npm run typecheck
npm test
npm run build
```
