"use client";

import { Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAssistantPanel } from "@/components/layout/use-assistant-panel";
import { cn } from "@/lib/utils";

/** Toggles the workspace AI assistant side panel from the topbar. */
export function TopbarAssistantButton() {
  const t = useTranslations("Topbar.assistant");
  const { togglePanel, isOpen: isAiPanelOpen } = useAssistantPanel();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={togglePanel}
      className={cn(
        "h-8 w-8 transition-colors",
        isAiPanelOpen
          ? "bg-[var(--q-user-bubble)]/10 text-[var(--q-user-bubble)] hover:bg-[var(--q-user-bubble)]/20"
          : "text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary",
      )}
      aria-label={isAiPanelOpen ? t("close") : t("open")}
    >
      <Bot className="h-4 w-4" />
    </Button>
  );
}
