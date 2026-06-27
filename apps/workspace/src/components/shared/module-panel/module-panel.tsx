"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { XIcon, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleTab {
  label: string
  value: string
  icon?: React.ReactNode
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ModulePanelContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFullscreen: boolean
  setIsFullscreen: (v: boolean) => void
  panelWidth: number
  panelHeight: number
  setPanelWidth: (w: number) => void
  setPanelHeight: (h: number) => void
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

const ModulePanelContext = React.createContext<ModulePanelContextValue | null>(null)

function useModulePanel() {
  const ctx = React.useContext(ModulePanelContext)
  if (!ctx) {
    throw new Error("ModulePanel sub-components must be used within <ModulePanel>")
  }
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface ModulePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  children: React.ReactNode
}

export function ModulePanel({
  open,
  onOpenChange,
  defaultWidth = 640,
  defaultHeight = 560,
  minWidth = 480,
  maxWidth = 1200,
  minHeight = 320,
  maxHeight = 960,
  children,
}: ModulePanelProps) {
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth)
  const [panelHeight, setPanelHeight] = React.useState(defaultHeight)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const clamp = React.useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    [],
  )

  const ctx = React.useMemo<ModulePanelContextValue>(
    () => ({
      open,
      onOpenChange,
      isFullscreen,
      setIsFullscreen,
      panelWidth,
      panelHeight,
      setPanelWidth: (w) =>
        setPanelWidth((prev) => clamp(w, minWidth, maxWidth)),
      setPanelHeight: (h) =>
        setPanelHeight((prev) => clamp(h, minHeight, maxHeight)),
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
    }),
    [
      open,
      onOpenChange,
      isFullscreen,
      panelWidth,
      panelHeight,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      clamp,
    ],
  )

  return (
    <ModulePanelContext.Provider value={ctx}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </ModulePanelContext.Provider>
  )
}

// ─── Portal ───────────────────────────────────────────────────────────────────

export function ModulePanelPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="module-portal" {...props} />
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

export function ModulePanelOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="module-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

// ─── Resize Handle ────────────────────────────────────────────────────────────

export function ModulePanelResizeHandle() {
  const ctx = useModulePanel()
  const isResizing = React.useRef(false)
  const startPos = React.useRef({ x: 0, y: 0 })
  const startSize = React.useRef({ w: 0, h: 0 })

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      isResizing.current = true
      startPos.current = { x: e.clientX, y: e.clientY }
      startSize.current = { w: ctx.panelWidth, h: ctx.panelHeight }
    },
    [ctx],
  )

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      ctx.setPanelWidth(startSize.current.w + dx)
      ctx.setPanelHeight(startSize.current.h + dy)
    },
    [ctx],
  )

  const onPointerUp = React.useCallback(() => {
    isResizing.current = false
  }, [])

  if (ctx.isFullscreen) return null

  return (
    <div
      className="absolute bottom-0 right-0 z-20 flex h-6 w-6 cursor-se-resize items-end justify-end p-0.5"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: "none" }}
    >
      <svg
        viewBox="0 0 10 10"
        className="h-3 w-3 text-muted-foreground/30"
        fill="currentColor"
      >
        <path d="M0 10 L10 0 L10 10 Z" />
      </svg>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

export interface ModulePanelContentProps extends DialogPrimitive.Popup.Props {
  containerClassName?: string
}

