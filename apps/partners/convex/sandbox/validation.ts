import { ConvexError } from "convex/values";
import { sandboxScopes } from "./types";

export function assertSandboxScope(scope: string) {
  if (!sandboxScopes.includes(scope)) {
    throw new ConvexError({ code: "INVALID_SCOPE", message: `Sandbox scope is not supported: ${scope}` });
  }
}

export function normalizeRequestedScopes(scopes: string[]) {
  const requested = scopes.map((scope) => scope.trim()).filter(Boolean);
  const normalized = requested.length ? [...new Set(requested)].sort() : sandboxScopes;
  for (const scope of normalized) assertSandboxScope(scope);
  return normalized;
}
