import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-zinc-800 shadow-none border-0 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
        outline:
          "border-zinc-100 bg-white hover:bg-zinc-50 text-zinc-900 aria-expanded:bg-zinc-50 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:aria-expanded:bg-white/10",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 aria-expanded:bg-zinc-200 shadow-none border-0 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:aria-expanded:bg-white/15",
        ghost:
          "hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 aria-expanded:bg-zinc-50 border-0 shadow-none dark:hover:bg-white/5 dark:hover:text-white dark:aria-expanded:bg-white/5",
        destructive:
          "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-100 shadow-none border-0 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15 dark:focus-visible:ring-red-500/20",
        link: "text-zinc-900 underline-offset-4 hover:underline border-0 shadow-none dark:text-white",
      },
      size: {
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[min(var(--radius-md),12px)] px-4 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-8 has-data-[icon=inline-end]:pe-6 has-data-[icon=inline-start]:ps-6",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
