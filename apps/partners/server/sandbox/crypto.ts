import { createHash, randomBytes } from "node:crypto";

export function sandboxToken(prefix: string) {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function pkceS256(verifier: string) {
  return sha256(verifier);
}
