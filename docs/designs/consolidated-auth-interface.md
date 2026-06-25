# Consolidated `@qentrah/auth` Interface Design

## 1. Current State — What Exists

Three packages, ~35 files, three separate build/publish cycles:

| Package | Files | Runtime | Key exports |
|---------|-------|---------|-------------|
| `@qentrah/auth` | 20+ | Server + Client | AuthContext, guards, session, OIDC provider, resource-server, scopes, React hooks |
| `@qentrah/auth-client` | 6 | Client (browser) | Better Auth React client presets (web/admin/external), form helpers |
| `@qentrah/authorization` | 9 | Client (browser) | OAuth popup flow, PKCE, token exchange/refresh/revoke, React provider+button |

**External consumers (outside these 3 packages):**
- `@qentrah/auth/scopes` → 1 import site (`domain-contracts`)
- `@qentrah/auth/react` → 1 import site (`ui` package: `useAuth`, `useAuthorization`)
- `@qentrah/auth-client` → 0 external imports
- `@qentrah/authorization` → 0 external imports

**Separate (NOT absorbed):**
- `@qentrah/auth-sdk` — published partner SDK, has its own token handling and browser button
- `@qentrah/partner-auth-core` — partner scope vocabulary, 10+ call sites

---

## 2. The Consolidated Interface — 3 Entry Points

```
@qentrah/auth            → types, errors, scope catalog (isomorphic, zero runtime deps)
@qentrah/auth/server     → server runtime (guards, session, OIDC provider, token verification)
@qentrah/auth/client     → browser runtime (Better Auth presets, OAuth popup, token ops, React)
```

### Why 3, not 1 or 2

- **Not 1**: The server entry imports `better-auth` (server plugins), `@qentrah/platform-core` (session bridge), and `@qentrah/brand-identity`. These are heavy Node-only deps. A single entry point would leak them into client bundles via import graphs, even with tree-shaking. The `"use client"` boundary helps but doesn't prevent the module from being evaluated during SSR.

- **Not 2**: Merging types into server (`@qentrah/auth` = types+server) would force any client code importing types to also resolve server deps. The current `@qentrah/auth` root already re-exports server code — this is a latent bundle-size risk. A clean types-only root eliminates this.

- **3 is the floor**: Types must be isomorphic. Server and client have irreconcilable dependency trees. That's 3.

---

## 3. Entry Point 1: `@qentrah/auth` — Types & Vocabulary

**Runtime deps**: none
**Side effects**: none
**Safe to import**: anywhere (server, client, RSC, tests)

Absorbs types from all three packages into one canonical set.

