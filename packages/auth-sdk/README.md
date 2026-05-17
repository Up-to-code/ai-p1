# @qentrah/auth-sdk

Developer integration helpers for building a Qentrah partner integration.

Use this package to add OAuth connection, token refresh, webhook verification, partner resource calls, and a reusable developer console model to your own app. The SDK is intentionally headless and batteries-included: it handles the repeated integration work, while your product keeps control of storage, routes, permissions, UI, and business logic.

This NPM package is published for developers who are building Qentrah integrations. It is not an open-source release of the Qentrah platform or a disclosure of private platform internals.

## What's New In 0.3.1

- Adds a headless partner integration harness for sections, scopes, lifecycle metadata, safe results, and UI-ready rows.
- Expands the service-app client with read/search/filter helpers for organization, clients, properties, projects, tasks, calendar, media, and webhooks.
- Adds client create, update, and delete helpers.
- Adds safe credential and operation-result shaping so apps can render useful status without exposing tokens or secrets.
- Keeps all sensitive OAuth, webhook, and resource calls server-side.
- Clarifies that the package is a developer SDK, not an open-source publication of Qentrah platform implementation.

## Install

```bash
npm install @qentrah/auth-sdk
```

## What The SDK Helps With

- Browser connect buttons that start OAuth through your own backend route.
- Authorization code + PKCE URL generation, state validation, and token exchange.
- Token refresh from server code.
- Webhook signature verification and event dispatch.
- Server-side resource calls with search, filters, pagination limits, and client CRUD helpers.
- Section metadata for integration consoles: Overview, OAuth Flow, Credentials, Organization, Clients, Properties, Projects, Tasks, Calendar, Media, Webhooks, and Test Results.
- Sanitized render data for credentials, request summaries, response summaries, errors, and operation results.

The package works well with Next.js, Express, Fastify, serverless functions, WordPress plugins with server endpoints, or any app that can keep OAuth tokens and secrets on the server.

Think of it as a compact integration kit for your app: connect, store safely, call resources, render developer status, test CRUD paths, and keep sensitive data out of the UI.

## Distribution Notice

This package is public on NPM so integration developers can install and use it. Public availability does not make the Qentrah platform implementation open source. The package exposes only the partner-facing SDK surface needed to build integrations.

## Security Rules

Keep sensitive values out of browser code, public logs, screenshots, client bundles, docs, and version control.

- Browser code should only redirect to your backend start route.
- Exchange authorization codes on the server.
- Store access tokens, refresh tokens, client secrets, webhook signing secrets, and authorization codes in your own secure server storage.
- Verify webhook signatures before trusting event data.
- Render only sanitized credential and result snapshots in admin UI.
- Use placeholders in examples, docs, and tests.

## Exports

```ts
import {
  buildQentrahPartnerAuthorizeUrl,
  exchangeQentrahPartnerAuthorizationCode,
  refreshQentrahPartnerAccessToken,
  qentrahPartnerAuthorityFromEnv,
} from "@qentrah/auth-sdk/partner";

import { mountQentrahAuthorizeButton } from "@qentrah/auth-sdk/partner/browser";
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";
import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";
import { createQentrahWebhookHandler, verifyQentrahWebhook } from "@qentrah/auth-sdk/partner/webhooks";
import {
  createQentrahPartnerConsoleService,
  qentrahPartnerSections,
  sanitizeQentrahPartnerPayload,
} from "@qentrah/auth-sdk/partner/harness";
```

The browser bundle is also available as:

```html
<script src="/qentrah-auth.js"></script>
```

It exposes:

```js
window.QentrahAuth.mountAuthorizeButton(...)
```

## Browser Connect Button

```html
<button id="qentrah-authorize">Authorize with Qentrah</button>
```

```ts
import { mountQentrahAuthorizeButton } from "@qentrah/auth-sdk/partner/browser";

mountQentrahAuthorizeButton({
  buttonId: "qentrah-authorize",
  startUrl: "/api/qentrah/oauth/start",
  label: "Authorize with Qentrah",
  disabledLabel: "Opening...",
  onError(error) {
    reportConnectionError(error);
  },
});
```

The button should point at a backend route in your app. It should not receive tokens or secrets.

## OAuth Routes

The Next.js helper is optional. Use it if your app uses Next route handlers.

