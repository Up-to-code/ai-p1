import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("asset frontend packet to database source", () => {
  it("keeps selected project fields in the frontend request packet", () => {
    const source = readSource("src/domains/assets/api/assets.ts");

    expect(source).toContain("projectId: values.projectId || undefined");
    expect(source).toContain('project: values.project?.trim() || "Standalone asset"');
    expect(source).toContain("body: assetPayloadFromForm(values)");
  });

  it("allows and forwards project fields through the backend payload", () => {
    const schemaSource = readSource("src/server/domains/assets/validation/asset.schema.ts");
    const serviceSource = readSource("src/server/domains/assets/services/assets.ts");

    expect(schemaSource).toContain('projectId: z.string().trim().min(1).optional()');
    expect(schemaSource).toContain('project: z.string().trim().optional().default("Standalone asset")');
    expect(serviceSource).toContain("input: { ...input, projectId: input.projectId as never }");
  });

  it("validates project ownership and stores the selected project fields in Convex", () => {
    const validatorSource = readSource("convex/assets/validators.ts");
    const writeSource = readSource("convex/assets/write.ts");

    expect(validatorSource).toContain('projectId: v.optional(v.id("projects"))');
    expect(validatorSource).toContain("project: v.string()");
    expect(writeSource).toContain("await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId)");
    expect(writeSource).toContain("...args.input");
    expect(writeSource).toContain('ctx.db.insert("assets"');
  });
});
