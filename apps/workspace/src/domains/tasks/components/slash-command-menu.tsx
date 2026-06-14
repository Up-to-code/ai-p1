"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import {
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlashMenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface SlashCommandMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  onClose: () => void;
}

export function SlashCommandMenu({ items, command, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        command(items[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [items, selectedIndex, command, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (items.length === 0) return null;

  return (
    <div
      className="w-72 overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1E] shadow-2xl"
      ref={listRef}
    >
      <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
        Blocks
      </div>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
              index === selectedIndex ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5",
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              command(item);
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 border border-white/10">
              <Icon className="h-4 w-4 text-white/50" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[11px] text-white/40 truncate">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function getSlashCommandItems(
  editor: { chain: () => any },
  onClose: () => void,
): SlashMenuItem[] {
  return [
    {
      id: "heading1",
      label: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        onClose();
      },
    },
    {
      id: "heading2",
      label: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
    },
    {
      id: "heading3",
      label: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        onClose();
      },
    },
    {
      id: "bullet-list",
      label: "Bullet List",
      description: "Create a simple bullet list",
      icon: List,
      action: () => {
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
    },
    {
      id: "ordered-list",
      label: "Numbered List",
      description: "Create a numbered list",
      icon: ListOrdered,
      action: () => {
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
    },
    {
      id: "code",
      label: "Code Block",
      description: "Insert a code block",
      icon: Code,
      action: () => {
        editor.chain().focus().toggleCodeBlock().run();
        onClose();
      },
    },
    {
      id: "blockquote",
      label: "Quote",
      description: "Add a blockquote",
      icon: Quote,
      action: () => {
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
    },
    {
      id: "horizontal-rule",
      label: "Divider",
      description: "Add a horizontal divider",
      icon: Minus,
      action: () => {
        editor.chain().focus().setHorizontalRule().run();
        onClose();
      },
    },
  ];
}