```typescript
// ─── Identity ─────────────────────────────────────────────────────────

export type AuthContext = {
  token?: string;
  issuer?: string;
  audience?: string | string[];
  subject: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  scopes: string[];
  entitlements: string[];
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationRole?: string | null;
  organizationPermissions: string[];
  brokerId?: string | null;
  redId?: string | null;
  ownerType?: "broker" | "developer" | "RED" | null;
  ownerId?: string | null;
  isActive: boolean;
  claims: QentrahOidcClaims;
};

export type ResourceOwner = {
  ownerType?: "broker" | "developer" | "RED" | null;
  ownerId?: string | null;
  brokerId?: string | null;
  redId?: string | null;
  organizationId?: string | null;
};

// ─── Errors ───────────────────────────────────────────────────────────
// Unified: absorbs AuthError + QentrahAuthorizationError
// All codes normalized to UPPER_CASE (breaking: authorization codes were snake_case)

export type AuthErrorCode =
  // Server-side
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_TOKEN"
  | "INSUFFICIENT_SCOPE"
  | "INVALID_AUTH_CONTEXT"
  | "AUTH_CONFIGURATION_ERROR"
  // Client-side (OAuth flow) — previously QentrahAuthorizationErrorCode
  | "POPUP_BLOCKED"
  | "ACCESS_DENIED"
  | "INVALID_STATE"
  | "INVALID_SCOPE"
  | "INACTIVE_CLIENT"
  | "AUTHORIZATION_EXPIRED"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE";

const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_TOKEN: 401,
  INSUFFICIENT_SCOPE: 403,
  INVALID_AUTH_CONTEXT: 401,
  AUTH_CONFIGURATION_ERROR: 503,
  POPUP_BLOCKED: 400,
  ACCESS_DENIED: 403,
  INVALID_STATE: 400,
  INVALID_SCOPE: 400,
  INACTIVE_CLIENT: 400,
  AUTHORIZATION_EXPIRED: 400,
  NETWORK_ERROR: 502,
  INVALID_RESPONSE: 502,
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(code: AuthErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = options?.status ?? AUTH_ERROR_STATUS[code];
    this.cause = options?.cause;
  }
}

/** Adapter for migrating from the old QentrahAuthorizationError */
export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  if (error instanceof Error) return new AuthError("INVALID_AUTH_CONTEXT", error.message, { cause: error });
  return new AuthError("INVALID_AUTH_CONTEXT", "Unknown auth error", { cause: error });
}

// ─── OIDC Claims ──────────────────────────────────────────────────────

export type QentrahOwnerType = "broker" | "developer" | "RED";

export type QentrahOidcClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  scope?: string | string[];
  scp?: string[];
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  org_id?: string | null;
  orgId?: string | null;
  organizationId?: string | null;
  org_slug?: string | null;
  orgSlug?: string | null;
  organizationSlug?: string | null;
  org_role?: string | null;
  orgRole?: string | null;
  organizationRole?: string | null;
  org_permissions?: string[];
  orgPermissions?: string[];
  organizationPermissions?: string[];
  entitlements?: string[] | string;
  permissions?: string[];
  role?: string | null;
  broker_id?: string | null;
  brokerId?: string | null;
  red_id?: string | null;
  redId?: string | null;
  developer_id?: string | null;
  developerId?: string | null;
  owner_type?: QentrahOwnerType | string | null;
  owner_id?: string | string | null;
  [claim: string]: unknown;
};

// ─── Scope Catalog ────────────────────────────────────────────────────
// Single source of truth. Authorization package's QentrahOAuthScope
// is derived from this (the non-OIDC subset).

export const OAUTH_SCOPE_CATALOG: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: "openid", label: "Authenticate the current user with OpenID Connect" },
  { id: "profile", label: "Read basic profile information" },
  { id: "email", label: "Read the authenticated user's email address" },
  { id: "offline_access", label: "Keep the organization connected when nobody is actively using Qentrah" },
  { id: "clients:read", label: "Read client records available to the connected organization" },
  { id: "clients:create", label: "Create clients for the connected organization" },
  { id: "clients:update_own", label: "Update clients that belong to the connected organization" },
  { id: "clients:read_own", label: "Read clients that belong to the connected organization" },
  { id: "assets:read", label: "Read assets available to the connected organization" },
  { id: "assets:create_own", label: "Create assets for the connected organization" },
  { id: "assets:update_own", label: "Update assets that belong to the connected organization" },
  { id: "assets:delete_own", label: "Delete assets that belong to the connected organization" },
  { id: "assets:read_own", label: "Read assets that belong to the connected organization" },
] as const;

export type OAuthScopeId = (typeof OAUTH_SCOPE_CATALOG)[number]["id"];
export type OrganizationOAuthScopeId = Exclude<OAuthScopeId, "openid" | "profile" | "email">;

export const OAUTH_SCOPE_IDS: readonly OAuthScopeId[] =
  OAUTH_SCOPE_CATALOG.map((s) => s.id) as readonly OAuthScopeId[];

export const ORGANIZATION_OAUTH_SCOPE_IDS: readonly OrganizationOAuthScopeId[] =
  OAUTH_SCOPE_IDS.filter((s): s is OrganizationOAuthScopeId =>
    s !== "openid" && s !== "profile" && s !== "email",
  );

// ─── Scope Normalization ──────────────────────────────────────────────

export function normalizeScopes(input: string | readonly string[] | undefined): string[];
export function formatScopeString(scopes: readonly string[]): string;
export function diffScopes(requested: readonly string[], granted: readonly string[]): string[];

// ─── Authorization Types (from @qentrah/authorization) ────────────────

export type QentrahAuthorizationClientOptions = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: readonly string[];
  sourceApp?: "web" | "admin";
  popup?: { width?: number; height?: number; timeoutMs?: number };
  onEvent?: (event: QentrahAuthorizationEvent) => void;
};

export type QentrahAuthorizeOptions = Partial<
  Pick<QentrahAuthorizationClientOptions, "redirectUri" | "scopes" | "sourceApp">
> & {
  state?: string;
  nonce?: string;
  popup?: false | QentrahAuthorizationClientOptions["popup"];
};

export type QentrahAuthorizeResult = {
  code: string;
  state: string;
  redirectUri: string;
};

export type QentrahAuthorizeCodeResult = QentrahAuthorizeResult & {
  codeVerifier: string;
};

export type QentrahTokenSet = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken?: string;
};

export type QentrahTokenExchangeInput = {
  issuer: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientSecret?: string;
};

export type QentrahRefreshTokenInput = {
  issuer: string;
  clientId: string;
  refreshToken: string;
  clientSecret?: string;
};

export type QentrahRevokeTokenInput = {
  issuer: string;
  clientId: string;
  token: string;
  clientSecret?: string;
};

export type QentrahAuthorizationServerMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  jwks_uri?: string;
  response_types_supported?: string[];
  grant_types_supported?: string[];
  scopes_supported?: string[];
  code_challenge_methods_supported?: string[];
};

export type QentrahAuthorizationEvent =
  | { type: "authorize_url_created"; url: string }
  | { type: "popup_opened" }
  | { type: "popup_blocked" }
  | { type: "popup_closed" }
  | { type: "redirect_fallback"; url: string }
  | { type: "authorized"; result: QentrahAuthorizeResult };

// ─── Config Types ─────────────────────────────────────────────────────

export type TrustedOidcClient = {
  clientId: string;
  clientSecret?: string;
  name: string;
  redirectUrls: string[];
  type?: "public" | "web" | "native" | "user-agent-based";
  disabled?: boolean;
  skipConsent?: boolean;
  icon?: string;
  metadata?: Record<string, unknown> | null;
};

export type VerifyAccessTokenOptions = {
  issuer: string;
  audience: string | string[];
  jwksUrl?: string;
  scopes?: string[];
};

// ─── Permissions (org API key) ────────────────────────────────────────

export const ORGANIZATION_API_KEY_RESOURCES: readonly string[];
export const ORGANIZATION_API_KEY_ACTIONS: readonly string[];
// ... (keep existing permissions types and helpers)
```

