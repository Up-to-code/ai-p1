import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveProjectAccess } from "./project";
import { resolveSpaceAccess } from "./space";

type ProjectSpaceAccessCtx = Pick<
  QueryCtx | MutationCtx,
  "auth" | "db" | "runQuery"
>;

export type ProjectSpaceAccessErrorCode =
  | "PROJECT_NOT_FOUND"
  | "SPACE_NOT_FOUND";

function relationError(
  code: ProjectSpaceAccessErrorCode,
  organizationId: string,
  message: string,
) {
  return new ConvexError({ code, organizationId, message });
}

function isActiveOrganizationRecord(
  record: { organizationId: string; deletedAt?: number; recordState?: string },
  organizationId: string,
): boolean {
  return (
    record.organizationId === organizationId &&
    !record.deletedAt &&
    record.recordState !== "deleted"
  );
}

export interface ProjectSpaceAccess {
  readonly actorUserId: string;
  filterReadableLinks(
    links: readonly Doc<"projectSpaces">[],
  ): Promise<Doc<"projectSpaces">[]>;
  assertCanReadLink(
    projectId: Id<"projects">,
    spaceId: Id<"spaces">,
  ): Promise<void>;
  assertCanManageLink(
    projectId: Id<"projects">,
    spaceIds: readonly Id<"spaces">[],
  ): Promise<{
    project: Doc<"projects">;
    spaces: Doc<"spaces">[];
  }>;
}

/**
 * Authorizes the relationship itself. A caller must be able to update the
 * Project and every Space affected by a link, unlink, move, or primary change.
 */
export async function resolveProjectSpaceAccess(
  ctx: ProjectSpaceAccessCtx,
  organizationId: string,
): Promise<ProjectSpaceAccess> {
  const [projectAccess, spaceAccess] = await Promise.all([
    resolveProjectAccess(ctx, organizationId),
    resolveSpaceAccess(ctx, organizationId),
  ]);

  return {
    actorUserId: projectAccess.actor.userId,
    filterReadableLinks: async (links) => {
      const activeLinks = links.filter((link) =>
        isActiveOrganizationRecord(link, organizationId),
      );
      const projectIds = [...new Set(activeLinks.map((link) => link.projectId))];
      const spaceIds = [...new Set(activeLinks.map((link) => link.spaceId))];
      const [projects, spaces] = await Promise.all([
        Promise.all(projectIds.map((projectId) => ctx.db.get(projectId))),
        Promise.all(spaceIds.map((spaceId) => ctx.db.get(spaceId))),
      ]);
      const readableProjects = new Set(
        projects
          .filter(
            (project): project is Doc<"projects"> =>
              Boolean(
                project &&
                  isActiveOrganizationRecord(project, organizationId) &&
                  projectAccess.canRead(project),
              ),
          )
          .map((project) => project._id),
      );
      const readableSpaces = new Set(
        spaces
          .filter(
            (space): space is Doc<"spaces"> =>
              Boolean(
                space &&
                  isActiveOrganizationRecord(space, organizationId) &&
                  spaceAccess.canRead(space),
              ),
          )
          .map((space) => space._id),
      );

      return activeLinks.filter(
        (link) =>
          readableProjects.has(link.projectId) &&
          readableSpaces.has(link.spaceId),
      );
    },
    assertCanReadLink: async (projectId, spaceId) => {
      const [project, space] = await Promise.all([
        ctx.db.get(projectId),
        ctx.db.get(spaceId),
      ]);
      if (!project || !isActiveOrganizationRecord(project, organizationId)) {
        throw relationError(
          "PROJECT_NOT_FOUND",
          organizationId,
          "Project was not found in this organization.",
        );
      }
      if (!space || !isActiveOrganizationRecord(space, organizationId)) {
        throw relationError(
          "SPACE_NOT_FOUND",
          organizationId,
          "Space was not found in this organization.",
        );
      }
      projectAccess.assertCanRead(project);
      spaceAccess.assertCanRead(space);
    },
    assertCanManageLink: async (projectId, spaceIds) => {
      const uniqueSpaceIds = [...new Set(spaceIds)];
      const [project, spaces] = await Promise.all([
        ctx.db.get(projectId),
        Promise.all(uniqueSpaceIds.map((spaceId) => ctx.db.get(spaceId))),
      ]);

      if (!project || !isActiveOrganizationRecord(project, organizationId)) {
        throw relationError(
          "PROJECT_NOT_FOUND",
          organizationId,
          "Project was not found in this organization.",
        );
      }
      projectAccess.assertCanUpdate(project);

      const activeSpaces: Doc<"spaces">[] = [];
      for (const space of spaces) {
        if (!space || !isActiveOrganizationRecord(space, organizationId)) {
          throw relationError(
            "SPACE_NOT_FOUND",
            organizationId,
            "Space was not found in this organization.",
          );
        }
        spaceAccess.assertCanUpdate(space);
        activeSpaces.push(space);
      }

      return { project, spaces: activeSpaces };
    },
  };
}
