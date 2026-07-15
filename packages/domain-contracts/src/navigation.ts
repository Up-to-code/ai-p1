import { z } from "zod";

export const navigationDomainIdSchema = z.enum([
  "home",
  "inbox",
  "spaces",
  "projects",
  "tasks",
  "docs",
  "calendar",
  "crm",
  "delivery",
  "resources",
  "finance",
  "reports",
  "automations",
  "ai",
  "admin",
]);

export const navigationRailModeSchema = z.enum(["expanded", "compact"]);

export const navigationNodeTypeSchema = z.enum([
  "route",
  "group",
  "resource",
  "saved_view",
]);

export const navigationNodeSchema: z.ZodType<NavigationNode> = z.object({
  id: z.string().min(1),
  domainId: navigationDomainIdSchema,
  parentId: z.string().optional(),
  labelKey: z.string().min(1),
  labelOverride: z.string().trim().min(1).optional(),
  iconId: z.string().min(1),
  routeId: z.string().min(1),
  params: z.record(z.string(), z.string()).optional(),
  nodeType: navigationNodeTypeSchema,
  required: z.boolean(),
  opensPanel: z.boolean(),
  children: z.lazy(() => z.array(navigationNodeSchema)).optional(),
});

export const navigationDomainSchema = z.object({
  id: navigationDomainIdSchema,
  labelKey: z.string().min(1),
  labelOverride: z.string().trim().min(1).optional(),
  iconId: z.string().min(1),
  routeId: z.string().min(1),
  required: z.boolean(),
  opensPanel: z.boolean(),
  nodes: z.array(navigationNodeSchema),
});

export const authorizedNavigationProjectionSchema = z.object({
  organizationId: z.string().min(1),
  policyVersion: z.number().int().nonnegative(),
  layoutVersion: z.number().int().nonnegative(),
  railMode: navigationRailModeSchema,
  secondaryPanelWidth: z.number().int().min(188).max(360),
  domains: z.array(navigationDomainSchema),
});

export const navigationOverlayInputSchema = z.object({
  domainOrder: z.array(navigationDomainIdSchema).optional(),
  hiddenOptionalNodeIds: z.array(z.string().min(1)).optional(),
  aliases: z.record(z.string(), z.string().trim().min(1)).optional(),
  railMode: navigationRailModeSchema.optional(),
  secondaryPanelWidth: z.number().int().min(188).max(360).optional(),
});

export type NavigationDomainId = z.infer<typeof navigationDomainIdSchema>;
export type NavigationRailMode = z.infer<typeof navigationRailModeSchema>;
export type NavigationNodeType = z.infer<typeof navigationNodeTypeSchema>;
export type NavigationDomain = z.infer<typeof navigationDomainSchema>;
export type AuthorizedNavigationProjection = z.infer<typeof authorizedNavigationProjectionSchema>;
export type NavigationOverlayInput = z.infer<typeof navigationOverlayInputSchema>;

export interface NavigationNode {
  id: string;
  domainId: NavigationDomainId;
  parentId?: string;
  labelKey: string;
  labelOverride?: string;
  iconId: string;
  routeId: string;
  params?: Record<string, string>;
  nodeType: NavigationNodeType;
  required: boolean;
  opensPanel: boolean;
  children?: NavigationNode[];
}
