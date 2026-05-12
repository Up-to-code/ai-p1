import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

const hotReadFiles = [
  "convex/projects/read.ts",
  "convex/properties/read.ts",
  "convex/clients/read.ts",
  "convex/dashboard/read.ts",
  "convex/organizations/audit/read.ts",
  "convex/agents/read.ts",
  "convex/mcp/tools.ts",
];

describe("Convex query load guards", () => {
  it("keeps hot read paths away from unbounded collect calls", () => {
    for (const file of hotReadFiles) {
      expect(read(file), `${file} should not use .collect()`).not.toContain(".collect(");
    }
  });

  it("keeps growing workspace lists paginated", () => {
    for (const file of ["convex/projects/read.ts", "convex/properties/read.ts", "convex/clients/read.ts", "convex/organizations/audit/read.ts"]) {
      expect(read(file), `${file} should expose paginated reads`).toContain(".paginate(args.paginationOpts)");
    }
  });

  it("keeps bulk project and property list presenters free of media fan-out", () => {
    expect(read("convex/projects/read.ts")).toMatch(/function presentProjectListItem[\s\S]*coverImageUrl: undefined/);
    expect(read("convex/properties/read.ts")).toMatch(/function presentPropertyListItem[\s\S]*coverImageUrl: undefined/);
  });

  it("keeps bulk client lists free of per-client work fan-out", () => {
    const clientsRead = read("convex/clients/read.ts");
    expect(clientsRead).toContain("return active.map(presentClientListItem)");
    expect(clientsRead).not.toContain("return Promise.all(active.map((client) => presentClient(ctx, client)))");
  });

  it("keeps project detail and property forms on scoped reads", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    expect(read("convex/projects/read.ts")).toContain("export const options");
    expect(read("convex/properties/read.ts")).toContain("export const listByProject");
    expect(router).toContain('"/:organizationId/read/projects/options"');
    expect(router).toContain('"/:organizationId/read/properties/by-project/:projectId"');
    expect(read("src/domains/projects/components/projects-screens.tsx")).toContain("useProjectPropertiesQuery");
    expect(read("src/domains/properties/components/properties-screens.tsx")).toContain("useProjectOptionsQuery");
  });

  it("keeps calendar-heavy supporting reads lazy or bounded", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    expect(read("convex/calendar/read.ts")).toContain("export const listUpcoming");
    expect(router).toContain('"/:organizationId/read/calendar/upcoming"');
    expect(read("src/domains/clients/components/clients-screens.tsx")).toContain("useUpcomingCalendarEventsQuery");
    expect(read("src/domains/calendar/components/calendar-screen.tsx")).toContain("shouldLoadPickerOptions");
  });

  it("keeps initial workspace screens on bundled index reads", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    for (const route of [
      '"/:organizationId/read/projects/index"',
      '"/:organizationId/read/properties/index"',
      '"/:organizationId/read/clients/index"',
      '"/:organizationId/read/activity/index"',
      '"/:organizationId/read/calendar/index"',
      '"/:organizationId/read/dashboard/index"',
    ]) {
      expect(router).toContain(route);
    }

    expect(read("src/domains/projects/components/projects-screens.tsx")).toContain("useProjectsIndexQuery");
    expect(read("src/domains/properties/components/properties-screens.tsx")).toContain("usePropertiesIndexQuery");
    expect(read("src/domains/clients/components/clients-screens.tsx")).toContain("useClientsIndexQuery");
    expect(read("src/domains/activity/components/activity-screen.tsx")).toContain("useHttpIndexedPagedQuery");
    expect(read("src/domains/calendar/components/calendar-screen.tsx")).toContain("useCalendarIndexRangeQueryResult");
    expect(read("src/domains/dashboard/components/dashboard-screen.tsx")).toContain("/read/dashboard/index");
  });

  it("keeps agent context bounded", () => {
    const agentsRead = read("convex/agents/read.ts");
    expect(agentsRead).toContain("Math.min(args.limit ?? 16, 30)");
    expect(agentsRead).toContain(".take(10)");
  });

  it("keeps MCP list tools limited and cursor-aware", () => {
    const catalog = read("src/server/protocols/mcp/tools/catalog.ts");
    const tools = read("convex/mcp/tools.ts");
    expect(catalog).toContain("const listLimit = z.number().int().min(1).max(50).optional()");
    expect(catalog).toContain("const listCursor = z.string().nullable().optional()");
    expect(tools).toContain("const MAX_TOOL_LIST_LIMIT = 50");
    expect(tools).toContain("function pagedResult");
    expect(tools).toContain("continueCursor");
    expect(tools).toContain(".paginate({ numItems: limit, cursor: listCursor(input) })");
  });
});
