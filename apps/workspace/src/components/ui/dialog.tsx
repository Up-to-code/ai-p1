"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const PrimitiveRoot = DialogPrimitive.Root as React.ComponentType<any>
const PrimitivePortal = DialogPrimitive.Portal as React.ComponentType<any>
const PrimitiveBackdrop = DialogPrimitive.Backdrop as React.ComponentType<any>
const PrimitivePopup = DialogPrimitive.Popup as React.ComponentType<any>
const PrimitiveClose = DialogPrimitive.Close as React.ComponentType<any>
const PrimitiveTitle = DialogPrimitive.Title as React.ComponentType<any>
const PrimitiveDescription = DialogPrimitive.Description as React.ComponentType<any>

function Dialog({ children, open, onOpenChange, ...props }: { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; [key: string]: unknown }) {
  return <PrimitiveRoot data-slot="dialog" open={open} onOpenChange={onOpenChange} {...props}>{children}</PrimitiveRoot>
}

function DialogPortal({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <PrimitivePortal data-slot="dialog-portal">{children}</PrimitivePortal>
}

function DialogOverlay({
  className,
  ...props
}: { className?: string; [key: string]: unknown }) {
  return (
    <div className={cn("fixed inset-0 isolate z-[100]", className)}>
      <PrimitiveBackdrop
        data-slot="dialog-overlay"
        className="h-full w-full bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        {...props}
      />
    </div>
  )
}

function DialogContent({
  className,
  containerClassName,
  children,
  overlayClassName,
  showCloseButton = true,
  ...props
}: { className?: string; containerClassName?: string; overlayClassName?: string; showCloseButton?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <div className={cn("fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none", containerClassName)}>
        <PrimitivePopup
          data-slot="dialog-content"
          className={cn(
            "relative z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none pointer-events-auto data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <PrimitiveClose
              data-slot="dialog-close"
              render={
                <Button
                  variant="ghost"
                  className="absolute top-2 end-2"
                  size="icon-sm"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </PrimitiveClose>
          )}
        </PrimitivePopup>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: { className?: string; showCloseButton?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <PrimitiveClose render={<Button variant="outline" />}>
          Close
        </PrimitiveClose>
      )}
    </div>
  )
}

function DialogTitle({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <PrimitiveTitle
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    >
      {children}
    </PrimitiveTitle>
  )
}

function DialogDescription({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return (
    <PrimitiveDescription
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </PrimitiveDescription>
  )
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
}
