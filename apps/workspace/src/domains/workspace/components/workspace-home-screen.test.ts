import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("./workspace-home-screen.tsx", import.meta.url)), "utf8");

describe("Workspace home renderer", () => {
  it("uses the personal command center instead of a duplicate task workspace", () => {
    expect(source).toContain('from "./workspace-command-center"');
    expect(source).toContain("<WorkspaceCommandCenter />");
    expect(source).not.toContain("TasksPageRedesigned");
    expect(source).not.toContain('from "@/domains/projects/components/views/task-table-view"');
  });
});
