"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@qentrah/platform-core/classnames"

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
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        {showLabel && <span className="text-[13px] text-text-primary">{department}</span>}
      </span>
    )
  }
)
DepartmentDot.displayName = "DepartmentDot"

export { DepartmentDot, type DepartmentDotProps, type Department, departmentColors }
