"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@anan/platform-core/classnames";

type ResponsiveChartFrameProps = {
  height: number;
  className?: string;
  fallback?: React.ReactNode;
  children: (size: { width: number; height: number }) => React.ReactNode;
};

/**
 * WHY:   Recharts can emit invalid-width warnings when a percentage-sized container mounts before layout settles.
 * WHAT:  Measures a chart host with ResizeObserver and renders the chart only after a valid width exists.
 * HOW:   Keeps a fixed numeric height, observes the host width, and passes stable numeric dimensions to the chart.
 */
export default function ResponsiveChartFrame({
  height,
  className,
  fallback,
  children,
}: ResponsiveChartFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    const updateWidth = (nextWidth: number) => {
      setWidth((current) => {
        const normalized = Math.max(0, Math.floor(nextWidth));
        return current === normalized ? current : normalized;
      });
    };

    updateWidth(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      updateWidth(entry.contentRect.width);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={cn("relative w-full min-w-0", className)} style={{ height }}>
      {width > 0 ? (
        children({ width, height })
      ) : (
        fallback ?? (
          <div className="h-full w-full rounded-[24px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_72%,transparent)]" />
        )
      )}
    </div>
  );
}
