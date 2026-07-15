import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Convex modelization schema guards", () => {
  it("keeps obsolete view and workflow tables out of schema", () => {
    const schema = [
      read("convex/schema/users.ts"),
      read("convex/schema/views.ts"),
      read("convex/schema/custom_fields.ts"),
    ].join("\n");

    for (const table of ["views", "userTableViews", "workspaceSettings", "pipeline_stages"]) {
      expect(schema).not.toContain(`${table}: defineTable`);
    }
  });

  it("keeps canonical surfaces, saved views, workflows, and field layouts typed", () => {
    const schema = read("convex/schema/views.ts");

    for (const table of ["surfaces", "surfaceTabs", "savedViews", "workflowDefinitions", "workflowStates", "fieldLayouts"]) {
      expect(schema).toContain(`${table}: defineTable`);
    }

    expect(schema).toContain("savedViewConfigValidator");
    expect(schema).not.toContain("v.any()");
  });

  it("keeps high-traffic workspace records on recordState indexes", () => {
    const schema = read("convex/schema/domains.ts");
    const compactSchema = schema.replace(/\s+/g, "").replace(/,\]/g, "]");

    for (const table of ["projects", "clients", "deals", "tasks", "calendarEvents"]) {
      expect(schema).toMatch(new RegExp(`${table}: defineTable\\([\\s\\S]*recordState: recordStateValidator`));
    }

    for (const index of [
      '.index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])',
      '.index("by_org_project_state_updated", ["organizationId", "projectId", "recordState", "updatedAt"])',
      '.index("by_org_space_state_updated", ["organizationId", "spaceId", "recordState", "updatedAt"])',
      '.index("by_org_assignee_state_due", ["organizationId", "assigneeUserId", "recordState", "dueDate"])',
      '.index("by_org_workflow_state_order", ["organizationId", "status", "recordState", "pipelineOrder"])',
    ]) {
      expect(compactSchema).toContain(index.replace(/\s+/g, ""));
    }
  });

  it("keeps default modelization seeds and read surfaces available", () => {
    const write = read("convex/modelization/write.ts");
    const readApi = read("convex/modelization/read.ts");

    for (const workflow of ["task-status", "project-status", "deal-stage", "client-pipeline"]) {
      expect(write).toContain(`key: "${workflow}"`);
    }

    for (const surface of [
      "workspace:home",
      "workspace:projects",
      "space:default:main",
      "project:default:main",
    ]) {
      expect(write).toContain(`key: "${surface}"`);
    }

    for (const fn of ["getSurfaceByKey", "listSurfaceTabs", "listSavedViews", "listWorkflowStates"]) {
      expect(readApi).toContain(`export const ${fn}`);
      expect(readApi).toMatch(new RegExp(`export const ${fn} = query\\([\\s\\S]*returns:`));
    }
  });
});
