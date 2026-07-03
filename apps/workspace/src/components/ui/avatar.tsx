"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  children,
  ...props
}: {
  className?: string
  size?: "default" | "sm" | "lg"
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...(props as any)}
    >
      {children}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({ className, ...props }: { className?: string; [key: string]: unknown }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...(props as any)}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...(props as any)}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
}
