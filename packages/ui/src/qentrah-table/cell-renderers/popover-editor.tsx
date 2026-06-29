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
  const [position, setPosition] = React.useState<{ top: number; left: number; minWidth: number } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  React.useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const cell = triggerRef.current?.closest(".ag-cell")
    const anchor = cell ?? triggerRef.current
    if (!anchor) return
    const rect = (anchor as HTMLElement).getBoundingClientRect()
    const width = minWidth ?? Math.max(rect.width, 240)
    setPosition({
      top: rect.bottom + 6,
      left: align === "end" ? Math.max(8, rect.right - width) : Math.max(8, rect.left),
      minWidth: width,
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
        className="contents"
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(!open)
        }}
      >
        {trigger}
      </div>
      {mounted && open
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
                  top: position?.top,
                  left: position?.left,
                  minWidth: position?.minWidth,
                  zIndex: 9999,
                }}
                className={cn(
                  "rounded-lg border border-[var(--q-border)] bg-[var(--q-card)] text-foreground overflow-hidden",
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
