"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type InfiniteScrollSentinelProps = {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  pageSize: number;
  className?: string;
  exhaustedLabel?: string;
};

export function InfiniteScrollSentinel({
  status,
  loadMore,
  pageSize,
  className,
  exhaustedLabel,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || status !== "CanLoadMore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore(pageSize);
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, pageSize, status]);

  if (status === "LoadingFirstPage") return null;

  return (
    <div ref={ref} className={cn("flex min-h-12 items-center justify-center py-4", className)}>
      {status === "LoadingMore" ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-label="Loading more records" />
      ) : status === "Exhausted" && exhaustedLabel ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{exhaustedLabel}</p>
      ) : null}
    </div>
  );
}
