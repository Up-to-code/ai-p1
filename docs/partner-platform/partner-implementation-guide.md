# Partner Implementation Guide

This guide is for external developers building an Qentrah partner app.

The short version:

1. Register your app in Qentrah Partners.
2. Put an `Authorize with Qentrah` button in your product.
3. Start OAuth 2.1 authorization code with PKCE.
4. Exchange the callback code on your backend.
5. Store tokens on your backend.
6. Call Workspace Hono APIs with `Authorization: Bearer <access_token>`.

Do not call Convex directly from a partner app.

## Registration Values

Use these fields in Partners:

| Field | Example |
| --- | --- |
| App name | `PDF Creator` |
| Publisher | `Your Company` |
| Partner app URL | `https://pdf.example.com` |
| Redirect URI | `https://pdf.example.com/api/auth/qentrah/callback` |
| Client type | Public PKCE app |
| CTA copy | `Authorize with Qentrah` |
| Authorization lifetime | 14 days |

Recommended scopes for a read-only PDF generator:

```txt
organization:read
client:read
property:read
offline_access
```

Recommended scopes for the demo safe-write app:

```txt
organization:read
client:read
property:read
client:create
client:update
offline_access
```

Delete scopes are not normal self-serve v1 scopes.

## Environment Variables

```bash
QENTRAH_WORKSPACE_API_URL=https://workspace.example.com
QENTRAH_CLIENT_ID=partners_client_...
QENTRAH_CLIENT_SECRET=
PARTNER_APP_URL=https://pdf.example.com
SESSION_SECRET=replace-with-32-plus-characters
```

Use `QENTRAH_CLIENT_SECRET` only for confidential server apps. Browser-started public PKCE apps should leave it empty.

## OAuth Details

Authorize endpoint:

```txt
GET {QENTRAH_WORKSPACE_API_URL}/oauth/authorize
```

Token endpoint:

```txt
POST {QENTRAH_WORKSPACE_API_URL}/oauth/token
```

Partner API audience:

```txt
{QENTRAH_WORKSPACE_API_URL}/api/v1/partner
```

The `resource` parameter must be sent to both the authorize request and token request. This asks Workspace for a JWT access token that can be verified by partner resource APIs.

## TypeScript Helpers

Copy this into `qentrah-oauth.ts`.

```ts
import { createHash, randomBytes } from "node:crypto";

export type QentrahTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  organization_id?: string;
};

export type QentrahConfig = {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  partnerAppUrl: string;
  redirectPath?: string;
};

export function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("Base URL is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function redirectUri(config: QentrahConfig) {
  return `${normalizeBaseUrl(config.partnerAppUrl)}${config.redirectPath ?? "/api/auth/qentrah/callback"}`;
}

export function partnerResourceAudience(workspaceBaseUrl: string) {
  return `${normalizeBaseUrl(workspaceBaseUrl)}/api/v1/partner`;
}

export function createPkceVerifier() {
  return randomBytes(48).toString("base64url");
}

export function createPkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildAuthorizeUrl(input: {
  workspaceBaseUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge: string;
}) {
  const workspaceBaseUrl = normalizeBaseUrl(input.workspaceBaseUrl);
  const url = new URL("/oauth/authorize", workspaceBaseUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", input.scopes.join(" "));
  url.searchParams.set("resource", partnerResourceAudience(workspaceBaseUrl));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeAuthorizationCode(input: {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
  fetcher?: typeof fetch;
}) {
  const workspaceBaseUrl = normalizeBaseUrl(input.workspaceBaseUrl);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    code: input.code,
    code_verifier: input.codeVerifier,
    resource: partnerResourceAudience(workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);

  const response = await (input.fetcher ?? fetch)(new URL("/oauth/token", workspaceBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = await response.json().catch(() => null) as QentrahTokenResponse | { error?: string; error_description?: string } | null;
  if (!response.ok || !payload || !("access_token" in payload)) {
    const message = payload && "error_description" in payload && payload.error_description
      ? payload.error_description
      : payload && "error" in payload && payload.error
        ? payload.error
        : "Qentrah token exchange failed.";
    throw new Error(message);
  }

  return payload;
}

export async function refreshAccessToken(input: {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
  fetcher?: typeof fetch;
}) {
  const workspaceBaseUrl = normalizeBaseUrl(input.workspaceBaseUrl);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: input.clientId,
    refresh_token: input.refreshToken,
    resource: partnerResourceAudience(workspaceBaseUrl),
  });
  if (input.clientSecret) body.set("client_secret", input.clientSecret);

  const response = await (input.fetcher ?? fetch)(new URL("/oauth/token", workspaceBaseUrl), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = await response.json().catch(() => null) as QentrahTokenResponse | { error?: string; error_description?: string } | null;
  if (!response.ok || !payload || !("access_token" in payload)) {
    throw new Error(payload && "error_description" in payload ? payload.error_description : "Qentrah token refresh failed.");
  }
  return payload;
}
```

## JavaScript Helpers

