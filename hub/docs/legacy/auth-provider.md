# Ara Strict Mode - AUTH-PROVIDER.md (Better Auth + Organization + OAuth 2.1 Full Plan)

Current date: May 2026.

Platform: Saudi Arabia Central Real Estate Data Hub. The hub is a synchronization engine and OAuth 2.1 Provider. It receives property data and changes from external CRMs, mobile apps, publisher systems, developer tools, and partner platforms. It validates data, runs approval workflows when required, controls visibility by platform and audience, and synchronizes the correct state back to connected systems.

Key decision: Better Auth is the main authorization system. The hub uses Better Auth with the OAuth 2.1 Provider plugin and Organization plugin. Convex remains the database and backend execution layer. OAuth scopes authorize client access. Organization permissions and hub domain authorization decide whether a request can actually read, write, sync, approve, suppress, or distribute data.

Plain Convex Auth is forbidden.

## 1. Installation & Setup

### 1.1 Exact Package Versions

Current package versions checked in May 2026:

| Package | Version | Purpose |
| --- | ---: | --- |
| `better-auth` | `1.6.9` | Better Auth core |
| `@better-auth/oauth-provider` | `1.6.9` | OAuth 2.1 Provider plugin |
| `@better-auth/cli` | `1.4.21` | Better Auth schema tooling |
| `@convex-dev/better-auth` | `0.12.2` | Convex Component for Better Auth |
| `convex` | `1.37.0` | Convex client/server runtime |
| `next` | `16.2.4` | Next.js App Router |

Install commands from `hub/`:

```bash
npm install next@16.2.4 convex@1.37.0 better-auth@1.6.9 @better-auth/oauth-provider@1.6.9 @convex-dev/better-auth@0.12.2
npm install -D @better-auth/cli@1.4.21
```

Required existing stack:

```bash
npm install typescript zod
```

Rules:

- Keep `better-auth` and `@better-auth/oauth-provider` on the same version line.
- Do not install `@convex-dev/auth`.
- Do not build a custom OAuth server.
- Do not use a second organization membership system.
- Do not store OAuth client secrets in hub-owned plaintext fields.

### 1.2 Convex Component Registration

File: `hub/convex/convex.config.ts`

```ts
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();

app.use(betterAuth, { name: "betterAuth" });

export default app;
```

Rules:

- Component name is `betterAuth`.
- The generated component reference is `components.betterAuth`.
- Better Auth component tables remain separate from hub domain tables.

### 1.3 Convex Auth Config

File: `hub/convex/auth.config.ts`

```ts
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

Purpose:

- Allows Convex to verify Better Auth-issued session tokens.
- Makes Better Auth identity available to Convex functions.

### 1.4 Better Auth Schema Generation

Run from `hub/`:

```bash
npx @better-auth/cli generate --output ./convex/betterAuth/schema.ts -y
```

Required folder:

```txt
hub/
  convex/
    betterAuth/
      schema.ts
      auth.ts
      permissions.ts
```

Rules:

- Generated Better Auth schema is not the hub domain schema.
- Hub domain tables remain in `hub/convex/schema.ts`.
- Generated auth schema must be reviewed after plugin changes.

### 1.5 Environment Variables

Set Convex environment variables:

```bash
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:3000"
npx convex env set OAUTH_ISSUER "http://localhost:3000/api/auth"
npx convex env set OAUTH_RESOURCE_HUB_API "http://localhost:3000/api/hub"
npx convex env set OAUTH_RESOURCE_MCP "http://localhost:3000/mcp"
```

Set `.env.local`:

```txt
CONVEX_DEPLOYMENT=dev:replace-with-deployment
NEXT_PUBLIC_CONVEX_URL=https://replace-with-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://replace-with-deployment.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production rules:

- `SITE_URL` must be HTTPS.
- `OAUTH_ISSUER` must be stable.
- `BETTER_AUTH_SECRET` must be generated outside source code.
- Never commit secrets.
- Never expose client secrets through `NEXT_PUBLIC_` variables.

### 1.6 Better Auth Server Configuration

File: `hub/convex/betterAuth/auth.ts`

