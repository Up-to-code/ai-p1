import { BrandMark } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandLoader() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="h-7 w-7" priority />
      <Skeleton className="h-4 w-20 rounded-full" />
    </div>
  );
}
