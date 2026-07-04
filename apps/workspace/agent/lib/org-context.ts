import type { ToolContext } from "eve/tools";

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export function requireOrgId(ctx: ToolContext): string {
  const auth = ctx.session.auth.current;
  if (!auth) {
    throw new PermissionError("No authentication context in session.");
  }
  const orgId = auth.attributes?.organizationId;
  if (!orgId || typeof orgId !== "string") {
    throw new PermissionError("No organization context in session.");
  }
  return orgId;
}