```ts
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { jwt, organization } from "better-auth/plugins";

import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import {
  ac,
  admin,
  auditor,
  complianceOfficer,
  integrationAdmin,
  member,
  owner,
  publisherEditor,
  publisherManager,
} from "./permissions";
import { isOrganizationScope } from "../../lib/auth/scope-policy";

const siteUrl = process.env.SITE_URL!;
const hubAudience = process.env.OAUTH_RESOURCE_HUB_API!;
const mcpAudience = process.env.OAUTH_RESOURCE_MCP!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const supportedOAuthScopes = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "organization.read",
  "organization.members.read",
  "properties.read",
  "properties.write",
  "properties.sync",
  "properties.visibility.read",
  "properties.visibility.write",
  "submissions.read",
  "submissions.write",
  "submissions.review",
  "webhook.read",
  "webhook.manage",
  "integrations.read",
  "integrations.manage",
  "audit.read",
  "mcp.tools.read",
  "mcp.tools.call",
] as const;

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const auth = betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    plugins: [
      jwt(),
      organization({
        ac,
        roles: {
          owner,
          admin,
          member,
          integration_admin: integrationAdmin,
          publisher_manager: publisherManager,
          publisher_editor: publisherEditor,
          compliance_officer: complianceOfficer,
          auditor,
        },
        allowUserToCreateOrganization: async () => false,
        requireEmailVerificationOnInvitation: true,
      }),
      oauthProvider({
        loginPage: "/sign-in",
        consentPage: "/consent",
        signUp: {
          page: "/sign-up",
        },
        validAudiences: [hubAudience, mcpAudience],
        scopes: [...supportedOAuthScopes],
        advertisedMetadata: {
          scopes_supported: [...supportedOAuthScopes],
          claims_supported: [
            "sub",
            "iss",
            "aud",
            "exp",
            "iat",
            "scope",
            "azp",
            "https://anand.sa/claims/organization_id",
            "https://anand.sa/claims/organization_type",
            "https://anand.sa/claims/roles",
          ],
        },
        postLogin: {
          page: "/select-organization",
          shouldRedirect: async ({ scopes }) => {
            return scopes.some(isOrganizationScope);
          },
          consentReferenceId: ({ session, scopes }) => {
            if (!scopes.some(isOrganizationScope)) {
              return undefined;
            }
            const activeOrganizationId = session?.activeOrganizationId as
              | string
              | undefined;
            if (!activeOrganizationId) {
              throw new Error("Organization context is required.");
            }
            return activeOrganizationId;
          },
        },
        clientReference: ({ session }) => {
          return (session?.activeOrganizationId as string | undefined) ?? undefined;
        },
        clientPrivileges: async ({ headers, session }) => {
          if (!session?.activeOrganizationId) {
            return false;
          }
          const activeMember = await auth.api.getActiveMember({ headers });
          const role = activeMember?.data?.role;
          return ["owner", "admin", "integration_admin"].includes(role);
        },
        scopeExpirations: {
          "properties.write": "15m",
          "properties.sync": "15m",
          "properties.visibility.write": "10m",
          "submissions.review": "10m",
          "audit.read": "10m",
          "mcp.tools.call": "10m",
        },
        rateLimit: {
          token: { window: 60, max: 20 },
          authorize: { window: 60, max: 30 },
          introspect: { window: 60, max: 100 },
          revoke: { window: 60, max: 30 },
          register: { window: 60, max: 5 },
          userinfo: { window: 60, max: 60 },
        },
        customAccessTokenClaims: ({ scopes, referenceId }) => {
          return {
            "https://anand.sa/claims/organization_id": referenceId,
            "https://anand.sa/claims/scopes": scopes,
          };
        },
        customTokenResponseFields: ({ grantType, verificationValue }) => {
          if (
            grantType === "authorization_code" &&
            verificationValue?.referenceId
          ) {
            return {
              organization_id: verificationValue.referenceId,
            };
          }
          return {};
        },
      }),
      convex({
        authConfig,
        options: {
          basePath: "/api/auth",
        },
      }),
    ],
  });

  return auth;
};
```

Implementation notes:

- OAuth Provider handles protocol mechanics.
- Organization plugin handles organization membership and role primitives.
- Convex plugin integrates Better Auth with Convex token validation.
- Hub authorization still enforces resource access in pure functions.
- Better Auth callbacks establish context. They do not approve property access.

### 1.7 Lazy Route Registration

File: `hub/convex/http.ts`

```ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

authComponent.registerRoutesLazy(http, createAuth, {
  cors: {
    allowedOrigins: [
      process.env.SITE_URL ?? "http://localhost:3000",
    ],
  },
});

export default http;
```

Rules:

- Use `registerRoutesLazy`.
- Do not use eager registration unless memory profile proves it is safe.
- Do not expose unauthenticated hub domain APIs through Convex HTTP routes.

### 1.8 Next.js Auth Proxy

File: `hub/lib/auth/auth-server.ts`

```ts
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
  basePath: "/api/auth",
});
```

File: `hub/app/api/auth/[...all]/route.ts`

```ts
import { handler } from "@/lib/auth/auth-server";

export const { GET, POST } = handler;
```

### 1.9 Client Auth Setup

File: `hub/lib/auth/auth-client.ts`

```ts
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

import {
  ac,
  admin,
  auditor,
  complianceOfficer,
  integrationAdmin,
  member,
  owner,
  publisherEditor,
  publisherManager,
} from "@/convex/betterAuth/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    convexClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
        integration_admin: integrationAdmin,
        publisher_manager: publisherManager,
        publisher_editor: publisherEditor,
        compliance_officer: complianceOfficer,
        auditor,
      },
    }),
    oauthProviderClient(),
  ],
});
```

Rules:

- UI permission checks are presentation only.
- Every Convex query, mutation, action, and HTTP API must enforce permission server-side.

## 2. Organization-Level Authorization

### 2.1 How Better Auth Organizations Work

Better Auth Organization plugin provides:

- Organization records.
- Organization membership.
- Invitations.
- Active organization context.
- Roles.
- Permission statements.
- Optional teams.
- Client-side organization methods.
- Server-side organization API methods.

The user first authenticates as a person. Then the user selects or activates an organization. The hub treats authorized actions as organization-context actions, not personal-only actions.

Required logic:

```txt
Personal session proves: "Who is the human user?"
Active organization proves: "Which tenant is the user acting for?"
Organization role proves: "What is the user allowed to do inside that tenant?"
Hub domain rules decide: "Can this request touch this property, submission, integration, visibility state, or audit record?"
```

### 2.2 Organization Login Flow

Required flow:

1. User clicks sign in.
2. Better Auth creates personal session.
3. Hub loads organizations where the user is a member.
4. If user has one organization and requested scopes require organization context, set it active.
5. If user has multiple organizations, show `/select-organization`.
6. User selects organization.
7. Hub sets active organization through Better Auth organization client/server API.
8. OAuth consent screen uses the active organization.
9. OAuth consent is tied to the active organization using `consentReferenceId`.
10. Access token contains or references organization context.
11. Resource APIs enforce organization membership and permissions.

### 2.3 Required Organization Types

File: `hub/domains/organization/organization-types.ts`

```ts
export const hubOrganizationTypes = [
  "platform_operator",
  "publisher_developer",
  "integration_partner",
  "government_legal_observer",
  "internal_workspace",
] as const;

export type HubOrganizationType = (typeof hubOrganizationTypes)[number];
```

Definitions:

- `platform_operator`: internal hub operating organization.
- `publisher_developer`: developer, brokerage, or publisher that owns property data.
- `integration_partner`: CRM vendor, mobile app, middleware, portal, or partner platform.
- `government_legal_observer`: approved legal/government/regulatory observer.
- `internal_workspace`: internal workspace using hub data.

### 2.4 Required Organization Roles

```ts
export const hubOrganizationRoles = [
  "owner",
  "admin",
  "integration_admin",
  "publisher_manager",
  "publisher_editor",
  "reviewer",
  "compliance_officer",
  "auditor",
  "legal_observer",
  "workspace_viewer",
  "support_operator",
] as const;
```

Role rules:

- `owner`: manages organization membership and owned OAuth apps.
- `admin`: manages most organization operations except owner-only actions.
- `integration_admin`: registers OAuth clients, trusted URLs, webhook endpoints, and SDK credentials.
- `publisher_manager`: manages publisher submissions and property correction workflows.
- `publisher_editor`: creates property submissions and corrections.
- `reviewer`: reviews submissions only when self-approval rules allow it.
- `compliance_officer`: approves compliance-restricted access and legal/government visibility.
- `auditor`: reads allowed audit events.
- `legal_observer`: reads approved legal/government visibility records.
- `workspace_viewer`: reads workspace-scoped data.
- `support_operator`: support visibility only; no approval authority.

### 2.5 How the System Knows the User Role

The role is resolved from Better Auth organization membership.

Server-side authorization sequence:

```ts
export async function resolveOrganizationActor(ctx: QueryCtx | MutationCtx) {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  const session = await loadBetterAuthSession(ctx);
  const activeOrganizationId = session.activeOrganizationId;
  if (!activeOrganizationId) {
    throw new Error("ORGANIZATION_REQUIRED");
  }

  const membership = await loadMembershipProjection(ctx, {
    userId: authUser.userId,
    organizationId: activeOrganizationId,
  });

  if (!membership || membership.status !== "active") {
    throw new Error("ORGANIZATION_MEMBERSHIP_REQUIRED");
  }

  return {
    userId: authUser.userId,
    organizationId: activeOrganizationId,
    organizationType: membership.organizationType,
    roles: membership.roles,
  };
}
```

Rules:

- Better Auth membership is the source.
- Hub projection tables exist only for indexed authorization and domain joins.
- If projection disagrees with Better Auth, deny and force repair.
- Organization role is never trusted from the browser.

## 3. OAuth 2.1 Flow for Third-Party Apps

### 3.1 "Continue with Anand" Definition

"Continue with Anand" is the third-party authorization entry point. It is an OAuth 2.1 Authorization Code + PKCE flow against Anand Hub.

Actors:

- User: human member of a publisher/developer organization.
- Third-party app: CRM, mobile app, partner platform, integration middleware, or MCP client.
- Anand Hub: OAuth 2.1 Provider and resource server.
- Organization: tenant granting access.

### 3.2 Popup Flow in Other Developers' Apps

Recommended UX:

1. Developer app shows `Continue with Anand`.
2. User clicks button.
3. Developer app opens centered popup.
4. Popup navigates to Anand authorization endpoint.
5. User signs in on Anand if not already signed in.
6. User selects organization.
7. User reviews consent screen.
8. User grants or denies access.
9. Anand redirects popup to developer callback URL.
10. Developer callback validates `state` and `iss`.
11. Developer callback exchanges `code` with `code_verifier`.
12. Developer callback sends success to opener via `postMessage`.
13. Parent window verifies message origin.
14. Parent window closes popup and updates connection state.