```ts
// app/api/qentrah/oauth/config.ts
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";

export const qentrahAuth = createQentrahPartnerAuthHandlers({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  clientId: process.env.QENTRAH_PARTNER_CLIENT_ID!,
  clientSecret: process.env.QENTRAH_PARTNER_CLIENT_SECRET,
  redirectUri: process.env.QENTRAH_PARTNER_REDIRECT_URI!,
  scopes: ["organization:read", "client:read"],

  sessionStore: {
    async savePendingAuthorization({ pending, request }) {
      await savePendingOAuthState(request, pending);
    },
    async loadPendingAuthorization({ state, request }) {
      return loadPendingOAuthState(request, state);
    },
    async clearPendingAuthorization({ state, request }) {
      await clearPendingOAuthState(request, state);
    },
  },

  tokenStore: {
    async saveTokens({ organizationId, tokenSet, scopes }) {
      await tokenVault.save({
        provider: "qentrah",
        organizationId,
        scopes,
        tokenSet,
      });
    },
  },

  afterSuccessRedirect: "/settings/integrations/qentrah?connected=1",
  afterErrorRedirect: "/settings/integrations/qentrah?error=1",
});
```

```ts
// app/api/qentrah/oauth/start/route.ts
import { qentrahAuth } from "../config";

export const GET = qentrahAuth.GET.start;
```

```ts
// app/api/qentrah/oauth/callback/route.ts
import { qentrahAuth } from "../config";

export const GET = qentrahAuth.GET.callback;
```

For other backend frameworks, use the lower-level helpers from `@qentrah/auth-sdk/partner` and wire the generated redirect URL, pending state storage, callback validation, and token storage into your own routes.

## Environment Variables

Use your own secret manager, hosting provider settings, or deployment environment.

```bash
QENTRAH_WORKSPACE_BASE_URL=https://app.qentrah.com
QENTRAH_PARTNER_CLIENT_ID=<your-partner-client-id>
QENTRAH_PARTNER_CLIENT_SECRET=<optional-confidential-client-secret>
QENTRAH_PARTNER_REDIRECT_URI=https://your-app.example.com/api/qentrah/oauth/callback
QENTRAH_PARTNER_SCOPES="organization:read client:read"
QENTRAH_WEBHOOK_SIGNING_SECRET=<your-webhook-signing-secret>
```

`QENTRAH_PARTNER_CLIENT_SECRET` is only needed for confidential client setups. Never place it in browser-visible configuration.

You can normalize the public OAuth settings with:

```ts
import { qentrahPartnerAuthorityFromEnv } from "@qentrah/auth-sdk/partner";

const authority = qentrahPartnerAuthorityFromEnv({
  QENTRAH_WORKSPACE_BASE_URL: process.env.QENTRAH_WORKSPACE_BASE_URL,
  QENTRAH_PARTNER_CLIENT_ID: process.env.QENTRAH_PARTNER_CLIENT_ID,
  QENTRAH_PARTNER_REDIRECT_URI: process.env.QENTRAH_PARTNER_REDIRECT_URI,
  QENTRAH_PARTNER_SCOPES: process.env.QENTRAH_PARTNER_SCOPES,
});
```

## Refresh Tokens

Refresh from server code, then save the returned token set back to your secure storage.

```ts
import { refreshQentrahPartnerAccessToken } from "@qentrah/auth-sdk/partner";

const tokenSet = await refreshQentrahPartnerAccessToken({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  clientId: process.env.QENTRAH_PARTNER_CLIENT_ID!,
  clientSecret: process.env.QENTRAH_PARTNER_CLIENT_SECRET,
  refreshToken: savedRefreshToken,
});

await tokenVault.save({ provider: "qentrah", tokenSet });
```

## Service-App Client

Use the service client from server code after your app has a saved access token.

```ts
import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";

const qentrah = createQentrahServiceAppClient({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  accessToken: savedAccessToken,
});

const organization = await qentrah.me();

const clients = await qentrah.listClients({
  organizationId,
  options: {
    limit: 25,
    search: "Acme",
    status: "active",
  },
});

const createdClient = await qentrah.createClient({
  organizationId,
  input: {
    name: "Acme Buyer",
    email: "buyer@example.com",
  },
  idempotencyKey: createIdempotencyKey(),
});

await qentrah.updateClient({
  organizationId,
  clientId: createdClient.id,
  input: { name: "Acme Buyer Updated" },
});

await qentrah.deleteClient({
  organizationId,
  clientId: createdClient.id,
});
```

