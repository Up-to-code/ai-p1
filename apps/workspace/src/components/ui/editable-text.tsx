"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export function EditableText({
  value,
  onChange,
  placeholder = "Empty",
  as: Tag = "span",
  multiline = false,
  disabled = false,
  className,
  inputClassName,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      if ("setSelectionRange" in inputRef.current) {
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDraft(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full resize-none bg-transparent outline-none ring-2 ring-ring/50 rounded-md p-1",
            className,
            inputClassName
          )}
          rows={Math.max(3, draft.split("\n").length)}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full bg-transparent outline-none ring-2 ring-ring/50 rounded-md p-1",
          className,
          inputClassName
        )}
      />
    );
  }

  return (
    <Tag
      onClick={() => !disabled && setIsEditing(true)}
      className={cn(
        "cursor-text rounded-md transition-colors hover:bg-muted/50 p-1 -m-1 inline-block min-h-[1.5em] min-w-[2em]",
        !value && "text-muted-foreground italic",
        disabled && "cursor-not-allowed hover:bg-transparent",
        className
      )}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      {value || placeholder}
    </Tag>
  );
}