Fallback:

- If popup is blocked, use full-page redirect.

### 3.3 Authorization Request

Example:

```txt
GET https://hub.anand.sa/api/auth/oauth2/authorize
  ?response_type=code
  &client_id=anand_client_123
  &redirect_uri=https%3A%2F%2Fcrm.example.com%2Foauth%2Fanand%2Fcallback
  &scope=openid%20profile%20email%20organization.read%20properties.read%20properties.sync
  &state=CLIENT_RANDOM_STATE
  &code_challenge=BASE64URL_SHA256_CODE_VERIFIER
  &code_challenge_method=S256
  &resource=https%3A%2F%2Fapi.anand.sa%2Fhub
```

Rules:

- `response_type` must be `code`.
- `code_challenge_method` must be `S256`.
- `plain` PKCE is forbidden.
- `state` is mandatory by hub policy.
- `redirect_uri` must exactly match a registered URI.
- `resource` must be an allowed audience.
- Requested scopes must be approved for the OAuth client.

### 3.4 Developer App Button Example

```ts
export async function startAnandOAuthPopup(config: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  resource: string;
}) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();

  sessionStorage.setItem("anand.oauth.state", state);
  sessionStorage.setItem("anand.oauth.verifier", codeVerifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    resource: config.resource,
  });

  const width = 520;
  const height = 720;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    `https://hub.anand.sa/api/auth/oauth2/authorize?${params}`,
    "anand_oauth",
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    window.location.href = `https://hub.anand.sa/api/auth/oauth2/authorize?${params}`;
  }
}
```

### 3.5 PKCE Helpers

```ts
export function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}
```

### 3.6 Consent Screen with Organization Context

Consent page must show:

- Third-party app name.
- Third-party app owner organization.
- Environment: sandbox or production.
- Verification status.
- Selected organization granting access.
- Requested scopes.
- Human-readable explanation per scope.
- Offline access warning if `offline_access` is requested.
- Redirect domain.
- Data categories affected.
- Duration of access.
- Support URL and privacy URL when approved.

Consent actions:

- `Allow access`: accepts requested scopes or selected subset.
- `Deny`: denies the OAuth request.
- `Change organization`: returns to organization selector.
- `Cancel`: terminates flow.

Code:

```tsx
"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

