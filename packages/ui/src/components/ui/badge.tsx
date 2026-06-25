"use client"

import { forwardRef, type ReactNode } from "react"
import { cn } from "@qentrah/platform-core/classnames"

/* ── Badge Variants ─────────────────────────────────────────────────────────── */

type BadgeVariant =
  // Status pills
  | "draft"
  | "in-progress"
  | "in-review"
  | "completed"
  | "failed"
  | "pending"
  | "scheduled"
  | "blocked"
  | "archived"
  | "on-hold"
  | "waiting"
  | "at-risk"
  // Boolean states
  | "active"
  | "inactive"
  | "enabled"
  | "disabled"
  | "visible"
  | "hidden"
  | "public"
  | "private"
  // Priority
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "none"
  // Roles
  | "owner"
  | "admin"
  | "editor"
  | "viewer"
  | "member"
  | "suspended"
  | "guest"
  // Payment
  | "paid"
  | "overdue"
  | "due-soon"
  | "void"
  | "refunded"
  | "recurring"
  | "trial"
  // Generic
  | "success"
  | "warning"
  | "error"
  | "info"
  | "note"

type BadgeStyle = "pill" | "tag" | "chip" | "outline" | "solid" | "square"
type BadgeSize = "sm" | "md" | "lg"

interface BadgeProps {
  variant: BadgeVariant
  style?: BadgeStyle
  size?: BadgeSize
  showIcon?: boolean
  showDot?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
}

/* ── Color Map ──────────────────────────────────────────────────────────────── */

