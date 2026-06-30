const VERIFIER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function randomString(length = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((byte) => VERIFIER_ALPHABET[byte % VERIFIER_ALPHABET.length]).join("");
}

export async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function createPkcePair() {
  const verifier = randomString(64);
  return {
    verifier,
    challenge: await sha256Base64Url(verifier),
    method: "S256" as const,
  };
}
