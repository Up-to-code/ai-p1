import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { canPerformOrganizationAction } from "../permissions";
import { resolveProjectAccess } from "./project";
import { resolveSpaceAccess } from "./space";

type TaskAccessCtx = Pick<QueryCtx, "auth" | "db" | "runQuery">;
type Task = Doc<"tasks">;
type TaskVisibility = "private" | "team" | "workspace";
type TaskAction = "read" | "create" | "update" | "delete";

export type TaskAccessErrorCode =
  | "TASK_ACCESS_DENIED"
  | "TASK_SCOPE_INVALID"
  | "TASK_CREATE_DENIED";

export interface TaskAccess {
  readonly actor: { readonly userId: string };
  readonly organizationId: string;
  canRead(task: Task): Promise<boolean>;
  canUpdate(task: Task): Promise<boolean>;
  canDelete(task: Task): Promise<boolean>;
  filterReadable(tasks: readonly Task[]): Promise<Task[]>;
  assertCanRead(task: Task): Promise<void>;
  assertCanUpdate(task: Task): Promise<void>;
  assertCanDelete(task: Task): Promise<void>;
  assertCanCreate(input: TaskScopeInput): Promise<void>;
  assertValidLinks(input: TaskScopeInput): Promise<void>;
}

export type TaskScopeInput = Readonly<{
  projectId?: string;
  spaceId?: string;
  visibility?: TaskVisibility;
}>;

type Scope = {
  project?: Doc<"projects">;
  space?: Doc<"spaces">;
  maxVisibility: TaskVisibility;
};

function accessError(
  code: TaskAccessErrorCode,
  message: string,
  organizationId: string,
  taskId?: Id<"tasks">,
) {
  return new ConvexError({ code, message, organizationId, taskId });
}

function isActiveTask(task: Task, organizationId: string): boolean {
  return task.organizationId === organizationId && !task.deletedAt && task.recordState !== "deleted";
}

function visibilityRank(visibility: TaskVisibility): number {
  return visibility === "private" ? 0 : visibility === "team" ? 1 : 2;
}

function projectMaxVisibility(project: Doc<"projects">): TaskVisibility {
  if (project.visibility === "private") return "private";
  if (project.visibility === "organization" || project.visibility === "workspace") return "workspace";
  return "team";
}

function spaceMaxVisibility(space: Doc<"spaces">): TaskVisibility {
  return space.visibility === "public" ? "workspace" : space.visibility === "request_only" ? "team" : "private";
}

function isParticipant(task: Task, userId: string): boolean {
  return task.createdByUserId === userId || task.assigneeUserId === userId || task.assigneeUserIds?.includes(userId) === true;
}

