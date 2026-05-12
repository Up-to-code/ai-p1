const verifierAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

export function createCodeVerifier(length = 64) {
  if (length < 43 || length > 128) {
    throw new Error("PKCE code verifier length must be between 43 and 128 characters.");
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => verifierAlphabet[byte % verifierAlphabet.length]).join("");
}

export async function createCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export async function createPkcePair() {
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  return { verifier, challenge, method: "S256" as const };
}
