import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  canPerformOrganizationAction,
  getOrganizationRole,
  hasOrganizationMembership,
  type OrganizationRole,
} from "../permissions";
import { requireServerActor, type ServerActor } from "./actor";

const MAX_ACTOR_SPACE_MEMBERSHIPS = 500;

type SpaceAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Space = Doc<"spaces">;

export type SpaceAccessErrorCode =
  | "ORGANIZATION_ACCESS_DENIED"
  | "SPACE_ACCESS_DENIED"
  | "SPACE_CREATE_DENIED";

export interface SpaceAccess {
  readonly actor: ServerActor;
  readonly organizationId: string;
  readonly organizationRole: OrganizationRole | null;
  canDiscover(space: Space): boolean;
  canRead(space: Space): boolean;
  canUpdate(space: Space): boolean;
  canDelete(space: Space): boolean;
  filterDiscoverable(spaces: readonly Space[]): Space[];
  filterReadable(spaces: readonly Space[]): Space[];
  assertCanDiscover(space: Space): void;
  assertCanRead(space: Space): void;
  assertCanUpdate(space: Space): void;
  assertCanDelete(space: Space): void;
  assertCanCreate(): Promise<void>;
}

function isActiveSpace(space: Space, organizationId: string): boolean {
  return (
    space.organizationId === organizationId &&
    !space.deletedAt &&
    space.recordState !== "deleted"
  );
}

function accessError(
  code: SpaceAccessErrorCode,
  message: string,
  organizationId: string,
): ConvexError<{
  code: SpaceAccessErrorCode;
  message: string;
  organizationId: string;
}> {
  return new ConvexError({ code, message, organizationId });
}

export async function resolveSpaceAccess(
  ctx: SpaceAccessCtx,
  organizationId: string,
): Promise<SpaceAccess> {
  const actor = await requireServerActor(ctx);
  const organizationRole = await getOrganizationRole(
    ctx,
    organizationId,
    actor.userId,
  );

  if (
    !organizationRole &&
    !(await hasOrganizationMembership(ctx, organizationId, actor.userId))
  ) {
    throw accessError(
      "ORGANIZATION_ACCESS_DENIED",
      "You are not a member of this organization.",
      organizationId,
    );
  }

  const memberships = await ctx.db
    .query("spaceMembers")
    .withIndex("by_user_id", (q) =>
      q.eq("organizationId", organizationId).eq("userId", actor.userId),
    )
    .take(MAX_ACTOR_SPACE_MEMBERSHIPS);
  const spaceRoles = new Map(
    memberships
      .filter(
        (membership) =>
          !membership.deletedAt && membership.recordState !== "deleted",
      )
      .map((membership) => [membership.spaceId, membership.role] as const),
  );

  const canDiscover = (space: Space): boolean => {
    if (!isActiveSpace(space, organizationId)) return false;
    if (organizationRole === "owner" || spaceRoles.has(space._id)) {
      return true;
    }
    return space.visibility === "public" || space.visibility === "request_only";
  };

  const canRead = (space: Space): boolean => {
    if (!isActiveSpace(space, organizationId)) return false;
    if (organizationRole === "owner" || spaceRoles.has(space._id)) {
      return true;
    }
    return space.visibility === "public";
  };

  const canUpdate = (space: Space): boolean => {
    if (!isActiveSpace(space, organizationId)) return false;
    if (organizationRole === "owner" || organizationRole === "admin") {
      return true;
    }
    const role = spaceRoles.get(space._id);
    return role === "admin" || role === "member";
  };

  const canDelete = (space: Space): boolean =>
    isActiveSpace(space, organizationId) && organizationRole === "owner";

  return {
    actor,
    organizationId,
    organizationRole,
    canDiscover,
    canRead,
    canUpdate,
    canDelete,
    filterDiscoverable: (spaces) => spaces.filter(canDiscover),
    filterReadable: (spaces) => spaces.filter(canRead),
    assertCanDiscover: (space) => {
      if (!canDiscover(space)) {
        throw accessError(
          "SPACE_ACCESS_DENIED",
          "You do not have access to discover this space.",
          organizationId,
        );
      }
    },
    assertCanRead: (space) => {
      if (!canRead(space)) {
        throw accessError(
          "SPACE_ACCESS_DENIED",
          "You do not have access to read this space.",
          organizationId,
        );
      }
    },
    assertCanUpdate: (space) => {
      if (!canUpdate(space)) {
        throw accessError(
          "SPACE_ACCESS_DENIED",
          "You do not have permission to update work in this space.",
          organizationId,
        );
      }
    },
    assertCanDelete: (space) => {
      if (!canDelete(space)) {
        throw accessError(
          "SPACE_ACCESS_DENIED",
          "You do not have permission to delete work in this space.",
          organizationId,
        );
      }
    },
    assertCanCreate: async () => {
      const allowed = await canPerformOrganizationAction(
        ctx,
        organizationId,
        actor.userId,
        "space",
        "create",
      );
      if (!allowed) {
        throw accessError(
          "SPACE_CREATE_DENIED",
          "You do not have permission to create spaces in this organization.",
          organizationId,
        );
      }
    },
  };
}
