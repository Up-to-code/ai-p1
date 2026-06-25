"use client";

import { cn } from "@/lib/utils";

type QentrahAiLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSNAME: Record<QentrahAiLogoSize, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

export default function QentrahAiLogo({
  size = "md",
  animated = false,
  className,
}: {
  size?: QentrahAiLogoSize;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        SIZE_CLASSNAME[size],
        animated && "animate-pulse",
        className,
      )}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai-logo.png"
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}
