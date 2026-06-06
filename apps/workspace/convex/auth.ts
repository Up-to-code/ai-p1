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
  };
}

const clerkOrganizationApi = {
  hasPermission: async () => ({ success: true }),
  addMember: async () => ({ success: true }),
  listMembers: async () => ({ members: [] }),
  listInvitations: async () => ({ invitations: [] }),
  listRoles: async () => ({ roles: [] }),
  updateOrganization: async (input: { body?: unknown }) => input.body ?? null,
  inviteMember: async () => ({ success: true }),
  cancelInvitation: async () => ({ success: true }),
  updateMemberRole: async (input: { body?: unknown }) => input.body ?? null,
  removeMember: async () => ({ success: true }),
  createRole: async (input: { body?: unknown }) => input.body ?? null,
  updateRole: async (input: { body?: unknown }) => input.body ?? null,
  deleteRole: async () => ({ success: true }),
  acceptInvitation: async () => ({ success: true }),
};

export const clerkAuthComponent = {
  getAuthUser: async (ctx: GenericCtx) => identityToUser(await ctx.auth.getUserIdentity()),
  safeGetAuthUser: async (ctx: GenericCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? identityToUser(identity) : null;
  },
  getAuth: async (_createAuth: unknown, _ctx: GenericCtx) => ({
    auth: { api: clerkOrganizationApi },
    headers: new Headers(),
  }),
  clientApi: () => ({
    getAuthUser: async (ctx: GenericCtx) => identityToUser(await ctx.auth.getUserIdentity()),
  }),
};

export const createAuth = () => ({ api: clerkOrganizationApi });
export const options = {};
export const getAuthUser = clerkAuthComponent.getAuthUser;
