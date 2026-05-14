import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signAdminSession, verifyAdminCredential, verifyAdminSession } from "./admin-session";

const secret = "admin-auth-secret-that-is-long-enough-123";
const passwordHash = createHash("sha256").update("correct-password").digest("hex");

const env = {
  ADMIN_AUTH_SECRET: secret,
  ADMIN_AUTH_EMAIL: "admin@qentrah.com",
  ADMIN_AUTH_PASSWORD_SHA256: passwordHash,
  PLATFORM_ADMIN_EMAILS: "admin@qentrah.com",
};

describe("admin env session", () => {
  it("verifies configured env credentials and roles", () => {
    expect(verifyAdminCredential("ADMIN@qentrah.com", "correct-password", env)?.roles).toEqual(["platform_admin"]);
    expect(verifyAdminCredential("admin@qentrah.com", "wrong-password", env)).toBeNull();
  });

  it("signs and verifies an HttpOnly-cookie session payload", async () => {
    const identity = verifyAdminCredential("admin@qentrah.com", "correct-password", env);
    expect(identity).not.toBeNull();
    const token = await signAdminSession(identity!, env, 1_000);
    await expect(verifyAdminSession(token, env, 1_500)).resolves.toMatchObject({
      email: "admin@qentrah.com",
      roles: ["platform_admin"],
    });
  });

  it("rejects tampered and expired sessions", async () => {
    const identity = verifyAdminCredential("admin@qentrah.com", "correct-password", env);
    const token = await signAdminSession(identity!, env, 1_000);
    await expect(verifyAdminSession(`${token}x`, env, 1_500)).resolves.toBeNull();
    await expect(verifyAdminSession(token, env, 1000 * 60 * 60 * 5)).resolves.toBeNull();
  });
});