---

## 4. Entry Point 2: `@qentrah/auth/server` — Server Runtime

**Runtime deps**: `better-auth`, `@qentrah/platform-core`, `@qentrah/brand-identity`
**Safe to import**: API routes, RSC, middleware, server-side only

```typescript
import type {
  AuthContext,
  AuthErrorCode,
  QentrahOidcClaims,
  ResourceOwner,
  TrustedOidcClient,
  VerifyAccessTokenOptions,
} from "@qentrah/auth";

// ─── Session Resolution ───────────────────────────────────────────────

export type AuthSessionResolver = () => Promise<{
  token: string;
  context: SessionContext;
} | null>;

export type QentrahAuthServerOptions = {
  appId: "web" | "admin" | "external-apps" | string;
  getOptionalSessionContext?: AuthSessionResolver;
};

/**
 * Creates a server-side auth context resolver.
 *
 * Invariants:
 * - `getOptionalAuth()` returns null when no session exists (never throws)
 * - `requireAuth()` throws `AuthError("UNAUTHORIZED")` when no session exists
 * - The returned `bridge` is the Better Auth ↔ Next.js bridge for session cookies
 *
 * Ordering: Call `getOptionalAuth()` or `requireAuth()` per-request, not at startup.
 */
export function createQentrahAuthServer(options: QentrahAuthServerOptions): {
  appId: string;
  bridge: ReturnType<typeof createNextAuthBridge>;
  getOptionalAuth(): Promise<AuthContext | null>;
  requireAuth(): Promise<AuthContext>;
};

/**
 * Standalone session resolver — use when you don't need the full server object.
 *
 * Error modes:
 * - Throws `AuthError("UNAUTHORIZED")` if `getOptionalSessionContext` returns null
 */
export async function requireAuth(args: {
  getOptionalSessionContext: AuthSessionResolver;
}): Promise<AuthContext>;

// ─── OIDC Provider Plugin ─────────────────────────────────────────────

export type QentrahOidcProviderOptions = {
  loginPage: string;
  consentPage?: string;
  issuer?: string;
  trustedClients?: TrustedOidcClient[];
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  allowDynamicClientRegistration?: boolean;
};

/**
 * Creates a Better Auth plugin that implements the OIDC Provider role.
 *
 * Invariants:
 * - `requirePKCE: true` — plain S256 only, no plain challenge
 * - `scopes` derived from OAUTH_SCOPE_IDS (single source of truth)
 * - `trustedClients` defaults to env-resolved clients when not provided
 *
 * Error modes:
 * - Throws at plugin-creation time if issuer/trustedClients are misconfigured
 */
export function createQentrahOAuthProviderPlugin(
  options: QentrahOidcProviderOptions,
): BetterAuthPlugin;

// ─── Resource Server: Token Verification ──────────────────────────────

/**
 * Verifies a Bearer access token and returns a fully-populated AuthContext.
 *
 * Invariants:
 * - Always validates signature via JWKS, issuer, and audience
 * - Optionally enforces scope requirements
 * - The returned AuthContext has `claims` populated from the raw JWT
 *
 * Error modes:
 * - Throws `AuthError("INVALID_TOKEN")` on any verification failure
 * - Throws `AuthError("INSUFFICIENT_SCOPE")` if scopes option is provided and token lacks them
 */
export async function verifyAccessToken(
  token: string,
  options: VerifyAccessTokenOptions,
): Promise<AuthContext>;

/**
 * Convenience: verify token + require specific scopes in one call.
 *
 * Error modes:
 * - Same as verifyAccessToken, plus `AuthError("INSUFFICIENT_SCOPE")` if scopes missing
 */
export async function verifyAccessTokenScopes(
  token: string,
  options: VerifyAccessTokenOptions & { scopes: string[] },
): Promise<AuthContext>;

// ─── Guards ───────────────────────────────────────────────────────────
// All guards are pure functions: AuthContext in → AuthContext out (or throw).
// They compose: requireAuth() → requireScopes() → requireOrganization()

/**
 * Throws `AuthError("INSUFFICIENT_SCOPE")` if context lacks any of the required scopes.
 * Returns context unchanged on success (enables chaining).
 */
export function requireScopes(
  context: AuthContext,
  requiredScopes: readonly string[],
): AuthContext;

/**
 * Throws `AuthError("FORBIDDEN")` if context lacks the entitlement.
 */
export function requireEntitlement(
  context: AuthContext,
  entitlement: string,
): AuthContext;

/**
 * Throws `AuthError("FORBIDDEN")` if:
 * - context has no organizationId, OR
 * - organizationId is provided and doesn't match context's
 */
export function requireOrganization(
  context: AuthContext,
  organizationId?: string | null,
): AuthContext;

/**
 * Throws `AuthError("FORBIDDEN")` if context doesn't match the resource owner
 * on any of: organizationId, brokerId, redId, ownerId.
 */
export function requireResourceOwner(
  context: AuthContext,
  resource: ResourceOwner,
): AuthContext;

/** Predicate: does context have this scope? */
export function hasScope(context: AuthContext, scope: string): boolean;

/** Predicate: does context have this entitlement? */
export function hasEntitlement(context: AuthContext, entitlement: string): boolean;

// ─── Claims Normalization ─────────────────────────────────────────────

/**
 * Converts raw OIDC claims into a normalized AuthContext.
 *
 * Invariants:
 * - `sub` claim is required; throws if missing
 * - Handles dual-format claims: `org_id`/`orgId`/`organizationId` → single `organizationId`
 * - Scope normalization: sorts, deduplicates, lowercases
 * - Entitlements merged from: explicit entitlements + permissions + org_permissions + role
 */
export function authContextFromClaims(
  claims: QentrahOidcClaims,
  token?: string,
): AuthContext;

/**
 * Converts a platform SessionContext into AuthContext.
 * Used by the Next.js session bridge.
 */
export function authContextFromSessionContext(
  session: SessionContext,
  token?: string,
): AuthContext;

// ─── Config ───────────────────────────────────────────────────────────

export function resolveAuthIssuer(
  env?: Record<string, string | undefined>,
): string;

export function resolveTrustedOidcClients(
  env?: Record<string, string | undefined>,
): TrustedOidcClient[];
```

