const verifierAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function base64UrlEncode(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64url");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

export function createCodeVerifier(length = 64) {
  if (length < 43 || length > 128) {
    throw new Error("PKCE code verifier length must be between 43 and 128 characters.");
  }
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => verifierAlphabet[byte % verifierAlphabet.length]).join("");
}

export async function createCodeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export async function createPkcePair() {
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  return { verifier, challenge, method: "S256" as const };
}
