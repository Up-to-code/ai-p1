"use client";

import { cn } from "@/lib/utils";

export function AiLogoIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai/logo.png"
        alt="Qentrah AI"
        width={28}
        height={28}
        className={cn(
          "h-7 w-7 object-contain transition-all duration-300",
          isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
        )}
      />
    </div>
  );
}
