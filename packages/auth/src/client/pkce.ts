const encoder = new TextEncoder();
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlEncode(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    output += BASE64URL_ALPHABET[(triple >> 18) & 0x3f];
    output += BASE64URL_ALPHABET[(triple >> 12) & 0x3f];
    if (index + 1 < bytes.length) output += BASE64URL_ALPHABET[(triple >> 6) & 0x3f];
    if (index + 2 < bytes.length) output += BASE64URL_ALPHABET[triple & 0x3f];
  }
  return output;
}

export function createRandomString(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64UrlEncode(bytes);
}

export async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = createRandomString(32);
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(new Uint8Array(digest)),
  };
}
