import { describe, expect, it } from "vitest";
import { resolveConvexAuthConfigEnv } from "./auth.config";

describe("Convex auth config environment", () => {
  it("uses the WorkOS client id and default API hostname", () => {
    expect(resolveConvexAuthConfigEnv({
      WORKOS_CLIENT_ID: " client_123 ",
    })).toEqual({
      clientId: "client_123",
      apiBaseUrl: "https://api.workos.com",
      jwksUrl: "https://api.workos.com/sso/jwks/client_123",
    });
  });

  it("supports WorkOS API hostname overrides", () => {
    expect(resolveConvexAuthConfigEnv({
      NEXT_PUBLIC_WORKOS_CLIENT_ID: "client_public",
      WORKOS_API_HOSTNAME: "api.eu.workos.com",
    })).toEqual({
      clientId: "client_public",
      apiBaseUrl: "https://api.eu.workos.com",
      jwksUrl: "https://api.eu.workos.com/sso/jwks/client_public",
    });
  });
});
