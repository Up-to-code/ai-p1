"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@qentrah/platform-core/classnames"
import { ColorDot } from "./color-dot"

type Department = "finance" | "hr" | "marketing" | "sales" | "engineering" | "operations" | "legal" | "support"

interface DepartmentDotProps extends HTMLAttributes<HTMLSpanElement> {
  department: Department | string
  showLabel?: boolean
}

const departmentColors: Record<string, string> = {
  finance: "#16a34a",
  hr: "#f97316",
  marketing: "#a855f7",
  sales: "#3b82f6",
  engineering: "#6b7280",
  operations: "#0891b2",
  legal: "#6366f1",
  support: "#ec4899",
}

const DepartmentDot = forwardRef<HTMLSpanElement, DepartmentDotProps>(
  ({ department, showLabel = false, className, ...props }, ref) => {
    const color = departmentColors[department.toLowerCase()] || "#6b7280"
    return (
      <ColorDot
        ref={ref}
        color={color}
        size="sm"
        label={showLabel ? department : undefined}
        className={className}
        {...(props as Omit<HTMLAttributes<HTMLSpanElement>, "children">)}
      />
    )
  }
)
DepartmentDot.displayName = "DepartmentDot"

export { DepartmentDot, type DepartmentDotProps, type Department, departmentColors }
