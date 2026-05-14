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
    if ([".git", ".next", "node_modules"].includes(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) listSourceFiles(fullPath, files);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|prisma)$/u.test(entry)) files.push(fullPath);
  }
  return files;
}

describe("Partners backend boundary", () => {
  it("keeps Partners-owned domains in the Prisma schema", () => {
    const schema = read("prisma/schema.prisma");
    for (const model of [
      "PartnerProfile",
      "ProgrammerOrganization",
      "PartnerApp",
      "SandboxOrganization",
      "SandboxOAuthCode",
      "SandboxOAuthToken",
      "SandboxResource",
      "SandboxRequestLog",
      "PartnerAppReview",
      "PartnerEvent",
      "QentrahWorkspaceLink",
      "QentrahIntegrationEvent",
    ]) {
      expect(schema).toContain(`model ${model}`);
    }
    expect(schema).toContain('url      = env("DATABASE_URL")');
  });

  it("keeps programmer organizations as the only Partners org kind", () => {
    const schema = read("prisma/schema.prisma");
    const signup = read("lib/partner-signup.ts");
    const organizations = read("server/partnerOrganizations.ts");

    expect(schema).toContain('@default("programmer")');
    expect(organizations).toContain('type: "programmer"');
    expect(signup).toContain('type: "programmer"');
    expect(schema).not.toMatch(/"(broker|red|testing)"/u);
    expect(signup).not.toMatch(/organizationType|type:\s*"broker"|type:\s*"red"/u);
  });

  it("does not keep retired backend runtime code or imports in Partners source", () => {
    const retiredPatterns = [
      String.raw`from\s+["'][^"']*` + "conv" + "ex",
      "@" + "conv" + "ex",
      "conv" + "ex/_generated",
      "CON" + "VEX_",
      "NEXT_PUBLIC_CON" + "VEX",
    ];
    const retiredBackendPattern = new RegExp(retiredPatterns.join("|"), "u");
    const offenders = listSourceFiles(partnersRoot)
      .map((file) => ({ file: relative(partnersRoot, file), source: readFileSync(file, "utf8") }))
      .filter(({ source }) => retiredBackendPattern.test(source))
      .map(({ file }) => file);

    expect(offenders).toEqual([]);
  });
});
