"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  NOTION_COLORS,
  NotionColorKey,
  hashStringToColor,
  getStoredColor,
  setStoredColor,
} from "@/lib/color-utils";

interface EditableTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  disabled?: boolean;
  className?: string;
}

export function EditableTags({
  tags = [],
  onChange,
  availableTags = [],
  disabled = false,
  className,
}: EditableTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagColors, setTagColors] = useState<Record<string, NotionColorKey>>({});

  // Sync colors when tags change
  useEffect(() => {
    const colorsMap: Record<string, NotionColorKey> = {};
    tags.forEach((tag) => {
      colorsMap[tag] = getStoredColor("tag", tag, hashStringToColor(tag));
    });
    setTagColors(colorsMap);
  }, [tags]);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setNewTag("");
    // Keep popover open so the user can easily add multiple tags/suggestions
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleSetTagColor = (tag: string, color: NotionColorKey) => {
    setStoredColor("tag", tag, color);
    setTagColors((prev) => ({ ...prev, [tag]: color }));
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {tags.map((tag) => {
        const colorKey = tagColors[tag] || hashStringToColor(tag);
        const colorStyle = NOTION_COLORS[colorKey] || NOTION_COLORS.gray;

        return (
          <Popover key={tag}>
            <PopoverTrigger
              disabled={disabled}
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-semibold border transition-all outline-none cursor-pointer shadow-sm animate-in fade-in zoom-in-95 duration-150 select-none",
                colorStyle.bg,
                colorStyle.text,
                colorStyle.border,
                "hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:opacity-100"
              )}
            >
              {tag}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]" title={tag}>
                    {tag}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-xs text-destructive hover:underline font-medium cursor-pointer"
                    >
                      Delete Tag
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Select Color
                  </span>
                  <div className="grid grid-cols-2 gap-1 max-h-[180px] overflow-y-auto pr-1">
                    {(Object.keys(NOTION_COLORS) as NotionColorKey[]).map((cKey) => {
                      const cStyle = NOTION_COLORS[cKey];
                      const isSelected = colorKey === cKey;
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => handleSetTagColor(tag, cKey)}
                          className={cn(
                            "flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs border transition-all cursor-pointer",
                            cStyle.bg,
                            cStyle.text,
                            cStyle.border,
                            "hover:opacity-80",
                            isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                          )}
                        >
                          <span className={cn("h-2 w-2 rounded-full shrink-0", cStyle.dot)} />
                          <span className="capitalize">{cKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      {!disabled && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger
            type="button"
            className="inline-flex h-6 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
            aria-label="Add tag"
          >
            <Plus className="mr-1 h-3 w-3" />
            New tag
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-2">
              <Input
                placeholder="New tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
                className="h-8 text-xs"
                autoFocus
              />
              {availableTags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Suggestions
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto">
                    {availableTags
                      .filter((t) => !tags.includes(t))
                      .map((t) => {
                        const sugColorKey = getStoredColor("tag", t, hashStringToColor(t));
                        const sugColorStyle = NOTION_COLORS[sugColorKey] || NOTION_COLORS.gray;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleAddTag(t)}
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-medium border transition-colors cursor-pointer",
                              sugColorStyle.bg,
                              sugColorStyle.text,
                              sugColorStyle.border,
                              "hover:opacity-80"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
