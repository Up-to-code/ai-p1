import type { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

type GenericCtx =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

type ClerkAuthUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: number;
  updatedAt: number;
  orgId: string | null;
  orgRole: string | null;
};

function identityToUser(identity: Awaited<ReturnType<GenericCtx["auth"]["getUserIdentity"]>>): ClerkAuthUser {
  if (!identity) {
    throw new Error("Authentication required.");
  }

  const subject = identity.subject;
  const email = identity.email ?? "";
  const name = identity.name ?? email ?? subject;

  return {
    _id: subject,
    id: subject,
    name,
    email,
    emailVerified: Boolean(identity.emailVerified),
    image: identity.pictureUrl ?? null,
    createdAt: 0,
    updatedAt: 0,
    orgId: (identity as Record<string, unknown>)["org_id"] as string | null
      ?? (identity as Record<string, unknown>)["orgId"] as string | null
      ?? null,
    orgRole: (identity as Record<string, unknown>)["org_role"] as string | null
      ?? (identity as Record<string, unknown>)["orgRole"] as string | null
      ?? null,
  };
}

export const clerkAuthComponent = {
  getAuthUser: async (ctx: GenericCtx) => identityToUser(await ctx.auth.getUserIdentity()),
  safeGetAuthUser: async (ctx: GenericCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? identityToUser(identity) : null;
  },
  getAuth: async (_createAuth: unknown, _ctx: GenericCtx) => ({
    auth: { api: {} },
    headers: new Headers(),
  }),
  clientApi: () => ({
    getAuthUser: async (ctx: GenericCtx) => identityToUser(await ctx.auth.getUserIdentity()),
  }),
};

export const createAuth = () => ({ api: {} });
export const options = {};
export const getAuthUser = clerkAuthComponent.getAuthUser;

export type { ClerkAuthUser };
