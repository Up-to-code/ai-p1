import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-[0.4] aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none border-0",
        outline:
          "border-border bg-card hover:bg-muted text-foreground aria-expanded:bg-muted shadow-none",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80 aria-expanded:bg-muted/80 shadow-none border-0",
        ghost:
          "hover:bg-muted text-muted-foreground hover:text-foreground aria-expanded:bg-muted border-0 shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 shadow-none border-0",
        link: "text-foreground underline-offset-4 hover:underline border-0 shadow-none",
      },
      size: {
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-8 gap-1 rounded-[min(var(--radius-xs),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[min(var(--radius-sm),12px)] px-4 text-[0.8rem] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-8 has-data-[icon=inline-end]:pe-6 has-data-[icon=inline-start]:ps-6",
        xl: "h-14 gap-2.5 px-10 text-base has-data-[icon=inline-end]:pe-8 has-data-[icon=inline-start]:ps-8",
        icon: "size-9",
        "icon-xs":
          "size-7 rounded-[min(var(--radius-xs),10px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-sm),12px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
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
