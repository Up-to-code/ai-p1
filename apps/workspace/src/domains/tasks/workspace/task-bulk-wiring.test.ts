import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Task bulk command wiring", () => {
  it("uses one validated Hono gateway route and one Convex bulk adapter", () => {
    const routes = read("src/server/domains/organization/routing/domains/crud.ts");
    const handler = read("src/server/domains/clientTasks/handlers/bulk-tasks.ts");
    const api = read("src/domains/tasks/api/tasks.ts");
    expect(routes).toContain('post("/:organizationId/tasks/bulk", handleBulkTasks)');
    expect(handler).toContain("z.array(z.string().min(1)).min(1).max(100)");
    expect(handler).toContain("api.clientTasks.write.bulkFromHono");
    expect(api).toContain('workspaceMutation<TaskBulkResult>(organizationId, "tasks/bulk"');
  });

  it("retains only failed selections instead of issuing per-row writes", () => {
    const table = read("src/domains/tasks/components/views/task-table-view.tsx");
    expect(table).toContain("await onTasksBulk(action");
    expect(table).toContain('outcome.status === "failed"');
    const bulkSection = table.slice(table.indexOf("async function runBulkAction"), table.indexOf("const flatTable"));
    expect(bulkSection).not.toContain("Promise.all");
    expect(bulkSection).not.toContain("updateTask(");
    expect(bulkSection).not.toContain("onTaskDelete");
  });
});
