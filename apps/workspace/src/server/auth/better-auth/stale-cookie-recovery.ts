const staleSessionPaths = new Set([
  "/api/auth/get-session",
  "/api/auth/convex/token",
]);

const authCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth.convex_jwt",
  "__Secure-better-auth.convex_jwt",
];

function clearCookieHeader(name: string) {
  return `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function isRecoverableAuthSessionPath(request: Request) {
  return staleSessionPaths.has(new URL(request.url).pathname);
}

export function staleAuthCookieRecoveryResponse(request: Request, response: Response) {
  if (response.status < 500 || !isRecoverableAuthSessionPath(request)) return response;

  return staleAuthCookieRecoveryFallback(request, response.headers);
}

export function staleAuthCookieRecoveryFallback(request: Request, responseHeaders?: Headers) {
  const headers = new Headers(responseHeaders);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  for (const cookieName of authCookieNames) {
    headers.append("set-cookie", clearCookieHeader(cookieName));
  }

  const pathname = new URL(request.url).pathname;
  return new Response(pathname.endsWith("/get-session") ? "null" : JSON.stringify({ token: null }), {
    status: pathname.endsWith("/get-session") ? 200 : 401,
    headers,
  });
}
