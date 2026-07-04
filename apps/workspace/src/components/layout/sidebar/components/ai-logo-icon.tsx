"use client";

import { cn } from "@/lib/utils";
import QentrahAiLogo from "@/components/ui/qentrah-ai-logo";

export function AiLogoIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center">
      <QentrahAiLogo
        size="md"
        className={cn(
          "h-7 w-7 transition-all duration-300",
          isActive ? "opacity-100" : "opacity-70 hover:opacity-100",
        )}
      />
    </div>
  );
}
