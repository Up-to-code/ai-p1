"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export function WorkOsRecordDrawer({
  open,
  eyebrow,
  title,
  description,
  onOpenChange,
  children,
}: {
  open: boolean;
  eyebrow: string;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[100] !w-[min(94vw,760px)] !max-w-[760px] gap-0 border-s border-border bg-white p-0 text-foreground dark:border-white/10 dark:bg-[#0A0A0A] sm:!max-w-[760px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 dark:border-white/5">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <SheetTitle className="mt-1 text-2xl font-black leading-tight tracking-tight text-foreground">
              {title}
            </SheetTitle>
            {description ? (
              <SheetDescription className="mt-2 text-xs font-bold leading-5 text-muted-foreground dark:text-muted-foreground">
                {description}
              </SheetDescription>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-2 transition hover:bg-muted/50"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
