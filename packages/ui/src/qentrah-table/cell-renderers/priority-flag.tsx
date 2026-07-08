"use client"

import { Flag } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"

export type QentrahPriority = "urgent" | "high" | "normal" | "low" | string

export type QentrahPriorityVariant = "pill" | "chip" | "square"

export interface PriorityFlagProps {
  priority: QentrahPriority
  className?: string
  size?: "xs" | "sm"
  withBackground?: boolean
  variant?: QentrahPriorityVariant
  onClick?: () => void
}

interface PriorityConfig {
  label: string
  vars: { bg: string; text: string; icon: string }
}

const config: Record<string, PriorityConfig> = {
  urgent: {
    label: "Urgent",
    vars: { bg: "--q-priority-urgent-bg", text: "--q-priority-urgent-text", icon: "--q-priority-urgent-icon" },
  },
  high: {
    label: "High",
    vars: { bg: "--q-priority-high-bg", text: "--q-priority-high-text", icon: "--q-priority-high-icon" },
  },
  normal: {
    label: "Normal",
    vars: { bg: "--q-priority-normal-bg", text: "--q-priority-normal-text", icon: "--q-priority-normal-icon" },
  },
  low: {
    label: "Low",
    vars: { bg: "--q-priority-low-bg", text: "--q-priority-low-text", icon: "--q-priority-low-icon" },
  },
}

export function priorityConfigFor(priority: QentrahPriority): PriorityConfig {
  return config[priority] ?? config.normal
}

export function PriorityFlag({
  priority,
  className,
  size = "sm",
  withBackground = true,
  variant = "chip",
  onClick,
}: PriorityFlagProps) {
  const cfg = priorityConfigFor(priority)
  const padding = size === "xs" ? "px-2 py-[2px]" : "px-2.5 py-1"
  const textSize = size === "xs" ? "text-[10px]" : "text-[11px]"
  const radius =
    variant === "pill" ? "rounded-full" : variant === "square" ? "rounded-md" : "rounded-[6px]"

  const interactive = typeof onClick === "function"

  // Read-only render as <span> so it can be nested inside a
  // CellPopover trigger button. Interactive = <button>.
  const Tag = interactive ? "button" : ("span" as const)

  return (
    <Tag
      {...(interactive ? { type: "button" as const, onClick } : {})}
      data-qentrah-priority-flag
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tracking-wide whitespace-nowrap",
        "transition-[background-color,color,transform] duration-150 ease-out",
        radius,
        padding,
        textSize,
        interactive &&
          "cursor-pointer hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
        !interactive && "cursor-default",
        className
      )}
      style={{
        background: withBackground ? `var(${cfg.vars.bg})` : "transparent",
        color: `var(${cfg.vars.text})`,
      }}
    >
      <Flag className="h-3 w-3" style={{ color: `var(${cfg.vars.icon})` }} />
      {cfg.label}
    </Tag>
  )
}
