"use client";

import { useState } from "react";
import type React from "react";
import { MoreHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/routing";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SidebarPanelLinkIcon = React.ComponentType<{ className?: string }>;

type SidebarPanelLinkProps = {
  href: string;
  icon: SidebarPanelLinkIcon;
  label: string;
  paramKey?: string;
  paramValue?: string;
  clearParams?: string[];
  extraParams?: Record<string, string>;
  iconPicker?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
};

export function SidebarPanelLink({
  href,
  icon: Icon,
  label,
  paramKey,
  paramValue,
  clearParams,
  extraParams: explicitExtraParams,
  iconPicker,
}: SidebarPanelLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const pathPart = href.split("?")[0];

  const hasMatchingExplicitParams = Object.entries(explicitExtraParams ?? {})
    .every(([key, value]) => searchParams.get(key) === value);
  const isActive =
    pathname.startsWith(pathPart) &&
    hasMatchingExplicitParams &&
    (paramKey
      ? searchParams.get(paramKey) === paramValue
      : clearParams
        ? clearParams.every((key) => !searchParams.has(key))
        : true);

  const pickerContent =
    typeof iconPicker === "function"
      ? iconPicker({ close: () => setIconPickerOpen(false) })
      : iconPicker;
  const derivedExtraParams =
    paramKey || clearParams
      ? {
          ...(clearParams?.reduce<Record<string, string>>((params, key) => {
            params[key] = "";
            return params;
          }, {}) ?? {}),
          ...(paramKey && paramValue ? { [paramKey]: paramValue } : {}),
        }
      : undefined;
  const extraParams = { ...(derivedExtraParams ?? {}), ...(explicitExtraParams ?? {}) };

  return (
    <div className="group relative">
      <WorkspaceLink
        href={href}
        extraParams={Object.keys(extraParams).length > 0 ? extraParams : undefined}
        className={cn(
          "flex h-7 w-full items-center gap-2 rounded-md px-2 text-[12px] font-medium transition-colors",
          isActive
            ? "bg-[var(--q-bg-tertiary)] font-semibold text-foreground"
            : "text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </WorkspaceLink>

      {pickerContent && (
        <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded opacity-0 transition-opacity hover:bg-[var(--q-bg-secondary)] group-hover:opacity-100"
              >
                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              </button>
            }
          />
          <PopoverContent side="right" align="start" className="w-auto p-2">
            {pickerContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
