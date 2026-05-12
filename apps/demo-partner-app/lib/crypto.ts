function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesText(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

function base64UrlEncode(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }
  const padded = value.replace(/-/gu, "+").replace(/_/gu, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", textBytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function aesKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", textBytes(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function signValue(value: string, secret: string) {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), textBytes(value));
  return `${value}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySignedValue(signedValue: string | undefined, secret: string) {
  if (!signedValue) return null;
  const index = signedValue.lastIndexOf(".");
  if (index <= 0) return null;
  const value = signedValue.slice(0, index);
  const signature = signedValue.slice(index + 1);
  const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), base64UrlDecode(signature), textBytes(value));
  return ok ? value : null;
}

export async function encryptJson(value: unknown, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await aesKey(secret),
    textBytes(JSON.stringify(value)),
  );
  return `${base64UrlEncode(iv)}.${base64UrlEncode(new Uint8Array(encrypted))}`;
}

export async function decryptJson<T>(value: string | undefined, secret: string): Promise<T | null> {
  if (!value) return null;
  const [iv, encrypted] = value.split(".");
  if (!iv || !encrypted) return null;
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64UrlDecode(iv) },
      await aesKey(secret),
      base64UrlDecode(encrypted),
    );
    return JSON.parse(bytesText(new Uint8Array(decrypted))) as T;
  } catch {
    return null;
  }
}
