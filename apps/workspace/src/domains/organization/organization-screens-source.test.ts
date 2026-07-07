import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("organization settings source", () => {
  it("keeps custom permissions in a members drawer instead of a primary tab", () => {
    const organizationScreen = read("src/domains/organization/components/screens/organization-screen.tsx");
    const customPermissionsScreen = read("src/domains/organization/components/screens/custom-permissions-screen.tsx");

    expect(customPermissionsScreen).toContain("CustomPermissionsDrawer");
    expect(organizationScreen).toContain("setCustomPermissionsOpen(true)");
    expect(customPermissionsScreen).toContain('from "@/components/shared/module-panel"');
    expect(customPermissionsScreen).toContain("<ModulePanel");
    expect(customPermissionsScreen).toContain("open={open}");
    expect(customPermissionsScreen).toContain("/organization/custom-permissions");
    expect(organizationScreen).not.toContain('{ id: "roles"');
    expect(organizationScreen).not.toContain("<RoleManagementPanel embedded");
  });
});