export function OAuthConsentActions({ acceptedScope }: { acceptedScope: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => authClient.oauth2.consent({ accept: false })}
      >
        Deny
      </Button>
      <Button
        type="button"
        onClick={() =>
          authClient.oauth2.consent({
            accept: true,
            scope: acceptedScope,
          })
        }
      >
        Allow access
      </Button>
    </div>
  );
}
```

Rules:

- Use ShadCN `Button`, `Card`, `Badge`, `AlertDialog`, and `Separator`.
- Do not hide high-risk scopes by default.
- Do not imply consent bypasses hub approval.
- Consent is organization-bound.

### 3.7 Token Exchange

Confidential client server exchange:

```ts
const response = await fetch("https://hub.anand.sa/api/auth/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.ANAND_CLIENT_ID!,
    client_secret: process.env.ANAND_CLIENT_SECRET!,
    code,
    redirect_uri: "https://crm.example.com/oauth/anand/callback",
    code_verifier: codeVerifier,
  }),
});
```

Public client exchange:

```ts
const response = await fetch("https://hub.anand.sa/api/auth/oauth2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: anandClientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  }),
});
```

Rules:

- Confidential clients keep secrets server-side.
- Public clients do not receive secrets.
- Refresh token requires `offline_access`.
- Access tokens must not be logged.

## 4. Scopes & Permissions

### 4.1 Scope Rule

Scopes are client grants. Permissions are hub resource decisions.

Example:

```txt
Scope: properties.write
Maps to possible permission: submissions:create
Still requires:
- organization membership
- approved integration
- trusted client
- payload validation
- idempotency
- publisher ownership
- server-side authorization
```

### 4.2 Recommended Scopes

| Scope | Meaning | Risk | Organization Required |
| --- | --- | --- | --- |
| `openid` | Identify user subject | Standard | No |
| `profile` | Read display profile | Standard | No |
| `email` | Read email and verification | Standard | No |
| `offline_access` | Issue refresh token | Elevated | Depends on requested resource |
| `organization.read` | Read selected organization context | Standard | Yes |
| `organization.members.read` | Read approved member context | Elevated | Yes |
| `properties.read` | Read visible property records | Elevated | Yes |
| `properties.write` | Submit property create/update claims | High | Yes |
| `properties.sync` | Synchronize property changes | High | Yes |
| `properties.visibility.read` | Read visibility evaluations | Elevated | Yes |
| `properties.visibility.write` | Request visibility changes | High | Yes |
| `submissions.read` | Read submissions in scope | Elevated | Yes |
| `submissions.write` | Create submissions | High | Yes |
| `submissions.review` | Review submissions | Critical | Yes |
| `webhook.read` | Read webhook delivery status | Standard | Yes |
| `webhook.manage` | Register/update webhook URLs | High | Yes |
| `integrations.read` | Read integration config | Standard | Yes |
| `integrations.manage` | Manage integration config | High | Yes |
| `audit.read` | Read audit records | Critical | Yes |
| `mcp.tools.read` | Discover approved MCP tools | Elevated | Yes |
| `mcp.tools.call` | Call approved MCP tools | Critical | Yes |

### 4.3 Scope-to-Permission Map

File: `hub/domains/authorization/oauth-scope-map.ts`

```ts
export const oauthScopePermissionMap = {
  "organization.read": ["organizations:read_active"],
  "organization.members.read": ["organizations:read_members"],
  "properties.read": ["properties:read", "visibility:read_scoped"],
  "properties.write": ["submissions:create", "properties:submit_claim"],
  "properties.sync": ["synchronization:read", "synchronization:write"],
  "properties.visibility.read": ["visibility:read_scoped"],
  "properties.visibility.write": ["visibility:request_update"],
  "submissions.read": ["submissions:read_scoped"],
  "submissions.write": ["submissions:create"],
  "submissions.review": ["submissions:review"],
  "webhook.read": ["webhooks:read_own"],
  "webhook.manage": ["webhooks:update_own", "webhooks:test_own"],
  "integrations.read": ["integrations:read_own"],
  "integrations.manage": ["integrations:update_own", "integrations:request_approval"],
  "audit.read": ["audit:read_scoped"],
  "mcp.tools.read": ["mcp:tools_read"],
  "mcp.tools.call": ["mcp:tools_call"],
} as const;
```

### 4.4 Enforcement Pattern

```ts
export async function assertScopedOrganizationAccess(input: {
  tokenScopes: string[];
  requiredScope: string;
  organizationId: string;
  permission: string;
  resource: { type: string; id: string };
}) {
  if (!input.tokenScopes.includes(input.requiredScope)) {
    throw new Error("OAUTH_SCOPE_DENIED");
  }

  await assertPermission({
    organizationId: input.organizationId,
    permission: input.permission,
    resource: input.resource,
  });
}
```

Rules:

- UI never decides final access.
- OAuth scope never replaces organization role.
- Organization role never replaces visibility evaluation.
- Visibility evaluation never replaces audit.

## 5. Developer Integration Experience

### 5.1 Registration Flow

Required developer flow:

1. Developer signs into the separate developer integration project.
2. Developer creates or joins developer organization.
3. Developer registers app.
4. Developer enters app name, legal name, support URL, privacy URL, terms URL.
5. Developer adds redirect URIs.
6. Developer adds trusted origins.
7. Developer adds webhook endpoint URLs.
8. Developer requests scopes.
9. Hub validates URLs and scope risk.
10. Hub creates sandbox OAuth client.
11. Developer receives Client ID.
12. Confidential developer receives Client Secret once.
13. Developer tests "Continue with Anand".
14. Developer submits production review.
15. Platform admin or integration security officer approves production.

### 5.2 Client ID and Secret

OAuth credentials:

- `client_id`: public identifier.
- `client_secret`: confidential secret for server-side apps.
- Public clients use `token_endpoint_auth_method: "none"`.
- Confidential clients use a supported client authentication method.

Rules:

- Client Secret is shown once.
- Client Secret is never visible in a query response.
- Client Secret rotation invalidates old secret.
- Client Secret is not an API key.

### 5.3 API Key Position

API keys are secondary. OAuth is primary.

API keys may be used for:

- Server-to-server ingestion without user delegation.
- Legacy bridge integrations.
- Sandbox automation.
- Webhook management only if approved.

API key rules:

- Raw API key shown once.
- Store hash only.
- Scope to organization, app, environment, endpoint, and rate-limit tier.
- Support expiry, rotation, revocation, last used timestamp, and audit.
- API key cannot grant legal/government visibility alone.

### 5.4 Trusted URL Registration

Trusted URL fields:

- Redirect URI.
- Allowed origin.
- Webhook URL.
- Terms URL.
- Privacy URL.
- Support URL.

Validation rules:

- Production URLs must use HTTPS.
- Redirect URIs must exact-match.
- Wildcards are forbidden.
- `localhost` forbidden in production.
- Private IP ranges forbidden in production.
- Loopback, link-local, multicast, metadata service IPs forbidden.
- Redirects to untrusted hosts forbidden.
- Webhook endpoint must pass challenge test.
- Trusted URL changes require reapproval when production.

### 5.5 Developer Button Implementation

Minimal developer app usage:

```ts
import { AnandOAuthClient } from "@anand/sdk";

const anand = new AnandOAuthClient({
  clientId: process.env.NEXT_PUBLIC_ANAND_CLIENT_ID!,
  redirectUri: "https://crm.example.com/oauth/anand/callback",
  resource: "https://api.anand.sa/hub",
  scopes: [
    "openid",
    "profile",
    "email",
    "organization.read",
    "properties.read",
    "properties.sync",
  ],
});

