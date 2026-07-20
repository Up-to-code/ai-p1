import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@qentrah/platform-core/classnames";

export type SpinnerProps = ComponentProps<typeof LoaderCircle>;

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <LoaderCircle
      aria-label="Loading"
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Spinner };
