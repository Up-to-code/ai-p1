import {
  hasEntitlement as baseHasEntitlement,
  requireEntitlement as baseRequireEntitlement,
  type AuthContext,
} from "@anan/auth/server";

export function hasEntitlement(context: AuthContext | null | undefined, entitlement: string): boolean {
  return Boolean(context && baseHasEntitlement(context, entitlement));
}

export function requireEntitlement(context: AuthContext, entitlement: string): AuthContext {
  return baseRequireEntitlement(context, entitlement);
}
