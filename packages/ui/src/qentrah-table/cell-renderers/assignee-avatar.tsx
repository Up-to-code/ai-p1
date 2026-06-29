"use client"

import { cn } from "@qentrah/platform-core/classnames"

export interface AssigneeAvatarProps {
  name?: string | null
  imageUrl?: string | null
  size?: "sm" | "md"
  showName?: boolean
  showPlaceholderWhenEmpty?: boolean
  className?: string
}

const palette = [
  "bg-[var(--q-data-cyan)]",
  "bg-[var(--q-agent-purple)]",
  "bg-[var(--q-human-green)]",
  "bg-[var(--q-automation-orange)]",
  "bg-[var(--q-error)]",
  "bg-[var(--q-agent-purple)]",
  "bg-[var(--q-human-green)]",
  "bg-[var(--q-automation-orange)]",
]

function colorFor(seed: string | null | undefined): string {
  if (!seed) return palette[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return palette[Math.abs(hash) % palette.length]
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AssigneeAvatar({
  name,
  imageUrl,
  size = "md",
  showName = true,
  showPlaceholderWhenEmpty = false,
  className,
}: AssigneeAvatarProps) {
  const dim = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]"
  const hasName = !!(name && name.trim())
  const display = hasName ? (name as string) : ""
  const initialsText = hasName ? initials(display) : "—"

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ring-1 ring-[var(--q-border)]",
          dim,
          !imageUrl && colorFor(hasName ? display : "unassigned"),
          !hasName && "bg-zinc-700/60 text-zinc-500"
        )}
        title={hasName ? display : "Unassigned"}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={display} className="h-full w-full rounded-full object-cover" />
        ) : (
          initialsText
        )}
      </div>
      {showName && hasName && (
        <span className="truncate text-xs text-foreground/90">{display}</span>
      )}
      {showName && !hasName && showPlaceholderWhenEmpty && (
        <span className="truncate text-xs text-muted-foreground/60">Unassigned</span>
      )}
    </div>
  )
}
