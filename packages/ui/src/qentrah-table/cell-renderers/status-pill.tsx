"use client"

import { Check } from "lucide-react"
import { cn } from "@qentrah/platform-core/classnames"

export type QentrahStatus =
  | "todo"
  | "inProgress"
  | "waiting"
  | "done"
  | "canceled"
  | string

export type QentrahStatusVariant = "pill" | "chip" | "square"

export interface StatusPillProps {
  status: QentrahStatus
  className?: string
  size?: "xs" | "sm"
  variant?: QentrahStatusVariant
  onClick?: () => void
}

interface StatusConfig {
  label: string
  vars: { bg: string; text: string; dot: string; border: string }
  check?: boolean
}

const statusConfig: Record<string, StatusConfig> = {
  todo: {
    label: "TO DO",
    vars: { bg: "--q-status-todo-bg", text: "--q-status-todo-text", dot: "--q-status-todo-dot", border: "--q-status-todo-border" },
  },
  inProgress: {
    label: "IN PROGRESS",
    vars: { bg: "--q-status-inProgress-bg", text: "--q-status-inProgress-text", dot: "--q-status-inProgress-dot", border: "--q-status-inProgress-border" },
  },
  waiting: {
    label: "WAITING",
    vars: { bg: "--q-status-waiting-bg", text: "--q-status-waiting-text", dot: "--q-status-waiting-dot", border: "--q-status-waiting-border" },
  },
  done: {
    label: "COMPLETE",
    vars: { bg: "--q-status-done-bg", text: "--q-status-done-text", dot: "--q-status-done-dot", border: "--q-status-done-border" },
    check: true,
  },
  canceled: {
    label: "CANCELED",
    vars: { bg: "--q-status-canceled-bg", text: "--q-status-canceled-text", dot: "--q-status-canceled-dot", border: "--q-status-canceled-border" },
  },
}

export function statusConfigFor(status: QentrahStatus): StatusConfig {
  return statusConfig[status] ?? statusConfig.todo
}

export function StatusPill({
  status,
  className,
  size = "sm",
  variant = "chip",
  onClick,
}: StatusPillProps) {
  const cfg = statusConfigFor(status)
  const padding = size === "xs" ? "px-2 py-[2px]" : "px-2.5 py-1"
  const textSize = size === "xs" ? "text-[10px]" : "text-[11px]"
  const radius =
    variant === "pill" ? "rounded-full" : variant === "square" ? "rounded-md" : "rounded-[6px]"

  const interactive = typeof onClick === "function"

  // When interactive, render as a real <button>. When read-only (the
  // common case for AG Grid cell renderers and as the trigger inside
  // a CellPopover), render as a <span> so it can be nested inside
  // another <button> without invalid HTML.
  const Tag = interactive ? "button" : ("span" as const)

  return (
    <Tag
      {...(interactive ? { type: "button" as const, onClick } : {})}
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
        background: `var(${cfg.vars.bg})`,
        color: `var(${cfg.vars.text})`,
      }}
    >
      {cfg.check ? (
        <Check className="h-3 w-3" strokeWidth={3.5} />
      ) : (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: `var(${cfg.vars.dot})` }}
        />
      )}
      {cfg.label}
    </Tag>
  )
}
