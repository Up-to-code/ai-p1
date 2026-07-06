"use client";

import { cn } from "@/lib/utils";

export function AiLogoIcon({ isActive, size }: { isActive: boolean; size?: number }) {
  const px = size ? `${size}px` : "28px";
  return (
    <div className="flex h-10 w-10 items-center justify-center" style={{ width: "40px", height: "40px" }}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg transition-all",
          isActive
            ? "bg-blue-500/10 ring-1 ring-blue-500/30"
            : "ring-0",
        )}
        style={{ width: px, height: px }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ai/logo.png"
          alt="Qentrah AI"
          width={size ?? 28}
          height={size ?? 28}
          className="object-contain transition-opacity"
          style={{ opacity: isActive ? 1 : 0.6 }}
        />
      </div>
    </div>
  );
}