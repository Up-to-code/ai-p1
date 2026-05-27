export function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function sanitizeAuthCallback(value: string | string[] | undefined) {
  const callback = firstSearchParam(value)?.trim();
  if (!callback) return "/";

  if (!callback.startsWith("/") || callback.startsWith("//") || /^https?:\/\//i.test(callback)) {
    return "/";
  }

  return callback;
}

export function authRouteWithCallback(route: "/(auth)/login" | "/(auth)/register", callbackURL: string) {
  const callback = sanitizeAuthCallback(callbackURL);
  return callback === route || callback === "/"
    ? route
    : `${route}?callbackURL=${encodeURIComponent(callback)}`;
}
