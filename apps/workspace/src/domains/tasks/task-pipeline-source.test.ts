import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("task pipeline source", () => {
  const screenSource = readSource("src/domains/tasks/components/tasks-screen.tsx");
  const skeletonSource = readSource("src/domains/tasks/components/task-board-skeleton.tsx");
  const hooksSource = readSource("src/domains/tasks/components/task-hooks.ts");
  const constantsSource = readSource("src/domains/tasks/tasks.constants.ts");
  const apiSource = readSource("src/domains/tasks/api/tasks.ts");
  const schemaSource = readSource("convex/schema.ts");
  const validatorSource = readSource("convex/clientTasks/validators.ts");

  it("keeps canceled tasks out of the active board columns", () => {
    expect(skeletonSource).toContain("taskBoardStatuses.map((status)");
    const orderSource = readSource("src/domains/tasks/task-pipeline-order.ts");
    expect(orderSource).toContain("export const taskBoardStatuses = [");
    expect(orderSource).toContain('"todo"');
    expect(orderSource).toContain('"inProgress"');
    expect(orderSource).toContain('"waiting"');
    expect(orderSource).toContain('"done"');
    expect(orderSource).not.toContain('"canceled"');
  });

  it("persists drag/drop with Convex real-time updates", () => {
    expect(screenSource).toContain("moveTaskMutation.mutate");
    expect(screenSource).toContain("nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex)");
    expect(screenSource).toContain("taskFormValuesForPipeline(variables.task, variables.status, pipelineOrder)");
    expect(screenSource).toContain("onSuccess:");
    expect(screenSource).toContain('taskLog.info("drag:committed"');
  });

  it("keeps the task board rendered from the query cache instead of a second local task store", () => {
    const groupedListSource = readSource("src/domains/tasks/components/task-grouped-list.tsx");
    expect(groupedListSource).not.toContain("optimisticTasks");
    expect(groupedListSource).not.toContain("setOptimisticTasks");
    expect(groupedListSource).toContain("for (const task of tasks)");
  });

  it("loads workspace members for board display before a drawer opens", () => {
    expect(hooksSource).toContain("listOrganizationMembers(organizationId)");
  });

  it("supports current-user task filters for assigned and sent work", () => {
    expect(constantsSource).toContain('ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const');
    expect(screenSource).toContain("task.assigneeUserId === account.user.id");
    expect(screenSource).toContain("task.createdByUserId === account.user.id");
    expect(screenSource).toContain("setOwnership(event.target.value");
  });

  it("accepts pipeline order across UI payload and Convex schema", () => {
    expect(apiSource).toContain("pipelineOrder: typeof values.pipelineOrder === \"number\"");
    expect(schemaSource).toContain("pipelineOrder: v.optional(v.number())");
    expect(validatorSource).toContain("pipelineOrder: v.optional(v.number())");
  });
});
