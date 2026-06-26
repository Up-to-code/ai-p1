"use client"

import { forwardRef, type ReactNode } from "react"
import { cn } from "@qentrah/platform-core/classnames"

/* ── ListItem Container ─────────────────────────────────────────────────────── */

interface ListItemProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  selected?: boolean
  disabled?: boolean
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function ListItemContainer({ children, onClick, href, selected, disabled, className, onMouseEnter, onMouseLeave }: ListItemProps) {
  const Component = href ? "a" : "div"

  return (
    <Component
      href={href}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        "border-b border-border-light dark:border-white/5",
        "hover:bg-[#f9fafb] dark:hover:bg-white/[0.03]",
        selected && "bg-primary/5 dark:bg-primary/10",
        disabled && "opacity-[0.4] pointer-events-none",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </Component>
  )
}

/* ── ListItem Avatar ────────────────────────────────────────────────────────── */

interface ListItemAvatarProps {
  src?: string
  alt?: string
  initials?: string
  icon?: ReactNode
  color?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const avatarSizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-[11px]",
  lg: "h-12 w-12 text-[12px]",
}

function ListItemAvatar({ src, alt, initials, icon, color, size = "md", className }: ListItemAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full overflow-hidden",
        avatarSizes[size],
        color ? "" : "bg-muted text-muted-foreground",
        className
      )}
      style={color ? { backgroundColor: `${color}15`, color } : undefined}
    >
      {src ? (
        <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
      ) : icon ? (
        icon
      ) : (
        <span className="font-semibold">{initials || "?"}</span>
      )}
    </div>
  )
}

/* ── ListItem Content ───────────────────────────────────────────────────────── */

interface ListItemContentProps {
  primary: ReactNode
  secondary?: ReactNode
  description?: ReactNode
  className?: string
}

function ListItemContent({ primary, secondary, description, className }: ListItemContentProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="flex items-center gap-2">
        <span className="truncate text-[13px] font-medium text-text-primary dark:text-white/90">
          {primary}
        </span>
      </div>
      {secondary && (
        <p className="mt-0.5 truncate text-[12px] text-text-secondary dark:text-white/50">
          {secondary}
        </p>
      )}
      {description && (
        <p className="mt-0.5 truncate text-[11px] text-text-muted dark:text-white/35">
          {description}
        </p>
      )}
    </div>
  )
}

/* ── ListItem Meta (right side) ─────────────────────────────────────────────── */

interface ListItemMetaProps {
  children: ReactNode
  className?: string
}

function ListItemMeta({ children, className }: ListItemMetaProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {children}
    </div>
  )
}

/* ── ListItem Actions (hover reveal) ────────────────────────────────────────── */

interface ListItemActionsProps {
  children: ReactNode
  alwaysVisible?: boolean
  className?: string
}

function ListItemActions({ children, alwaysVisible = false, className }: ListItemActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-opacity",
        alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── ListItem Tag ───────────────────────────────────────────────────────────── */

interface ListItemTagProps {
  children: ReactNode
  className?: string
}

function ListItemTag({ children, className }: ListItemTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-secondary",
        "dark:bg-white/5 dark:text-white/50",
        className
      )}
    >
      {children}
    </span>
  )
}

/* ── ListItem Divider ───────────────────────────────────────────────────────── */

function ListItemDivider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border-light dark:bg-white/5", className)} />
}

/* ── ListItem Empty ─────────────────────────────────────────────────────────── */

interface ListItemEmptyProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

function ListItemEmpty({ icon, title, description, action, className }: ListItemEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && <div className="mb-3 text-text-muted/40 dark:text-white/20">{icon}</div>}
      {title && (
        <p className="text-[13px] font-medium text-text-secondary dark:text-white/60">
          {title}
        </p>
      )}
      {description && (
        <p className="mt-1 text-[12px] text-text-muted dark:text-white/35">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ── List Container ─────────────────────────────────────────────────────────── */

interface ListProps {
  children: ReactNode
  className?: string
  divided?: boolean
}

function List({ children, className, divided = true }: ListProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-border bg-card shadow-sm",
        "dark:border-white/5 dark:bg-white/[0.02]",
        className
      )}
    >
      <div className="divide-y divide-border-light dark:divide-white/5">
        {children}
      </div>
    </div>
  )
}

export {
  ListItemContainer,
  ListItemAvatar,
  ListItemContent,
  ListItemMeta,
  ListItemActions,
  ListItemTag,
  ListItemDivider,
  ListItemEmpty,
  List,
  type ListItemProps,
  type ListItemAvatarProps,
  type ListItemContentProps,
  type ListItemMetaProps,
  type ListItemActionsProps,
  type ListItemTagProps,
  type ListItemEmptyProps,
  type ListProps,
}
