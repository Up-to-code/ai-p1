import type { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import { AuthError, type AuthContext } from "@qentrah/auth";

type GenericCtx =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

function identityToAuthContext(
  identity: Awaited<ReturnType<GenericCtx["auth"]["getUserIdentity"]>>,
): AuthContext {
  if (!identity) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }

  return {
    subject: identity.subject,
    userId: identity.subject,
    email: identity.email ?? null,
    name: (identity.name as string | null) ?? identity.email ?? null,
    image: (identity.pictureUrl as string | null) ?? null,
    scopes: [],
    entitlements: [],
    organizationId: null,
    organizationSlug: null,
    organizationRole: null,
    organizationPermissions: [],
    isActive: true,
    claims: {
      sub: identity.subject,
      email: identity.email as string | null,
      name: identity.name as string | null,
      picture: identity.pictureUrl as string | null,
    },
  };
}

export async function requireAuth(ctx: GenericCtx): Promise<AuthContext> {
  const identity = await ctx.auth.getUserIdentity();
  return identityToAuthContext(identity);
}

export async function getAuth(ctx: GenericCtx): Promise<AuthContext | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identityToAuthContext(identity);
}
