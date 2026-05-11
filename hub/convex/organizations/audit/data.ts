import type { Doc } from "../../_generated/dataModel";
import type { Infer } from "convex/values";
import { organizationAuditCategoryValidator } from "./validators";

type AuditCategory = Infer<typeof organizationAuditCategoryValidator>;

export function auditCategoryForAction(action: string): AuditCategory {
  if (action.includes(".invite") || action.includes(".invitation")) return "invites";
  if (action.includes(".member.")) return "people";
  if (action.includes(".role.")) return "roles";
  if (action.includes(".media.")) return "media";
  if (action.startsWith("client.")) return "clients";
  if (action.startsWith("calendar.")) return "calendar";
  if (action.startsWith("project.")) return "projects";
  if (action.startsWith("property.")) return "properties";
  return "organization";
}

export function toPublicAuditEvent(event: Doc<"organizationAuditEvents">) {
  return {
    id: event._id,
    actorUserId: event.actorUserId,
    action: event.action,
    category: auditCategoryForAction(event.action),
    target: event.target,
    summary: event.summary,
    createdAt: event.createdAt,
  };
}
