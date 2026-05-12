import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const partnersRoot = fileURLToPath(new URL("..", import.meta.url));

function read(relativePath: string) {
  return readFileSync(join(partnersRoot, relativePath), "utf8");
}

function listSourceFiles(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir)) {
    if ([".next", "node_modules", ".git"].includes(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      listSourceFiles(fullPath, files);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/u.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("Partners backend boundary", () => {
  it("keeps Partners-owned domains in the Partners Convex schema", () => {
    const schema = read("convex/schema.ts");

    for (const table of [
      "partnerProfiles",
      "partnerOrganizations",
      "partnerApps",
      "partnerAppReviews",
      "partnerEvents",
      "ananWorkspaceLinks",
      "ananIntegrationEvents",
    ]) {
      expect(schema).toContain(`${table}: defineTable`);
    }
  });

  it("keeps programmer organizations as the only Partners org kind", () => {
    const schema = read("convex/schema.ts");
    const signup = read("lib/partner-signup.ts");
    const organizations = read("convex/partnerOrganizations.ts");

    expect(schema).toContain('type: v.literal("programmer")');
    expect(schema).toContain("tenantOrganizationId");
    expect(organizations).toContain("createProgrammerTenantOrganization");
    expect(organizations).toContain("tenantOrganizationId");
    expect(signup).toContain('type: "programmer"');
    expect(schema).not.toMatch(/v\.literal\("(broker|red|testing)"\)/u);
    expect(signup).not.toMatch(/organizationType|type:\s*"broker"|type:\s*"red"/u);
  });

  it("keeps generated Convex modules pointed at the Partners backend only", () => {
    const generatedApi = read("convex/_generated/api.d.ts");

    expect(generatedApi).toContain("partnerApps");
    expect(generatedApi).toContain("partnerOrganizations");
    expect(generatedApi).toContain("ananIntegrationEvents");
    expect(generatedApi).not.toContain("anan/convex/_generated");
  });

  it("does not import Anan generated Convex APIs from Partners source", () => {
    const offenders = listSourceFiles(partnersRoot)
      .map((file) => {
        const source = readFileSync(file, "utf8");
        return {
          file: relative(partnersRoot, file),
          source,
        };
      })
      .filter(({ source }) =>
        /from\s+["'][^"']*anan\/convex\/_generated\/api|import\s*\(\s*["'][^"']*anan\/convex\/_generated\/api/u.test(source),
      )
      .map(({ file }) => file);

    expect(offenders).toEqual([]);
  });
});