document.querySelector("#continue-with-anand")?.addEventListener("click", () => {
  anand.authorizeWithPopup();
});
```

## 6. SDK Package

### 6.1 Package Name

Recommended package:

```txt
@anand/sdk
```

Companion packages if needed:

```txt
@anand/react
@anand/next
```

Default decision:

- Start with `@anand/sdk`.
- Add framework packages only if duplication proves real.

### 6.2 SDK Responsibilities

SDK handles:

- Authorization URL construction.
- PKCE generation.
- Popup flow.
- Redirect flow fallback.
- State verification helpers.
- Issuer verification helpers.
- Token exchange helper for server environments.
- Token refresh helper.
- Bearer token API client.
- Webhook signature verification middleware.
- Idempotency header helper.
- Typed payload helpers.

SDK does not handle:

- Hub approval decisions.
- Property visibility logic.
- Submission review logic.
- Legal/government visibility.
- Storing raw client secrets.
- Bypassing consent.

### 6.3 SDK Structure

```txt
packages/
  sdk/
    src/
      auth/
        anand-oauth-client.ts
        pkce.ts
        state.ts
        token-store.ts
        token-exchange.ts
      api/
        anand-api-client.ts
        requests.ts
        errors.ts
      webhooks/
        verify-signature.ts
        express-middleware.ts
        next-route-handler.ts
      types/
        scopes.ts
        tokens.ts
        properties.ts
        submissions.ts
        webhooks.ts
      index.ts
    package.json
    tsconfig.json
    README.md
```

### 6.4 Class-Based SDK Approach

```ts
export class AnandOAuthClient {
  constructor(
    private readonly config: {
      clientId: string;
      redirectUri: string;
      resource: string;
      scopes: string[];
      issuer?: string;
    }
  ) {}

  async authorizeWithPopup() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    saveTransientOAuthState({ verifier, state });

