import type { AuthContext } from "@anan/auth/server";

export function createMockAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    subject: "user_test",
    userId: "user_test",
    email: "user@example.com",
    name: "Test User",
    image: null,
    scopes: ["openid", "profile", "email"],
    entitlements: ["workspace:user"],
    organizationId: "org_test",
    organizationSlug: "test-org",
    organizationRole: "member",
    organizationPermissions: [],
    brokerId: null,
    redId: null,
    ownerType: null,
    ownerId: "org_test",
    isActive: true,
    claims: { sub: "user_test" },
    ...overrides,
  };
}

export function createMockSessionPayload(overrides: Partial<{
  authenticated: boolean;
  context: AuthContext | null;
  accessToken: string;
  expiresAtMs: number;
  scopes: string[];
  csrfToken: string;
}> = {}) {
  const context = overrides.context === undefined ? createMockAuthContext() : overrides.context;
  return {
    authenticated: overrides.authenticated ?? Boolean(context),
    context,
    accessToken: overrides.accessToken ?? "test-access-token",
    expiresAtMs: overrides.expiresAtMs ?? Date.now() + 300_000,
    scopes: overrides.scopes ?? context?.scopes ?? [],
    csrfToken: overrides.csrfToken ?? "test-csrf",
  };
}
