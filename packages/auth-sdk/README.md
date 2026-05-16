# @qentrah/auth-sdk

Public Qentrah partner SDK for connecting a partner app to a customer's Qentrah workspace.

This package contains browser authorization helpers, OAuth route helpers, webhook verification, and partner API helpers.

## What's New In 0.2.0

- Adds helpers for reading partner OAuth configuration from environment variables.
- Documents the current partner app setup flow.
- Updates examples to use the latest partner scope names.
- Keeps OAuth, token storage, and webhook handling server-side.
- Publishes only the partner-facing SDK entrypoints.

## What This SDK Does

The SDK gives partners a small integration surface:

- Mount an "Authorize with Qentrah" button in browser code.
- Start OAuth from your app route.
- Generate and validate PKCE and state.
- Exchange authorization codes on the server only.
- Save access and refresh tokens through your own storage callback.
- Refresh access tokens when needed.
- Verify Qentrah webhooks with HMAC SHA-256.
- Dispatch typed webhook events like `client.created`, `client.updated`, and `client.deleted`.
- Call partner/service-app APIs with typed read, write, and webhook-send helpers.

## Partner App Setup

Create your app in the Qentrah Partners portal, then configure your integration with:

- the issued OAuth client id
- the exact redirect URI used by your app
- the approved scopes
- the workspace base URL

Use this SDK for OAuth, webhook verification, token refresh, and partner API calls.

## Security Model

Keep sensitive material out of browser JavaScript.

- Browser code only redirects users to your app start route.
- Authorization code exchange happens on the server.
- Access tokens, refresh tokens, authorization codes, client secrets, and webhook signing secrets must stay server-side.
- OAuth uses authorization code + PKCE.
- Callback `state` is validated against your stored pending authorization.
- Token exchange sends `resource=${workspaceBaseUrl}/api/v1/partner`.
- Webhook signatures must be verified against the raw request body before parsing JSON.

## Exports

```ts
import {
  buildQentrahPartnerAuthorizeUrl,
  qentrahPartnerAuthorityFromEnv,
  exchangeQentrahPartnerAuthorizationCode,
  refreshQentrahPartnerAccessToken,
} from "@qentrah/auth-sdk/partner";

import { mountQentrahAuthorizeButton } from "@qentrah/auth-sdk/partner/browser";
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";
import { createQentrahWebhookHandler, verifyQentrahWebhook } from "@qentrah/auth-sdk/partner/webhooks";
import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";
```

Browser script bundle:

```html
<script src="/qentrah-auth.js"></script>
```

The bundle exposes:

```js
window.QentrahAuth.mountAuthorizeButton(...)
```

If you use a bundler, import from `@qentrah/auth-sdk/partner/browser` instead.

## Quick Start

Add a button to your app:

```html
<button id="qentrah-authorize">Authorize with Qentrah</button>
```

Mount the button:

```js
import { mountQentrahAuthorizeButton } from "@qentrah/auth-sdk/partner/browser";

mountQentrahAuthorizeButton({
  buttonId: "qentrah-authorize",
});
```

By default, clicking the button sends the browser to:

```txt
/api/qentrah/oauth/start
```

You can customize the route and label:

```js
mountQentrahAuthorizeButton({
  buttonId: "qentrah-authorize",
  startUrl: "/api/qentrah/oauth/start",
  label: "Connect Qentrah",
  disabledLabel: "Opening...",
  onError(error) {
    console.error(error);
  },
});
```

## Plain JavaScript Script Usage

Copy `qentrah-auth.js` from the package into your public assets during your build, then use:

```html
<button id="qentrah-authorize">Authorize with Qentrah</button>
<script src="/qentrah-auth.js"></script>
<script>
  window.QentrahAuth.mountAuthorizeButton({
    buttonId: "qentrah-authorize",
    startUrl: "/api/qentrah/oauth/start",
    label: "Authorize with Qentrah",
  });
</script>
```

## Next.js OAuth Routes

Create two route handlers:

```txt
app/api/qentrah/oauth/start/route.ts
app/api/qentrah/oauth/callback/route.ts
```

Shared config example:

```ts
// app/api/qentrah/oauth/config.ts
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";

const pendingByState = new Map<string, any>();

export const qentrahAuth = createQentrahPartnerAuthHandlers({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  clientId: process.env.QENTRAH_PARTNER_CLIENT_ID!,
  clientSecret: process.env.QENTRAH_PARTNER_CLIENT_SECRET,
  redirectUri: process.env.QENTRAH_PARTNER_REDIRECT_URI!,
  scopes: ["organization:read", "client:read"],

  sessionStore: {
    async savePendingAuthorization({ pending }) {
      pendingByState.set(pending.state, pending);
    },
    async loadPendingAuthorization({ state }) {
      return pendingByState.get(state) ?? null;
    },
    async clearPendingAuthorization({ state }) {
      pendingByState.delete(state);
    },
  },

  tokenStore: {
    async saveTokens({ organizationId, tokenSet, scopes }) {
      // Save to your secure token store.
      // Never send these tokens to the browser.
      console.log("Connected Qentrah organization", organizationId, scopes, tokenSet.expiresAt);
    },
  },

  afterSuccessRedirect: "/settings/integrations/qentrah?connected=1",
  afterErrorRedirect: "/settings/integrations/qentrah?error=1",
});
```

You can also normalize the public partner authority variables first:

