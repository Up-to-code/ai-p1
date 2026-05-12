import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AnimatedReveal({
  children,
  className,
  delay = "0ms"
}: {
  children: ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both", className)} style={{ animationDelay: delay }}>
      {children}
    </div>
  );
}
