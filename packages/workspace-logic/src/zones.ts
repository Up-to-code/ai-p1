import type {
  WorkspaceAudience,
  WorkspaceCapabilities,
  WorkspaceZoneKey,
} from "@qentrah/domain-contracts/workspace";
import {
  resolveVisibleZoneKeys,
  resolveWorkspaceCapabilities,
} from "@qentrah/domain-contracts/workspace";

export const WORKSPACE_BASE_ZONE_KEYS = ["overview", "settings"] as const satisfies readonly WorkspaceZoneKey[];
export const WORKSPACE_BUSINESS_ZONE_KEYS = [
  "clients",
  "opportunities",
  "projects",
  "tasks",
  "calendar",
  "assets",
  "automations",
  "integrations",
  "team",
] as const satisfies readonly WorkspaceZoneKey[];

export type WorkspaceZoneDescriptor = {
  key: WorkspaceZoneKey;
  requiresBusinessAudience: boolean;
};

export const WORKSPACE_ZONE_DESCRIPTORS: readonly WorkspaceZoneDescriptor[] = [
  { key: "overview", requiresBusinessAudience: false },
  { key: "clients", requiresBusinessAudience: true },
  { key: "opportunities", requiresBusinessAudience: true },
  { key: "projects", requiresBusinessAudience: true },
  { key: "tasks", requiresBusinessAudience: true },
  { key: "calendar", requiresBusinessAudience: true },
  { key: "assets", requiresBusinessAudience: true },
  { key: "automations", requiresBusinessAudience: true },
  { key: "integrations", requiresBusinessAudience: true },
  { key: "team", requiresBusinessAudience: true },
  { key: "settings", requiresBusinessAudience: false },
];

export function getWorkspaceZoneKeysForAudience(audience: WorkspaceAudience): WorkspaceZoneKey[] {
  return resolveVisibleZoneKeys(audience);
}

export function getWorkspaceCapabilitiesForAudience(audience: WorkspaceAudience): WorkspaceCapabilities {
  return resolveWorkspaceCapabilities(getWorkspaceZoneKeysForAudience(audience));
}

export function isBusinessWorkspaceAudience(audience: WorkspaceAudience): audience is "workspace" {
  return audience === "workspace";
}
