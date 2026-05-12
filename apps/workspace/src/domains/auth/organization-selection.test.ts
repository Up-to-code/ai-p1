import { describe, expect, it, vi } from "vitest";
import {
  createAndSelectOrganization,
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
      nextHref: "/dashboard",
    });

    expect(organization).toEqual({ id: "org_1" });
    expect(calls).toEqual(["setActive", "navigate:/dashboard"]);
  });

  it("passes the selected organization id to navigation", async () => {
    const navigate = vi.fn();

    await selectExistingOrganization({
      organizationId: "org_1",
      setActive: async () => ({ data: { id: "org_1" } }),
      navigate,
      nextHref: "/dashboard",
    });

    expect(navigate).toHaveBeenCalledWith("/dashboard", "org_1");
  });

  it("does not navigate when Better Auth returns an error", async () => {
    const navigate = vi.fn();

    await expect(
      selectExistingOrganization({
        organizationId: "org_1",
        setActive: async () => ({ error: { message: "Not a member" } }),
        navigate,
        nextHref: "/dashboard",
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
        nextHref: "/dashboard",
      }),
    ).rejects.toThrow("Could not select this organization.");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when Better Auth confirms a different organization", async () => {
    const navigate = vi.fn();

    await expect(
      selectExistingOrganization({
        organizationId: "org_1",
        setActive: async () => ({ data: { id: "org_2" } }),
        navigate,
        nextHref: "/dashboard",
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
});