```ts
import { qentrahPartnerAuthorityFromEnv } from "@qentrah/auth-sdk/partner";

const authority = qentrahPartnerAuthorityFromEnv({
  QENTRAH_WORKSPACE_BASE_URL: process.env.QENTRAH_WORKSPACE_BASE_URL,
  QENTRAH_PARTNER_CLIENT_ID: process.env.QENTRAH_PARTNER_CLIENT_ID,
  QENTRAH_PARTNER_REDIRECT_URI: process.env.QENTRAH_PARTNER_REDIRECT_URI,
  QENTRAH_PARTNER_SCOPES: process.env.QENTRAH_PARTNER_SCOPES,
});
```

Start route:

```ts
// app/api/qentrah/oauth/start/route.ts
import { qentrahAuth } from "../config";

export const GET = qentrahAuth.GET.start;
```

Callback route:

```ts
// app/api/qentrah/oauth/callback/route.ts
import { qentrahAuth } from "../config";

export const GET = qentrahAuth.GET.callback;
```

The in-memory `Map` is only for local development and examples. In production, use durable session storage that matches your app security requirements.

## OAuth Config

```ts
type QentrahPartnerAuthConfig = {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  sessionStore: {
    savePendingAuthorization(input): Promise<void> | void;
    loadPendingAuthorization(input): Promise<pending | null> | pending | null;
    clearPendingAuthorization(input): Promise<void> | void;
  };
  tokenStore: {
    saveTokens(input): Promise<void> | void;
  };
  afterSuccessRedirect?: string;
  afterErrorRedirect?: string;
};
```

## Refresh Tokens

Use the refresh helper from server code:

```ts
import { refreshQentrahPartnerAccessToken } from "@qentrah/auth-sdk/partner";

const tokenSet = await refreshQentrahPartnerAccessToken({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  clientId: process.env.QENTRAH_PARTNER_CLIENT_ID!,
  clientSecret: process.env.QENTRAH_PARTNER_CLIENT_SECRET,
  refreshToken: savedRefreshToken,
});
```

Save the returned token set back to your token store.

## Webhook Verification

Qentrah webhooks use these headers:

- `Qentrah-Signature`
- `Qentrah-Timestamp`
- `Qentrah-Event-Id`
- `Qentrah-Event-Type`
- `Qentrah-Delivery-Id`

The signature format is:

```txt
v1=<hex-hmac-sha256>
```

The signed payload is:

```txt
${timestamp}.${rawBody}
```

Next.js route example:

```ts
// app/api/qentrah/webhooks/route.ts
import { createQentrahWebhookHandler } from "@qentrah/auth-sdk/partner/webhooks";

export const runtime = "nodejs";

export const POST = createQentrahWebhookHandler({
  signingSecret: process.env.QENTRAH_WEBHOOK_SIGNING_SECRET!,
  handlers: {
    async "client.created"(event) {
      console.log("Client created", event.data);
    },
    async "client.updated"(event) {
      console.log("Client updated", event.data);
    },
    async "client.deleted"(event) {
      console.log("Client deleted", event.data.id);
    },
  },
  async onUnhandledEvent(event) {
    console.log("Unhandled Qentrah event", event.type);
  },
});
```

Do not call `request.json()` before verification. The SDK needs the raw body from the original `Request`.

## Service-App Client

Use this from server code when your app has a saved access token:

```ts
import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";

const qentrah = createQentrahServiceAppClient({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  accessToken: savedAccessToken,
});

const clients = await qentrah.read({
  organizationId: "org_123",
  resource: "client",
  input: { limit: 25 },
});

const created = await qentrah.write({
  organizationId: "org_123",
  resource: "client",
  action: "create",
  input: {
    name: "Nile Vista Unit 09",
    email: "owner@example.com",
  },
  idempotencyKey: "client-create-123",
});

await qentrah.sendWebhook({
  organizationId: "org_123",
  eventType: "client.created",
  eventId: "evt_123",
  data: created,
  idempotencyKey: "evt_123",
});
```

Current typed write support starts with client create, update, and delete behavior. Other resource names are reserved for partner API expansion.

## Environment Variables

Recommended production variables:

```bash
QENTRAH_WORKSPACE_BASE_URL=https://app.qentrah.com
QENTRAH_PARTNER_CLIENT_ID=partners_client_...
QENTRAH_PARTNER_CLIENT_SECRET=your_client_secret_if_confidential
QENTRAH_PARTNER_REDIRECT_URI=https://your-app.com/api/qentrah/oauth/callback
QENTRAH_PARTNER_SCOPES=organization:read client:read
QENTRAH_WEBHOOK_SIGNING_SECRET=whsec_...
```

For local development:

```bash
QENTRAH_WORKSPACE_BASE_URL=http://localhost:3000
QENTRAH_PARTNER_REDIRECT_URI=http://localhost:4000/api/qentrah/oauth/callback
```

`QENTRAH_PARTNER_CLIENT_ID`, redirect URIs, scopes, and webhook secrets come from the Partners portal.

For Vercel, configure the same variables in Production, Preview, and Development as needed. Webhook routes should use:

```ts
export const runtime = "nodejs";
```

## Error Handling

SDK errors are friendly and stable enough to branch on:

- `CONFIGURATION_ERROR`
- `AUTHORIZATION_DENIED`
- `INVALID_STATE`
- `TOKEN_EXCHANGE_FAILED`
- `ORGANIZATION_AUTHORIZATION_MISSING`
- `MISSING_RAW_BODY`
- `STALE_TIMESTAMP`
- `INVALID_SIGNATURE`
- `UNSUPPORTED_RUNTIME`

```ts
import { isQentrahPartnerAuthError } from "@qentrah/auth-sdk/partner";

try {
  // SDK call
} catch (error) {
  if (isQentrahPartnerAuthError(error)) {
    console.error(error.code, error.message);
  }
}
```

## License

UNLICENSED
