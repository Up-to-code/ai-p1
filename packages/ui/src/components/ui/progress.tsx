import * as React from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
};

function Progress({ className, value = 0, max = 100, ...props }: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-[width]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };
