import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Work OS CRUD modules", () => {
  it("routes legacy opportunities to Deals and tasks to the canonical Task Workspace", () => {
    const opportunitiesPage = readSource("src/app/[locale]/(app)/opportunities/page.tsx");
    const opportunityDetailPage = readSource("src/app/[locale]/(app)/opportunities/[id]/page.tsx");
    const tasksPage = readSource("src/app/[locale]/(app)/tasks/page.tsx");
    const taskDetailPage = readSource("src/app/[locale]/(app)/tasks/[id]/page.tsx");

    expect(opportunitiesPage).toContain('buildCanonicalRedirectPath(locale, "/deals"');
    expect(opportunityDetailPage).toContain("OpportunityDetailScreen");
    expect(tasksPage).toContain("TaskWorkspace");
    expect(taskDetailPage).toContain("TaskDetailScreen");
    expect(opportunitiesPage).not.toContain("WorkOsModuleScreen");
    expect(tasksPage).not.toContain("WorkOsModuleScreen");
  });

  it("wires opportunities through list, create, update, and delete paths", () => {
    const screen = readSource("src/domains/opportunities/components/opportunities-screen.tsx");
    const api = readSource("src/domains/opportunities/api/opportunities.ts");

    expect(screen).toContain("createOpportunityRequest");
    expect(screen).toContain("updateOpportunityRequest");
    expect(screen).toContain("deleteOpportunityRequest");
    expect(screen).toContain("WorkOsRecordDrawer");
    expect(screen).toContain('invalidateQueries({ queryKey: ["opportunities"] })');
    expect(screen).toContain('invalidateQueries({ queryKey: ["opportunities-stats"] })');
    expect(api).toContain("useOpportunitiesQuery");
    expect(api).toContain("requestOrganizationAction");
    const crudRouter = readSource("src/server/domains/organization/routing/domains/crud.ts");
    expect(crudRouter).toContain('"/:organizationId/opportunities"');
    expect(crudRouter).toContain('"/:organizationId/opportunities/:opportunityId"');
    expect(crudRouter).toContain('"/:organizationId/read/opportunities"');
    expect(crudRouter).toContain('"/:organizationId/read/opportunities/:opportunityId"');
  });

  it("wires tasks through list, create, update, and delete paths", () => {
    const workspace = readSource("src/domains/tasks/components/TasksPageRedesigned.tsx");
    const mutations = readSource("src/domains/tasks/hooks/use-task-mutations.ts");
    const api = readSource("src/domains/tasks/api/tasks.ts");
    const router = readSource("src/server/domains/organization/routing/domains/crud.ts");

    expect(workspace).toContain("useTasksQuery");
    expect(workspace).toContain("useTaskMutations");
    expect(workspace).toContain("TaskViewFrame");
    expect(mutations).toContain("createTaskRequest");
    expect(mutations).toContain("updateTaskRequest");
    expect(mutations).toContain("deleteTaskRequest");
    expect(mutations).toContain("createTaskMutation");
    expect(mutations).toContain("updateTaskMutation");
    expect(mutations).toContain("deleteTaskMutation");
    expect(api).toContain('"tasks"');
    expect(api).toContain("createResourceApi");
    expect(router).toContain('"/:organizationId/tasks"');
    expect(router).toContain('"/:organizationId/tasks/:taskId"');
    expect(router).toContain('"/:organizationId/read/tasks"');
    expect(router).toContain('"/:organizationId/read/tasks/:taskId"');
  });
});
