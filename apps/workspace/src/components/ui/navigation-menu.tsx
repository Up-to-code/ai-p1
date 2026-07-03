import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const PrimitiveRoot = NavigationMenuPrimitive.Root as React.ComponentType<any>
const PrimitiveList = NavigationMenuPrimitive.List as React.ComponentType<any>
const PrimitiveItem = NavigationMenuPrimitive.Item as React.ComponentType<any>
const PrimitivePortal = NavigationMenuPrimitive.Portal as React.ComponentType<any>
const PrimitivePositioner = NavigationMenuPrimitive.Positioner as React.ComponentType<any>
const PrimitivePopup = NavigationMenuPrimitive.Popup as React.ComponentType<any>
const PrimitiveViewport = NavigationMenuPrimitive.Viewport as React.ComponentType<any>
const PrimitiveLink = NavigationMenuPrimitive.Link as React.ComponentType<any>

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: {
  align?: string
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <PrimitiveRoot
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </PrimitiveRoot>
  )
}

function NavigationMenuList({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) {
  return (
    <PrimitiveList
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) {
  return (
    <PrimitiveItem
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-[0.4] data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted"
)

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: {
  className?: string
  side?: string
  sideOffset?: number
  align?: string
  alignOffset?: number
  [key: string]: unknown
}) {
  return (
    <PrimitivePortal>
      <PrimitivePositioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          className
        )}
        {...props}
      >
        <PrimitivePopup className="data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0">
          <PrimitiveViewport className="relative size-full overflow-hidden" />
        </PrimitivePopup>
      </PrimitivePositioner>
    </PrimitivePortal>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) {
  return (
    <PrimitiveLink
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
}
