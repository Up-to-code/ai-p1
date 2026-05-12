import type {
  WorkspaceAudience,
  WorkspaceCapabilities,
  WorkspaceZoneKey,
} from "@anan/domain-contracts/workspace";
import {
  resolveVisibleZoneKeys,
  resolveWorkspaceCapabilities,
} from "@anan/domain-contracts/workspace";

export const WORKSPACE_BASE_ZONE_KEYS = ["overview", "settings"] as const satisfies readonly WorkspaceZoneKey[];
export const WORKSPACE_BUSINESS_ZONE_KEYS = [
  "market",
  "projects",
  "offers",
  "crm",
  "inbox",
] as const satisfies readonly WorkspaceZoneKey[];

export type WorkspaceZoneDescriptor = {
  key: WorkspaceZoneKey;
  requiresBusinessAudience: boolean;
};

export const WORKSPACE_ZONE_DESCRIPTORS: readonly WorkspaceZoneDescriptor[] = [
  { key: "overview", requiresBusinessAudience: false },
  { key: "market", requiresBusinessAudience: true },
  { key: "projects", requiresBusinessAudience: true },
  { key: "offers", requiresBusinessAudience: true },
  { key: "crm", requiresBusinessAudience: true },
  { key: "inbox", requiresBusinessAudience: true },
  { key: "settings", requiresBusinessAudience: false },
];

export function getWorkspaceZoneKeysForAudience(audience: WorkspaceAudience): WorkspaceZoneKey[] {
  return resolveVisibleZoneKeys(audience);
}

export function getWorkspaceCapabilitiesForAudience(audience: WorkspaceAudience): WorkspaceCapabilities {
  return resolveWorkspaceCapabilities(getWorkspaceZoneKeysForAudience(audience));
}

export function isBusinessWorkspaceAudience(audience: WorkspaceAudience): audience is "broker" | "developer" {
  return audience === "broker" || audience === "developer";
}