export async function resolveTaskAccess(
  ctx: TaskAccessCtx,
  organizationId: string,
): Promise<TaskAccess> {
  const [projectAccess, spaceAccess] = await Promise.all([
    resolveProjectAccess(ctx, organizationId),
    resolveSpaceAccess(ctx, organizationId),
  ]);
  const actor = projectAccess.actor;

  async function resolveScope(input: TaskScopeInput): Promise<Scope | null> {
    let project: Doc<"projects"> | undefined;
    let space: Doc<"spaces"> | undefined;

    if (input.projectId) {
      const candidate = await ctx.db.get(input.projectId as Id<"projects">);
      if (!candidate || candidate.organizationId !== organizationId || candidate.deletedAt || candidate.recordState === "deleted") return null;
      project = candidate;
    }
    if (input.spaceId) {
      const candidate = await ctx.db.get(input.spaceId as Id<"spaces">);
      if (!candidate || candidate.organizationId !== organizationId || candidate.deletedAt || candidate.recordState === "deleted") return null;
      space = candidate;
    }
    if (project && space) {
      const link = await ctx.db
        .query("projectSpaces")
        .withIndex("by_project_space", (q) =>
          q.eq("organizationId", organizationId).eq("projectId", project!._id).eq("spaceId", space!._id),
        )
        .first();
      if (!link || link.deletedAt || link.recordState === "deleted") return null;
    }

    const candidates = [
      ...(project ? [projectMaxVisibility(project)] : []),
      ...(space ? [spaceMaxVisibility(space)] : []),
    ];
    return { project, space, maxVisibility: candidates.sort((a, b) => visibilityRank(a) - visibilityRank(b))[0] ?? "workspace" };
  }

  async function canPerform(task: Task, action: Exclude<TaskAction, "create">): Promise<boolean> {
    if (!isActiveTask(task, organizationId)) return false;
    const scope = await resolveScope(task);
    if (!scope) return false;
    const visibility = task.visibility ?? "private";
    if (visibilityRank(visibility) > visibilityRank(scope.maxVisibility)) return false;

    if (scope.project) {
      const allowed = action === "read"
        ? projectAccess.canRead(scope.project)
        : action === "update"
          ? projectAccess.canUpdate(scope.project)
          : projectAccess.canDelete(scope.project);
      if (!allowed) return false;
    }
    if (scope.space) {
      const allowed = action === "read"
        ? spaceAccess.canRead(scope.space)
        : action === "update"
          ? spaceAccess.canUpdate(scope.space)
          : spaceAccess.canDelete(scope.space);
      if (!allowed) return false;
    }

    if (action === "delete") {
      // The creator may delete their own private task; assignees still need
      // the governing parent or organization delete authority.
      if (visibility === "private" && task.createdByUserId === actor.userId) {
        return true;
      }
      if (scope.project || scope.space) return true;
      return canPerformOrganizationAction(ctx, organizationId, actor.userId, "task", "delete");
    }

    if (visibility === "private") {
      return isParticipant(task, actor.userId);
    }
    if (visibility === "team" && !scope.project && !scope.space) {
      return isParticipant(task, actor.userId);
    }
    if (scope.project || scope.space) return true;
    return canPerformOrganizationAction(ctx, organizationId, actor.userId, "task", action);
  }

  async function assertAllowed(task: Task, action: Exclude<TaskAction, "create">) {
    if (!(await canPerform(task, action))) {
      throw accessError("TASK_ACCESS_DENIED", `You do not have permission to ${action} this task.`, organizationId, task._id);
    }
  }

  async function assertValidLinks(input: TaskScopeInput) {
    if (!(await resolveScope(input))) {
      throw accessError("TASK_SCOPE_INVALID", "Task links must reference active records in this organization.", organizationId);
    }
  }

  return {
    actor,
    organizationId,
    canRead: (task) => canPerform(task, "read"),
    canUpdate: (task) => canPerform(task, "update"),
    canDelete: (task) => canPerform(task, "delete"),
    filterReadable: async (tasks) => {
      const readable = await Promise.all(tasks.map(async (task) => ((await canPerform(task, "read")) ? task : null)));
      return readable.filter((task): task is Task => task !== null);
    },
    assertCanRead: (task) => assertAllowed(task, "read"),
    assertCanUpdate: (task) => assertAllowed(task, "update"),
    assertCanDelete: (task) => assertAllowed(task, "delete"),
    assertCanCreate: async (input) => {
      const scope = await resolveScope(input);
      if (!scope) throw accessError("TASK_SCOPE_INVALID", "Task links must reference active records in this organization.", organizationId);
      const visibility = input.visibility ?? "private";
      if (visibilityRank(visibility) > visibilityRank(scope.maxVisibility)) {
        throw accessError("TASK_SCOPE_INVALID", "Task visibility exceeds its linked scope.", organizationId);
      }
      if (scope.project && !projectAccess.canUpdate(scope.project)) {
        throw accessError("TASK_CREATE_DENIED", "You do not have permission to create work in this project.", organizationId);
      }
      if (scope.space && !spaceAccess.canUpdate(scope.space)) {
        throw accessError("TASK_CREATE_DENIED", "You do not have permission to create work in this space.", organizationId);
      }
      if (!scope.project && !scope.space) {
        if (visibility === "team") {
          throw accessError("TASK_SCOPE_INVALID", "Team-visible tasks require a Space or Project scope.", organizationId);
        }
        if (visibility === "workspace" && !(await canPerformOrganizationAction(ctx, organizationId, actor.userId, "task", "create"))) {
          throw accessError("TASK_CREATE_DENIED", "You do not have permission to create organization-visible tasks.", organizationId);
        }
      }
    },
    assertValidLinks,
  };
}
