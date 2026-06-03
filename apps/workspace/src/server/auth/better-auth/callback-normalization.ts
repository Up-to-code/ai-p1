const localizedAuthCallbackPattern = /^\/([a-z]{2})(\/.*)?$/u;

export function normalizeSocialSignInCallbackURL(callbackURL: unknown) {
  if (typeof callbackURL !== "string") return callbackURL;
  if (callbackURL === "/auth-callback") return callbackURL;

  const match = localizedAuthCallbackPattern.exec(callbackURL);
  const locale = match?.[1];
  const path = match?.[2] ?? "";
  if (!locale) return "/en/choose-org";

  if (path === "/choose-org") return `/${locale}/choose-org`;
  if (path === "/accept-invite" || path.startsWith("/accept-invite?")) return callbackURL;

  return `/${locale}/choose-org`;
}

export async function normalizeBetterAuthRequest(request: Request) {
  const url = new URL(request.url);
  if (request.method !== "POST" || !url.pathname.endsWith("/api/auth/sign-in/social")) {
    return request;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return request;

  const body = await request.clone().json().catch(() => undefined) as Record<string, unknown> | undefined;
  if (!body || typeof body !== "object" || !("callbackURL" in body)) return request;

  const normalizedCallbackURL = normalizeSocialSignInCallbackURL(body.callbackURL);
  if (normalizedCallbackURL === body.callbackURL) return request;

  const headers = new Headers(request.headers);
  headers.delete("content-length");
  const RequestCtor = request.constructor as typeof Request;

  return new RequestCtor(request.url, {
    method: request.method,
    body: JSON.stringify({ ...body, callbackURL: normalizedCallbackURL }),
    headers,
  });
}
