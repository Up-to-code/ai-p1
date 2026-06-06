export const MOBILE_AUTH_ENTRY_ROUTE = "/(auth)";
export const MOBILE_WORKSPACE_GATE_ROUTE = "/";
const MOBILE_WORKSPACE_CHOOSER_ROUTE = "/(auth)/choose-workspace";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function sanitizeAuthCallback(value: string | string[] | undefined) {
  const callback = firstSearchParam(value)?.trim();
  if (!callback) return MOBILE_WORKSPACE_GATE_ROUTE;

  if (!callback.startsWith("/") || callback.startsWith("//") || /^https?:\/\//i.test(callback)) {
    return MOBILE_WORKSPACE_GATE_ROUTE;
  }

  return callback;
}

export function authRouteWithCallback(route: "/(auth)" | "/(auth)/email" | "/(auth)/login" | "/(auth)/register", callbackURL: string) {
  const callback = sanitizeAuthCallback(callbackURL);
  return callback === route || callback === MOBILE_WORKSPACE_GATE_ROUTE
    ? route
    : `${route}?callbackURL=${encodeURIComponent(callback)}`;
}

export function mobilePostAuthRoute(input: {
  canAccessApp: boolean;
  workspaceStatus?: "loading" | "ready" | "needs_workspace" | "signed_out" | "error";
}) {
  if (!input.canAccessApp) return MOBILE_AUTH_ENTRY_ROUTE;
  if (input.workspaceStatus === "ready") return "/(app)";
  if (input.workspaceStatus === "needs_workspace" || input.workspaceStatus === "error") {
    return MOBILE_WORKSPACE_CHOOSER_ROUTE;
  }
  return MOBILE_WORKSPACE_GATE_ROUTE;
}
