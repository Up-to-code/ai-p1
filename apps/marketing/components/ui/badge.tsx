import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-black text-white dark:bg-white dark:text-zinc-900",
        secondary: "border-transparent bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white",
        outline: "border-zinc-200 bg-white text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
