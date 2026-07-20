"use node";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function credentialSecret() {
  const secret =
    process.env.AUTOMATION_CREDENTIALS_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "AUTOMATION_CREDENTIALS_SECRET or BETTER_AUTH_SECRET is required.",
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptAutomationCredentials(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", credentialSecret(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    encryptedCredentials: Buffer.concat([encrypted, tag]).toString("base64url"),
    credentialIv: iv.toString("base64url"),
  };
}

export function decryptAutomationCredentials<T>(
  encryptedCredentials: string,
  credentialIv: string,
): T {
  const bytes = Buffer.from(encryptedCredentials, "base64url");
  if (bytes.length <= 16) throw new Error("Stored automation credentials are invalid.");
  const encrypted = bytes.subarray(0, bytes.length - 16);
  const tag = bytes.subarray(bytes.length - 16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    credentialSecret(),
    Buffer.from(credentialIv, "base64url"),
  );
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decrypted) as T;
}
