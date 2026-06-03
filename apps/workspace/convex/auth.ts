import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";

type WorkOSAuthUser = NonNullable<Awaited<ReturnType<AuthKit<DataModel>["getAuthUser"]>>>;

export type WorkspaceAuthUser = WorkOSAuthUser & {
  _id: string;
  name?: string;
};

const authFunctions: AuthFunctions = internal.auth;

const additionalWorkOSEventTypes = [
  "organization.updated",
  "organization_membership.created",
  "organization_membership.updated",
  "organization_membership.deleted",
  "api_key.created",
  "api_key.revoked",
] as const;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
  authFunctions,
  additionalEventTypes: [...additionalWorkOSEventTypes],
});

async function requireAuthUser(ctx: QueryCtx | MutationCtx): Promise<WorkspaceAuthUser> {
  const user = await authKit.getAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated.");
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
  return {
    ...user,
    _id: user.id,
    name,
  };
}

export const authComponent = {
  getAuthUser: requireAuthUser,
};

export const getAuthUser = requireAuthUser;
export const { backfillUsers } = authKit.utils();
export const { authKitEvent } = authKit.events({
  "user.created": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "user.updated": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "user.deleted": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "organization.updated": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "organization_membership.created": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "organization_membership.updated": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "organization_membership.deleted": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "api_key.created": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
  "api_key.revoked": async (ctx, event) => {
    await ctx.runMutation(internal.workosAuth.projectAuthKitEvent, {
      event: event.event,
      data: event.data,
    });
  },
});
export const { authKitAction } = authKit.actions({
  authentication: async (_ctx, _action, response) => response.allow(),
  userRegistration: async (_ctx, _action, response) => response.allow(),
});
