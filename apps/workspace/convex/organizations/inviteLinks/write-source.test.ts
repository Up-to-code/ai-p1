import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const directory = fileURLToPath(new URL(".", import.meta.url));

function readSource(path: string) {
  return readFileSync(resolve(directory, path), "utf8");
}

describe("organization invite link write authorization", () => {
  const source = readSource("write.ts");

  it("allows organization member-create permission without requiring platform admin", () => {
    expect(source).not.toContain("assertPlatformAdmin");
    expect(source).toContain(
      'assertOrganizationResourcePermission(ctx, args.organizationId, "member", "create")',
    );
  });

  it("keeps invite links single-use and handles already-members idempotently", () => {
    expect(source).toContain('inviteLink.status !== "pending"');
    expect(source).toContain('throw new Error("Invite link is no longer active.")');
    expect(source).toContain("inviteLink.expiresAt <= now");
    expect(source).toContain('throw new Error("Invite link has expired.")');
    expect(source).toContain("isAlreadyMemberError");
    expect(source).toContain('status: "used"');
  });
});
