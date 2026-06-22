"use client";

import { useState, useCallback, useEffect } from "react";
import { useDashboardContext } from "../dashboard-context";
import { useDashboardPersistence } from "@/domains/projects/hooks/use-dashboard-persistence";
import { useAccountContext } from "@/domains/auth";
import { StickyNote } from "lucide-react";

export function NotesWidget() {
  const { projectId, organizationId } = useDashboardContext();
  const { config, saveNotes } = useDashboardPersistence(projectId, organizationId);
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (config?.notes !== undefined) {
      setContent(config.notes);
    }
  }, [config?.notes]);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      saveNotes(value);
    },
    [saveNotes],
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
        <StickyNote className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Project Notes
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Add notes about this project..."
        className="flex-1 resize-none p-4 text-sm text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
      />
      {isFocused && (
        <div className="px-4 py-1.5 border-t border-border/40 text-[10px] text-muted-foreground/50">
          Auto-saves as you type
        </div>
      )}
    </div>
  );
}
