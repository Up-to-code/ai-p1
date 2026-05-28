function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

export function assertSafeWebhookUrl(value: string) {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase().replace(/^\[/u, "").replace(/\]$/u, "");
  const privateHost = hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal" ||
    isPrivateIpv4(hostname) ||
    hostname === "::1" ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe80:");

  if (url.protocol !== "https:" || url.username || url.password || privateHost) {
    throw new Error("Webhook URL must be HTTPS and cannot target local or private network hosts.");
  }
}