---

## 5. Entry Point 3: `@qentrah/auth/client` — Browser Runtime

**Runtime deps**: `better-auth/react`, `@convex-dev/better-auth`, `@qentrah/brand-identity`
**Peer deps**: `react` (optional)
**Safe to import**: client components, `"use client"` modules

All exports are wrapped with `"use client"` at the module level.

```typescript
import type {
  AuthContext,
  QentrahAuthorizationClientOptions,
  QentrahAuthorizeOptions,
  QentrahAuthorizeCodeResult,
  QentrahTokenSet,
  QentrahTokenExchangeInput,
  QentrahRefreshTokenInput,
  QentrahRevokeTokenInput,
  QentrahAuthorizationServerMetadata,
} from "@qentrah/auth";

// ─── Better Auth Client (absorbs @qentrah/auth-client) ────────────────

/**
 * Creates a Better Auth React client with the appropriate plugin preset.
 *
 * Variants:
 * - "web"     → convexClient + organizationClient + emailOTPClient
 * - "admin"   → convexClient
 * - "external"→ convexClient
 *
 * Invariants:
 * - Returns the same client shape as `createAuthClient` from better-auth/react
 * - Each call creates a new client instance (not a singleton)
 *
 * Error modes:
 * - None at creation time; errors surface at call time (signIn, signOut, etc.)
 */
export function createAuthClient(variant?: "web" | "admin" | "external"): any;

// ─── Form Helpers ─────────────────────────────────────────────────────

export type EmailPasswordSignInInput = {
  email: string;
  password: string;
  callbackURL: string;
  rememberMe?: boolean;
};

/**
 * Signs in with email + password. Trims the email before sending.
 *
 * Error modes:
 * - Returns `{ error }` shape from Better Auth (does not throw)
 */
export function signInWithEmailPassword(
  client: { signIn: { email: (input: any) => Promise<{ error?: unknown | null }> } },
  input: EmailPasswordSignInInput,
): Promise<{ error?: unknown | null }>;

/**
 * Signs out the current user.
 *
 * Error modes:
 * - Throws on network/session errors
 */
export function signOut(
  client: { signOut: () => Promise<unknown> },
): Promise<unknown>;

// ─── Authorization Popup Flow (absorbs @qentrah/authorization) ────────

/**
 * Creates a client that manages the OAuth popup/redirect authorization flow.
 *
 * Invariants:
 * - PKCE S256 is always used (never plain)
 * - State is randomly generated per authorize call if not provided
 * - Popup opens centered on screen; falls back to redirect if blocked
 * - Popup timeout defaults to 5 minutes
 * - State mismatch between popup result and pending state → rejected
 *
 * Error modes:
 * - `AuthError("POPUP_BLOCKED")` — popup was blocked by browser, redirects instead
 * - `AuthError("ACCESS_DENIED")` — user closed the popup
 * - `AuthError("INVALID_STATE")` — state mismatch (CSRF protection)
 * - `AuthError("AUTHORIZATION_EXPIRED")` — popup timed out
 * - `AuthError("NETWORK_ERROR")` — network failure during flow
 */
export function createQentrahAuthorizationClient(
  options: QentrahAuthorizationClientOptions,
): {
  /** Opens popup (or redirects), waits for OAuth code, returns code + verifier */
  authorize(options?: QentrahAuthorizeOptions): Promise<QentrahAuthorizeCodeResult>;
  /** Builds the authorize URL without opening it (for custom flow control) */
  buildAuthorizeUrl(
    options?: QentrahAuthorizeOptions,
  ): Promise<{ url: string; state: string; codeVerifier: string }>;
};

// ─── Token Operations ─────────────────────────────────────────────────
// These are the "other half" of the OAuth flow: exchange the code, manage tokens.

/**
 * Exchanges an authorization code for tokens.
 *
 * Invariants:
 * - Always sends code_verifier for PKCE validation
 * - Client auth: uses Basic header if clientSecret provided, else client_id param
 *
 * Error modes:
 * - `AuthError("INVALID_RESPONSE")` — token endpoint returned unexpected shape
 * - `AuthError("AUTHORIZATION_EXPIRED")` — code expired
 * - `AuthError("ACCESS_DENIED")` — code rejected
 */
export function exchangeCode(input: QentrahTokenExchangeInput): Promise<QentrahTokenSet>;

/**
 * Refreshes an access token using a refresh token.
 *
 * Error modes: same as exchangeCode
 */
export function refreshToken(input: QentrahRefreshTokenInput): Promise<QentrahTokenSet>;

/**
 * Revokes a token (access or refresh).
 *
 * Error modes:
 * - `AuthError("INVALID_RESPONSE")` — revocation endpoint rejected
 */
export function revokeToken(input: QentrahRevokeTokenInput): Promise<void>;

/**
 * Fetches OAuth server metadata from /.well-known/oauth-authorization-server.
 *
 * Error modes:
 * - `AuthError("NETWORK_ERROR")` — metadata endpoint unreachable
 */
export function getMetadata(issuer: string): Promise<QentrahAuthorizationServerMetadata>;

// ─── PKCE Utilities ──────────────────────────────────────────────────

/**
 * Generates a PKCE S256 verifier + challenge pair.
 * Exposed for advanced use; most callers use createQentrahAuthorizationClient instead.
 */
export function createPkcePair(): Promise<{
  verifier: string;
  challenge: string;
  method: "S256";
}>;

// ─── React: Providers ────────────────────────────────────────────────

/**
 * Provides AuthContext to the component tree.
 * Mount once at the app root, typically with server-provided context.
 */
export function AuthProvider(props: {
  children: React.ReactNode;
  value: { context: AuthContext | null; token?: string | null };
}): React.ReactElement;

/**
 * Provides the authorization popup client to the component tree.
 * Only needed in apps that use the OAuth popup flow.
 */
export function QentrahAuthorizationProvider(props: {
  options: QentrahAuthorizationClientOptions;
  children: React.ReactNode;
}): React.ReactElement;

// ─── React: Hooks ────────────────────────────────────────────────────

/**
 * Returns the current auth context and token.
 * Returns `{ context: null, token: null }` when unauthenticated.
 *
 * Error modes: none (always returns a value)
 */
export function useAuth(): { context: AuthContext | null; token?: string | null };

/**
 * Returns the current auth context, or throws if unauthenticated.
 *
 * Error modes:
 * - Throws `AuthError("UNAUTHORIZED")` if no context
 */
export function useRequiredAuth(): AuthContext;

/**
 * Returns the auth context + scope/entitlement predicates.
 * Predicates return false when context is null (safe to call unconditionally).
 */
export function useAuthorization(): {
  context: AuthContext | null;
  hasScope(scope: string): boolean;
  hasEntitlement(entitlement: string): boolean;
};

/**
 * Returns the authorization popup client from QentrahAuthorizationProvider.
 *
 * Error modes:
 * - Throws if used outside QentrahAuthorizationProvider
 */
export function useQentrahAuthorization(): {
  authorize(options?: QentrahAuthorizeOptions): Promise<QentrahAuthorizeCodeResult>;
  buildAuthorizeUrl(
    options?: QentrahAuthorizeOptions,
  ): Promise<{ url: string; state: string; codeVerifier: string }>;
};

// ─── React: Components ───────────────────────────────────────────────

/**
 * Button that triggers the OAuth popup flow.
 * Handles pending state, loading text, and error forwarding.
 */
export function QentrahAuthorizeButton(props: {
  children?: React.ReactNode;
  options?: QentrahAuthorizeOptions;
  className?: string;
  onSuccess?(result: QentrahAuthorizeCodeResult): void;
  onError?(error: unknown): void;
}): React.ReactElement;
```