Copy this into `qentrah-oauth.js` for plain Node.js.

```js
import { createHash, randomBytes } from "node:crypto";

export function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/+$/u, "");
  if (!trimmed) throw new Error("Base URL is required.");
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function partnerResourceAudience(workspaceBaseUrl) {
  return `${normalizeBaseUrl(workspaceBaseUrl)}/api/v1/partner`;
}

export function createPkceVerifier() {
  return randomBytes(48).toString("base64url");
}

export function createPkceChallenge(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildAuthorizeUrl({ workspaceBaseUrl, clientId, redirectUri, scopes, state, codeChallenge }) {
  const workspace = normalizeBaseUrl(workspaceBaseUrl);
  const url = new URL("/oauth/authorize", workspace);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("resource", partnerResourceAudience(workspace));
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeAuthorizationCode({ workspaceBaseUrl, clientId, clientSecret, redirectUri, code, codeVerifier }) {
  const workspace = normalizeBaseUrl(workspaceBaseUrl);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
    resource: partnerResourceAudience(workspace),
  });
  if (clientSecret) body.set("client_secret", clientSecret);

  const response = await fetch(new URL("/oauth/token", workspace), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.error || "Qentrah token exchange failed.");
  }
  return payload;
}
```

## Next.js App Router Example

Frontend button:

```tsx
export function AuthorizeWithQentrahButton() {
  return (
    <a href="/api/auth/qentrah/start">
      Authorize with Qentrah
    </a>
  );
}
```

Start route at `app/api/auth/qentrah/start/route.ts`:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  createPkceChallenge,
  createPkceVerifier,
} from "@/lib/qentrah-oauth";

const scopes = [
  "organization:read",
  "client:read",
  "property:read",
  "offline_access",
];

export async function GET() {
  const state = crypto.randomUUID();
  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);
  const cookieStore = await cookies();

  cookieStore.set("qentrah_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  cookieStore.set("qentrah_pkce_verifier", verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const redirectUri = `${process.env.PARTNER_APP_URL}/api/auth/qentrah/callback`;
  const url = buildAuthorizeUrl({
    workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
    clientId: process.env.QENTRAH_CLIENT_ID!,
    redirectUri,
    scopes,
    state,
    codeChallenge: challenge,
  });

  return NextResponse.redirect(url);
}
```

Callback route at `app/api/auth/qentrah/callback/route.ts`:

```ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/lib/qentrah-oauth";
import { saveQentrahTokens } from "@/lib/token-store";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();

  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
  if (!state || state !== cookieStore.get("qentrah_oauth_state")?.value) {
    return NextResponse.json({ error: "state_mismatch" }, { status: 400 });
  }

  const redirectUri = `${process.env.PARTNER_APP_URL}/api/auth/qentrah/callback`;
  const tokens = await exchangeAuthorizationCode({
    workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
    clientId: process.env.QENTRAH_CLIENT_ID!,
    clientSecret: process.env.QENTRAH_CLIENT_SECRET || undefined,
    redirectUri,
    code,
    codeVerifier: cookieStore.get("qentrah_pkce_verifier")?.value ?? "",
  });

  if (!tokens.organization_id) {
    return NextResponse.json({ error: "missing_organization_id" }, { status: 400 });
  }

  await saveQentrahTokens({
    organizationId: tokens.organization_id,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    scope: tokens.scope,
  });

  cookieStore.delete("qentrah_oauth_state");
  cookieStore.delete("qentrah_pkce_verifier");
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

`saveQentrahTokens` should write to your backend database or token vault. The standalone demo app uses encrypted HttpOnly cookies only to keep the example deployable without a database.

## Calling Workspace APIs

Copy this into `qentrah-workspace-api.ts`.

```ts
export class QentrahApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function parseQentrahError(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
  return new QentrahApiError(payload?.message ?? payload?.error ?? "Qentrah API error", payload?.error ?? "workspace_api_error", response.status);
}

export async function qentrahFetch<T>(input: {
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
  path: string;
  init?: RequestInit;
}) {
  const workspace = input.workspaceBaseUrl.replace(/\/+$/u, "");
  const response = await fetch(`${workspace}/api/v1/partner/organizations/${encodeURIComponent(input.organizationId)}${input.path}`, {
    ...input.init,
    headers: {
      authorization: `Bearer ${input.accessToken}`,
      "content-type": "application/json",
      ...input.init?.headers,
    },
  });
  if (!response.ok) throw await parseQentrahError(response);
  return response.json() as Promise<T>;
}

export function getOrganization(input: { workspaceBaseUrl: string; organizationId: string; accessToken: string }) {
  return qentrahFetch({
    ...input,
    path: "/me",
  });
}

export function listClients(input: { workspaceBaseUrl: string; organizationId: string; accessToken: string }) {
  return qentrahFetch({
    ...input,
    path: "/clients",
  });
}

export function listProperties(input: { workspaceBaseUrl: string; organizationId: string; accessToken: string }) {
  return qentrahFetch({
    ...input,
    path: "/properties",
  });
}

export function createClient(input: {
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
  client: { name: string; contact?: string; phone?: string; type?: "Buyer" | "Tenant" | "Investor" | "Broker" };
}) {
  return qentrahFetch({
    workspaceBaseUrl: input.workspaceBaseUrl,
    organizationId: input.organizationId,
    accessToken: input.accessToken,
    path: "/clients",
    init: {
      method: "POST",
      body: JSON.stringify(input.client),
    },
  });
}

export function updateClient(input: {
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
  clientId: string;
  patch: { name?: string; contact?: string; phone?: string; status?: "active" | "inactive" };
}) {
  return qentrahFetch({
    workspaceBaseUrl: input.workspaceBaseUrl,
    organizationId: input.organizationId,
    accessToken: input.accessToken,
    path: `/clients/${encodeURIComponent(input.clientId)}`,
    init: {
      method: "PATCH",
      body: JSON.stringify(input.patch),
    },
  });
}
```

