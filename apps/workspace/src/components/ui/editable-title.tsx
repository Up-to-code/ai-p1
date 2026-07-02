"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  size?: "sm" | "md" | "lg" | "xl";
  trigger?: "doubleClick" | "click" | "alwaysEdit";
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  truncate?: boolean;
  ariaLabel?: string;
}

const SIZE_CLASSES = {
  sm: "text-[11px]",
  md: "text-[13px]",
  lg: "text-base",
  xl: "text-xl",
};

export function EditableTitle({
  value,
  onChange,
  placeholder = "Untitled",
  size = "md",
  trigger = "doubleClick",
  disabled = false,
  className,
  inputClassName,
  truncate = true,
  ariaLabel,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(trigger === "alwaysEdit");
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = async () => {
    if (draft !== value) {
      await onChange(draft);
    }
    if (trigger !== "alwaysEdit") setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    if (trigger !== "alwaysEdit") setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "bg-transparent border-b border-primary outline-none font-semibold w-full",
          SIZE_CLASSES[size],
          inputClassName,
        )}
      />
    );
  }

  return (
    <span
      role={trigger === "click" || trigger === "doubleClick" ? "button" : undefined}
      tabIndex={disabled ? undefined : 0}
      onClick={trigger === "click" ? () => setIsEditing(true) : undefined}
      onDoubleClick={trigger === "doubleClick" ? () => setIsEditing(true) : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled) setIsEditing(true);
      }}
      aria-label={ariaLabel}
      className={cn(
        SIZE_CLASSES[size],
        "font-semibold",
        !disabled && "cursor-pointer hover:text-primary transition-colors",
        truncate && "truncate",
        className,
      )}
    >
      {value || placeholder}
    </span>
  );
}
