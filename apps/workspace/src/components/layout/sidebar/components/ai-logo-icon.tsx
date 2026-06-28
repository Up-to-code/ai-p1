"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AiLogoIcon({ isActive }: { isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  const showPng = hovered || isActive;

  return (
    <div
      className="relative flex h-9 w-9 items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* SVG — default (hidden when PNG shows) */}
      <img
        src="/brand-logo.svg"
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-contain p-1.5 transition-opacity duration-300",
          showPng ? "opacity-0" : "opacity-100",
        )}
      />
      {/* PNG — shows on hover or when active */}
      <img
        src="/ai-logo.png"
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-contain p-1.5 transition-opacity duration-300",
          showPng ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
