"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@qentrah/platform-core/classnames"

export interface CellPopoverProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "end"
  minWidth?: number
  className?: string
}

/**
 * Self-contained popover for table cells. Renders the trigger inline
 * and portals the content to document.body, anchored to the cell rect.
 *
 * A click-anywhere-else scrim is rendered while the popover is open
 * so the rest of the table (and the next row's status pill) is
 * visually masked — prevents the "extra burger sticking out"
 * effect where adjacent row content peeks under the popover.
 *
 * Uses `pointerdown` (not `mousedown`) for outside-click detection so
 * the handler fires before `click` on the option buttons. The content
 * ref check ensures clicks inside the popover never close it.
 */
export function CellPopover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  minWidth,
  className,
}: CellPopoverProps) {
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = React.useState<{ top: number; left: number; minWidth: number; maxHeight: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  React.useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const trigger = triggerRef.current
    const cell = trigger?.closest(".ag-cell")
    const triggerRect = trigger?.getBoundingClientRect()
    const cellRect = cell instanceof HTMLElement ? cell.getBoundingClientRect() : null
    const anchorRect =
      triggerRect && triggerRect.width > 0 && triggerRect.height > 0
        ? triggerRect
        : cellRect && cellRect.width > 0 && cellRect.height > 0
          ? cellRect
          : null
    if (!anchorRect) return
    const padding = 8
    const estimatedHeight = 320
    const width = minWidth ?? Math.max(anchorRect.width, 240)
    const clampedWidth = Math.min(width, window.innerWidth - padding * 2)
    const left =
      align === "end"
        ? anchorRect.right - clampedWidth
        : anchorRect.left
    const clampedLeft = Math.min(Math.max(padding, left), window.innerWidth - clampedWidth - padding)
    const spaceBelow = window.innerHeight - anchorRect.bottom - padding
    const spaceAbove = anchorRect.top - padding
    const opensAbove = spaceBelow < Math.min(estimatedHeight, spaceAbove)
    const maxHeight = Math.max(160, opensAbove ? spaceAbove - 6 : spaceBelow - 6)
    setPosition({
      top: opensAbove ? Math.max(padding, anchorRect.top - Math.min(estimatedHeight, maxHeight) - 6) : anchorRect.bottom + 6,
      left: clampedLeft,
      minWidth: clampedWidth,
      maxHeight,
    })
  }, [open, align, minWidth])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      onOpenChange(false)
    }
    const onScroll = () => onOpenChange(false)
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onScroll, true)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onScroll, true)
    }
  }, [open, onOpenChange])

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="inline-flex max-w-full"
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(!open)
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return
          e.preventDefault()
          e.stopPropagation()
          onOpenChange(!open)
        }}
      >
        {trigger}
      </div>
      {mounted && open && position
        ? createPortal(
            <>
              {/* Scrim behind the popover — masks the rest of the
                  table (especially the next row's status pill) so
                  no adjacent content peeks under the popover. */}
              <div
                data-qentrah-cell-popover-scrim
                onClick={() => onOpenChange(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9998,
                  background: "color-mix(in srgb, var(--q-bg) 30%, transparent)",
                  animation: "qentrah-cell-popover-scrim-in 120ms ease-out",
                }}
              />
              <div
                ref={contentRef}
                data-qentrah-cell-popover
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  minWidth: position.minWidth,
                  maxHeight: position.maxHeight,
                  zIndex: 9999,
                }}
                className={cn(
                  "rounded-lg border border-[var(--q-border)] bg-[var(--q-card)] text-foreground overflow-hidden shadow-xl",
                  className
                )}
              >
                {children}
              </div>
            </>,
            document.body
          )
        : null}
    </>
  )
}
