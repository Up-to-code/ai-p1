import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("useAccountContext Better Auth wiring", () => {
  it("derives session and organization identity from Better Auth", () => {
    const source = readSource("src/domains/auth/hooks/use-account-context.ts");

    expect(source).toContain("authClient.useSession");
    expect(source).toContain("authClient.useActiveOrganization");
  });
});
