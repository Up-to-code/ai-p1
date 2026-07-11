import { describe, expect, it, vi } from "vitest";
import {
  createAndSelectOrganization,
  completeOrganizationEntry,
  requireOrganizationResult,
  selectExistingOrganization,
} from "./organization-selection";

describe("organization selection flow", () => {
  it("selects an existing organization, then navigates", async () => {
    const calls: string[] = [];
    const organization = await selectExistingOrganization({
      organizationId: "org_1",
      setActive: vi.fn(async () => {
        calls.push("setActive");
        return { data: { id: "org_1" } };
      }),
      navigate: vi.fn((href) => {
        calls.push(`navigate:${href}`);
      }),
      nextHref: "/ws",
    });

    expect(organization).toEqual({ id: "org_1" });
    expect(calls).toEqual(["setActive", "navigate:/ws"]);
  });

  it("passes the selected organization id to navigation", async () => {
    const navigate = vi.fn();

    await selectExistingOrganization({
      organizationId: "org_1",
      setActive: async () => ({ data: { id: "org_1" } }),
      navigate,
      nextHref: "/ws",
    });

    expect(navigate).toHaveBeenCalledWith("/ws", "org_1");
  });

  it("does not navigate when dev identity returns an error", async () => {
    const navigate = vi.fn();

    await expect(
      selectExistingOrganization({
        organizationId: "org_1",
        setActive: async () => ({ error: { message: "Not a member" } }),
        navigate,
        nextHref: "/ws",
      }),
    ).rejects.toThrow("Not a member");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when the selected organization response is empty", async () => {
    const navigate = vi.fn();

    await expect(
      selectExistingOrganization({
        organizationId: "org_1",
        setActive: async () => ({ data: null }),
        navigate,
        nextHref: "/ws",
      }),
    ).rejects.toThrow("Could not select this organization.");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when dev identity confirms a different organization", async () => {
    const navigate = vi.fn();

    await expect(
      selectExistingOrganization({
        organizationId: "org_1",
        setActive: async () => ({ data: { id: "org_2" } }),
        navigate,
        nextHref: "/ws",
      }),
    ).rejects.toThrow("Could not select this organization.");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("creates an organization, explicitly selects it, then navigates", async () => {
    const setActive = vi.fn(async () => ({ data: { id: "org_new" } }));
    const navigate = vi.fn();

    await createAndSelectOrganization({
      create: async () => ({ data: { id: "org_new" } }),
      setActive,
      navigate,
      nextHref: "/settings/organization",
    });

    expect(setActive).toHaveBeenCalledWith({ organizationId: "org_new" });
    expect(navigate).toHaveBeenCalledWith("/settings/organization", "org_new");
  });

  it("does not select or navigate when organization creation does not return an id", async () => {
    const setActive = vi.fn();
    const navigate = vi.fn();

    await expect(
      createAndSelectOrganization({
        create: async () => ({ data: {} }),
        setActive,
        navigate,
        nextHref: "/settings/organization",
      }),
    ).rejects.toThrow("Could not create this organization.");

    expect(setActive).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("normalizes result errors with code fallbacks", () => {
    expect(() => requireOrganizationResult({ error: { code: "ORG_NOT_FOUND" } }, "fallback")).toThrow("ORG_NOT_FOUND");
    expect(() => requireOrganizationResult({ error: {} }, "fallback")).toThrow("fallback");
  });

  it("completes Organization entry in activation, handoff, seed, navigation order", async () => {
    const calls: string[] = [];

    await completeOrganizationEntry({
      organizationId: "org_1",
      setActive: async () => {
        calls.push("active");
        return { data: { id: "org_1" } };
      },
      writeHandoff: () => calls.push("handoff"),
      seedWorkspace: async () => {
        calls.push("seed");
      },
      navigate: (href) => calls.push(`navigate:${href}`),
      nextHref: "/ws",
      errorMessage: "Could not enter workspace.",
    });

    expect(calls).toEqual(["active", "handoff", "seed", "navigate:/ws"]);
  });

  it("does not hand off, seed, or navigate when activation fails", async () => {
    const writeHandoff = vi.fn();
    const seedWorkspace = vi.fn();
    const navigate = vi.fn();

    await expect(
      completeOrganizationEntry({
        organizationId: "org_1",
        setActive: async () => ({ error: { message: "Not a member" } }),
        writeHandoff,
        seedWorkspace,
        navigate,
        nextHref: "/ws",
        errorMessage: "Could not enter workspace.",
      }),
    ).rejects.toThrow("Not a member");

    expect(writeHandoff).not.toHaveBeenCalled();
    expect(seedWorkspace).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when Workspace seeding fails", async () => {
    const navigate = vi.fn();

    await expect(
      completeOrganizationEntry({
        organizationId: "org_1",
        setActive: async () => ({}),
        writeHandoff: vi.fn(),
        seedWorkspace: async () => {
          throw new Error("Seed failed");
        },
        navigate,
        nextHref: "/ws",
        errorMessage: "Could not enter workspace.",
      }),
    ).rejects.toThrow("Seed failed");

    expect(navigate).not.toHaveBeenCalled();
  });
});
