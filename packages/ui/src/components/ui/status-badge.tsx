"use client"

import { forwardRef, type ReactNode } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"

type TableStatusVariant = "active" | "inactive" | "pending" | "warning" | "error"

interface TableStatusBadgeProps {
  variant: TableStatusVariant
  showIcon?: boolean
  className?: string
  children?: ReactNode
}

// Soft Qentrah-token colors. The badge surface is the panel
// (--q-bg-secondary) at low alpha so it doesn't shout; the only
// saturated color is the icon itself. The text stays muted so the
// row isn't visually cluttered.
const variantStyles: Record<TableStatusVariant, { surface: string; text: string; icon: string }> = {
  active: {
    surface: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300/90",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  inactive: {
    surface: "bg-zinc-500/10",
    text: "text-zinc-600 dark:text-zinc-300/80",
    icon: "text-zinc-500 dark:text-zinc-300",
  },
  pending: {
    surface: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-200/90",
    icon: "text-amber-600 dark:text-amber-300",
  },
  warning: {
    surface: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-200/90",
    icon: "text-amber-600 dark:text-amber-300",
  },
  error: {
    surface: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300/90",
    icon: "text-rose-600 dark:text-rose-300",
  },
}

function StatusIcon({ variant }: { variant: TableStatusVariant }) {
  const style = variantStyles[variant]
  switch (variant) {
    case "active":
      return <Check className={cn("h-3 w-3", style.icon)} />
    case "inactive":
      return <X className={cn("h-3 w-3", style.icon)} />
    case "pending":
      return <Clock className={cn("h-3 w-3", style.icon)} />
    case "warning":
      return <AlertTriangle className={cn("h-3 w-3", style.icon)} />
    case "error":
      return <AlertCircle className={cn("h-3 w-3", style.icon)} />
  }
}

const TableStatusBadge = forwardRef<HTMLSpanElement, TableStatusBadgeProps>(
  ({ variant, showIcon = true, className, children }, ref) => {
    const style = variantStyles[variant]
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium border border-border/60",
          style.surface,
          style.text,
          className
        )}
      >
        {showIcon && <StatusIcon variant={variant} />}
        {children}
      </span>
    )
  }
)
TableStatusBadge.displayName = "TableStatusBadge"

export { TableStatusBadge, type TableStatusBadgeProps, type TableStatusVariant }