---

## 6. Usage Examples

### Example 1: Next.js API Route (Server)

```typescript
// app/api/assets/route.ts
import { requireAuth, requireScopes } from "@qentrah/auth/server";

export async function GET(req: Request) {
  const auth = await requireAuth({
    getOptionalSessionContext: () => getSessionFromRequest(req),
  });
  requireScopes(auth, ["assets:read"]);

  const assets = await db.assets.findMany({ where: { organizationId: auth.organizationId } });
  return Response.json(assets);
}
```

### Example 2: Resource Server (External API)

```typescript
// app/api/v1/partner/assets/route.ts
import { verifyAccessTokenScopes } from "@qentrah/auth/server";

export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new AuthError("UNAUTHORIZED", "Missing token");

  const auth = await verifyAccessTokenScopes(token, {
    issuer: process.env.QENTRAH_AUTH_ISSUER!,
    audience: "https://api.qentrah.com",
    scopes: ["assets:read"],
  });

  return Response.json(await listAssets(auth.organizationId!));
}
```

### Example 3: Server Component (RSC)

```typescript
// app/dashboard/page.tsx
import { createQentrahAuthServer } from "@qentrah/auth/server";
import { AuthProvider } from "@qentrah/auth/client";

const authServer = createQentrahAuthServer({
  appId: "web",
  getOptionalSessionContext: () => getServerSession(),
});

export default async function DashboardPage() {
  const context = await authServer.getOptionalAuth();

  return (
    <AuthProvider value={{ context, token: context?.token }}>
      <Dashboard />
    </AuthProvider>
  );
}
```

