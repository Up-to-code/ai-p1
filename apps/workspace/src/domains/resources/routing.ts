export function organizationApiPath(organizationId: string, ...segments: string[]) {
  const encoded = [organizationId, ...segments].map((segment) => encodeURIComponent(segment));
  return `/api/v1/organizations/${encoded.join("/")}`;
}

function organizationResourcePath(organizationId: string, path: string) {
  const suffix = path.startsWith("/") ? path.slice(1) : path;
  return organizationApiPath(organizationId, ...suffix.split("/").filter(Boolean));
}

function organizationReadPath(organizationId: string, path: string) {
  return organizationResourcePath(organizationId, `/read/${path.replace(/^\/+/u, "")}`);
}

export { organizationResourcePath, organizationReadPath };
