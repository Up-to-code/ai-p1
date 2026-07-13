import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  canPerformOrganizationAction,
  getOrganizationRole,
  hasOrganizationMembership,
  type OrganizationRole,
  type SpaceRole,
} from "../permissions";
import { normalizeProjectVisibility } from "../projects/validators";
import { requireServerActor, type ServerActor } from "./actor";
import { resolveSpaceAccess } from "./space";

type ProjectAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Project = Doc<"projects">;
type ProjectRole = "admin" | "member" | "viewer";

export type ProjectAccessErrorCode =
  | "ORGANIZATION_ACCESS_DENIED"
  | "PROJECT_ACCESS_DENIED"
  | "PROJECT_CREATE_DENIED"
  | "PROJECT_UPDATE_DENIED"
  | "PROJECT_DELETE_DENIED";

export interface ProjectAccess {
  readonly actor: ServerActor;
  readonly organizationId: string;
  readonly organizationRole: OrganizationRole | null;
  canRead(project: Project): boolean;
  canUpdate(project: Project): boolean;
  canDelete(project: Project): boolean;
  filterReadable(projects: readonly Project[]): Project[];
  filterActorSpaceIds(
    spaceIds: readonly Id<"spaces">[],
  ): Promise<Id<"spaces">[]>;
  assertCanRead(project: Project): void;
  assertCanUpdate(project: Project): void;
  assertCanDelete(project: Project): void;
  assertCanCreate(): Promise<void>;
}

function isActiveProject(project: Project, organizationId: string): boolean {
  return (
    project.organizationId === organizationId &&
    !project.deletedAt &&
    project.recordState !== "deleted"
  );
}

function accessError(
  code: ProjectAccessErrorCode,
  message: string,
  organizationId: string,
  projectId?: Id<"projects">,
): ConvexError<{
  code: ProjectAccessErrorCode;
  message: string;
  organizationId: string;
  projectId?: Id<"projects">;
}> {
  return new ConvexError({ code, message, organizationId, projectId });
}

