"use client";

import { useEffect, useRef } from "react";
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
  chainCommands: (chain: any) => any;
}

interface SlashCommandMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  onClose: () => void;
  selectedIndex?: number;
}

export function SlashCommandMenu({ items, command, onClose, selectedIndex = 0 }: SlashCommandMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

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
            onMouseEnter={() => {}}
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

export function getSlashCommandItems(): SlashMenuItem[] {
  return [
    {
      id: "heading1",
      label: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      chainCommands: (chain) => chain.toggleHeading({ level: 1 }),
    },
    {
      id: "heading2",
      label: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      chainCommands: (chain) => chain.toggleHeading({ level: 2 }),
    },
    {
      id: "heading3",
      label: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      chainCommands: (chain) => chain.toggleHeading({ level: 3 }),
    },
    {
      id: "bullet-list",
      label: "Bullet List",
      description: "Create a simple bullet list",
      icon: List,
      chainCommands: (chain) => chain.toggleBulletList(),
    },
    {
      id: "ordered-list",
      label: "Numbered List",
      description: "Create a numbered list",
      icon: ListOrdered,
      chainCommands: (chain) => chain.toggleOrderedList(),
    },
    {
      id: "code",
      label: "Code Block",
      description: "Insert a code block",
      icon: Code,
      chainCommands: (chain) => chain.toggleCodeBlock(),
    },
    {
      id: "blockquote",
      label: "Quote",
      description: "Add a blockquote",
      icon: Quote,
      chainCommands: (chain) => chain.toggleBlockquote(),
    },
    {
      id: "horizontal-rule",
      label: "Divider",
      description: "Add a horizontal divider",
      icon: Minus,
      chainCommands: (chain) => chain.setHorizontalRule(),
    },
  ];
}
