import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Task quick-create wiring", () => {
  const provider = read("src/domains/tasks/components/task-workspace-provider.tsx");
  const modal = read("src/domains/tasks/components/task-create-modal.tsx");
  const table = read("src/domains/tasks/components/views/task-table-view.tsx");
  const list = read("src/domains/tasks/components/views/task-list-view.tsx");
  const board = read("src/domains/tasks/components/views/task-board-view.tsx");
  const mutations = read("src/domains/tasks/hooks/use-task-mutations.ts");

  it("routes every view and modal through one command contract", () => {
    expect(provider).toContain("runTaskQuickCreate");
    expect(provider).toContain("quickCreateInFlight.current");
    expect(modal).toContain("onCreate: TaskQuickCreateCommand");
    expect(modal).not.toContain("useTaskMutations");
    for (const source of [table, list, board]) {
      expect(source).toContain("TaskQuickCreateCommand");
      expect(source).toContain("await onTaskCreate?.({");
    }
  });

  it("opens the canonical detail route and relies on reactive Convex updates", () => {
    expect(provider).toContain('router.push(`/tasks/${taskId}`)');
    expect(mutations).not.toContain("invalidateQueries");
    expect(mutations).not.toContain("useQueryClient");
  });
});