## Node.js Express Example

```js
import express from "express";
import cookieParser from "cookie-parser";
import {
  buildAuthorizeUrl,
  createPkceChallenge,
  createPkceVerifier,
  exchangeAuthorizationCode,
} from "./qentrah-oauth.js";

const app = express();
app.use(cookieParser());

const scopes = ["organization:read", "client:read", "property:read", "offline_access"];

app.get("/auth/qentrah/start", (req, res) => {
  const state = crypto.randomUUID();
  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);

  res.cookie("qentrah_oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 10 * 60 * 1000 });
  res.cookie("qentrah_pkce_verifier", verifier, { httpOnly: true, sameSite: "lax", maxAge: 10 * 60 * 1000 });

  res.redirect(buildAuthorizeUrl({
    workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL,
    clientId: process.env.QENTRAH_CLIENT_ID,
    redirectUri: `${process.env.PARTNER_APP_URL}/auth/qentrah/callback`,
    scopes,
    state,
    codeChallenge: challenge,
  }));
});

app.get("/auth/qentrah/callback", async (req, res, next) => {
  try {
    if (!req.query.code) return res.status(400).json({ error: "missing_code" });
    if (req.query.state !== req.cookies.qentrah_oauth_state) {
      return res.status(400).json({ error: "state_mismatch" });
    }

    const tokens = await exchangeAuthorizationCode({
      workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL,
      clientId: process.env.QENTRAH_CLIENT_ID,
      clientSecret: process.env.QENTRAH_CLIENT_SECRET || undefined,
      redirectUri: `${process.env.PARTNER_APP_URL}/auth/qentrah/callback`,
      code: String(req.query.code),
      codeVerifier: req.cookies.qentrah_pkce_verifier,
    });

    // Store this in your database, keyed by tokens.organization_id.
    console.log("Authorized Qentrah organization", tokens.organization_id);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

app.listen(3000);
```

## PDF Generator Example

For a PDF generator, request only read scopes:

```txt
organization:read client:read property:read offline_access
```

Backend flow:

1. User clicks `Authorize with Qentrah`.
2. You store tokens keyed by `organization_id`.
3. User opens your PDF generator.
4. Your backend calls:
   - `GET /api/v1/partner/organizations/:organizationId/me`
   - `GET /api/v1/partner/organizations/:organizationId/clients`
   - `GET /api/v1/partner/organizations/:organizationId/properties`
5. Your backend renders the PDF.

Example:

```ts
import { getOrganization, listClients, listProperties } from "./qentrah-workspace-api";

export async function buildProfilePdfData(input: {
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
}) {
  const [organization, clients, properties] = await Promise.all([
    getOrganization(input),
    listClients(input),
    listProperties(input),
  ]);

  return {
    organization,
    clients,
    properties,
    generatedAt: new Date().toISOString(),
  };
}
```

## Error Handling

Handle these errors directly in your product:

| Error | Recommended partner response |
| --- | --- |
| `connection_expired` | Show `Reconnect with Qentrah`. Start OAuth again. |
| `connection_not_found` | Show `Authorize with Qentrah`. |
| `scope_denied` | Explain the missing feature permission and ask the user to reconnect after you update app scopes. |
| `app_not_approved` | Hide the integration and contact Qentrah review/admin. |
| `missing_bearer` | Fix backend token loading; do not send tokens from the browser. |

Never place access tokens in browser JavaScript, query params, logs, or local storage.

## Security Checklist

- Store `state` and PKCE verifier in HttpOnly cookies or a backend session.
- Validate `state` before token exchange.
- Exchange `code` only on your backend.
- Store tokens encrypted at rest.
- Key token records by `organization_id`.
- Refresh tokens before access-token expiry when using `offline_access`.
- Delete tokens when a workspace disconnects your app.
- Treat all Workspace API failures as authorization-sensitive and avoid logging token values.

## Existing Examples

- Standalone deployable demo: `apps/demo-partner-app`
- Minimal helper examples: `apps/partners/examples/auth`
