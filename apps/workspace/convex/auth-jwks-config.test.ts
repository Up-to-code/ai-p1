import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./auth.ts", import.meta.url)), "utf8");

describe("Better Auth JWKS configuration", () => {
  it("uses the Convex provider algorithm for OAuth and session JWTs", () => {
    expect(source).toContain('const AUTH_JWT_ALGORITHM = "RS256" as const');
    expect(source).toContain("keyPairConfig: { alg: AUTH_JWT_ALGORITHM }");
  });

  it("keeps incompatible-key recovery internal and enabled during migration", () => {
    expect(source).toContain("jwksRotateOnTokenGenerationError: true");
    expect(source).toContain("export const rotateKeys = internalAction");
    expect(source).toContain("await createAuth(ctx).api.rotateKeys()");
    expect(source).toContain("return { rotated: true, algorithm: AUTH_JWT_ALGORITHM }");
  });
});
