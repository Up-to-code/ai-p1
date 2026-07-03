"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@qentrah/platform-core/classnames"

const PrimitiveRoot = MenuPrimitive.Root as React.ComponentType<any>
const PrimitivePortal = MenuPrimitive.Portal as React.ComponentType<any>
const PrimitiveTrigger = MenuPrimitive.Trigger as React.ComponentType<any>
const PrimitivePositioner = MenuPrimitive.Positioner as React.ComponentType<any>
const PrimitivePopup = MenuPrimitive.Popup as React.ComponentType<any>
const PrimitiveGroup = MenuPrimitive.Group as React.ComponentType<any>
const PrimitiveGroupLabel = MenuPrimitive.GroupLabel as React.ComponentType<any>
const PrimitiveItem = MenuPrimitive.Item as React.ComponentType<any>
const PrimitiveCheckboxItem = MenuPrimitive.CheckboxItem as React.ComponentType<any>
const PrimitiveCheckboxItemIndicator = MenuPrimitive.CheckboxItemIndicator as React.ComponentType<any>
const PrimitiveRadioItem = MenuPrimitive.RadioItem as React.ComponentType<any>
const PrimitiveRadioItemIndicator = MenuPrimitive.RadioItemIndicator as React.ComponentType<any>
const PrimitiveSeparator = MenuPrimitive.Separator as React.ComponentType<any>
const PrimitiveSubmenuRoot = MenuPrimitive.SubmenuRoot as React.ComponentType<any>
const PrimitiveSubmenuTrigger = MenuPrimitive.SubmenuTrigger as React.ComponentType<any>
const PrimitiveRadioGroup = MenuPrimitive.RadioGroup as React.ComponentType<any>

function DropdownMenu(props: Record<string, unknown>) {
  return <PrimitiveRoot data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal(props: Record<string, unknown>) {
  return <PrimitivePortal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger(props: Record<string, unknown>) {
  return <PrimitiveTrigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: {
  align?: string
  alignOffset?: number
  side?: string
  sideOffset?: number
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitivePortal>
      <PrimitivePositioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <PrimitivePopup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </PrimitivePositioner>
    </PrimitivePortal>
  )
}

function DropdownMenuGroup(props: Record<string, unknown>) {
  return <PrimitiveGroup data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: {
  className?: string
  inset?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveGroupLabel
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-label"
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
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
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  )
}

function DropdownMenuSub(props: Record<string, unknown>) {
  return <PrimitiveSubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: {
  className?: string
  inset?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveSubmenuTrigger
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </PrimitiveSubmenuTrigger>
  )
}

function DropdownMenuSubContent(props: Record<string, unknown>) {
  return <DropdownMenuContent {...props} />
}

function DropdownMenuCheckboxItem({
  checked,
  children,
  className,
  inset,
  ...props
}: {
  checked?: boolean
  className?: string
  inset?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveCheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <PrimitiveCheckboxItemIndicator>
          <CheckIcon />
        </PrimitiveCheckboxItemIndicator>
      </span>
      {children}
    </PrimitiveCheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: Record<string, unknown>) {
  return <PrimitiveRadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
  children,
  className,
  inset,
  ...props
}: {
  className?: string
  inset?: boolean
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveRadioItem
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <PrimitiveRadioItemIndicator>
          <CheckIcon />
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
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
