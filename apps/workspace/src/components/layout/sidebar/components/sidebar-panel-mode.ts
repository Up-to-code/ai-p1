import { forwardPersistentParams } from "@/lib/workspace-nav-params";

export type SecondaryPanelMode = "workspace" | "ai";

export type SecondaryPanelRouteMemory = Record<SecondaryPanelMode, string>;

export const DEFAULT_SECONDARY_PANEL_ROUTES: SecondaryPanelRouteMemory = {
  workspace: "/ws",
  ai: "/ai",
};

export function getSecondaryPanelModeForHref(href: string): SecondaryPanelMode {
  const path = href.split("?", 1)[0] ?? "";
  return path === "/ai" || path.startsWith("/ai/") ? "ai" : "workspace";
}

export function buildCurrentModeHref(
  pathname: string,
  currentParams: URLSearchParams,
): string {
  const query = currentParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function isRememberedModeHref(
  mode: SecondaryPanelMode,
  href: string | undefined,
): href is string {
  return Boolean(
    href?.startsWith("/") &&
      !href.startsWith("//") &&
      getSecondaryPanelModeForHref(href) === mode,
  );
}

export function getSecondaryPanelModeHref(
  mode: SecondaryPanelMode,
  currentParams: URLSearchParams,
  rememberedHref?: string,
): string {
  if (isRememberedModeHref(mode, rememberedHref)) {
    return rememberedHref;
  }

  return mode === "ai"
    ? forwardPersistentParams("/ai", currentParams)
    : forwardPersistentParams("/ws", currentParams, {
        mode: "",
        threadId: "",
        state: "",
      });
}
