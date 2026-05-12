import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const partnersRoot = fileURLToPath(new URL("..", import.meta.url));

function read(relativePath: string) {
  return readFileSync(join(partnersRoot, relativePath), "utf8");
}

describe("partner account backend ownership", () => {
  it("requires authenticated Partners identity for account reads and updates", () => {
    const account = read("convex/partnerAccount.ts");

    expect(account).toContain("requirePartnerIdentity(ctx)");
    expect(account).toContain("ensurePartnerProfile(ctx, now)");
    expect(account).toContain("PROGRAMMER_ORGANIZATION_REQUIRED");
  });

  it("keeps programmer organization updates inside the programmer org boundary", () => {
    const account = read("convex/partnerAccount.ts");
    const organizations = read("convex/partnerOrganizations.ts");

    expect(account).toContain('type: "programmer"');
    expect(account).toContain("partner_organization.updated");
    expect(organizations).toContain("tenantOrganizationId");
    expect(organizations).toContain('type: "programmer"');
  });
});
