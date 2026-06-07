import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("project and asset creation history source", () => {
  it("stores project creator identity and creation history in organization audit events", () => {
    const source = readSource("convex/projects/write.ts");

    expect(source).toContain('createdByUserId: user._id');
    expect(source).toContain('ctx.db.insert("organizationAuditEvents"');
    expect(source).toContain('action: "project.create"');
    expect(source).toContain('actorUserId: user._id');
    expect(source).toContain("summary: `Created project ${args.input.name}.`");
  });

  it("stores asset creator identity, project ownership validation, and creation history", () => {
    const source = readSource("convex/assets/write.ts");

    expect(source).toContain('createdByUserId: user._id');
    expect(source).toContain('ctx.db.insert("organizationAuditEvents"');
    expect(source).toContain('action: "asset.create"');
    expect(source).toContain('actorUserId: user._id');
    expect(source).toContain("summary: `Created asset ${args.input.name}.`");
  });

  it("keeps project and asset creation scoped by organization resource permission", () => {
    const projectSource = readSource("convex/projects/write.ts");
    const assetSource = readSource("convex/assets/write.ts");

    expect(projectSource).toContain('assertOrganizationResourcePermission(ctx, args.organizationId, "project", "create")');
    expect(assetSource).toContain('assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "create")');
  });
});