const colorMap: Record<BadgeVariant, { bg: string; text: string; border?: string; dot: string }> = {
  // Status
  "draft":        { bg: "#f3f3f3", text: "#555555", dot: "#bbbbbb" },
  "in-progress":  { bg: "#fef0e0", text: "#b86600", dot: "#e08c00" },
  "in-review":    { bg: "#e8effe", text: "#2248b8", dot: "#3b5fdd" },
  "completed":    { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "failed":       { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "pending":      { bg: "#fff8e0", text: "#9a6a00", dot: "#e0a800" },
  "scheduled":    { bg: "#eeedfe", text: "#4a3ab8", dot: "#6b5ce7" },
  "blocked":      { bg: "#fde8f5", text: "#922b72", dot: "#cc3d9e" },
  "archived":     { bg: "#f0f0f0", text: "#444444", dot: "#888888" },
  "on-hold":      { bg: "#e0f5ff", text: "#0a5a8a", dot: "#1280c4" },
  "waiting":      { bg: "#f5f0ff", text: "#6837c0", dot: "#8855e0" },
  "at-risk":      { bg: "#fff4e0", text: "#a05400", dot: "#dd7700" },
  // Boolean
  "active":       { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "inactive":     { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "enabled":      { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "disabled":     { bg: "#f0f0f0", text: "#666666", dot: "#888888" },
  "visible":      { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "hidden":       { bg: "#f0f0f0", text: "#666666", dot: "#888888" },
  "public":       { bg: "#e8effe", text: "#2248b8", dot: "#3b5fdd" },
  "private":      { bg: "#f0f0f0", text: "#555555", dot: "#888888" },
  // Priority
  "critical":     { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "high":         { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "medium":       { bg: "#fff8e0", text: "#9a6a00", dot: "#e0a800" },
  "low":          { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "none":         { bg: "#f0f0f0", text: "#666666", dot: "#888888" },
  // Roles
  "owner":        { bg: "#fff0e0", text: "#b86600", dot: "#e08c00" },
  "admin":        { bg: "#eeedfe", text: "#4a3ab8", dot: "#6b5ce7" },
  "editor":       { bg: "#e8effe", text: "#2248b8", dot: "#3b5fdd" },
  "viewer":       { bg: "#f0f0f0", text: "#555555", dot: "#888888" },
  "member":       { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "suspended":    { bg: "#fde8f5", text: "#922b72", dot: "#cc3d9e" },
  "guest":        { bg: "#f0f0f0", text: "#444444", dot: "#888888" },
  // Payment
  "paid":         { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "overdue":      { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "due-soon":     { bg: "#fff8e0", text: "#9a6a00", dot: "#e0a800" },
  "void":         { bg: "#f0f0f0", text: "#555555", dot: "#888888" },
  "refunded":     { bg: "#e8effe", text: "#2248b8", dot: "#3b5fdd" },
  "recurring":    { bg: "#eeedfe", text: "#4a3ab8", dot: "#6b5ce7" },
  "trial":        { bg: "#e0f5ff", text: "#0a5a8a", dot: "#1280c4" },
  // Generic
  "success":      { bg: "#e4f7ed", text: "#17803f", dot: "#1a8a45" },
  "warning":      { bg: "#fff8e0", text: "#9a6a00", dot: "#e0a800" },
  "error":        { bg: "#fce9e9", text: "#b02020", dot: "#d93232" },
  "info":         { bg: "#e8effe", text: "#2248b8", dot: "#3b5fdd" },
  "note":         { bg: "#eeedfe", text: "#4a3ab8", dot: "#6b5ce7" },
}

/* ── Solid Color Map ────────────────────────────────────────────────────────── */

const solidColorMap: Record<BadgeVariant, { bg: string; text: string }> = {
  "draft":        { bg: "#888888", text: "#ffffff" },
  "in-progress":  { bg: "#e08c00", text: "#ffffff" },
  "in-review":    { bg: "#3b5fdd", text: "#ffffff" },
  "completed":    { bg: "#1a8a45", text: "#ffffff" },
  "failed":       { bg: "#d93232", text: "#ffffff" },
  "pending":      { bg: "#e0a800", text: "#ffffff" },
  "scheduled":    { bg: "#6b5ce7", text: "#ffffff" },
  "blocked":      { bg: "#cc3d9e", text: "#ffffff" },
  "archived":     { bg: "#111111", text: "#ffffff" },
  "on-hold":      { bg: "#1280c4", text: "#ffffff" },
  "waiting":      { bg: "#8855e0", text: "#ffffff" },
  "at-risk":      { bg: "#dd7700", text: "#ffffff" },
  "active":       { bg: "#1a8a45", text: "#ffffff" },
  "inactive":     { bg: "#d93232", text: "#ffffff" },
  "enabled":      { bg: "#1a8a45", text: "#ffffff" },
  "disabled":     { bg: "#888888", text: "#ffffff" },
  "visible":      { bg: "#1a8a45", text: "#ffffff" },
  "hidden":       { bg: "#888888", text: "#ffffff" },
  "public":       { bg: "#3b5fdd", text: "#ffffff" },
  "private":      { bg: "#888888", text: "#ffffff" },
  "critical":     { bg: "#d93232", text: "#ffffff" },
  "high":         { bg: "#d93232", text: "#ffffff" },
  "medium":       { bg: "#e0a800", text: "#ffffff" },
  "low":          { bg: "#1a8a45", text: "#ffffff" },
  "none":         { bg: "#888888", text: "#ffffff" },
  "owner":        { bg: "#e08c00", text: "#ffffff" },
  "admin":        { bg: "#6b5ce7", text: "#ffffff" },
  "editor":       { bg: "#3b5fdd", text: "#ffffff" },
  "viewer":       { bg: "#888888", text: "#ffffff" },
  "member":       { bg: "#1a8a45", text: "#ffffff" },
  "suspended":    { bg: "#cc3d9e", text: "#ffffff" },
  "guest":        { bg: "#888888", text: "#ffffff" },
  "paid":         { bg: "#1a8a45", text: "#ffffff" },
  "overdue":      { bg: "#d93232", text: "#ffffff" },
  "due-soon":     { bg: "#e0a800", text: "#ffffff" },
  "void":         { bg: "#888888", text: "#ffffff" },
  "refunded":     { bg: "#3b5fdd", text: "#ffffff" },
  "recurring":    { bg: "#6b5ce7", text: "#ffffff" },
  "trial":        { bg: "#1280c4", text: "#ffffff" },
  "success":      { bg: "#1a8a45", text: "#ffffff" },
  "warning":      { bg: "#e0a800", text: "#ffffff" },
  "error":        { bg: "#d93232", text: "#ffffff" },
  "info":         { bg: "#3b5fdd", text: "#ffffff" },
  "note":         { bg: "#6b5ce7", text: "#ffffff" },
}

/* ── Outline Border Color Map ───────────────────────────────────────────────── */

const outlineBorderMap: Record<BadgeVariant, string> = {
  "draft": "#bbbbbb", "in-progress": "#e08c00", "in-review": "#3b5fdd",
  "completed": "#1a8a45", "failed": "#d93232", "pending": "#e0a800",
  "scheduled": "#6b5ce7", "blocked": "#cc3d9e", "archived": "#aaaaaa",
  "on-hold": "#1280c4", "waiting": "#8855e0", "at-risk": "#dd7700",
  "active": "#1a8a45", "inactive": "#d93232", "enabled": "#1a8a45",
  "disabled": "#888888", "visible": "#1a8a45", "hidden": "#888888",
  "public": "#3b5fdd", "private": "#888888", "critical": "#d93232",
  "high": "#d93232", "medium": "#e0a800", "low": "#1a8a45", "none": "#888888",
  "owner": "#e08c00", "admin": "#6b5ce7", "editor": "#3b5fdd",
  "viewer": "#888888", "member": "#1a8a45", "suspended": "#cc3d9e",
  "guest": "#888888", "paid": "#1a8a45", "overdue": "#d93232",
  "due-soon": "#e0a800", "void": "#888888", "refunded": "#3b5fdd",
  "recurring": "#6b5ce7", "trial": "#1280c4", "success": "#1a8a45",
  "warning": "#e0a800", "error": "#d93232", "info": "#3b5fdd", "note": "#6b5ce7",
}

/* ── Chip Border Color Map ──────────────────────────────────────────────────── */

const chipBorderMap: Record<BadgeVariant, string> = {
  "draft": "#dddddd", "in-progress": "#f5cc80", "in-review": "#9db8f5",
  "completed": "#74c99a", "failed": "#f5a0a0", "pending": "#f5d980",
  "scheduled": "#b8aef5", "blocked": "#e8a0d0", "archived": "#cccccc",
  "on-hold": "#80c8e8", "waiting": "#c8b8f5", "at-risk": "#f5d080",
  "active": "#74c99a", "inactive": "#f5a0a0", "enabled": "#74c99a",
  "disabled": "#cccccc", "visible": "#74c99a", "hidden": "#cccccc",
  "public": "#9db8f5", "private": "#cccccc", "critical": "#f5a0a0",
  "high": "#f5a0a0", "medium": "#f5d980", "low": "#74c99a", "none": "#cccccc",
  "owner": "#f5cc80", "admin": "#b8aef5", "editor": "#9db8f5",
  "viewer": "#cccccc", "member": "#74c99a", "suspended": "#e8a0d0",
  "guest": "#cccccc", "paid": "#74c99a", "overdue": "#f5a0a0",
  "due-soon": "#f5d980", "void": "#cccccc", "refunded": "#9db8f5",
  "recurring": "#b8aef5", "trial": "#80c8e8", "success": "#74c99a",
  "warning": "#f5d980", "error": "#f5a0a0", "info": "#9db8f5", "note": "#b8aef5",
}

/* ── Size Styles ────────────────────────────────────────────────────────────── */

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-3 py-1 text-[13px] gap-1.5",
  lg: "px-4 py-2 text-[15px] gap-2",
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: "w-[5px] h-[5px]",
  md: "w-[7px] h-[7px]",
  lg: "w-[9px] h-[9px]",
}

const iconSizeStyles: Record<BadgeSize, string> = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-5 h-5",
}

/* ── Default Labels ─────────────────────────────────────────────────────────── */

const defaultLabels: Record<BadgeVariant, string> = {
  "draft": "Draft", "in-progress": "In progress", "in-review": "In review",
  "completed": "Completed", "failed": "Failed", "pending": "Pending",
  "scheduled": "Scheduled", "blocked": "Blocked", "archived": "Archived",
  "on-hold": "On hold", "waiting": "Waiting", "at-risk": "At risk",
  "active": "Active", "inactive": "Inactive", "enabled": "Enabled",
  "disabled": "Disabled", "visible": "Visible", "hidden": "Hidden",
  "public": "Public", "private": "Private", "critical": "Critical",
  "high": "High", "medium": "Medium", "low": "Low", "none": "None",
  "owner": "Owner", "admin": "Admin", "editor": "Editor",
  "viewer": "Viewer", "member": "Member", "suspended": "Suspended",
  "guest": "Guest", "paid": "Paid", "overdue": "Overdue",
  "due-soon": "Due soon", "void": "Void", "refunded": "Refunded",
  "recurring": "Recurring", "trial": "Trial", "success": "Success",
  "warning": "Warning", "error": "Error", "info": "Info", "note": "Note",
}

/* ── Badge Component ────────────────────────────────────────────────────────── */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, style = "pill", size = "md", showIcon = false, showDot = false, icon, className, children }, ref) => {
    const colors = colorMap[variant]
    const solidColors = solidColorMap[variant]

    const getBackground = () => {
      if (style === "solid") return solidColors.bg
      if (style === "outline" || style === "chip") return "transparent"
      return colors.bg
    }

    const getTextColor = () => {
      if (style === "solid") return solidColors.text
      return colors.text
    }

    const getBorder = () => {
      if (style === "outline") return `1.5px solid ${outlineBorderMap[variant]}`
      if (style === "chip") return `1px solid ${chipBorderMap[variant]}`
      if (style === "tag" || style === "square") return "none"
      return "none"
    }

    const getRadius = () => {
      if (style === "pill") return "rounded-full"
      if (style === "tag" || style === "chip") return "rounded-[6px]"
      if (style === "square") return "rounded-lg"
      return "rounded-full"
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium whitespace-nowrap",
          getRadius(),
          sizeStyles[size],
          className
        )}
        style={{
          background: getBackground(),
          color: getTextColor(),
          border: getBorder(),
        }}
      >
        {showDot && (
          <span
            className={cn("rounded-full flex-shrink-0", dotSizeStyles[size])}
            style={{ background: colors.dot }}
          />
        )}
        {showIcon && !icon && (
          <span className={cn("flex-shrink-0", iconSizeStyles[size])}>
            <DefaultIcon variant={variant} />
          </span>
        )}
        {icon && (
          <span className={cn("flex-shrink-0", iconSizeStyles[size])}>
            {icon}
          </span>
        )}
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

/* ── Default Icons ──────────────────────────────────────────────────────────── */

function DefaultIcon({ variant }: { variant: BadgeVariant }) {
  const iconClass = "w-full h-full"
  const stroke = "currentColor"
  const sw = "2"

  switch (variant) {
    case "draft":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
        </svg>
      )
    case "in-progress":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
        </svg>
      )
    case "in-review":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 3v6h-6" />
        </svg>
      )
    case "completed":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      )
    case "failed":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    case "pending":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case "scheduled":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case "blocked":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      )
    case "archived":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      )
    case "on-hold":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      )
    case "waiting":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case "at-risk":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    case "critical":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    case "high":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      )
    case "low":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      )
    case "owner":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
        </svg>
      )
    case "admin":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case "editor":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    case "viewer":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case "member":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      )
    case "suspended":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      )
    case "guest":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case "paid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      )
    case "overdue":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    case "due-soon":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case "refunded":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      )
    case "recurring":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} className={iconClass}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

/* ── Number Badge ───────────────────────────────────────────────────────────── */

interface NumberBadgeProps {
  count: number | string
  color?: string
  className?: string
}

function NumberBadge({ count, color = "#d93232", className }: NumberBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-semibold text-white",
        className
      )}
      style={{ background: color }}
    >
      {count}
    </span>
  )
}

export {
  Badge,
  NumberBadge,
  type BadgeProps,
  type BadgeVariant,
  type BadgeStyle,
  type BadgeSize,
  type NumberBadgeProps,
  colorMap,
  solidColorMap,
  defaultLabels,
}
