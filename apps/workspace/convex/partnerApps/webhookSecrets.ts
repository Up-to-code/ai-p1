import { partnerAppsRuntimeConfig } from "../../src/packages/config/partner-apps";

export function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) throw new Error("Invalid encrypted webhook secret.");
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

async function webhookSecretEncryptionKey() {
  const secret = partnerAppsRuntimeConfig.webhookSecretEncryptionKey.trim();
  if (!secret) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return await crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function protectWebhookSecret(secret: string) {
  const key = await webhookSecretEncryptionKey();
  if (!key) throw new Error("Webhook secret encryption key is required.");

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(secret),
  );
  return `aesgcm:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

export async function revealWebhookSecret(storedSecret: string) {
  if (storedSecret.startsWith("plain:")) return storedSecret.slice("plain:".length);
  if (!storedSecret.startsWith("aesgcm:")) return storedSecret;

  const [, ivHex, ciphertextHex] = storedSecret.split(":");
  const key = await webhookSecretEncryptionKey();
  if (!key || !ivHex || !ciphertextHex) {
    throw new Error("Webhook secret encryption key is required.");
  }

  const secret = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBytes(ivHex) },
    key,
    hexToBytes(ciphertextHex),
  );
  return new TextDecoder().decode(secret);
}

export async function buildWebhookSignature(secret: string, timestamp: number, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  return `v1=${bytesToHex(new Uint8Array(signature))}`;
}

export function randomWebhookSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `whsec_${bytesToHex(bytes)}`;
}
