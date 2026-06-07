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
  const apiSource = readSource("src/domains/tasks/api/tasks.ts");
  const schemaSource = readSource("convex/schema.ts");
  const validatorSource = readSource("convex/clientTasks/validators.ts");

  it("keeps canceled tasks out of the active board columns", () => {
    expect(screenSource).toContain("taskBoardStatuses.map((status)");
    expect(readSource("src/domains/tasks/task-pipeline-order.ts")).toContain('["todo", "inProgress", "waiting", "done"]');
  });

  it("persists drag/drop with optimistic rollback", () => {
    expect(screenSource).toContain("moveTaskMutation.mutate");
    expect(screenSource).toContain("nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex)");
    expect(screenSource).toContain("taskFormValuesForPipeline(variables.task, variables.status, pipelineOrder)");
    expect(screenSource).toContain("queryClient.setQueriesData<TaskRecord[]>");
    expect(screenSource).toContain("context?.previousEntries.forEach");
    expect(screenSource).toContain('invalidateQueries({ queryKey: ["tasks", variables?.organizationId] })');
    expect(screenSource).toContain('invalidateQueries({ queryKey: ["tasks-stats", variables?.organizationId] })');
  });

  it("loads workspace members for board display before a drawer opens", () => {
    expect(screenSource).toContain("listOrganizationMembers(organizationId)");
    expect(screenSource).not.toContain("!isFormDrawerOpen) return");
  });

  it("supports current-user task filters for assigned and sent work", () => {
    expect(screenSource).toContain('ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const');
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
