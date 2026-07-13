import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("./read.ts", import.meta.url)), "utf8");
const listPageSource = source.slice(
  source.indexOf("export const listPage"),
  source.indexOf("export const options"),
);

describe("client task read.get", () => {
  it("normalizes task route IDs before fetching records", () => {
    expect(source).toContain('args: { organizationId: v.string(), taskId: v.string() }');
    expect(source).toContain('ctx.db.normalizeId("tasks", args.taskId)');
    expect(source).toContain("if (!taskId) return null;");
  });

  it("paginates indexed TaskWorkspace scopes before access filtering", () => {
    expect(source).toContain("export const listPage = query");
    expect(source).toContain("paginationOpts: paginationOptsValidator");
    expect(source).toContain("returns: paginationResultValidator(clientTaskValidator)");
    expect(source).toContain('withIndex("by_organization_updated"');
    expect(source).toContain('withIndex("by_organization_project"');
    expect(source).toContain('withIndex("by_organization_project_space"');
    expect(source).toContain(".paginate(args.paginationOpts)");
    expect(source).toContain("access.filterReadable(activeDueWorkspaceRows(rawPage.page))");
    expect(listPageSource).not.toContain(".take(");
  });

  it("validates a Project-Space relation before scoped pagination", () => {
    expect(source).toContain('query("projectSpaces")');
    expect(source).toContain('withIndex("by_project_space"');
    expect(source).toContain("!isActiveOrganizationRecord(link, args.organizationId)");
  });

  it("uses normalized assignee and creator cursors for ownership scopes", () => {
    expect(listPageSource).toContain('v.literal("assignedToMe")');
    expect(listPageSource).toContain('query("taskAssignments")');
    expect(listPageSource).toContain('withIndex("by_organization_user_task"');
    expect(listPageSource).toContain('withIndex("by_organization_creator_updated"');
    expect(listPageSource).toContain("taskAssigneeIds(task).includes(access.actor.userId)");
  });
});
