import type { Context } from "hono";
import type { Id, TableNames } from "@convex/_generated/dataModel";
import {
  readEnumQuery,
  readIdParam,
  readOptionalNumberQuery,
  readPaginationQuery,
  readParam,
  readSearchQuery,
  workspaceReadJson,
} from "./workspace-read-helper";

type WorkspaceReadResult<TValue> =
  | { ok: true; data: TValue }
  | { ok: false; response: Response };

export function readOrganizationId(c: Context): WorkspaceReadResult<string> {
  const parsed = readParam(c, "organizationId", "Organization id");
  if (!parsed.ok) return { ok: false, response: parsed.response };
  return { ok: true, data: parsed.data };
}

export async function workspaceOrganizationReadJson<T>(
  c: Context,
  label: string,
  operation: (organizationId: string) => Promise<T>,
) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  return workspaceReadJsonForOrganization(c, label, organizationId.data, operation);
}

export async function workspaceReadJsonForOrganization<T>(
  c: Context,
  label: string,
  organizationId: string,
  operation: (organizationId: string) => Promise<T>,
) {
  return workspaceReadJson(c, label, () => operation(organizationId));
}

export function readWorkspaceListQuery<TValue extends string>(
  c: Context,
  enumName: string,
  allowed: readonly TValue[],
): WorkspaceReadResult<{
  paginationOpts: { numItems: number; cursor: string | null };
  filter: TValue | undefined;
  search: string | undefined;
}> {
  const pagination = readPaginationQuery(c);
  if (!pagination.ok) return { ok: false, response: pagination.response };
  const filter = readEnumQuery(c, enumName, allowed);
  if (!filter.ok) return { ok: false, response: filter.response };
  const search = readSearchQuery(c);
  if (!search.ok) return { ok: false, response: search.response };

  return {
    ok: true,
    data: {
      paginationOpts: pagination.data,
      filter: filter.data,
      search: search.data,
    },
  };
}

export function readWorkspaceIdParam<TTable extends TableNames>(
  c: Context,
  name: string,
  label: string,
) {
  return readIdParam<TTable>(c, name, label);
}

export function readBoundedOptionalLimit(c: Context, maxLimit: number) {
  const rawLimit = readOptionalNumberQuery(c, "limit");
  if (!rawLimit.ok) return rawLimit;
  return {
    ok: true as const,
    data: rawLimit.data === undefined ? undefined : Math.max(1, Math.min(Math.floor(rawLimit.data), maxLimit)),
  };
}

export function castWorkspaceId<TTable extends TableNames>(id: string) {
  return id as Id<TTable>;
}