export async function resolveProjectAccess(
  ctx: ProjectAccessCtx,
  organizationId: string,
): Promise<ProjectAccess> {
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

  const [projectMemberships, spaceMemberships] = await Promise.all([
      ctx.db
        .query("projectMembers")
        .withIndex("by_user", (q) =>
          q.eq("organizationId", organizationId).eq("userId", actor.userId),
        )
        .collect(),
      ctx.db
        .query("spaceMembers")
        .withIndex("by_user_id", (q) =>
          q.eq("organizationId", organizationId).eq("userId", actor.userId),
        )
        .collect(),
    ]);

  const activeSpaces = await Promise.all(
    spaceMemberships
      .filter(
        (membership) =>
          !membership.deletedAt && membership.recordState !== "deleted",
      )
      .map((membership) => ctx.db.get(membership.spaceId)),
  );
  const activeSpaceIds = new Set(
    activeSpaces
      .filter((space): space is Doc<"spaces"> =>
        Boolean(
          space &&
          space.organizationId === organizationId &&
          !space.deletedAt &&
          space.recordState !== "deleted",
        ),
      )
      .map((space) => space._id),
  );
  const projectSpaceLinks = (
    await Promise.all(
      [...activeSpaceIds].map((spaceId) =>
        ctx.db
          .query("projectSpaces")
          .withIndex("by_space_id", (q) =>
            q.eq("organizationId", organizationId).eq("spaceId", spaceId),
          )
          .collect(),
      ),
    )
  ).flat();

  const projectRoles = new Map<Id<"projects">, ProjectRole>();
  for (const membership of projectMemberships) {
    if (!membership.deletedAt && membership.recordState !== "deleted") {
      projectRoles.set(membership.projectId, membership.role);
    }
  }

  const spaceRoles = new Map<Id<"spaces">, SpaceRole>();
  for (const membership of spaceMemberships) {
    if (
      !membership.deletedAt &&
      membership.recordState !== "deleted" &&
      activeSpaceIds.has(membership.spaceId)
    ) {
      spaceRoles.set(membership.spaceId, membership.role);
    }
  }

  const projectSpaceIds = new Map<Id<"projects">, Set<Id<"spaces">>>();
  for (const link of projectSpaceLinks) {
    if (link.deletedAt || link.recordState === "deleted") continue;
    const spaceIds = projectSpaceIds.get(link.projectId) ?? new Set();
    spaceIds.add(link.spaceId);
    projectSpaceIds.set(link.projectId, spaceIds);
  }

  const organizationAdministrator =
    organizationRole === "owner" || organizationRole === "admin";

  const inheritedSpaceRoles = (project: Project): SpaceRole[] => {
    if (normalizeProjectVisibility(project.visibility) !== "space_members") {
      return [];
    }
    return [...(projectSpaceIds.get(project._id) ?? [])]
      .map((spaceId) => spaceRoles.get(spaceId))
      .filter((role): role is SpaceRole => Boolean(role));
  };

  const canRead = (project: Project): boolean => {
    if (!isActiveProject(project, organizationId)) return false;
    if (organizationAdministrator || project.ownerUserId === actor.userId) {
      return true;
    }
    if (projectRoles.has(project._id)) return true;
    if (normalizeProjectVisibility(project.visibility) === "organization") {
      return true;
    }
    return inheritedSpaceRoles(project).length > 0;
  };

  const canUpdate = (project: Project): boolean => {
    if (!isActiveProject(project, organizationId)) return false;
    if (organizationAdministrator || project.ownerUserId === actor.userId) {
      return true;
    }
    const projectRole = projectRoles.get(project._id);
    if (projectRole === "admin" || projectRole === "member") return true;
    return inheritedSpaceRoles(project).some(
      (role) => role === "admin" || role === "member",
    );
  };

  const canDelete = (project: Project): boolean => {
    if (!isActiveProject(project, organizationId)) return false;
    if (organizationRole === "owner" || project.ownerUserId === actor.userId) {
      return true;
    }
    return projectRoles.get(project._id) === "admin";
  };

  return {
    actor,
    organizationId,
    organizationRole,
    canRead,
    canUpdate,
    canDelete,
    filterReadable: (projects) => projects.filter(canRead),
    filterActorSpaceIds: async (spaceIds) => {
      const requestedSpaceIds = [...new Set(spaceIds)];
      const [spaceAccess, requestedSpaces] = await Promise.all([
        resolveSpaceAccess(ctx, organizationId),
        Promise.all(requestedSpaceIds.map((spaceId) => ctx.db.get(spaceId))),
      ]);
      return spaceAccess
        .filterReadable(
          requestedSpaces.filter(
            (space): space is Doc<"spaces"> => space !== null,
          ),
        )
        .map((space) => space._id);
    },
    assertCanRead: (project) => {
      if (!canRead(project)) {
        throw accessError(
          "PROJECT_ACCESS_DENIED",
          "You do not have permission to read this project.",
          organizationId,
          project._id,
        );
      }
    },
    assertCanUpdate: (project) => {
      if (!canUpdate(project)) {
        throw accessError(
          "PROJECT_UPDATE_DENIED",
          "You do not have permission to update this project.",
          organizationId,
          project._id,
        );
      }
    },
    assertCanDelete: (project) => {
      if (!canDelete(project)) {
        throw accessError(
          "PROJECT_DELETE_DENIED",
          "You do not have permission to delete this project.",
          organizationId,
          project._id,
        );
      }
    },
    assertCanCreate: async () => {
      const allowed = await canPerformOrganizationAction(
        ctx,
        organizationId,
        actor.userId,
        "project",
        "create",
      );
      if (!allowed) {
        throw accessError(
          "PROJECT_CREATE_DENIED",
          "You do not have permission to create projects in this organization.",
          organizationId,
        );
      }
    },
  };
}
