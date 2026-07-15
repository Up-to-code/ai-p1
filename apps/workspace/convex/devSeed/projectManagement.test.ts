import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./projectManagement.ts", import.meta.url),
  "utf8",
);

describe("development Project portfolio seed safety", () => {
  it("remains internal, explicitly confirmed, and idempotently marked", () => {
    expect(source).toContain("internalMutation");
    expect(source).toContain('const TARGET_EMAIL = "uptocodejs@gmail.com"');
    expect(source).toContain(
      'const CONFIRMATION = "SEED_DEVELOPMENT_PROJECT_MANAGEMENT_DATA"',
    );
    expect(source).toContain("existingMarker");
    expect(source).toContain("alreadySeeded: true");
    expect(source).toContain("repairDevelopmentProjectViews");
    expect(source).toContain("isSystemDefault: false");
    expect(source).toContain("isRemovable: true");
    expect(source).toContain('sharingMode: "shared"');
  });

  it("covers the complete Project-management development graph", () => {
    for (const table of [
      "spaces",
      "projects",
      "tasks",
      "docs",
      "calendarEvents",
      "milestones",
      "channels",
      "messages",
      "notificationEvents",
    ]) {
      expect(source).toContain(`ctx.db.insert("${table}"`);
    }

    for (const viewType of [
      "table",
      "list",
      "board",
      "calendar",
      "timeline",
      "dashboard",
    ]) {
      expect(source).toContain(`viewType: "${viewType}"`);
    }
  });
});
