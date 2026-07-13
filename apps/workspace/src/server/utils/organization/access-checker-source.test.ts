import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");

function readSource(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("organization capability source", () => {
  it("checks platform admin capability without logging expected denials as Convex errors", () => {
    const convexSource = readSource("convex/platform/access.ts");
    const accessCheckerSource = readSource("src/server/utils/organization/access-checker.ts");

    expect(convexSource).toContain('from "../../../../packages/auth/src/platform-admin"');
    expect(convexSource).not.toContain('from "@qentrah/auth"');
    expect(convexSource).toContain("return { allowed: isPlatformAdminEmail(user.email) }");
    expect(convexSource).not.toContain("await assertPlatformAdmin(ctx);\n    return { allowed: true };");
    expect(accessCheckerSource).toContain(".then((result) => result.allowed)");
    expect(accessCheckerSource).not.toContain(".then(() => true)");
  });
});
