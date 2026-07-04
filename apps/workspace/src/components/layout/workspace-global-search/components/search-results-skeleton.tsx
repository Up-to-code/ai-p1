import { cn } from "@/lib/utils";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted/50", className)} />
  );
}

/** One placeholder row shaped like a CmdRow */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <SkeletonBox className="h-8 w-8 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-1.5">
        <SkeletonBox className="h-3 w-2/5 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-12 rounded-full" />
    </div>
  );
}

/**
 * Shows a labelled section of skeleton rows while search results are loading.
 */
export function SearchResultsSkeleton({
  label,
  rows = 4,
}: {
  label: string;
  rows?: number;
}) {
  return (
    <section className="pb-2">
      <div className="px-3 pb-1.5 pt-2">
        <SkeletonBox className="h-2.5 w-20 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonRow key={i} />
      ))}
    </section>
  );
}
