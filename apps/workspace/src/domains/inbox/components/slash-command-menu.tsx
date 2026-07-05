"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, CheckSquare, FileText, Calendar, Building2, DollarSign, FolderOpen, Bold, Italic, Code, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
}

interface SlashCommandMenuProps {
  editor: any;
  onClose: () => void;
  onOpenMentionPicker: (category: string) => void;
}

const commands: SlashCommand[] = [
  {
    id: "mention-user",
    name: "Mention User",
    description: "Mention a team member",
    icon: User,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("users");
    },
  },
  {
    id: "mention-task",
    name: "Mention Task",
    description: "Mention a task",
    icon: CheckSquare,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("tasks");
    },
  },
  {
    id: "mention-doc",
    name: "Mention Document",
    description: "Mention a document",
    icon: FileText,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("documents");
    },
  },
  {
    id: "mention-event",
    name: "Mention Event",
    description: "Mention a calendar event",
    icon: Calendar,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("events");
    },
  },
  {
    id: "mention-project",
    name: "Mention Project",
    description: "Mention a project",
    icon: FolderOpen,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("projects");
    },
  },
  {
    id: "mention-client",
    name: "Mention Client",
    description: "Mention a client",
    icon: Building2,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("clients");
    },
  },
  {
    id: "mention-deal",
    name: "Mention Deal",
    description: "Mention a deal",
    icon: DollarSign,
    action: (editor, onOpenMentionPicker) => {
      onOpenMentionPicker("deals");
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Make text bold",
    icon: Bold,
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    name: "Italic",
    description: "Make text italic",
    icon: Italic,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: "code",
    name: "Code",
    description: "Make text code",
    icon: Code,
    action: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    id: "bullet-list",
    name: "Bullet List",
    description: "Create bullet list",
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "ordered-list",
    name: "Ordered List",
    description: "Create ordered list",
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "blockquote",
    name: "Blockquote",
    description: "Create blockquote",
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

export function SlashCommandMenu({ editor, onClose, onOpenMentionPicker }: SlashCommandMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const query = searchQuery.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " ") {
        // Space closes the menu
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  const handleSelect = (command: SlashCommand) => {
    // Remove the "/" from the editor
    editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.to }).run();

    // Execute the command action
    if (command.action) {
      command.action(editor, onOpenMentionPicker);
    }

    onClose();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 right-0 mx-auto max-w-md rounded-xl border border-border bg-popover shadow-2xl z-50"
      style={{ bottom: "100px" }}
    >
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands..."
            className="pl-9 h-10 text-sm"
          />
        </div>
      </div>

      {/* Commands list */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCommands.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No commands found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredCommands.map((command, idx) => {
              const Icon = command.icon;
              const isSelected = idx === selectedIndex;

              return (
                <motion.button
                  key={command.id}
                  type="button"
                  onClick={() => handleSelect(command)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors mb-1",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {command.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2 w-2 rounded-full bg-accent-foreground"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-3">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Space Close</span>
          <span>Esc Close</span>
        </div>
      </div>
    </motion.div>
  );
}
