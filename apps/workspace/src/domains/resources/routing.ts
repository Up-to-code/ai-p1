function organizationResourcePath(organizationId: string, path: string) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/api/v1/organizations/${organizationId}${suffix}`;
}

function organizationReadPath(organizationId: string, path: string) {
  return organizationResourcePath(organizationId, `/read/${path.replace(/^\/+/u, "")}`);
}

export function organizationApiPath(organizationId: string, ...segments: string[]) {
  const encoded = [organizationId, ...segments].map((segment) => encodeURIComponent(segment));
  return `/api/v1/organizations/${encoded.join("/")}`;
}

export { organizationResourcePath, organizationReadPath };
