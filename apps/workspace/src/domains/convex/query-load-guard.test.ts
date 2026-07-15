import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Convex query load guards", () => {
  it("keeps growing organization lists paginated", () => {
    for (const file of [
      "convex/projects/read.ts",
      "convex/clients/read.ts",
      "convex/organizations/audit/read.ts",
    ]) {
      expect(read(file), `${file} should expose paginated reads`).toContain(".paginate(args.paginationOpts)");
    }
  });

  it("keeps bulk client lists free of per-client work fan-out", () => {
    const clientsRead = read("convex/clients/read.ts");
    expect(clientsRead).toContain("return active.map(presentClientListItem)");
    expect(clientsRead).not.toContain("return Promise.all(active.map((client) => presentClient(ctx, client)))");
  });

  it("keeps project options and calendar range reads scoped", () => {
    expect(read("convex/projects/read.ts")).toContain("export const options");
    expect(read("convex/calendar/read.ts")).toContain("export const listUpcoming");
    expect(read("convex/calendar/read.ts")).toContain("export const listRange");

    const crudRoutes = read("src/server/domains/organization/routing/domains/crud.ts");
    expect(crudRoutes).toContain('"/:organizationId/read/projects/options"');
    expect(crudRoutes).toContain('"/:organizationId/read/calendar/upcoming"');
  });

  it("keeps initial workspace screens on bundled index reads", () => {
    const crudRoutes = read("src/server/domains/organization/routing/domains/crud.ts");
    for (const route of [
      '"/:organizationId/read/projects/index"',
      '"/:organizationId/read/clients/index"',
      '"/:organizationId/read/activity/index"',
      '"/:organizationId/read/calendar/index"',
      '"/:organizationId/read/dashboard/index"',
    ]) {
      expect(crudRoutes).toContain(route);
    }

    expect(read("src/domains/projects/hooks/use-project-collection-view.ts")).toContain("useProjectsIndexQuery");
    expect(read("src/domains/clients/components/clients-screens.tsx")).toContain("useClientsIndexQuery");
    expect(read("src/domains/activity/components/activity-screen.tsx")).toContain("useWorkspaceIndexedResource");
    expect(read("src/domains/calendar/components/CalendarPageRedesigned.tsx")).toContain("useCalendarIndexRangeQueryResult");
  });

  it("keeps core database indexes in their owned schema modules", () => {
    const schema = [
      read("convex/schema/domains.ts"),
      read("convex/schema/custom_fields.ts"),
      read("convex/schema/automations.ts"),
    ].join("\n");
    for (const index of [
      '.index("by_organization_updated", ["organizationId", "updatedAt"])',
      '.index("by_organization_assignee", ["organizationId", "assigneeUserId"])',
      '.index("by_due", ["organizationId", "dueDate"])',
      '.index("by_start", ["organizationId", "startAt"])',
      '.index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])',
      '.index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])',
      '.index("by_organization_record", ["organizationId", "recordType", "recordId"])',
      '.index("by_organization_key", ["organizationId", "key"])',
    ]) {
      expect(schema).toContain(index);
    }
  });

  it("keeps MCP list operations bounded and cursor-aware", () => {
    const catalog = read("src/server/protocols/mcp/tools/catalog.ts");
    const inputs = read("convex/mcp/toolInputs.ts");
    const handlers = [
      read("convex/mcp/handlers/projects.ts"),
      read("convex/mcp/handlers/clients.ts"),
      read("convex/mcp/handlers/tasks.ts"),
      read("convex/mcp/handlers/media.ts"),
    ].join("\n");
    expect(catalog).toContain("const listLimit = z.number().int().min(1).max(50).optional()");
    expect(catalog).toContain("const listCursor = z.string().nullable().optional()");
    expect(inputs).toContain("const MAX_TOOL_LIST_LIMIT = 50");
    expect(inputs).toContain("export function pagedResult");
    expect(handlers).toContain(".paginate({ numItems: limit, cursor: listCursor(");
  });
});
