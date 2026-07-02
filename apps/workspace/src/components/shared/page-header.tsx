"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface PageHeaderAction {
  label: string;
  icon?: LucideIcon;
  variant?: "ghost" | "outline" | "default" | "destructive" | "primary";
  onClick: () => void;
  disabled?: boolean;
}

export interface PageHeaderTab {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional eyebrow text (small label above title) */
  eyebrow?: string;
  /** Tabs to display below the header */
  tabs?: PageHeaderTab[];
  /** Active tab value */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (value: string) => void;
  /** Action buttons to display on the right */
  actions?: PageHeaderAction[];
  /** Breadcrumb items */
  breadcrumb?: { label: string; href?: string }[];
  /** Additional content on the left side */
  leftContent?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show border at bottom */
  showBorder?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  tabs,
  activeTab,
  onTabChange,
  actions = [],
  breadcrumb,
  leftContent,
  className,
  showBorder = true,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden flex flex-col gap-4 pb-4 text-start",
        showBorder && "border-b border-border",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left side: breadcrumb, title, subtitle */}
        <div className="min-w-0 space-y-2 flex-1">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-border">/</span>}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-foreground">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Eyebrow */}
          {eyebrow && (
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <div className="h-px w-5 bg-border" />
              {eyebrow}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          )}

          {/* Left content */}
          {leftContent}
        </div>

        {/* Right side: actions */}
        {actions.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    "flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    action.variant === "primary" &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    action.variant === "destructive" &&
                      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    action.variant === "outline" &&
                      "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                    (!action.variant || action.variant === "ghost" || action.variant === "default") &&
                      "bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange?.(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