export function ModulePanelContent({
  className,
  containerClassName,
  children,
  ...props
}: ModulePanelContentProps) {
  const ctx = useModulePanel()
  const [maxViewWidth, setMaxViewWidth] = React.useState(Infinity)
  const [maxViewHeight, setMaxViewHeight] = React.useState(Infinity)

  React.useEffect(() => {
    const onResize = () => {
      setMaxViewWidth(window.innerWidth * 0.9)
      setMaxViewHeight(window.innerHeight * 0.9)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const effectiveMaxWidth = Math.min(ctx.maxWidth, maxViewWidth)
  const effectiveMaxHeight = Math.min(ctx.maxHeight, maxViewHeight)

  return (
    <ModulePanelPortal>
      <ModulePanelOverlay />
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none",
          containerClassName,
        )}
      >
        <DialogPrimitive.Popup
          data-slot="module-content"
          className={cn(
            "relative z-50 flex flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none pointer-events-auto",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            ctx.isFullscreen &&
              "!w-screen !h-screen !rounded-none !ring-0 !max-w-none !max-h-none",
            className,
          )}
          style={
            ctx.isFullscreen
              ? undefined
              : {
                  width: Math.min(ctx.panelWidth, effectiveMaxWidth),
                  height: Math.min(ctx.panelHeight, effectiveMaxHeight),
                }
          }
          {...props}
        >
          {children}
          <ModulePanelResizeHandle />
        </DialogPrimitive.Popup>
      </div>
    </ModulePanelPortal>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export interface ModulePanelHeaderProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  className?: string
}

export function ModulePanelHeader({
  left,
  center,
  right,
  className,
}: ModulePanelHeaderProps) {
  return (
    <div
      data-slot="module-header"
      className={cn(
        "flex shrink-0 items-center gap-3 border-b border-border px-5 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
        {left}
      </div>
      {center && (
        <div className="flex items-center gap-2 shrink-0 justify-center">
          {center}
        </div>
      )}
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {right}
      </div>
    </div>
  )
}

// ─── Title ────────────────────────────────────────────────────────────────────

export function ModulePanelTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="module-title"
      className={cn(
        "font-heading text-base font-medium text-foreground truncate",
        className,
      )}
      {...props}
    />
  )
}

// ─── Description ──────────────────────────────────────────────────────────────

export function ModulePanelDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="module-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// ─── Tab Header ───────────────────────────────────────────────────────────────

export interface ModulePanelTabHeaderProps {
  tabs: ModuleTab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ModulePanelTabHeader({
  tabs,
  value,
  onChange,
  className,
}: ModulePanelTabHeaderProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange}>
      <TabsPrimitive.List
        data-slot="module-tab-header"
        className={cn(
          "flex shrink-0 items-center gap-1 border-b border-border px-5",
          className,
        )}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            data-slot="module-tab-trigger"
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors",
              "text-muted-foreground hover:text-foreground cursor-pointer",
              "data-active:text-foreground",
              "data-active:after:absolute data-active:after:bottom-0 data-active:after:left-0 data-active:after:right-0 data-active:after:h-[2px] data-active:after:bg-primary data-active:after:rounded-t-full",
            )}
          >
            {tab.icon && (
              <span className="shrink-0 opacity-70">{tab.icon}</span>
            )}
            {tab.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export interface ModulePanelBodyProps {
  children: React.ReactNode
  className?: string
}

export function ModulePanelBody({ children, className }: ModulePanelBodyProps) {
  return (
    <div
      data-slot="module-body"
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
    >
      {children}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export interface ModulePanelFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModulePanelFooter({
  children,
  className,
}: ModulePanelFooterProps) {
  return (
    <div
      data-slot="module-footer"
      className={cn(
        "flex shrink-0 items-center justify-between border-t border-border bg-background/95 px-5 py-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Convenience: Close Button ────────────────────────────────────────────────

export function ModulePanelCloseButton({
  className,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children" | "variant" | "size"
>) {
  return (
    <DialogPrimitive.Close
      data-slot="module-close"
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "transition-all duration-200 h-8 w-8 hover:bg-destructive/10 hover:text-destructive",
            className,
          )}
          {...props}
        />
      }
    >
      <XIcon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )
}

// ─── Convenience: Fullscreen Toggle ────────────────────────────────────────────

export function ModulePanelFullscreenToggle({
  className,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children" | "onClick"
>) {
  const ctx = useModulePanel()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => ctx.setIsFullscreen(!ctx.isFullscreen)}
      className={cn("transition-all duration-200 h-8 w-8", className)}
      title={ctx.isFullscreen ? "Exit full screen" : "Full screen"}
      {...props}
    >
      {ctx.isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  )
}
