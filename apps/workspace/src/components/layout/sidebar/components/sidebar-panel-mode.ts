import { forwardPersistentParams } from "@/lib/workspace-nav-params";

export type SecondaryPanelMode = "workspace" | "ai";

export function getSecondaryPanelModeHref(
  mode: SecondaryPanelMode,
  currentParams: URLSearchParams,
): string {
  return mode === "ai"
    ? forwardPersistentParams("/ai", currentParams)
    : forwardPersistentParams("/ws", currentParams, {
        mode: "",
        threadId: "",
        state: "",
      });
}
