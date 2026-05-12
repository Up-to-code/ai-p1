type AuthError = { message?: string; code?: string };

export type OrganizationSelection = {
  id?: string | null;
};

export type AuthResult<T> = {
  data?: T | null;
  error?: AuthError | null;
};

type SelectExistingOrganizationInput<TOrganization extends OrganizationSelection> = {
  organizationId: string;
  setActive: (input: { organizationId: string }) => Promise<AuthResult<TOrganization>>;
  navigate: (href: string, organizationId: string) => void;
  nextHref: string;
};

type CreateOrganizationInput<TOrganization extends OrganizationSelection> = {
  create: () => Promise<AuthResult<TOrganization>>;
  setActive: (input: { organizationId: string }) => Promise<AuthResult<TOrganization | null>>;
  navigate: (href: string, organizationId: string) => void;
  nextHref: string;
};

function authResultError(error: AuthError | null | undefined, fallback: string) {
  if (!error) return fallback;
  return error.message ?? error.code ?? fallback;
}

export function requireOrganizationResult<TOrganization extends OrganizationSelection>(
  result: AuthResult<TOrganization | null>,
  fallback: string,
  expectedOrganizationId?: string,
) {
  if (result.error) {
    throw new Error(authResultError(result.error, fallback));
  }

  const organizationId = result.data?.id;
  if (!organizationId) {
    throw new Error(fallback);
  }

  if (expectedOrganizationId && organizationId !== expectedOrganizationId) {
    throw new Error(fallback);
  }

  return result.data as TOrganization;
}

export async function selectExistingOrganization<TOrganization extends OrganizationSelection>({
  organizationId,
  setActive,
  navigate,
  nextHref,
}: SelectExistingOrganizationInput<TOrganization>) {
  const organization = requireOrganizationResult(
    await setActive({ organizationId }),
    "Could not select this organization.",
    organizationId,
  );

  navigate(nextHref, organization.id!);

  return organization;
}

export async function createAndSelectOrganization<TOrganization extends OrganizationSelection>({
  create,
  setActive,
  navigate,
  nextHref,
}: CreateOrganizationInput<TOrganization>) {
  const organization = requireOrganizationResult(
    await create(),
    "Could not create this organization.",
  );

  requireOrganizationResult(
    await setActive({ organizationId: organization.id! }),
    "Could not select the new organization.",
    organization.id!,
  );

  navigate(nextHref, organization.id!);

  return organization;
}
