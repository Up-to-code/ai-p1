type OrganizationCreationError = {
  code?: string;
  message?: string;
};

type OrganizationCreationResult<T> = {
  data?: T | null;
  error?: OrganizationCreationError | null;
};

type CreatedOrganization = {
  id?: string | null;
  slug?: string | null;
};

type CreateOrganizationWithUniqueSlugInput<T extends CreatedOrganization> = {
  name: string;
  checkSlug: (input: { slug: string }) => Promise<
    OrganizationCreationResult<{ status?: boolean }>
  >;
  create: (input: { name: string; slug: string }) => Promise<
    OrganizationCreationResult<T>
  >;
  maximumAttempts?: number;
};

function resultErrorMessage(
  error: OrganizationCreationError | null | undefined,
  fallback: string,
) {
  return error?.message ?? error?.code ?? fallback;
}

/** Converts a display name into the stable base for a workspace URL. */
export function organizationSlugFromName(value: string) {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "workspace"
  );
}

/** Keeps the first URL clean and adds a deterministic suffix only on conflict. */
export function organizationSlugCandidate(baseSlug: string, attempt: number) {
  if (attempt <= 1) return baseSlug;
  const suffix = `-${attempt}`;
  return `${baseSlug.slice(0, Math.max(1, 64 - suffix.length))}${suffix}`;
}

export function isOrganizationSlugConflict(
  error: OrganizationCreationError | null | undefined,
) {
  const value = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    value.includes("organization already exists") ||
    (value.includes("slug") &&
      ["already", "exist", "taken", "unique", "duplicate"].some((term) =>
        value.includes(term),
      ))
  );
}

/**
 * Creates an Organization without treating its display name as unique.
 * Better Auth remains authoritative for global slug uniqueness; a concurrent
 * collision is retried with the next deterministic suffix.
 */
export async function createOrganizationWithUniqueSlug<
  T extends CreatedOrganization,
>({
  name,
  checkSlug,
  create,
  maximumAttempts = 50,
}: CreateOrganizationWithUniqueSlugInput<T>) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Workspace name is required.");

  const baseSlug = organizationSlugFromName(trimmedName);
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const slug = organizationSlugCandidate(baseSlug, attempt);
    const availability = await checkSlug({ slug });

    if (availability.error) {
      if (isOrganizationSlugConflict(availability.error)) continue;
      throw new Error(
        resultErrorMessage(availability.error, "Could not check workspace URL."),
      );
    }
    if (availability.data?.status !== true) continue;

    const result = await create({ name: trimmedName, slug });
    if (result.error) {
      if (isOrganizationSlugConflict(result.error)) continue;
      throw new Error(
        resultErrorMessage(result.error, "Could not create the organization."),
      );
    }
    if (!result.data?.id) {
      throw new Error("Could not create the organization.");
    }
    return result.data;
  }

  throw new Error("Could not find an available workspace URL.");
}
