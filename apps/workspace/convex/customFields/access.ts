import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

type CustomFieldRecordType = Doc<"customFieldDefinitions">["appliesTo"][number];
type CustomFieldPermissionResource =
  | "client"
  | "deal"
  | "project"
  | "task"
  | "calendar"
  | "document"
  | "media"
  | "space";

const permissionResourceByRecordType = {
  client: "client",
  deal: "deal",
  opportunity: "deal",
  project: "project",
  task: "task",
  calendarEvent: "calendar",
  doc: "document",
  media: "media",
  space: "space",
} as const satisfies Record<CustomFieldRecordType, CustomFieldPermissionResource>;

export function customFieldPermissionResource(
  recordType: CustomFieldRecordType,
): CustomFieldPermissionResource {
  return permissionResourceByRecordType[recordType];
}

/** Authorizes every domain targeted by a custom-field definition. */
export async function assertCustomFieldTargetPermission(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  recordTypes: readonly CustomFieldRecordType[],
  action: "read" | "update",
) {
  const resources = new Set(recordTypes.map(customFieldPermissionResource));
  if (resources.size === 0) {
    throw new Error("Custom fields must target at least one record type");
  }
  for (const resource of resources) {
    await assertOrganizationResourcePermission(ctx, organizationId, resource, action);
  }
}
