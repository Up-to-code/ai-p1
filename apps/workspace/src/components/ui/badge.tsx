import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-black text-white px-2.5 py-1 border-0 shadow-none dark:bg-white dark:text-zinc-900",
        secondary:
          "bg-zinc-100 text-zinc-900 px-2.5 py-1 border-0 shadow-none dark:bg-white/10 dark:text-white",
        destructive:
          "bg-red-50 text-red-600 px-2.5 py-1 border-0 shadow-none dark:bg-red-500/10 dark:text-red-300",
        outline:
          "border-zinc-100 text-zinc-400 bg-white px-2.5 py-1 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
        ghost:
          "text-zinc-400 bg-transparent px-2.5 py-1 border-0 shadow-none dark:text-zinc-400",
        link: "text-zinc-900 underline px-0 rounded-none border-0 shadow-none dark:text-white",
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
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
