"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"

import { cn } from "@/lib/utils"

const R = NavigationMenuPrimitive.Root as unknown as React.ComponentType<Record<string, unknown>>
const L = NavigationMenuPrimitive.List as unknown as React.ComponentType<Record<string, unknown>>
const I = NavigationMenuPrimitive.Item as unknown as React.ComponentType<Record<string, unknown>>
const Lk = NavigationMenuPrimitive.Link as unknown as React.ComponentType<Record<string, unknown>>
const T = NavigationMenuPrimitive.Trigger as unknown as React.ComponentType<Record<string, unknown>>
const P = NavigationMenuPrimitive.Popup as unknown as React.ComponentType<Record<string, unknown>>
const Pos = NavigationMenuPrimitive.Positioner as unknown as React.ComponentType<Record<string, unknown>>

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; align?: string; [key: string]: unknown }) {
  return React.createElement(
    R,
    { ...props, className: cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className), "data-slot": "navigation-menu" },
    React.createElement(Pos, { align },
      React.createElement(L, { className: cn("group/navigation-menu-list flex flex-1 list-none items-center justify-center gap-1", className) },
        children,
      ),
    ),
  )
}

function NavigationMenuList({
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    L,
    { ...props, className: cn("group/navigation-menu-list flex flex-1 list-none items-center justify-center gap-1", className) },
    children,
  )
}

function NavigationMenuItem({
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    I,
    { ...props, className: cn("relative", className), "data-slot": "navigation-menu-item" },
    children,
  )
}

function NavigationMenuLink({
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    Lk,
    { ...props, className: cn("flex h-9 w-max items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50", className) },
    children,
  )
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    T,
    { ...props, className: cn("flex h-9 w-max items-center justify-center gap-1 rounded-md px-4 py-1.5 text-sm font-medium outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground", className) },
    children,
  )
}

function NavigationMenuContent({
  className,
  children,
  ...props
}: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
  return React.createElement(
    P,
    { ...props, className: cn("left-0 top-0 w-full bg-popover p-2 text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 md:absolute md:w-auto md:rounded-lg md:shadow-lg md:ring-1 md:ring-foreground/10", className) },
    children,
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
}
