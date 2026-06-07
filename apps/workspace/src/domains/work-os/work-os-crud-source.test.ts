import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Work OS CRUD modules", () => {
  it("routes opportunities and tasks to real CRUD screens instead of disabled placeholders", () => {
    const opportunitiesPage = readSource("src/app/[locale]/(app)/opportunities/page.tsx");
    const opportunityDetailPage = readSource("src/app/[locale]/(app)/opportunities/[id]/page.tsx");
    const tasksPage = readSource("src/app/[locale]/(app)/tasks/page.tsx");
    const taskDetailPage = readSource("src/app/[locale]/(app)/tasks/[id]/page.tsx");

    expect(opportunitiesPage).toContain("OpportunitiesScreen");
    expect(opportunityDetailPage).toContain("OpportunityDetailScreen");
    expect(tasksPage).toContain("TasksScreen");
    expect(taskDetailPage).toContain("TaskDetailScreen");
    expect(opportunitiesPage).not.toContain("WorkOsModuleScreen");
    expect(tasksPage).not.toContain("WorkOsModuleScreen");
  });

  it("wires opportunities through list, create, update, and delete paths", () => {
    const screen = readSource("src/domains/opportunities/components/opportunities-screen.tsx");
    const api = readSource("src/domains/opportunities/api/opportunities.ts");
    const router = readSource("src/server/domains/organization/routing/router.ts");

    expect(screen).toContain("createOpportunityRequest");
    expect(screen).toContain("updateOpportunityRequest");
    expect(screen).toContain("deleteOpportunityRequest");
    expect(screen).toContain("WorkOsRecordDrawer");
    expect(screen).toContain('invalidateQueries({ queryKey: ["opportunities"] })');
    expect(screen).toContain('invalidateQueries({ queryKey: ["opportunities-stats"] })');
    expect(screen).toContain('invalidateQueries({ queryKey: ["opportunity", organizationId, id] })');
    expect(api).toContain("useOpportunitiesQuery");
    expect(api).toContain("requestOrganizationAction");
    expect(router).toContain('"/:organizationId/opportunities"');
    expect(router).toContain('"/:organizationId/opportunities/:opportunityId"');
    expect(router).toContain('"/:organizationId/read/opportunities"');
    expect(router).toContain('"/:organizationId/read/opportunities/:opportunityId"');
  });

  it("wires tasks through list, create, update, and delete paths", () => {
    const screen = readSource("src/domains/tasks/components/tasks-screen.tsx");
    const api = readSource("src/domains/tasks/api/tasks.ts");
    const router = readSource("src/server/domains/organization/routing/router.ts");

    expect(screen).toContain("useTasksQuery");
    expect(screen).toContain("createTaskRequest");
    expect(screen).toContain("updateTaskRequest");
    expect(screen).toContain("deleteTaskRequest");
    expect(screen).toContain('invalidateQueries({ queryKey: ["tasks"] })');
    expect(screen).toContain('invalidateQueries({ queryKey: ["tasks-stats"] })');
    expect(screen).toContain('invalidateQueries({ queryKey: ["task", organizationId, id] })');
    expect(screen).toContain("TaskBoard");
    expect(screen).toContain("WorkOsRecordDrawer");
    expect(api).toContain('"tasks"');
    expect(api).toContain("requestOrganizationAction");
    expect(router).toContain('"/:organizationId/tasks"');
    expect(router).toContain('"/:organizationId/tasks/:taskId"');
    expect(router).toContain('"/:organizationId/read/tasks"');
    expect(router).toContain('"/:organizationId/read/tasks/:taskId"');
  });
});
