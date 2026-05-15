import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("project and unit creation history source", () => {
  it("stores project creator identity and creation history in organization audit events", () => {
    const source = readSource("convex/projects/write.ts");

    expect(source).toContain('createdByUserId: user._id');
    expect(source).toContain('ctx.db.insert("organizationAuditEvents"');
    expect(source).toContain('action: "project.create"');
    expect(source).toContain('actorUserId: user._id');
    expect(source).toContain("summary: `Created project ${args.input.name}.`");
  });

  it("stores unit creator identity, project ownership validation, and creation history", () => {
    const source = readSource("convex/properties/write.ts");

    expect(source).toContain("await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId)");
    expect(source).toContain('createdByUserId: user._id');
    expect(source).toContain('ctx.db.insert("organizationAuditEvents"');
    expect(source).toContain('action: "property.create"');
    expect(source).toContain('actorUserId: user._id');
    expect(source).toContain("summary: `Created property unit ${args.input.title}.`");
  });

  it("keeps public visibility creation gated to platform admins for projects and units", () => {
    const projectSource = readSource("convex/projects/write.ts");
    const propertySource = readSource("convex/properties/write.ts");

    expect(projectSource).toContain('if ((args.input.visibility ?? "private") === "public")');
    expect(projectSource).toContain("await assertPlatformAdmin(ctx)");
    expect(propertySource).toContain('if ((args.input.visibility ?? "private") === "public")');
    expect(propertySource).toContain("await assertPlatformAdmin(ctx)");
  });
});
