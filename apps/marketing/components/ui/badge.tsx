import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground px-2.5 py-1 border-0 shadow-none",
        secondary:
          "bg-muted text-foreground px-2.5 py-1 border-0 shadow-none",
        destructive:
          "bg-destructive/10 text-destructive px-2.5 py-1 border-0 shadow-none",
        outline:
          "border-border text-muted-foreground bg-card px-2.5 py-1 shadow-none",
        ghost:
          "text-muted-foreground bg-transparent px-2.5 py-1 border-0 shadow-none",
        link: "text-foreground underline px-0 rounded-none border-0 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
