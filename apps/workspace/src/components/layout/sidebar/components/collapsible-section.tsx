"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";

type CollapsibleSectionProps = {
  title: string;
  icon?: ReactNode;
  href: string;
  children: ReactNode;
  count?: number;
  maxVisible?: number;
  moreHref?: string;
};

export function CollapsibleSection({
  title,
  icon,
  href,
  children,
  count,
  maxVisible = 5,
  moreHref,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);
  const items = Array.isArray(children) ? children : [children];
  const visible = items.slice(0, maxVisible);
  const hasMore = count !== undefined ? count > maxVisible : items.length > maxVisible;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
        {icon}
        {title}
      </button>

      {open && (
          <div className="flex flex-col gap-2">
          {visible}
          {hasMore && moreHref && (
            <WorkspaceLink
              href={moreHref}
              className="ml-7 mr-4 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              More...
            </WorkspaceLink>
          )}
        </div>
      )}
    </div>
  );
}