Read helpers include:

- `me`
- `listClients`
- `listProperties`
- `listProjects`
- `listTasks`
- `listCalendar`
- `listMedia`
- `listWebhooks`

Common options include `limit`, `cursor`, `search`, `type`, `status`, `startAt`, `endAt`, `indexStart`, and `indexEnd`. Media also supports `resourceType` and `resourceId`.

The older `read`, `write`, and `sendWebhook` helpers remain available for existing integrations.

## Headless Integration Harness

The harness gives you reusable data models for a developer console without forcing a React component or a specific app layout.

```ts
import {
  createQentrahPartnerConsoleService,
  qentrahPartnerSections,
} from "@qentrah/auth-sdk/partner/harness";

const consoleService = createQentrahPartnerConsoleService({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_BASE_URL!,
  redirectUri: process.env.QENTRAH_PARTNER_REDIRECT_URI!,
  requestedScopes: ["organization:read", "client:read", "client:create"],
  session: await loadQentrahSession(userId),
});

const sections = consoleService.sections();
const lifecycle = consoleService.lifecycle();
const credentialSnapshot = consoleService.credentials();
const clientsQuery = consoleService.searchParams("clients", {
  limit: 25,
  search: "Acme",
  status: "active",
});
```

The harness can:

- Return the available console sections and the scopes each section needs.
- Detect missing scopes and reauthorization needs.
- Build OAuth lifecycle metadata for docs or UI.
- Build query parameters for list filters.
- Convert API responses into compact render rows.
- Normalize operation results for Test Results views.
- Sanitize nested payloads before rendering them.

Example rendering flow:

```ts
const result = await consoleService.runResourceOperation({
  sectionId: "clients",
  operation: "read",
  resource: "client",
  options: { limit: 25, search: "Acme" },
});

const rows = consoleService.renderRows("clients", result.responseSummary);
const safeResult = consoleService.result({
  sectionId: "clients",
  operation: "read",
  method: "GET",
  path: "/api/qentrah/clients",
  status: result.status,
  response: result.responseSummary,
  error: result.error,
});
```

Render `rows`, `sections`, `lifecycle`, `credentialSnapshot`, and `safeResult` with your own UI framework.

## Webhook Verification

Use webhook helpers from server code. The signing secret must remain server-side.

```ts
// app/api/qentrah/webhooks/route.ts
import { createQentrahWebhookHandler } from "@qentrah/auth-sdk/partner/webhooks";

export const runtime = "nodejs";

export const POST = createQentrahWebhookHandler({
  signingSecret: process.env.QENTRAH_WEBHOOK_SIGNING_SECRET!,
  handlers: {
    async "client.created"(event) {
      await syncClientCreated(event.data);
    },
    async "client.updated"(event) {
      await syncClientUpdated(event.data);
    },
    async "client.deleted"(event) {
      await syncClientDeleted(event.data);
    },
  },
  async onUnhandledEvent(event) {
    await recordUnhandledEvent(event.type);
  },
});
```

Verify against the original request body before parsing JSON. The helper does that for standard `Request` objects.

## WordPress And Server-Backed Apps

For WordPress or PHP-backed products, keep the same separation of responsibilities:

- Enqueue the browser button script in the admin screen or integration settings page.
- Point the button at a server route that starts OAuth.
- Store pending OAuth state in a server-side session or database table.
- Complete the callback on the server and save token data in encrypted storage.
- Proxy Qentrah resource calls through server endpoints.
- Render only sanitized connection status, section readiness, request summaries, and result summaries in the admin UI.

If your WordPress plugin uses a Node service or build step, you can use this package directly in that server layer. If your backend is pure PHP, mirror the same OAuth, webhook, and storage contract server-side, and use the browser bundle only for the connect button.

## Error Handling

SDK errors are stable enough to branch on:

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
  await connectQentrah();
} catch (error) {
  if (isQentrahPartnerAuthError(error)) {
    await recordIntegrationIssue({
      code: error.code,
      message: error.message,
    });
  }
}
```

## Before Publishing Or Sharing Examples

- Use placeholders for all credentials and tokens.
- Do not include local secrets, customer data, access tokens, refresh tokens, webhook signing secrets, or authorization headers.
- Do not paste private implementation details into public docs.
- Prefer sanitized SDK snapshots and summaries for screenshots, logs, and test fixtures.

## License

UNLICENSED
