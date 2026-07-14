import { describe, expect, it, vi } from "vitest";

vi.mock("./project", () => ({ resolveProjectAccess: vi.fn() }));

import { resolveProjectAccess } from "./project";
import { resolveDeliveryAccess } from "./delivery";

function fakeCtx() {
  const chain = { eq: () => chain };
  return {
    db: {
      query: vi.fn(() => ({ withIndex: vi.fn((_name: string, build: (q: typeof chain) => unknown) => { build(chain); return { collect: vi.fn(async () => [{ projectId: "project_1", recordState: "active" }]) }; }) })),
      get: vi.fn(async () => ({ _id: "project_1", organizationId: "org_1", recordState: "active" })),
    },
  };
}

function engagement(ownerUserId = "owner") {
  return { _id: "engagement_1", organizationId: "org_1", ownerUserId, recordState: "active" };
}

describe("Delivery access Interface", () => {
  it("lets an Engagement owner read and update before a Project is linked", async () => {
    vi.mocked(resolveProjectAccess).mockResolvedValue({ actor: { userId: "owner" }, organizationRole: "member", canRead: () => false, canUpdate: () => false } as never);
    const access = await resolveDeliveryAccess(fakeCtx() as never, "org_1");
    await expect(access.canRead(engagement() as never)).resolves.toBe(true);
    await expect(access.canUpdate(engagement() as never)).resolves.toBe(true);
  });

  it("inherits live read/update decisions from linked Projects", async () => {
    vi.mocked(resolveProjectAccess).mockResolvedValue({ actor: { userId: "member" }, organizationRole: "member", canRead: () => true, canUpdate: () => false } as never);
    const access = await resolveDeliveryAccess(fakeCtx() as never, "org_1");
    await expect(access.canRead(engagement() as never)).resolves.toBe(true);
    await expect(access.canUpdate(engagement() as never)).resolves.toBe(false);
  });

  it("rejects cross-Organization Engagement records", async () => {
    vi.mocked(resolveProjectAccess).mockResolvedValue({ actor: { userId: "owner" }, organizationRole: "owner", canRead: () => true, canUpdate: () => true } as never);
    const access = await resolveDeliveryAccess(fakeCtx() as never, "org_1");
    await expect(access.canRead({ ...engagement("owner"), organizationId: "org_2" } as never)).resolves.toBe(false);
  });
});
