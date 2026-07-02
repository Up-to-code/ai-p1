"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PopoverMenu, type PopoverMenuItem } from "../popover-menu";
import { CountBadge } from "./count-badge";
import { NewBadge } from "./new-badge";
import { StageBar } from "./stage-bar";
import type { StageDefinition } from "./types";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

function EditableTitle({ value, onChange, className, inputClassName }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft.trim()) onChange(draft.trim());
    setIsEditing(false);
    setDraft("");
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft("");
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") cancel();
        }}
        className={inputClassName}
      />
    );
  }

  return (
    <h2
      onDoubleClick={() => {
        setDraft(value);
        setIsEditing(true);
      }}
      className={className}
    >
      {value}
    </h2>
  );
}

export interface ColumnHeaderProps {
  stage: StageDefinition;
  count: number;
  showBarColor?: boolean;
  showCount?: boolean;
  showNewBadge?: boolean;
  allowInlineCreate?: boolean;
  onStageRename: (stageKey: string, newName: string) => void;
  onAddStage?: () => void;
  onStageDelete?: (stageKey: string) => void;
  onAddClick: () => void;
}

export function ColumnHeader({
  stage,
  count,
  showBarColor = true,
  showCount = true,
  showNewBadge = false,
  allowInlineCreate = false,
  onStageRename,
  onAddStage,
  onStageDelete,
  onAddClick,
}: ColumnHeaderProps) {
  const menuItems: PopoverMenuItem[] = [
    {
      key: "rename",
      label: "Rename column",
      icon: <Pencil className="w-3.5 h-3.5" />,
      onClick: () => onStageRename(stage.key, stage.name),
    },
    ...(onAddStage
      ? [
          {
            key: "add-stage",
            label: "Add new stage",
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => onAddStage(),
          },
        ]
      : []),
    ...(onStageDelete
      ? [
          {
            key: "delete",
            label: "Delete column",
            icon: <Trash2 className="w-3.5 h-3.5" />,
            destructive: true,
            onClick: () => {
              if (typeof window !== "undefined" && !window.confirm(`Delete column "${stage.name}"?`)) return;
              onStageDelete(stage.key);
            },
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col shrink-0">
      {showBarColor && <StageBar color={stage.color} />}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <EditableTitle
            value={stage.name}
            onChange={(name) => onStageRename(stage.key, name)}
            className="text-[13px] font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
            inputClassName="bg-transparent border-b border-primary outline-none w-full font-semibold text-[13px]"
          />
          {showCount && <CountBadge color={stage.color} count={count} />}
          {showNewBadge && <NewBadge />}
        </div>
        <button
          type="button"
          className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 -mr-1"
          onClick={onAddClick}
          aria-label="Add task"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
        <PopoverMenu
          align="right"
          trigger={
            <button
              type="button"
              className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 -mr-1 inline-flex"
              aria-label="Column options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={menuItems}
        />
      </div>
      {allowInlineCreate && (
        <button
          className="mx-3.5 mb-2 py-1.5 rounded-md border border-dashed border-border/60 bg-background/40 flex items-center justify-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-colors"
          onClick={onAddClick}
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      )}
    </div>
  );
}
