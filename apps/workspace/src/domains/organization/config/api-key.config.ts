import { Building2, CalendarDays, CheckCircle2, FileText, Users, type LucideIcon } from "lucide-react";
import type { OrganizationApiKeyAction, OrganizationApiKeyExpiry, OrganizationApiKeyResource } from "../api";

export const apiKeyResourceDefinitions: Array<{
  resource: OrganizationApiKeyResource;
  icon: LucideIcon;
  actions: OrganizationApiKeyAction[];
}> = [
  { resource: "organization", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "client", icon: Users, actions: ["read", "create", "update", "delete"] },
  { resource: "project", icon: Building2, actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", icon: CalendarDays, actions: ["read", "create", "update", "delete"] },
  { resource: "task", icon: CheckCircle2, actions: ["read", "create", "update", "delete"] },
  { resource: "media", icon: FileText, actions: ["read", "create", "update", "delete"] },
];

export const apiKeyExpiryOptions: OrganizationApiKeyExpiry[] = ["5h", "14d", "30d", "never"];
