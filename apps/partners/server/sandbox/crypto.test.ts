import { describe, expect, it } from "vitest";
import { pkceS256, sandboxToken, sha256 } from "./crypto";

describe("sandbox crypto helpers", () => {
  it("hashes tokens without returning the raw token", () => {
    const token = sandboxToken("sandbox_access");
    expect(token).toMatch(/^sandbox_access_/);
    expect(sha256(token)).not.toBe(token);
    expect(sha256(token)).toBe(sha256(token));
  });

  it("uses S256 PKCE challenge format", () => {
    expect(pkceS256("verifier")).toBe(sha256("verifier"));
  });
});