    const url = this.buildAuthorizeUrl({ challenge, state });
    return openOAuthPopup(url);
  }

  buildAuthorizeUrl(input: { challenge: string; state: string }) {
    const issuer = this.config.issuer ?? "https://hub.anand.sa/api/auth";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state: input.state,
      code_challenge: input.challenge,
      code_challenge_method: "S256",
      resource: this.config.resource,
    });

    return `${issuer}/oauth2/authorize?${params}`;
  }
}
```

### 6.5 Function-Based SDK Approach

```ts
export async function createAnandAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  resource: string;
}) {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  return {
    verifier,
    state,
    url: buildAuthorizeUrl({
      ...input,
      state,
      codeChallenge: challenge,
    }),
  };
}
```

Decision:

- SDK exports both.
- Class-based API is convenient for app developers.
- Function-based API is easier to test and use in custom frameworks.

### 6.6 Token Management

SDK token rules:

- Browser SDK stores transient verifier/state only.
- Browser SDK does not store long-lived refresh tokens by default.
- Server SDK can receive a user-provided token store adapter.
- SDK never logs tokens.
- SDK never stores client secrets.

Token store interface:

```ts
export interface AnandTokenStore {
  get(key: string): Promise<AnandTokenSet | undefined>;
  set(key: string, value: AnandTokenSet): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### 6.7 Webhook Middleware

Express:

```ts
import { verifyAnandWebhook } from "@anand/sdk/webhooks";

app.post("/webhooks/anand", express.raw({ type: "application/json" }), (req, res) => {
  const event = verifyAnandWebhook({
    body: req.body,
    headers: req.headers,
    secret: process.env.ANAND_WEBHOOK_SECRET!,
  });

  handleEvent(event);
  res.status(204).end();
});
```

Next.js route handler:

```ts
import { verifyAnandWebhook } from "@anand/sdk/webhooks";

export async function POST(request: Request) {
  const body = await request.text();
  const event = verifyAnandWebhook({
    body,
    headers: request.headers,
    secret: process.env.ANAND_WEBHOOK_SECRET!,
  });

  await handleEvent(event);
  return new Response(null, { status: 204 });
}
```

Webhook rules:

- Verify HMAC.
- Verify timestamp.
- Reject replayed event ID.
- Use idempotency keys.
- Do not process unsigned events.

## 7. SOLID Architecture in Authorization Code

### 7.1 Single Responsibility Principle

Each module owns one job.

Required modules:

```txt
domains/authorization/
  scope-map.ts              # maps OAuth scopes to hub permissions
  can.ts                    # pure permission decision
  assert-permission.ts      # throws server errors
  organization-access.ts    # organization membership checks
  resource-access.ts        # property/submission/platform ownership
  visibility-access.ts      # visibility authorization
  token-access.ts           # token claims normalization
```

Rules:

- OAuth parsing does not decide property visibility.
- Organization membership does not parse JWTs.
- Visibility access does not validate Zod payloads.
- Consent screen does not enforce server access.

### 7.2 Open/Closed Principle

Scopes and permissions must be extendable by adding entries, not rewriting core logic.

```ts
export const scopePolicy = {
  "properties.read": {
    permissions: ["properties:read", "visibility:read_scoped"],
    requiresOrganization: true,
    risk: "elevated",
  },
} as const;
```

### 7.3 Liskov Substitution Principle

Different token verifiers must expose the same interface.

```ts
export interface AccessTokenVerifier {
  verify(rawToken: string): Promise<VerifiedAccessToken>;
}
```

Implementations:

- `JwtAccessTokenVerifier`
- `OpaqueIntrospectionVerifier`
- `TestAccessTokenVerifier`

### 7.4 Interface Segregation Principle

Do not create one massive auth service.

Interfaces:

```ts
export interface ScopeAuthorizer {
  assertScope(scopes: string[], requiredScope: string): void;
}

export interface OrganizationAuthorizer {
  assertOrganization(input: OrganizationAccessInput): Promise<void>;
}

export interface VisibilityAuthorizer {
  assertVisibility(input: VisibilityAccessInput): Promise<void>;
}
```

### 7.5 Dependency Inversion Principle

High-level domain code depends on interfaces, not concrete Better Auth calls.

```ts
export async function submitPropertyClaim(
  deps: {
    tokenVerifier: AccessTokenVerifier;
    authorizer: HubAuthorizer;
    repository: SubmissionRepository;
  },
  input: SubmitPropertyClaimInput
) {
  const token = await deps.tokenVerifier.verify(input.accessToken);
  await deps.authorizer.assertCanCreateSubmission(token, input.payload);
  return deps.repository.createSubmission(input.payload);
}
```

Rules:

- Better Auth adapter code lives at the edge.
- Convex mutations orchestrate dependencies.
- Pure functions remain testable without Better Auth runtime.

## 8. Integration with Convex

### 8.1 Convex Responsibilities

Convex owns:

- Hub domain tables.
- Real-time admin views.
- Submission intake.
- Approval transitions.
- Visibility computation.
- Distribution events.
- Audit logs.
- Organization projection tables.
- OAuth client approval projections.
- Webhook delivery state.

### 8.2 Better Auth Session in Convex

Convex functions use:

```ts
const authUser = await authComponent.getAuthUser(ctx);
```

For Better Auth API methods inside Convex mutations:

```ts
const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

await auth.api.createOAuthClient({
  headers,
  body: {
    client_name: "CRM Production App",
    redirect_uris: ["https://crm.example.com/oauth/anand/callback"],
  },
});
```

Rules:

- Better Auth API calls that mutate auth state run inside Convex mutations.
- Convex queries may read current user/session projection.
- Do not call Better Auth APIs directly from random Next.js handlers if Convex owns backend state.

### 8.3 Organization Projection Tables

Required hub-owned projections:

```ts
organizationProfiles: defineTable({
  betterAuthOrganizationId: v.string(),
  organizationType: v.union(
    v.literal("platform_operator"),
    v.literal("publisher_developer"),
    v.literal("integration_partner"),
    v.literal("government_legal_observer"),
    v.literal("internal_workspace")
  ),
  displayName: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("pending_review"),
    v.literal("suspended"),
    v.literal("rejected")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_better_auth_organization", ["betterAuthOrganizationId"])
```

```ts
membershipProfiles: defineTable({
  betterAuthUserId: v.string(),
  betterAuthOrganizationId: v.string(),
  roles: v.array(v.string()),
  status: v.union(v.literal("active"), v.literal("suspended")),
  updatedAt: v.number(),
})
  .index("by_user", ["betterAuthUserId"])
  .index("by_organization", ["betterAuthOrganizationId"])
  .index("by_user_organization", [
    "betterAuthUserId",
    "betterAuthOrganizationId",
  ])
```

Rules:

- Better Auth remains source of membership truth.
- Projection exists for indexed hub authorization.
- If projection is stale, deny sensitive actions.

### 8.4 OAuth Client Projection Tables

```ts
oauthClientProfiles: defineTable({
  betterAuthClientId: v.string(),
  owningOrganizationId: v.string(),
  environment: v.union(v.literal("sandbox"), v.literal("production")),
  status: v.union(
    v.literal("draft"),
    v.literal("pending_review"),
    v.literal("approved"),
    v.literal("suspended"),
    v.literal("revoked")
  ),
  requestedScopes: v.array(v.string()),
  approvedScopes: v.array(v.string()),
  trustedRedirectUris: v.array(v.string()),
  trustedOrigins: v.array(v.string()),
  webhookUrls: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_better_auth_client", ["betterAuthClientId"])
  .index("by_owning_organization", ["owningOrganizationId"])
```

Rules:

- Better Auth owns protocol client record.
- Hub profile owns review, approval, visibility, and integration policy.

### 8.5 Webhooks

Webhook event flow:

1. Canonical property changes.
2. Visibility engine recomputes platform visibility.
3. Sync engine creates distribution event.
4. Webhook sender signs payload.
5. Delivery attempt recorded.
6. Retry or dead-letter handled.

Webhook payloads use OAuth client/integration profile for:

- Destination platform.
- Approved scopes.
- Visibility redaction.
- Webhook URL.
- Signing secret reference.

## 9. Security & Best Practices

### 9.1 Token Handling

Rules:

- Use Authorization Code + PKCE.
- Do not use implicit flow.
- Do not use password grant.
- Access tokens short-lived.
- High-risk scopes shorter-lived.
- Refresh tokens require `offline_access`.
- Do not store access tokens in localStorage for first-party web.
- Confidential clients store tokens server-side.
- Public clients use platform-secure storage.
- Never log access tokens.
- Never put tokens in query strings.

### 9.2 Client Secret Handling

Rules:

- Client secret shown once.
- Confidential clients only.
- Rotate on suspicion or admin request.
- Do not store in browser.
- Do not expose through Convex queries.
- Do not send in webhook payloads.

### 9.3 Trusted Origins and Redirect URIs

Rules:

- Production redirect URI must use HTTPS.
- Exact match only.
- No wildcard redirect URI.
- No private IP target.
- No localhost in production.
- No untrusted redirect chain.
- Validate DNS resolution where practical.
- Revalidate on change.
- Production URL changes require approval.

### 9.4 Rate Limiting

Required rate-limited endpoints:

- `/oauth2/authorize`
- `/oauth2/token`
- `/oauth2/register`
- `/oauth2/introspect`
- `/oauth2/revoke`
- `/oauth2/userinfo`
- API key verification
- Webhook tests
- Submission intake
- Sync retries

Use:

- Better Auth OAuth Provider rate limits for OAuth endpoints.
- `@convex-dev/rate-limiter` for hub API, ingestion, and sync endpoints.

### 9.5 Consent Security

Rules:

- Consent must show organization context.
- Consent must show exact scopes.
- Consent must show offline access.
- Trusted first-party clients may skip consent only if explicitly approved.
- Third-party production clients must not skip consent.
- Consent revocation must be available.

### 9.6 Visibility Security

OAuth cannot bypass visibility.

Marketplace visibility hidden when:

- sold;
- off-market;
- withdrawn;
- expired;
- rejected;
- suspended;
- under dispute;
- manually hidden;
- leased when marketplace withdrawal is required.

CRM visibility:

- Can retain internal state only for owning publisher or approved platform.

Legal/Government visibility:

- Requires compliance officer or platform admin approval.

### 9.7 Audit Requirements

Audit these events:

- OAuth client created.
- OAuth client updated.
- OAuth client approved.
- OAuth client suspended.
- Client secret rotated.
- Consent granted.
- Consent revoked.
- Scope request approved.
- Scope request denied.
- Token introspection failure spike.
- API key created.
- API key revoked.
- Webhook URL validated.
- Webhook delivery failed.
- High-risk scope used.

Audit logs must not include:

- Access tokens.
- Refresh tokens.
- Client secrets.
- Raw API keys.
- Full personal payloads unless explicitly approved and redacted.

### 9.8 Required Tests

Tests:

- Install configuration compiles.
- Better Auth component registered.
- Auth route proxy works.
- OAuth authorization metadata exists.
- OIDC metadata exists.
- Authorization Code + PKCE succeeds.
- Missing PKCE fails.
- `plain` PKCE fails.
- Invalid redirect URI fails.
- Invalid state fails.
- Issuer mismatch fails.
- Consent accept succeeds.
- Consent deny returns error flow.
- Organization selection required for organization scopes.
- User role resolved from Better Auth organization membership.
- Scope maps to permission.
- Scope without permission fails.
- Permission without visibility fails.
- Publisher self-approval denied.
- Production client requires approval.
- Client secret one-time reveal enforced.
- API key raw value not stored.
- Webhook signature verification works.
- MCP scopes map to MCP permissions.

## 10. Implementation File Structure

```txt
hub/
  app/
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
      consent/page.tsx
      select-organization/page.tsx
    api/
      auth/[...all]/route.ts
    .well-known/
      openid-configuration/route.ts
      oauth-authorization-server/route.ts
      oauth-protected-resource/route.ts
  convex/
    convex.config.ts
    auth.config.ts
    http.ts
    betterAuth/
      auth.ts
      permissions.ts
      schema.ts
    authProvider/
      oauthClients.ts
      oauthClientApprovals.ts
      oauthConsents.ts
      oauthAudit.ts
  domains/
    authorization/
      scope-map.ts
      can.ts
      assert-permission.ts
      token-access.ts
      organization-access.ts
      visibility-access.ts
    organization/
      organization-types.ts
      organization-projection.ts
    integration/
      trusted-redirect-uri.ts
      oauth-client-policy.ts
      webhook-url-policy.ts
  lib/
    auth/
      auth-client.ts
      auth-server.ts
      scope-copy.ts
      scope-policy.ts
```

## 11. Final Rule

Better Auth OAuth 2.1 Provider issues the tokens.

Better Auth Organization plugin supplies organization context and membership roles.

Convex enforces the hub domain.

OAuth scopes allow the client to ask.

Organization permissions decide whether the user can act.

Visibility rules decide what data can leave the hub.

Approval workflows decide when submitted claims become canonical.

Audit records prove what happened.
