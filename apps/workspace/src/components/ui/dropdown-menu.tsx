"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

const PrimitiveRoot = MenuPrimitive.Root as React.ComponentType<any>
const PrimitiveTrigger = MenuPrimitive.Trigger as React.ComponentType<any>
const PrimitivePortal = MenuPrimitive.Portal as React.ComponentType<any>
const PrimitivePositioner = MenuPrimitive.Positioner as React.ComponentType<any>
const PrimitivePopup = MenuPrimitive.Popup as React.ComponentType<any>
const PrimitiveGroup = MenuPrimitive.Group as React.ComponentType<any>
const PrimitiveGroupLabel = MenuPrimitive.GroupLabel as React.ComponentType<any>
const PrimitiveItem = MenuPrimitive.Item as React.ComponentType<any>
const PrimitiveRadioGroup = MenuPrimitive.RadioGroup as React.ComponentType<any>
const PrimitiveRadioItem = MenuPrimitive.RadioItem as React.ComponentType<any>
const PrimitiveRadioItemIndicator = MenuPrimitive.RadioItemIndicator as React.ComponentType<any>
const PrimitiveSeparator = MenuPrimitive.Separator as React.ComponentType<any>

function DropdownMenu({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveRoot data-slot="dropdown-menu" {...props}>
      {children}
    </PrimitiveRoot>
  )
}

function DropdownMenuTrigger({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveTrigger data-slot="dropdown-menu-trigger" {...props}>
      {children}
    </PrimitiveTrigger>
  )
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  collisionPadding = 8,
  side = "bottom",
  sideOffset = 4,
  className,
  children,
  ...props
}: {
  align?: string
  alignOffset?: number
  collisionPadding?: number
  side?: string
  sideOffset?: number
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitivePortal>
      <PrimitivePositioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
      >
        <PrimitivePopup
          data-slot="dropdown-menu-content"
          className={cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-none ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-start-2 data-[side=inline-start]:slide-in-from-end-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          {children}
        </PrimitivePopup>
      </PrimitivePositioner>
    </PrimitivePortal>
  )
}

function DropdownMenuGroup({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveGroup data-slot="dropdown-menu-group" {...props}>
      {children}
    </PrimitiveGroup>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveGroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:ps-7",
        className
      )}
      {...props}
    >
      {children}
    </PrimitiveGroupLabel>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  variant?: "default" | "destructive"
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveItem
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    >
      {children}
    </PrimitiveItem>
  )
}

function DropdownMenuRadioGroup({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveRadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    >
      {children}
    </PrimitiveRadioGroup>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  inset?: boolean
  [key: string]: unknown
}) {
  return (
    <PrimitiveRadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <PrimitiveRadioItemIndicator>
          <CheckIcon
          />
        </PrimitiveRadioItemIndicator>
      </span>
      {children}
    </PrimitiveRadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) {
  return (
    <PrimitiveSeparator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
}
