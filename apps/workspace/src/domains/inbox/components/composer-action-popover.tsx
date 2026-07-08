"use client";

/**
 * ComposerActionPopover
 *
 * Replaces the old QuickActionsModal (tabs: Upload / Document / Image / Link).
 * Renders as a small floating panel that appears just above the composer's + button.
 * Each action is a discrete icon tile — not a tabbed modal — so the UI stays minimal.
 *
 * Shareable: this component has no hard inbox dependency; pass callbacks in.
 */

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ImageIcon,
  Link2,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ComposerAction =
  | "upload-file"
  | "attach-document"
  | "attach-image"
  | "insert-link"
  | "mention";

interface ActionTile {
  id: ComposerAction;
  icon: React.ElementType;
  label: string;
  description: string;
  accent: string;   // Tailwind bg class for the icon backdrop
}

const ACTION_TILES: ActionTile[] = [
  {
    id: "upload-file",
    icon: Upload,
    label: "Upload file",
    description: "PDF, DOC, ZIP…",
    accent: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "attach-document",
    icon: FileText,
    label: "Document",
    description: "Workspace doc",
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    id: "attach-image",
    icon: ImageIcon,
    label: "Image",
    description: "PNG, JPG, GIF",
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "insert-link",
    icon: Link2,
    label: "Link",
    description: "Paste a URL",
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "mention",
    icon: AtSign,
    label: "Mention",
    description: "User or item",
    accent: "bg-rose-500/10 text-rose-500",
  },
];

interface ComposerActionPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: ComposerAction) => void;
  /** Anchor element the popover positions itself above */
  anchorRef?: React.RefObject<HTMLElement>;
}

export function ComposerActionPopover({
  isOpen,
  onClose,
  onAction,
  anchorRef,
}: ComposerActionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Calculate position based on anchor. The composer sits at the viewport bottom,
  // so this menu must open upward and clamp inside the visible window.
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 308;
      const menuHeight = popoverRef.current?.offsetHeight ?? 188;
      const gutter = 10;
      setPosition({
        top: Math.max(gutter, rect.top - menuHeight - gutter),
        left: Math.min(
          window.innerWidth - menuWidth - gutter,
          Math.max(gutter, rect.left),
        ),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, anchorRef]);

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !anchorRef?.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="fixed z-[300]"
          style={{ top: position.top, left: position.left }}
        >
          <div className="w-[260px] overflow-hidden rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/10">
            <div className="space-y-0.5">
              {ACTION_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => {
                      onAction(tile.id);
                      onClose();
                    }}
                    className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted active:scale-[0.98]"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105",
                        tile.accent,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium leading-tight text-foreground">
                        {tile.label}
                      </p>
                      <p className="truncate text-[10px] leading-tight text-muted-foreground">
                        {tile.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