### Example 4: Client Component — Sign In

```typescript
// components/SignInForm.tsx
"use client";
import { createAuthClient, signInWithEmailPassword } from "@qentrah/auth/client";

const client = createAuthClient("web");

export function SignInForm() {
  const handleSubmit = async (email: string, password: string) => {
    const result = await signInWithEmailPassword(client, {
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (result.error) console.error(result.error);
  };

  return <form onSubmit={...}>...</form>;
}
```

### Example 5: Client Component — Scope Checking

```typescript
// components/AssetActions.tsx
"use client";
import { useAuthorization } from "@qentrah/auth/client";

export function AssetActions({ assetId }: { assetId: string }) {
  const { hasScope } = useAuthorization();

  return (
    <div>
      {hasScope("assets:read") && <ViewButton assetId={assetId} />}
      {hasScope("assets:update_own") && <EditButton assetId={assetId} />}
      {hasScope("assets:delete_own") && <DeleteButton assetId={assetId} />}
    </div>
  );
}
```

### Example 6: Partner OAuth Popup Flow

```typescript
// components/ConnectPartner.tsx
"use client";
import {
  createQentrahAuthorizationClient,
  QentrahAuthorizationProvider,
  QentrahAuthorizeButton,
  exchangeCode,
} from "@qentrah/auth/client";

const authClient = createQentrahAuthorizationClient({
  issuer: "https://auth.qentrah.com",
  clientId: "partner-app-123",
  redirectUri: "https://partner.example.com/callback",
  scopes: ["openid", "profile", "clients:read", "assets:read"],
  sourceApp: "web",
});

export function ConnectPartnerProvider({ children }: { children: React.ReactNode }) {
  return (
    <QentrahAuthorizationProvider options={authClient}>
      {children}
    </QentrahAuthorizationProvider>
  );
}

export function ConnectButton() {
  return (
    <QentrahAuthorizeButton
      onSuccess={async (result) => {
        const tokens = await exchangeCode({
          issuer: "https://auth.qentrah.com",
          clientId: "partner-app-123",
          code: result.code,
          redirectUri: "https://partner.example.com/callback",
          codeVerifier: result.codeVerifier,
        });
        await storeTokens(tokens);
      }}
      onError={(err) => console.error(err)}
    />
  );
}
```

### Example 7: Token Refresh

```typescript
// lib/token-refresh.ts
import { refreshToken } from "@qentrah/auth/client";

export async function refreshAccessToken(refreshTokenValue: string) {
  return refreshToken({
    issuer: "https://auth.qentrah.com",
    clientId: "partner-app-123",
    refreshToken: refreshTokenValue,
  });
}
```

### Example 8: Guard Chaining (Server)

