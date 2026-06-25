"use client"

import { forwardRef, type ReactNode } from "react"
import { cn } from "@qentrah/platform-core/classnames"

type TableStatusVariant = "active" | "inactive" | "pending" | "warning" | "error"

interface TableStatusBadgeProps {
  variant: TableStatusVariant
  showIcon?: boolean
  className?: string
  children?: ReactNode
}

const variantStyles: Record<TableStatusVariant, string> = {
  active: "bg-[#dcfce7] text-[#15803d]",
  inactive: "bg-[#fee2e2] text-[#dc2626]",
  pending: "bg-[#fef3c7] text-[#d97706]",
  warning: "bg-[#fef3c7] text-[#d97706]",
  error: "bg-[#fee2e2] text-[#dc2626]",
}

function StatusIcon({ variant }: { variant: TableStatusVariant }) {
  switch (variant) {
    case "active":
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    case "inactive":
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )
    case "pending":
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    case "warning":
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    case "error":
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
  }
}

const TableStatusBadge = forwardRef<HTMLSpanElement, TableStatusBadgeProps>(
  ({ variant, showIcon = true, className, children }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium",
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <StatusIcon variant={variant} />}
      {children}
    </span>
  )
)
TableStatusBadge.displayName = "TableStatusBadge"

export { TableStatusBadge, type TableStatusBadgeProps, type TableStatusVariant }
