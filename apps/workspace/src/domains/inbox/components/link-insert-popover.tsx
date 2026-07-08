"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkInsertPopoverProps = {
  open: boolean;
  anchorRef?: React.RefObject<HTMLElement>;
  onClose: () => void;
  onSubmit: (url: string, label?: string) => void;
};

export function LinkInsertPopover({ open, anchorRef, onClose, onSubmit }: LinkInsertPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;

    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const width = 320;
      const height = popoverRef.current?.offsetHeight ?? 170;
      const gutter = 10;
      setPosition({
        top: Math.max(gutter, rect.top - height - gutter),
        left: Math.min(window.innerWidth - width - gutter, Math.max(gutter, rect.left)),
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => urlInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !anchorRef?.current?.contains(target)
      ) {
        onClose();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [anchorRef, onClose, open]);

  if (!mounted || !open) return null;

  const submit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    onSubmit(trimmedUrl, label.trim() || undefined);
    setUrl("");
    setLabel("");
  };

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[310] w-80 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg shadow-black/10"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          Insert link
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2 p-3">
        <input
          ref={urlInputRef}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="https://example.com"
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-none transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          )}
        />
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Display text (optional)"
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-none transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          )}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={submit} disabled={!url.trim()}>
            Insert
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
