import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("task pipeline source", () => {
  const workspaceSource = readSource("src/domains/tasks/components/task-workspace-provider.tsx");
  const mutationsSource = readSource("src/domains/tasks/hooks/use-task-mutations.ts");
  const hooksSource = readSource("src/domains/tasks/hooks/use-task-mention-options.ts");
  const constantsSource = readSource("src/domains/tasks/tasks.constants.ts");
  const apiSource = readSource("src/domains/tasks/api/tasks.ts");
  const schemaSource = readSource("convex/schema/domains.ts");
  const validatorSource = readSource("convex/clientTasks/validators.ts");

  it("keeps canceled tasks out of the active board columns", () => {
    const orderSource = readSource("src/domains/tasks/task-pipeline-order.ts");
    expect(orderSource).toContain("export const taskBoardStatuses = [");
    expect(orderSource).toContain('"todo"');
    expect(orderSource).toContain('"inProgress"');
    expect(orderSource).toContain('"waiting"');
    expect(orderSource).toContain('"done"');
    expect(orderSource).not.toContain('"canceled"');
  });

  it("persists drag/drop with Convex real-time updates", () => {
    expect(workspaceSource).toContain("mutations.moveTask");
    expect(mutationsSource).toContain("moveTaskMutation");
    expect(mutationsSource).toContain("nextTaskPipelineOrder(stageTasks, task.id, targetIndex)");
    expect(mutationsSource).toContain("taskFormValuesForPipeline(task, toStage, pipelineOrder)");
    expect(mutationsSource).toContain("onSuccess:");
  });

  it("keeps the task board rendered from the query cache instead of a second local task store", () => {
    expect(workspaceSource).not.toContain("setOptimisticTasks");
    expect(workspaceSource).toContain("applyOptimistic(rawTasks)");
    expect(workspaceSource).toContain("useTaskWorkspaceQuery");
    expect(workspaceSource).not.toContain("useProjectOptionsQueryResult");
    expect(workspaceSource).not.toContain("tasks.slice(");
  });

  it("loads workspace members for board display before a drawer opens", () => {
    expect(hooksSource).toContain("listOrganizationMembers(organizationId!)");
  });

  it("supports current-user task filters for assigned and sent work", () => {
    expect(constantsSource).toContain('ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const');
    const filterSource = readSource("src/domains/tasks/lib/task-sidebar-filter.ts");
    expect(filterSource).toContain("task.assigneeUserId === currentUserId");
    expect(filterSource).toContain("task.createdByUserId === currentUserId");
    expect(workspaceSource).toContain("selectTaskWorkspaceRecords");
    expect(workspaceSource).toContain('viewState.filter === "my"');
    expect(workspaceSource).toContain('"assignedToMe"');
  });

  it("accepts pipeline order across UI payload and Convex schema", () => {
    expect(apiSource).toContain("pipelineOrder: typeof values.pipelineOrder === \"number\"");
    expect(schemaSource).toContain("pipelineOrder: v.optional(v.number())");
    expect(validatorSource).toContain("pipelineOrder: v.optional(v.number())");
  });
});
