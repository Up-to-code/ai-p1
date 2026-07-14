const MAX_ENCRYPTED_JSON_BYTES = 64 * 1024;
const MAX_TEXT_BYTES = 32 * 1024;
const REDACTED_TEXT = "[encrypted]";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) throw new Error("Invalid encrypted organization data.");
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function organizationDataSecret() {
  return process.env.ORGANIZATION_DATA_ENCRYPTION_KEY?.trim() ?? "";
}

async function organizationDataKey() {
  const secret = organizationDataSecret();
  if (secret.length < 32) {
    throw new Error("ORGANIZATION_DATA_ENCRYPTION_KEY must be configured before storing sensitive organization data.");
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function aad(organizationId: string, purpose: string) {
  return new TextEncoder().encode(`${organizationId}:${purpose}:v1`);
}

export function redactSensitiveText(value: string, maxLength = 240) {
  const withoutSecrets = value
    .replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/-]+=*/gu, "[redacted-token]")
    .replace(/\b(?:sk|pk|whsec|qentrah)_[A-Za-z0-9._-]{12,}\b/gu, "[redacted-secret]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/gu, "[redacted-phone]");
  return withoutSecrets.length > maxLength ? `${withoutSecrets.slice(0, maxLength)}...` : withoutSecrets;
}

export function encryptedPlaceholder() {
  return REDACTED_TEXT;
}

export async function protectOrganizationText(organizationId: string, purpose: string, text: string) {
  const encoded = new TextEncoder().encode(text);
  if (encoded.byteLength > MAX_TEXT_BYTES) {
    throw new Error("Sensitive text is too large to store.");
  }
  const key = await organizationDataKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad(organizationId, purpose) }, key, encoded);
  return `org-aesgcm:v1:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

/** Stable, non-reversible Organization-scoped lookup key for normalized PII. */
export async function organizationLookupFingerprint(organizationId: string, purpose: string, value: string) {
  const secret = organizationDataSecret();
  if (secret.length < 32) {
    throw new Error("ORGANIZATION_DATA_ENCRYPTION_KEY must be configured before fingerprinting sensitive organization data.");
  }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${organizationId}:${purpose}:v1:${value}`));
  return `org-hmac:v1:${bytesToHex(new Uint8Array(signature))}`;
}

export async function revealOrganizationText(organizationId: string, purpose: string, stored: string | undefined, fallback = "") {
  if (!stored) return fallback;
  if (!stored.startsWith("org-aesgcm:")) return stored;
  const [, version, ivHex, ciphertextHex] = stored.split(":");
  if (version !== "v1" || !ivHex || !ciphertextHex) throw new Error("Invalid encrypted organization data.");
  const key = await organizationDataKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBytes(ivHex), additionalData: aad(organizationId, purpose) },
    key,
    hexToBytes(ciphertextHex),
  );
  return new TextDecoder().decode(plaintext);
}

export async function protectOrganizationJson(organizationId: string, purpose: string, value: unknown) {
  const text = JSON.stringify(value ?? null);
  if (new TextEncoder().encode(text).byteLength > MAX_ENCRYPTED_JSON_BYTES) {
    throw new Error("Sensitive JSON payload is too large to store.");
  }
  return protectOrganizationText(organizationId, purpose, text);
}

export async function revealOrganizationJson<T>(organizationId: string, purpose: string, stored: string | undefined, fallback: T): Promise<T> {
  if (!stored) return fallback;
  const text = await revealOrganizationText(organizationId, purpose, stored);
  return JSON.parse(text) as T;
}