```typescript
import { requireAuth, requireScopes, requireOrganization, requireResourceOwner } from "@qentrah/auth/server";

// Composable guard chain — each call returns AuthContext or throws
const auth = await requireAuth({ getOptionalSessionContext });
requireScopes(auth, ["clients:read"]);
requireOrganization(auth);
requireResourceOwner(auth, { organizationId: targetOrgId });

// auth is fully validated at this point
```

### Example 9: Type-Only Import (Shared Code)

```typescript
// packages/domain-contracts/src/organizationPermissions.ts
import type { AuthContext } from "@qentrah/auth";

export function mapPermissions(ctx: AuthContext) {
  return ctx.organizationPermissions.map(/* ... */);
}
```

---

## 7. What the Implementation Hides Behind the Seam

| Hidden concept | Where it lives | Why hide it |
|---|---|---|
| PKCE S256 generation (SHA-256 + base64url) | `client/pkce.ts` | Crypto boilerplate; callers just need a pair |
| Popup window lifecycle (open, poll-close, message listening, origin validation, timeout, cleanup) | `client/authorization.ts` | ~100 lines of DOM/event orchestration |
| Popup → redirect fallback | `client/authorization.ts` | Browser detection + `window.location.assign` |
| Better Auth plugin composition | `client/presets.ts` | Convex + Org + OTP plugin wiring is internal |
| Token endpoint HTTP (form-urlencoded POST, response parsing, error mapping) | `client/token.ts` | HTTP boilerplate + response shape normalization |
| OIDC authorize URL construction (query param assembly) | `client/url.ts` | URL building is an implementation detail |
| Claims dual-format normalization (`org_id`/`orgId`/`organizationId`) | `server/claims.ts` | Backward compat noise |
| JWKS URL derivation from issuer | `server/jwks.ts` | `/.well-known` convention |
| Env variable resolution with brand prefix fallback | `server/config/env.ts` | Env reading boilerplate |
| `@qentrah/platform-core/auth-next` bridge wiring | `server/session.ts` | Platform-specific session adapter |

---

## 8. Dependency Strategy

### Injected by caller (explicit, testable)

| Dependency | Where injected | Purpose |
|---|---|---|
| `issuer` | `createQentrahAuthServer`, `createQentrahAuthorizationClient`, `verifyAccessToken` | OIDC authority URL |
| `clientId` / `clientSecret` | `createQentrahAuthorizationClient`, `exchangeCode`, `refreshToken`, `revokeToken` | OAuth client credentials |
| `getOptionalSessionContext` | `createQentrahAuthServer` | Platform-specific session resolver |
| `loginPage` / `consentPage` | `createQentrahOAuthProviderPlugin` | OIDC UI routes |
| `redirectUri` | `createQentrahAuthorizationClient`, `exchangeCode` | OAuth redirect target |
| `scopes` | `createQentrahAuthorizationClient`, `verifyAccessToken` | Permission boundaries |

### Internal (never exposed)

| Dependency | Why internal |
|---|---|
| `better-auth` (all server plugins, `verifyAccessToken`, `oidcProvider`) | OIDC implementation detail |
| `@convex-dev/better-auth` (Convex client plugin) | Persistence layer choice |
| `@qentrah/brand-identity` (`brandLabel`, `brandProductName`) | UI copy, not auth logic |
| `@qentrah/platform-core/auth-next` (`createNextAuthBridge`) | Next.js session adapter |
| `crypto.subtle` (SHA-256 for PKCE) | Browser/WebCrypto API |
| `window` APIs (popup, message events) | Browser-only runtime |

---

## 9. Trade-offs

### High leverage

| Decision | Why it pays off |
|---|---|
| **Unified `AuthContext`** across server + client + authorization | One type flows through guards, hooks, and token verification. No mental model split. Callers learn one shape. |
| **Single `AuthError` class** with 14 discriminated codes | Catch blocks handle one error type. The `code` discriminant replaces two separate error hierarchies. |
| **`createAuthClient("web" \| "admin" \| "external")`** | Collapses 3 factory functions + 3 preset files into one parameterized function. Reduces API surface by 50%. |
| **Scope catalog as single source of truth** | Server (OIDC provider) and client (authorization popup) derive from the same catalog. Eliminates the duplicated `QENTRAH_OAUTH_SCOPES` array. |
| **`@qentrah/auth/client` absorbs both auth-client + authorization** | One import path for all browser auth. Eliminates the "which package?" confusion. |
| **Guard composability** (`requireAuth → requireScopes → requireOrganization`) | Each guard returns `AuthContext` on success, enabling fluent chaining. No nested try/catch needed. |

### Thin leverage (necessary but not transformative)

| Decision | Why it still matters |
|---|---|
| **Two React providers** (not one) | `AuthProvider` (session context) and `QentrahAuthorizationProvider` (OAuth popup) serve different concerns. Merging would create a bloated provider that most components don't need. Two is correct. |
| **`signInWithEmailPassword` / `signOut` helpers** | 2-3 line wrappers, but they normalize the interface so callers don't couple to Better Auth's API shape directly. Worth the 20 lines. |
| **Config resolution helpers** | Small, but centralize env variable reading with brand-prefix fallback. Prevents inconsistent resolution logic across apps. |

