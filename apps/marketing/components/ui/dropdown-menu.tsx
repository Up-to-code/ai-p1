"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

const R = MenuPrimitive.Root as unknown as React.ComponentType<Record<string, unknown>>
const P = MenuPrimitive.Portal as unknown as React.ComponentType<Record<string, unknown>>
const T = MenuPrimitive.Trigger as unknown as React.ComponentType<Record<string, unknown>>
const Pos = MenuPrimitive.Positioner as unknown as React.ComponentType<Record<string, unknown>>
const Pop = MenuPrimitive.Popup as unknown as React.ComponentType<Record<string, unknown>>
const G = MenuPrimitive.Group as unknown as React.ComponentType<Record<string, unknown>>
const GL = MenuPrimitive.GroupLabel as unknown as React.ComponentType<Record<string, unknown>>
const I = MenuPrimitive.Item as unknown as React.ComponentType<Record<string, unknown>>
const SR = MenuPrimitive.SubmenuRoot as unknown as React.ComponentType<Record<string, unknown>>
const ST = MenuPrimitive.SubmenuTrigger as unknown as React.ComponentType<Record<string, unknown>>
const CI = MenuPrimitive.CheckboxItem as unknown as React.ComponentType<Record<string, unknown>>
const CII = MenuPrimitive.CheckboxItemIndicator as unknown as React.ComponentType<Record<string, unknown>>
const RG = MenuPrimitive.RadioGroup as unknown as React.ComponentType<Record<string, unknown>>
const RI = MenuPrimitive.RadioItem as unknown as React.ComponentType<Record<string, unknown>>
const RII = MenuPrimitive.RadioItemIndicator as unknown as React.ComponentType<Record<string, unknown>>
const Sep = MenuPrimitive.Separator as unknown as React.ComponentType<Record<string, unknown>>

function DropdownMenu({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(R, { ...props, "data-slot": "dropdown-menu" }, children)
}

function DropdownMenuPortal({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(P, { ...props, "data-slot": "dropdown-menu-portal" }, children)
}

function DropdownMenuTrigger({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    T,
    { ...props, "data-slot": "dropdown-menu-trigger", className },
    children,
  )
}

function DropdownMenuContent({
  align,
  alignOffset,
  side,
  sideOffset,
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; align?: string; alignOffset?: number; side?: string; sideOffset?: number; [key: string]: unknown }) {
  return React.createElement(P, null,
    React.createElement(
      Pos,
      { className: "isolate z-50 outline-none", align, alignOffset, side, sideOffset },
      React.createElement(
        Pop,
        {
          ...props,
          "data-slot": "dropdown-menu-content",
          className: cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-start-2 data-[side=inline-start]:slide-in-from-end-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className),
        },
        children,
      ),
    ),
  )
}

function DropdownMenuGroup({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(G, { ...props, "data-slot": "dropdown-menu-group" }, children)
}

function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: { className?: string; inset?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    GL,
    {
      ...props,
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      className: cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:ps-7", className as string),
    },
    children,
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: { className?: string; inset?: boolean; variant?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    I,
    {
      ...props,
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className as string,
      ),
    },
    children,
  )
}

function DropdownMenuSub({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(SR, { ...props, "data-slot": "dropdown-menu-sub" }, children)
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: { className?: string; inset?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    ST,
    {
      ...props,
      "data-slot": "dropdown-menu-sub-trigger",
      "data-inset": inset,
      className: cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:ps-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className as string,
      ),
    },
    children,
    React.createElement(ChevronRightIcon, { className: "rtl:rotate-180 ms-auto" }),
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "inline-end",
  sideOffset = 0,
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; align?: string; alignOffset?: number; side?: string; sideOffset?: number; [key: string]: unknown }) {
  return React.createElement(
    DropdownMenuContent,
    {
      ...props,
      "data-slot": "dropdown-menu-sub-content",
      className: cn("w-auto min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className as string),
      align,
      alignOffset,
      side,
      sideOffset,
    },
    children,
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: { className?: string; checked?: boolean; inset?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    CI,
    {
      ...props,
      "data-slot": "dropdown-menu-checkbox-item",
      "data-inset": inset,
      checked,
      className: cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className as string,
      ),
    },
    React.createElement("span", {
      className: "pointer-events-none absolute end-2 flex items-center justify-center",
      "data-slot": "dropdown-menu-checkbox-item-indicator",
    }, React.createElement(CII, null, React.createElement(CheckIcon, null))),
    children,
  )
}

function DropdownMenuRadioGroup({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(RG, { ...props, "data-slot": "dropdown-menu-radio-group" }, children)
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: { className?: string; inset?: boolean; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    RI,
    {
      ...props,
      "data-slot": "dropdown-menu-radio-item",
      "data-inset": inset,
      className: cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:ps-7 data-disabled:pointer-events-none data-disabled:opacity-[0.4] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className as string,
      ),
    },
    React.createElement("span", {
      className: "pointer-events-none absolute end-2 flex items-center justify-center",
      "data-slot": "dropdown-menu-radio-item-indicator",
    }, React.createElement(RII, null, React.createElement(CheckIcon, null))),
    children,
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: { className?: string; [key: string]: unknown }) {
  return React.createElement(Sep, {
    ...props,
    "data-slot": "dropdown-menu-separator",
    className: cn("-mx-1 my-1 h-px bg-border", className as string),
  })
}

function DropdownMenuShortcut({
  className,
  ...props
}: Record<string, unknown>) {
  return React.createElement("span", {
    ...props,
    "data-slot": "dropdown-menu-shortcut",
    className: cn("ms-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground", className as string),
  })
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
