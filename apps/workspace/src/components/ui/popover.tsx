"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

const PrimitiveRoot = PopoverPrimitive.Root as React.ComponentType<any>
const PrimitiveTrigger = PopoverPrimitive.Trigger as React.ComponentType<any>
const PrimitivePortal = PopoverPrimitive.Portal as React.ComponentType<any>
const PrimitivePositioner = PopoverPrimitive.Positioner as React.ComponentType<any>
const PrimitivePopup = PopoverPrimitive.Popup as React.ComponentType<any>
const PrimitiveTitle = PopoverPrimitive.Title as React.ComponentType<any>
const PrimitiveDescription = PopoverPrimitive.Description as React.ComponentType<any>

function Popover({
  children,
  open,
  onOpenChange,
  ...props
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  [key: string]: unknown
}) {
  return (
    <PrimitiveRoot data-slot="popover" open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </PrimitiveRoot>
  )
}

function PopoverTrigger({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveTrigger data-slot="popover-trigger" {...props}>
      {children}
    </PrimitiveTrigger>
  )
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  children,
  ...props
}: {
  className?: string
  align?: string
  alignOffset?: number
  side?: string
  sideOffset?: number
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitivePortal>
      <PrimitivePositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PrimitivePopup
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </PrimitivePopup>
      </PrimitivePositioner>
    </PrimitivePortal>
  )
}

function PopoverHeader({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverTitle({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveTitle
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </PrimitiveTitle>
  )
}

function PopoverDescription({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveDescription
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </PrimitiveDescription>
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
