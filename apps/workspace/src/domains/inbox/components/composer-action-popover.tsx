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

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ImageIcon,
  Link2,
  AtSign,
  X,
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

  // Calculate position based on anchor
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px gap above button
        left: rect.left,
      });
    }
  }, [isOpen, anchorRef]);

  // Close on click-outside
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50"
          style={{ top: position.top, left: position.left }}
        >
          <div className="rounded-xl border border-border bg-popover shadow-lg shadow-black/10 overflow-hidden w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Add to message
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action grid */}
            <div className="grid grid-cols-3 gap-1 px-2 pb-3">
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
                    className="group flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center transition-colors hover:bg-muted active:scale-95"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                        tile.accent,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-foreground leading-tight">
                        {tile.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
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
    </AnimatePresence>
  );
}
