import type {
  AuthorizedNavigationProjection,
  NavigationDomain,
  NavigationDomainId,
  NavigationRailMode,
} from "@qentrah/domain-contracts";
import type { NavigationCatalogDomain } from "./catalog";

export type NavigationLayoutLayer = Readonly<{
  domainOrder?: readonly string[];
  hiddenOptionalNodeIds?: readonly string[];
  aliases?: Readonly<Record<string, string>>;
  railMode?: NavigationRailMode;
  secondaryPanelWidth?: number;
  version?: number;
}>;

function orderedDomains(
  domains: readonly NavigationCatalogDomain[],
  orders: readonly (readonly string[] | undefined)[],
): NavigationCatalogDomain[] {
  const byId = new Map<string, NavigationCatalogDomain>(
    domains.map((domain) => [domain.id, domain]),
  );
  const result: NavigationCatalogDomain[] = [];
  const seen = new Set<NavigationDomainId>();
  for (const order of orders) {
    for (const id of order ?? []) {
      const domain = byId.get(id);
      if (domain && !seen.has(domain.id)) {
        seen.add(domain.id);
        result.push(domain);
      }
    }
  }
  for (const domain of domains) {
    if (!seen.has(domain.id)) result.push(domain);
  }
  return result;
}

export function buildAuthorizedNavigationProjection(input: {
  organizationId: string;
  allowedDomainIds: ReadonlySet<NavigationDomainId>;
  catalog: readonly NavigationCatalogDomain[];
  organizationLayout?: NavigationLayoutLayer;
  userOverlay?: NavigationLayoutLayer;
}): AuthorizedNavigationProjection {
  const allowed = input.catalog.filter((domain) => input.allowedDomainIds.has(domain.id));
  const ordered = orderedDomains(allowed, [
    input.userOverlay?.domainOrder,
    input.organizationLayout?.domainOrder,
  ]);
  const aliases = {
    ...(input.organizationLayout?.aliases ?? {}),
    ...(input.userOverlay?.aliases ?? {}),
  };
  const hiddenOptionalNodeIds = new Set([
    ...(input.organizationLayout?.hiddenOptionalNodeIds ?? []),
    ...(input.userOverlay?.hiddenOptionalNodeIds ?? []),
  ]);
  const domains: NavigationDomain[] = ordered.map((domain) => ({
    id: domain.id,
    labelKey: domain.labelKey,
    labelOverride: aliases[`domain:${domain.id}`],
    iconId: domain.iconId,
    routeId: domain.routeId,
    required: domain.required,
    opensPanel: domain.opensPanel,
    nodes: domain.nodes
      .filter((navigationNode) => navigationNode.required || !hiddenOptionalNodeIds.has(navigationNode.id))
      .map((navigationNode) => ({
        ...navigationNode,
        labelOverride: aliases[`node:${navigationNode.id}`],
      })),
  }));
  return {
    organizationId: input.organizationId,
    policyVersion: 1,
    layoutVersion: Math.max(
      input.organizationLayout?.version ?? 0,
      input.userOverlay?.version ?? 0,
    ),
    railMode: input.userOverlay?.railMode ?? input.organizationLayout?.railMode ?? "expanded",
    secondaryPanelWidth: input.userOverlay?.secondaryPanelWidth
      ?? input.organizationLayout?.secondaryPanelWidth
      ?? 248,
    domains,
  };
}
