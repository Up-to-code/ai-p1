import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("organization settings source", () => {
  it("keeps custom permissions in a members drawer instead of a primary tab", () => {
    const source = read("src/domains/organization/components/organization-screens.tsx");

    expect(source).toContain("CustomPermissionsDrawer");
    expect(source).toContain("setCustomPermissionsOpen(true)");
    expect(source).toContain('from "@/components/ui/sheet"');
    expect(source).toContain("<Sheet open={open}");
    expect(source).not.toContain('{ id: "roles"');
    expect(source).not.toContain("<RoleManagementPanel embedded");
  });
});
