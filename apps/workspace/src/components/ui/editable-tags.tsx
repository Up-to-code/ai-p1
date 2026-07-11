"use client";

import React, { useState, useEffect } from "react";
import { Check, Plus, Search } from "lucide-react";
import { ColorDot } from "@qentrah/ui";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTagName, setModalTagName] = useState("");
  const [modalTagColor, setModalTagColor] = useState<NotionColorKey>("gray");

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setNewTag("");
    // Keep popover open so the user can easily add multiple tags/suggestions
  };

  const handleCreateNewTag = () => {
    const trimmed = modalTagName.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setModalTagName("");
    setIsModalOpen(false);
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
                "inline-flex h-6 items-center gap-1 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors cursor-pointer shadow-none select-none",
                colorStyle.bg,
                colorStyle.text,
                colorStyle.border,
                "hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:opacity-100"
              )}
            >
              {tag}
            </PopoverTrigger>
            <PopoverContent className="w-56 rounded-md p-2 shadow-none" align="start">
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
                          <ColorDot dotClassName={cStyle.dot} size="sm" />
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
        <>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
              type="button"
              className="inline-flex h-6 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
              aria-label="Add tag"
            >
              <Plus className="mr-1 h-3 w-3" />
              New tag
            </PopoverTrigger>
            <PopoverContent className="w-64 rounded-md p-0 shadow-none" align="start">
              <div className="border-b border-border p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search or create tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                    className="h-9 rounded-md pl-8 text-xs shadow-none"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-3 p-2">
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggestions
                    </p>
                    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                      {availableTags
                        .filter((t) => !tags.includes(t) && (!newTag.trim() || t.toLowerCase().includes(newTag.trim().toLowerCase())))
                        .map((t) => {
                          const sugColorKey = getStoredColor("tag", t, hashStringToColor(t));
                          const sugColorStyle = NOTION_COLORS[sugColorKey] || NOTION_COLORS.gray;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleAddTag(t)}
                              className={cn(
                                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer shadow-none",
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
                <Button
                  type="button"
                  onClick={() => { setModalTagName(newTag); setModalTagColor("gray"); setIsModalOpen(true); setIsOpen(false); }}
                  className="h-8 w-full justify-start rounded-md px-2 text-xs shadow-none"
                  variant="ghost"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {newTag.trim() ? `Create “${newTag.trim()}”` : "Create a new tag"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-md gap-0 p-0 shadow-none">
              <DialogHeader className="border-b border-border px-5 py-4">
                <DialogTitle>Create tag</DialogTitle>
                <DialogDescription>Add a reusable label and choose its color.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-5 py-4">
                <div>
                      <label className="mb-1.5 block text-[11px] font-bold text-muted-foreground">Tag Name</label>
                      <Input
                        placeholder="Enter tag name..."
                        value={modalTagName}
                        onChange={(e) => setModalTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateNewTag();
                          }
                        }}
                        className="h-9 rounded-md text-sm shadow-none"
                        autoFocus
                      />
                </div>
                <div>
                      <label className="mb-1.5 block text-[11px] font-bold text-muted-foreground">Tag Color</label>
                      <div className="grid grid-cols-6 gap-2">
                        {(Object.keys(NOTION_COLORS) as NotionColorKey[]).map((cKey) => {
                          const cStyle = NOTION_COLORS[cKey];
                          return (
                            <button
                              key={cKey}
                              type="button"
                              onClick={() => setModalTagColor(cKey)}
                              className={cn(
                                "relative inline-flex h-9 items-center justify-center rounded-md border transition-colors shadow-none",
                                cStyle.bg,
                                cStyle.border,
                                "hover:border-foreground/30",
                                modalTagColor === cKey && "border-foreground ring-1 ring-foreground"
                              )}
                              title={cKey}
                            >
                              <ColorDot dotClassName={cStyle.dot} size="sm" />
                              {modalTagColor === cKey && <Check className="absolute right-0.5 top-0.5 h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                </div>
              </div>
              <DialogFooter className="m-0 rounded-none border-t border-border bg-muted/20 px-5 py-3">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="h-9 rounded-md text-xs shadow-none">Cancel</Button>
                <Button type="button" onClick={handleCreateNewTag} className="h-9 rounded-md text-xs shadow-none" disabled={!modalTagName.trim()}>Create tag</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
