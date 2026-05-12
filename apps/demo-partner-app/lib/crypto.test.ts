import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson, signValue, verifySignedValue } from "./crypto";

const secret = "abcdefghijklmnopqrstuvwxyz123456";

describe("cookie crypto", () => {
  it("round-trips encrypted token JSON", async () => {
    const encrypted = await encryptJson({ access_token: "access", organizationId: "org_1" }, secret);

    await expect(decryptJson(encrypted, secret)).resolves.toEqual({ access_token: "access", organizationId: "org_1" });
  });

  it("fails encrypted token reads with the wrong secret", async () => {
    const encrypted = await encryptJson({ access_token: "access" }, secret);

    await expect(decryptJson(encrypted, `${secret}x`)).resolves.toBeNull();
  });

  it("signs and verifies short-lived OAuth cookies", async () => {
    const signed = await signValue("state-123", secret);

    await expect(verifySignedValue(signed, secret)).resolves.toBe("state-123");
    await expect(verifySignedValue(signed, `${secret}x`)).resolves.toBeNull();
  });
});
