"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuickChat } from "@/components/layout/quick-chat-context";

/** Opens the quick chat panel from the topbar. */
export function TopbarAssistantButton() {
  const t = useTranslations("Topbar.assistant");
  const { toggle } = useQuickChat();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className={cn(
          "relative flex items-center gap-1.5 px-2 py-1 transition-colors",
          "text-text-muted hover:bg-accent hover:text-text-primary",
        )}
        aria-label={t("open")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ai/logo.png"
          alt="Qentrah AI"
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0 object-contain"
        />
      </Button>
    </div>
  );
}
