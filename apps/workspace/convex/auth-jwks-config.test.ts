import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

const source = read("./auth.ts");
const runtimeSource = read("./auth/runtime.ts");
const oauthSource = read("./auth/oauth.ts");
const jwksRouteSource = read("../src/app/api/auth/jwks/route.ts");
const metadataSource = read("../src/app/.well-known/oauth-authorization-server/api/auth/route.ts");

describe("Better Auth JWKS configuration", () => {
  it("uses the Convex provider algorithm for OAuth and session JWTs", () => {
    expect(runtimeSource).toContain('AUTH_JWT_ALGORITHM = "RS256" as const');
    expect(oauthSource).toContain("keyPairConfig: { alg: AUTH_JWT_ALGORITHM }");
  });

  it("publishes the Convex-owned keyset at the issuer's advertised JWKS URL", () => {
    expect(jwksRouteSource).toContain("/api/auth/convex/jwks");
    expect(jwksRouteSource).toContain('alg: z.literal("RS256")');
    expect(metadataSource).toContain("jwks_uri: topology.jwksUrl");
  });

  it("keeps incompatible-key recovery internal and enabled during migration", () => {
    expect(source).toContain("jwksRotateOnTokenGenerationError: true");
    expect(source).toContain("export const rotateKeys = internalAction");
    expect(source).toContain("await createAuth(ctx).api.rotateKeys()");
    expect(source).toContain("return { rotated: true, algorithm: AUTH_JWT_ALGORITHM }");
  });
});
