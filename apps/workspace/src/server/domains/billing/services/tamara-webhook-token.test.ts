import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyTamaraWebhookToken } from "./tamara-webhook-token";

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

function sign(payload: Record<string, unknown>, secret: string) {
  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "HS256" }));
  const body = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64Url(signature)}`;
}

describe("Tamara webhook token verification", () => {
  it("accepts valid HS256 notification tokens", () => {
    const token = sign({ iss: "Tamara", exp: 2_000, iat: 1_000 }, "notification-secret");
    expect(verifyTamaraWebhookToken(token, "notification-secret", 1_500)).toBe(true);
  });

  it("rejects invalid and expired tokens", () => {
    const token = sign({ iss: "Tamara", exp: 1_000 }, "notification-secret");
    expect(verifyTamaraWebhookToken(token, "wrong-secret", 900)).toBe(false);
    expect(verifyTamaraWebhookToken(token, "notification-secret", 1_001)).toBe(false);
    expect(verifyTamaraWebhookToken("not-a-jwt", "notification-secret", 900)).toBe(false);
  });
});
