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
  "convex/assets/read.ts",
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
    for (const file of ["convex/projects/read.ts", "convex/assets/read.ts", "convex/clients/read.ts", "convex/organizations/audit/read.ts"]) {
      expect(read(file), `${file} should expose paginated reads`).toContain(".paginate(args.paginationOpts)");
    }
  });

  it("keeps project and asset list cards backed by selected cover media", () => {
    expect(read("convex/projects/read.ts")).toMatch(/function presentProjectListItem[\s\S]*coverImageUrl: selectCoverUrl\(media\)/);
    expect(read("convex/assets/read.ts")).toMatch(/function presentAssetListItem[\s\S]*const coverImageUrl = selectCoverUrl\(media\) \?\? asset\.url \?\? ""/);
  });

  it("keeps bulk client lists free of per-client work fan-out", () => {
    const clientsRead = read("convex/clients/read.ts");
    expect(clientsRead).toContain("return active.map(presentClientListItem)");
    expect(clientsRead).not.toContain("return Promise.all(active.map((client) => presentClient(ctx, client)))");
  });

  it("keeps project detail and asset forms on scoped reads", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    expect(read("convex/projects/read.ts")).toContain("export const options");
    expect(read("convex/assets/read.ts")).toContain("export const listByProject");
    expect(router).toContain('"/:organizationId/read/projects/options"');
    expect(router).toContain('"/:organizationId/read/assets/by-project/:projectId"');
    expect(read("src/domains/projects/components/projects-screens.tsx")).toContain("useProjectAssetsQuery");
    expect(read("src/domains/assets/components/assets-screens.tsx")).toContain("useProjectOptionsQuery");
  });

  it("keeps asset ids strict and asset links on recordLinks indexes", () => {
    const assetsRead = read("convex/assets/read.ts");
    const workspaceRead = read("src/server/domains/organization/handlers/workspace-read.ts");
    const assetScreen = read("src/domains/assets/components/assets-screens.tsx");
    const clientsApi = read("src/domains/clients/api/clients.ts");

    expect(assetsRead).toContain("assetId: v.string()");
    expect(assetsRead).toContain('ctx.db.normalizeId("assets", identifier)');
    expect(assetsRead).toContain('.withIndex("by_source"');
    expect(assetsRead).toContain('eq("sourceRecordType", "project")');
    expect(assetsRead).toContain('link.targetRecordType === "asset"');
    expect(read("convex/clients/read.ts")).toContain('.withIndex("by_target"');
    expect(read("convex/clients/read.ts")).toContain('eq("targetRecordType", "asset")');
    expect(workspaceRead).toContain('const assetId = readParam(c, "assetId", "Asset id")');
    expect(assetScreen).toContain("useAssetClientLinksQuery(workspaceOrganizationId, asset?.id)");
    expect(clientsApi).toContain('!assetId.startsWith("AST-")');
  });

  it("keeps Work OS core read indexes declared in schema", () => {
    const schema = read("convex/schema.ts");
    for (const index of [
      '.index("by_organization_updated", ["organizationId", "updatedAt"])',
      '.index("by_organization_deleted_status_updated", ["organizationId", "isDeleted", "status", "updatedAt"])',
      '.index("by_organization_deleted_type_updated", ["organizationId", "isDeleted", "type", "updatedAt"])',
      '.index("by_organization_assignee", ["organizationId", "assigneeUserId"])',
      '.index("by_due", ["organizationId", "dueDate"])',
      '.index("by_start", ["organizationId", "startAt"])',
      '.index("by_source", ["organizationId", "sourceRecordType", "sourceRecordId"])',
      '.index("by_target", ["organizationId", "targetRecordType", "targetRecordId"])',
      '.index("by_organization_record", ["organizationId", "recordType", "recordId"])',
      '.index("by_organization_key", ["organizationId", "key"])',
      '.index("by_organization_enabled", ["organizationId", "enabled"])',
    ]) {
      expect(schema).toContain(index);
    }
  });

  it("keeps calendar-heavy supporting reads lazy or bounded", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    expect(read("convex/calendar/read.ts")).toContain("export const listUpcoming");
    expect(router).toContain('"/:organizationId/read/calendar/upcoming"');
    expect(read("src/domains/clients/components/clients-screens.tsx")).toContain("useUpcomingCalendarEventsQuery");
    expect(read("src/domains/calendar/components/CalendarPageRedesigned.tsx")).toContain("shouldLoadPickerOptions");
  });

  it("keeps initial workspace screens on bundled index reads", () => {
    const router = read("src/server/domains/organization/routing/router.ts");
    for (const route of [
      '"/:organizationId/read/projects/index"',
      '"/:organizationId/read/assets/index"',
      '"/:organizationId/read/clients/index"',
      '"/:organizationId/read/activity/index"',
      '"/:organizationId/read/calendar/index"',
      '"/:organizationId/read/dashboard/index"',
    ]) {
      expect(router).toContain(route);
    }

    expect(read("src/domains/projects/components/projects-screens.tsx")).toContain("useProjectsIndexQuery");
    expect(read("src/domains/assets/components/assets-screens.tsx")).toContain("useAssetsIndexQuery");
    expect(read("src/domains/clients/components/clients-screens.tsx")).toContain("useClientsIndexQuery");
    expect(read("src/domains/activity/components/activity-screen.tsx")).toContain("useWorkspaceIndexedResource");
    expect(read("src/domains/calendar/components/CalendarPageRedesigned.tsx")).toContain("useCalendarIndexRangeQueryResult");
    expect(read("src/domains/dashboard/components/dashboard-screen.tsx")).toContain("useWorkspaceResourceResult");
  });

  it("keeps agent context bounded", () => {
    const agentsRead = read("convex/agents/read.ts");
    const readSurface = read("convex/agents/readSurface.ts");
    expect(agentsRead).toContain("boundedAgentReadLimit(args.limit, 16, 30)");
    expect(readSurface).toContain("export function boundedAgentReadLimit");
    expect(readSurface).toContain("Math.min(limit ?? fallback, max)");
    expect(agentsRead).toContain(".take(10)");
  });

  it("keeps MCP list tools limited and cursor-aware", () => {
    const catalog = read("src/server/protocols/mcp/tools/catalog.ts");
    const tools = read("convex/mcp/tools.ts");
    const toolInputs = read("convex/mcp/toolInputs.ts");
    expect(catalog).toContain("const listLimit = z.number().int().min(1).max(50).optional()");
    expect(catalog).toContain("const listCursor = z.string().nullable().optional()");
    expect(toolInputs).toContain("const MAX_TOOL_LIST_LIMIT = 50");
    expect(toolInputs).toContain("export function pagedResult");
    expect(toolInputs).toContain("continueCursor");
    expect(tools).toContain(".paginate({ numItems: limit, cursor: listCursor(input) })");
  });
});
