import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("useAccountContext Clerk wiring", () => {
  it("derives session and organization identity from Clerk", () => {
    const source = readSource("src/domains/auth/hooks/use-account-context.ts");

    expect(source).toContain("useAuth");
    expect(source).toContain("useUser");
    expect(source).toContain("useOrganization");
    expect(source).toContain("useConvexAuth");
  });
});
