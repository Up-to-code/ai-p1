import { ConvexError } from "convex/values";

export function normalizeRedirectUris(redirectUris: string[]) {
  const unique = [...new Set(redirectUris.map((uri) => uri.trim()).filter(Boolean))];
  if (unique.length === 0) {
    throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "At least one redirect URI is required" });
  }
  for (const uri of unique) {
    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "Redirect URI must be a valid URL" });
    }
    const isLoopback = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname);
    if (parsed.hash || parsed.username || parsed.password) {
      throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "Redirect URI must not include fragments or credentials" });
    }
    if (parsed.protocol !== "https:" && !isLoopback) {
      throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "Redirect URI must use HTTPS except localhost loopback." });
    }
  }
  return unique;
}

export function normalizeScopes(scopes: string[]) {
  const normalized = [...new Set(scopes.map((scope) => scope.trim()).filter(Boolean))].sort();
  if (normalized.length === 0) {
    throw new ConvexError({ code: "INVALID_SCOPE", message: "At least one scope is required" });
  }
  return normalized;
}

export function assertPartnerOwnsApp(app: { partnerAuthSubject: string } | null, authSubject: string) {
  if (!app || app.partnerAuthSubject !== authSubject) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Partner app not found" });
  }
}
