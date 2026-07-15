import { describe, expect, it, vi } from "vitest";
import {
  createOrganizationWithUniqueSlug,
  isOrganizationSlugConflict,
  organizationSlugCandidate,
  organizationSlugFromName,
} from "./organization-creation";

describe("organization creation", () => {
  it("keeps display-name normalization separate from slug uniqueness", () => {
    expect(organizationSlugFromName("  Qentrah Studio  ")).toBe("qentrah-studio");
    expect(organizationSlugFromName("شركة قنطرة")).toBe("workspace");
    expect(organizationSlugCandidate("qentrah", 1)).toBe("qentrah");
    expect(organizationSlugCandidate("qentrah", 2)).toBe("qentrah-2");
  });

  it("creates a repeated display name with the next available slug", async () => {
    const create = vi.fn(async ({ name, slug }: { name: string; slug: string }) => ({
      data: { id: "org_2", name, slug },
    }));

    const organization = await createOrganizationWithUniqueSlug({
      name: "Qentrah",
      checkSlug: vi.fn(async ({ slug }) =>
        slug === "qentrah"
          ? { error: { message: "Organization slug already taken" } }
          : { data: { status: true } },
      ),
      create,
    });

    expect(organization).toMatchObject({
      id: "org_2",
      name: "Qentrah",
      slug: "qentrah-2",
    });
    expect(create).toHaveBeenCalledWith({ name: "Qentrah", slug: "qentrah-2" });
  });

  it("retries a race detected during creation", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "Organization already exists" } })
      .mockResolvedValueOnce({ data: { id: "org_3", slug: "acme-2" } });

    const organization = await createOrganizationWithUniqueSlug({
      name: "Acme",
      checkSlug: vi.fn(async () => ({ data: { status: true } })),
      create,
    });

    expect(organization.slug).toBe("acme-2");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("does not hide non-conflict provider errors", async () => {
    await expect(
      createOrganizationWithUniqueSlug({
        name: "Acme",
        checkSlug: async () => ({ error: { message: "Authentication required" } }),
        create: async () => ({ data: { id: "unused" } }),
      }),
    ).rejects.toThrow("Authentication required");
  });

  it("recognizes Better Auth slug collision errors", () => {
    expect(isOrganizationSlugConflict({ message: "Organization already exists" })).toBe(true);
    expect(isOrganizationSlugConflict({ code: "ORGANIZATION_SLUG_ALREADY_TAKEN" })).toBe(true);
    expect(isOrganizationSlugConflict({ message: "Authentication required" })).toBe(false);
  });
});
