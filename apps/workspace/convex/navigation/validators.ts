import { v } from "convex/values";

export const navigationDomainIdValidator = v.union(
  v.literal("home"),
  v.literal("inbox"),
  v.literal("spaces"),
  v.literal("projects"),
  v.literal("tasks"),
  v.literal("docs"),
  v.literal("calendar"),
  v.literal("crm"),
  v.literal("delivery"),
  v.literal("resources"),
  v.literal("finance"),
  v.literal("reports"),
  v.literal("automations"),
  v.literal("ai"),
  v.literal("admin"),
);

export const navigationRailModeValidator = v.union(
  v.literal("expanded"),
  v.literal("compact"),
);

export const navigationNodeValidator = v.object({
  id: v.string(),
  domainId: navigationDomainIdValidator,
  parentId: v.optional(v.string()),
  labelKey: v.string(),
  labelOverride: v.optional(v.string()),
  iconId: v.string(),
  routeId: v.string(),
  nodeType: v.union(
    v.literal("route"),
    v.literal("group"),
    v.literal("resource"),
    v.literal("saved_view"),
  ),
  required: v.boolean(),
  opensPanel: v.boolean(),
  children: v.optional(v.array(v.object({
    id: v.string(),
    domainId: navigationDomainIdValidator,
    parentId: v.optional(v.string()),
    labelKey: v.string(),
    labelOverride: v.optional(v.string()),
    iconId: v.string(),
    routeId: v.string(),
    nodeType: v.union(
      v.literal("route"),
      v.literal("group"),
      v.literal("resource"),
      v.literal("saved_view"),
    ),
    required: v.boolean(),
    opensPanel: v.boolean(),
  }))),
});

export const navigationDomainValidator = v.object({
  id: navigationDomainIdValidator,
  labelKey: v.string(),
  labelOverride: v.optional(v.string()),
  iconId: v.string(),
  routeId: v.string(),
  required: v.boolean(),
  opensPanel: v.boolean(),
  nodes: v.array(navigationNodeValidator),
});

export const authorizedNavigationProjectionValidator = v.object({
  organizationId: v.string(),
  policyVersion: v.number(),
  layoutVersion: v.number(),
  railMode: navigationRailModeValidator,
  secondaryPanelWidth: v.number(),
  domains: v.array(navigationDomainValidator),
});
