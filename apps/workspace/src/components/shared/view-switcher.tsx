"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ViewOption<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  iconPath?: string;
  color?: string;
}

interface ViewSwitcherProps<T extends string = string> {
  views: ViewOption<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  showActiveIcon?: boolean;
  triggerClassName?: string;
  iconSize?: number;
}

function PathIcon({ path, size = 13, color }: { path: string; size?: number; color?: string }) {
  return (
    <span
      role="img"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? "currentColor",
        WebkitMaskImage: `url(${path})`,
        maskImage: `url(${path})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      } as CSSProperties}
    />
  )
}

export function ViewSwitcher<T extends string = string>({
  views,
  active,
  onChange,
  className,
  showActiveIcon = true,
  triggerClassName,
  iconSize = 13,
}: ViewSwitcherProps<T>) {
  const activeView = views.find((v) => v.id === active);

  const renderIcon = (view: ViewOption<T>, color?: string) => {
    if (view.iconPath) {
      return <PathIcon path={view.iconPath} size={iconSize} color={color ?? view.color ?? "currentColor"} />;
    }
    if (view.icon) {
      return <span className="shrink-0">{view.icon}</span>;
    }
    return null;
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {views.map((view) => {
        const isActive = view.id === active;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {showActiveIcon && renderIcon(view, isActive ? (view.color ?? undefined) : undefined)}
            {view.label}
          </button>
        );
      })}

      {activeView && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                triggerClassName
              )}
              aria-label="Add view"
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5">
                <line x1="7" y1="3" x2="7" y2="11" />
                <line x1="3" y1="7" x2="11" y2="7" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-xl border border-border bg-card shadow-xl p-1.5">
            {views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => onChange(view.id)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer"
              >
                {renderIcon(view, view.color ?? "currentColor")}
                <span className="flex-1">{view.label}</span>
                {view.id === active && (
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-primary">
                    <polyline points="2.5 7 5.5 10 11.5 4" />
                  </svg>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
