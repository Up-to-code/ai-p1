import { createHmac, timingSafeEqual } from "node:crypto";

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/gu, "+").replace(/_/gu, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function base64UrlEncode(input: Buffer) {
  return input.toString("base64").replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

export function verifyTamaraWebhookToken(token: string, notificationToken: string, now = Math.floor(Date.now() / 1000)) {
  if (!token || !notificationToken) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const expectedSignature = base64UrlEncode(
    createHmac("sha256", notificationToken).update(`${header}.${payload}`).digest(),
  );
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload).toString("utf8")) as { exp?: number; nbf?: number };
    if (decoded.exp && decoded.exp < now) return false;
    if (decoded.nbf && decoded.nbf > now) return false;
    return true;
  } catch {
    return false;
  }
}
