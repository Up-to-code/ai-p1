import * as React from "react"
import { cn } from "@/lib/utils"

export interface EntityHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function EntityHeader({ className, children, ...props }: EntityHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full bg-background border-b border-border/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface EntityHeaderTopRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

EntityHeader.TopRow = function EntityHeaderTopRow({ className, children, ...props }: EntityHeaderTopRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 pt-3 pb-2 min-h-[44px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface EntityHeaderTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
}

EntityHeader.Title = function EntityHeaderTitle({ icon, title, className, ...props }: EntityHeaderTitleProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)} {...props}>
      {icon && (
        <div className="shrink-0 flex items-center justify-center">
          {icon}
        </div>
      )}
      <span className="text-[14px] font-semibold text-foreground tracking-tight truncate">
        {title}
      </span>
    </div>
  )
}

export interface EntityHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

EntityHeader.Actions = function EntityHeaderActions({ className, children, ...props }: EntityHeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-4 text-muted-foreground shrink-0", className)} {...props}>
      {children}
    </div>
  )
}

export interface EntityHeaderTabsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

EntityHeader.TabsRow = function EntityHeaderTabsRow({ className, children, ...props }: EntityHeaderTabsRowProps) {
  return (
    <div
      className={cn(
        "flex items-center px-5 overflow-x-auto scrollbar-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface EntityHeaderToolbarRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

EntityHeader.ToolbarRow = function EntityHeaderToolbarRow({ className, children, ...props }: EntityHeaderToolbarRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-2 border-t border-border/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
