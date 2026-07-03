"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const PrimitiveRoot = SheetPrimitive.Root as React.ComponentType<any>
const PrimitivePortal = SheetPrimitive.Portal as React.ComponentType<any>
const PrimitiveBackdrop = SheetPrimitive.Backdrop as React.ComponentType<any>
const PrimitivePopup = SheetPrimitive.Popup as React.ComponentType<any>
const PrimitiveClose = SheetPrimitive.Close as React.ComponentType<any>
const PrimitiveTitle = SheetPrimitive.Title as React.ComponentType<any>
const PrimitiveDescription = SheetPrimitive.Description as React.ComponentType<any>

function Sheet({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <PrimitiveRoot data-slot="sheet" {...props}>{children}</PrimitiveRoot>
}

function SheetPortal({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <PrimitivePortal data-slot="sheet-portal" {...props}>{children}</PrimitivePortal>
}

function SheetOverlay({ className, ...props }: { className?: string; [key: string]: unknown }) {
  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      <PrimitiveBackdrop
        data-slot="sheet-overlay"
        className="h-full w-full bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs"
        {...props}
      />
    </div>
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  [key: string]: unknown
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <PrimitivePopup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-none transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:start-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:end-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <PrimitiveClose
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 end-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </PrimitiveClose>
        )}
      </PrimitivePopup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
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
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </PrimitiveTitle>
  )
}

function SheetDescription({
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
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </PrimitiveDescription>
  )
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
