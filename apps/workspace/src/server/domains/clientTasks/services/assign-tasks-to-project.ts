import { workspaceMutation } from "@/domains/resources/workspace-resource-request";

export async function assignTasksToProject(organizationId: string, taskIds: string[], projectId: string) {
  return workspaceMutation<{ updated: number }>(
    organizationId,
    "client-tasks/assign-to-project",
    {
      method: "POST",
      body: { taskIds, projectId },
      fallbackMessage: "Failed to assign tasks to project.",
    },
  );
}
