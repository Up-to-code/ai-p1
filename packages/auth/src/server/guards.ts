import { AuthError, type AuthContext, type ResourceOwner } from "../types";

export function requireScopes(context: AuthContext, requiredScopes: readonly string[]): AuthContext {
  const granted = new Set(context.scopes);
  const missing = requiredScopes.filter((scope) => !granted.has(scope));
  if (missing.length > 0) {
    throw new AuthError("INSUFFICIENT_SCOPE", `Required scope missing: ${missing.join(", ")}`);
  }
  return context;
}

export function requireEntitlement(context: AuthContext, entitlement: string): AuthContext {
  if (!context.entitlements.includes(entitlement)) {
    throw new AuthError("FORBIDDEN", `Required entitlement missing: ${entitlement}`);
  }
  return context;
}

export function requireOrganization(context: AuthContext, organizationId?: string | null): AuthContext {
  if (!context.organizationId) {
    throw new AuthError("FORBIDDEN", "Active organization required");
  }
  if (organizationId && context.organizationId !== organizationId) {
    throw new AuthError("FORBIDDEN", "Cannot access another organization");
  }
  return context;
}

export function requireResourceOwner(context: AuthContext, resource: ResourceOwner): AuthContext {
  if (resource.organizationId && context.organizationId === resource.organizationId) {
    return context;
  }
  if (resource.brokerId && context.brokerId === resource.brokerId) {
    return context;
  }
  if (resource.redId && context.redId === resource.redId) {
    return context;
  }
  if (resource.ownerId && context.ownerId === resource.ownerId) {
    return context;
  }
  throw new AuthError("FORBIDDEN", "Cannot access a resource owned by another principal");
}

export function hasScope(context: AuthContext, scope: string): boolean {
  return context.scopes.includes(scope);
}

export function hasEntitlement(context: AuthContext, entitlement: string): boolean {
  return context.entitlements.includes(entitlement);
}
