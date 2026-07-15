import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("agency operating system cutover invariants", () => {
  it("keeps every migration behind Convex internal callables", () => {
    for (const file of ["backfillRecordState.ts", "removeAssets.ts", "prepareAgencyCutover.ts"]) {
      const text = source(`convex/migrations/${file}`);
      expect(text).not.toMatch(/= mutation\s*\(/);
      expect(text).not.toMatch(/= query\s*\(/);
      expect(text).toMatch(/internal(?:Mutation|Query)/);
    }
  });

  it("routes automation writes through the owned command adapter", () => {
    const execute = source("convex/automations/execute.ts");
    expect(execute).toContain("executeAutomationAction");
    for (const table of ["tasks", "docs", "clients", "financeInvoices", "engagements"]) expect(execute).not.toContain(`db.insert(\"${table}\"`);
  });

  it("reauthorizes report source/scope and portal capability independently", () => {
    const reports = source("convex/reports/access.ts"), portal = source("convex/portal/access.ts");
    expect(reports).toContain("assertReportSourceAccess");
    expect(reports).toContain("assertReportScopeAccess");
    expect(reports).toContain("resolveActorTeamIds");
    expect(portal).toContain("hashPortalToken");
    expect(portal).toContain("grant.capabilities.includes(capability)");
    expect(portal).not.toContain("portalIdentityId: args");
  });

  it("retains leading Organization indexes for high-volume agency tables", () => {
    const finance = source("convex/schema/finance.ts"), resources = source("convex/schema/resourcePlanning.ts"), reports = source("convex/schema/reports.ts"), search = source("convex/schema/search.ts");
    expect(finance).toContain('index("by_org_status_due", ["organizationId", "status", "dueAt"])');
    expect(resources).toContain('index("by_org_status_start", ["organizationId", "status", "startAt"])');
    expect(reports).toContain('index("by_org_source_updated", ["organizationId", "source", "updatedAt"])');
    expect(search).toContain('index("by_organization_status_attempt"');
  });
});
