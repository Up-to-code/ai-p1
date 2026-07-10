"use client";

import { Bot, LayoutGrid } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  useSidebarRail,
  type SecondaryPanelMode,
} from "../sidebar-rail-context";
import { getSecondaryPanelModeHref } from "./sidebar-panel-mode";

export { getSecondaryPanelModeHref } from "./sidebar-panel-mode";

export function SidebarPanelModeSwitch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { secondaryPanelMode, setSecondaryPanelMode } = useSidebarRail();

  const switchMode = (mode: SecondaryPanelMode) => {
    if (mode === secondaryPanelMode) return;
    setSecondaryPanelMode(mode);
    router.push(getSecondaryPanelModeHref(mode, searchParams));
  };

  return (
    <div
      role="group"
      aria-label="Secondary panel mode"
      className="flex h-7 items-center rounded-md border border-border bg-background p-0.5"
    >
      <button
        type="button"
        aria-label="Switch to Workspace"
        aria-pressed={secondaryPanelMode === "workspace"}
        title="Workspace"
        onClick={() => switchMode("workspace")}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-sm transition-colors",
          secondaryPanelMode === "workspace"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Switch to AI"
        aria-pressed={secondaryPanelMode === "ai"}
        title="AI"
        onClick={() => switchMode("ai")}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-sm transition-colors",
          secondaryPanelMode === "ai"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Bot className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
