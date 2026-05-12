export type SecureCookieOptions = {
  name: string;
  value: string;
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  httpOnly?: boolean;
  secure?: boolean;
};

export function serializeSecureCookie(options: SecureCookieOptions): string {
  const parts = [
    `${encodeURIComponent(options.name)}=${encodeURIComponent(options.value)}`,
    `Path=${options.path ?? "/"}`,
    `SameSite=${options.sameSite ?? "Lax"}`,
  ];
  if (options.maxAgeSeconds !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`);
  if (options.httpOnly ?? true) parts.push("HttpOnly");
  if (options.secure ?? true) parts.push("Secure");
  return parts.join("; ");
}

export function serializeExpiredCookie(name: string, path = "/"): string {
  return serializeSecureCookie({ name, value: "", maxAgeSeconds: 0, path });
}
