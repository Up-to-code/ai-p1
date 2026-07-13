import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import {
  readOrganizationId,
  readWorkspaceIdParam,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

const taskStatuses = ["todo", "inProgress", "waiting", "done", "canceled"] as const;

export async function handleReadTasks(c: Context) {
  return workspaceOrganizationReadJson(c, "tasks list", async (organizationId) => {
    const projectId = c.req.query("projectId");
    const tasks = projectId
      ? await fetchAuthQuery(api.clientTasks.read.listByProject, { organizationId, projectId })
      : await fetchAuthQuery(api.clientTasks.read.list, { organizationId });

    const status = c.req.query("status");
    const search = c.req.query("search")?.trim().toLowerCase();

    return tasks
      .filter((task) => !taskStatuses.includes(status as never) || task.status === status)
      .filter((task) => !search || [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])].some((value) => value?.toLowerCase().includes(search)));
  });
}

export async function handleReadTaskStats(c: Context) {
  return workspaceOrganizationReadJson(c, "task stats", (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.stats, { organizationId }),
  );
}

export async function handleReadTaskOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "task options", (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadTask(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const taskId = readWorkspaceIdParam<"tasks">(c, "taskId", "Task id");
  if (!taskId.ok) return taskId.response;
  return workspaceReadJsonForOrganization(c, "task detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.clientTasks.read.get, {
      organizationId,
      taskId: taskId.data,
    }),
  );
}
