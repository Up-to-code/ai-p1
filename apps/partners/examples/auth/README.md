# Qentrah OAuth Examples

These examples show the partner-side implementation for organization-level OAuth.

The flow is:

1. Generate a PKCE verifier and challenge.
2. Send the workspace admin to Workspace with the `Authorize with Qentrah` flow.
3. Handle the callback on your backend.
4. Exchange the code for tokens.
5. Store tokens securely on your backend.
6. Call Workspace Hono resource APIs with the access token.

Always set `QENTRAH_WORKSPACE_API_URL` to the Qentrah Workspace base URL for the environment, then send `resource=${QENTRAH_WORKSPACE_API_URL}/api/v1/partner` in the authorize URL and token exchange. Workspace partner APIs verify JWT access tokens for that resource audience.

## Files

- `pkce.ts`: PKCE verifier/challenge helpers.
- `oauth-url.ts`: authorization URL builder.
- `token-exchange.ts`: backend token exchange and refresh helpers.
- `workspace-api.ts`: example Workspace Hono resource API client.
- `local-demo-registration.ts`: the current local Qentrah OAuth Demo values from Partners.
- `auth-flow.test.ts`: tests covering URL building, PKCE shape, token exchange, refresh, and API errors.

## Current local demo registration

```txt
App: Qentrah OAuth Demo
Publisher: ZA
Partner URL: http://localhost:3004
Client ID: partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f
Redirect URI: http://localhost:3004/api/auth/qentrah/callback
Scopes: calendar:read client:create client:read client:update media:read organization:read project:read asset:read task:read
```

## Frontend button

```tsx
<a href="/api/auth/qentrah/start">
  Authorize with Qentrah
</a>
```

## Backend start route

```ts
import { buildQentrahAuthorizeUrl } from "./oauth-url";
import { createPkcePair } from "./pkce";
import { localDemoRegistration } from "./local-demo-registration";

export async function GET() {
  const pkce = await createPkcePair();

  // Store pkce.verifier and state in an HttpOnly session before redirecting.
  const url = buildQentrahAuthorizeUrl({
    workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
    clientId: process.env.QENTRAH_CLIENT_ID ?? localDemoRegistration.clientId,
    redirectUri: localDemoRegistration.redirectUri,
    scopes: [...localDemoRegistration.scopes],
    state: crypto.randomUUID(),
    codeChallenge: pkce.challenge,
  });

  return Response.redirect(url);
}
```

## Backend callback route

```ts
import { exchangeAuthorizationCode } from "./token-exchange";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  const tokens = await exchangeAuthorizationCode({
    workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
    clientId: process.env.QENTRAH_CLIENT_ID!,
    redirectUri: `${process.env.PARTNER_APP_URL}/api/auth/qentrah/callback`,
    code,
    codeVerifier: "read-from-http-only-session",
  });

  // Store tokens on the backend, keyed by organization id from the token claims.
  return Response.json({ connected: true, expiresIn: tokens.expires_in });
}
```