### Where consolidation sacrifices something

| Trade-off | Mitigation |
|---|---|
| **Error code normalization (snake_case → UPPER_CASE)** | Breaking change. Migration: `toAuthError()` adapter handles old error shapes. Codemod possible. |
| **`@qentrah/auth/client` bundles React as optional peer** | Non-React browser apps pull in unused React types. Mitigated by `peerDependenciesMeta: { react: { optional: true } }`. Tree-shaking eliminates the runtime code. |
| **Variant param for `createAuthClient`** | Previously you could import only `createWebAuthClient` to get only web plugins. With the variant param, all 3 plugin sets are in scope. Tree-shaking should handle this, but if not, bundle size increases for "admin" apps that import the web preset code. **Verify with bundle analysis before shipping.** |
| **PKCE exposed as standalone export** | Most callers should use `createQentrahAuthorizationClient` which handles PKCE internally. The standalone `createPkcePair` is an escape hatch — document it as "advanced use only." |
| **`@qentrah/authorization` package becomes empty** | After absorption, the package should be deprecated with a re-export shim that points to `@qentrah/auth/client`. Timeline: mark deprecated → remove after 2 releases. |

---

## 10. Migration Path

1. **Phase 1**: Create the consolidated `@qentrah/auth` with 3 entry points. Internal code still imports from old packages.
2. **Phase 2**: Add re-export shims in `@qentrah/auth-client` and `@qentrah/authorization` that forward to `@qentrah/auth/client`. Mark old packages as `"deprecated"` in package.json.
3. **Phase 3**: Migrate all consumer imports to `@qentrah/auth/*` subpaths. Grep for old imports.
4. **Phase 4**: Remove old packages from workspace.

---

## 11. package.json Exports

```jsonc
{
  "name": "@qentrah/auth",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./server": {
      "types": "./dist/server/index.d.ts",
      "import": "./dist/server/index.js"
    },
    "./client": {
      "types": "./dist/client/index.d.ts",
      "import": "./dist/client/index.js"
    }
  },
  "dependencies": {
    "@qentrah/brand-identity": "0.1.0",
    "@qentrah/platform-core": "0.1.0",
    "@convex-dev/better-auth": "^0.11.4",
    "better-auth": "1.5.6"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true }
  }
}
```

---

## 12. File Layout

```
packages/auth/src/
├── index.ts                          ← @qentrah/auth (types, errors, scopes)
├── types/
│   ├── index.ts
│   ├── context.ts                    ← AuthContext, ResourceOwner
│   ├── claims.ts                     ← QentrahOidcClaims
│   └── errors.ts                     ← AuthError, AuthErrorCode
├── scopes/
│   ├── index.ts
│   ├── catalog.ts                    ← OAUTH_SCOPE_CATALOG + normalization
│   └── permissions.ts                ← org API key permissions
├── server/
│   ├── index.ts                      ← @qentrah/auth/server
│   ├── session.ts                    ← createQentrahAuthServer, requireAuth
│   ├── guards.ts                     ← requireScopes, requireEntitlement, etc.
│   ├── claims.ts                     ← authContextFromClaims, authContextFromSessionContext
│   ├── oauth-provider.ts             ← createQentrahOAuthProviderPlugin
│   ├── verify.ts                     ← verifyAccessToken, verifyAccessTokenScopes
│   ├── jwks.ts                       ← resolveJwksUrl (internal)
│   └── config/
│       ├── env.ts                    ← readAuthEnv (internal)
│       ├── issuer.ts                 ← resolveAuthIssuer
│       └── clients.ts                ← resolveTrustedOidcClients
├── client/
│   ├── index.ts                      ← @qentrah/auth/client
│   ├── better-auth.ts                ← createAuthClient (absorbs presets)
│   ├── forms.ts                      ← signInWithEmailPassword, signOut
│   ├── authorization.ts              ← createQentrahAuthorizationClient (absorbed from @qentrah/authorization)
│   ├── token.ts                      ← exchangeCode, refreshToken, revokeToken, getMetadata
│   ├── pkce.ts                       ← createPkcePair (internal + exported for advanced use)
│   ├── url.ts                        ← buildAuthorizeUrl (internal)
│   ├── errors.ts                     ← QentrahAuthorizationError → mapped to AuthError (internal)
│   └── react/
│       ├── index.ts
│       ├── AuthProvider.tsx           ← AuthProvider, useAuth, useRequiredAuth, useAuthorization
│       ├── AuthorizationProvider.tsx  ← QentrahAuthorizationProvider, useQentrahAuthorization
│       └── AuthorizeButton.tsx        ← QentrahAuthorizeButton
```
