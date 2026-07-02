"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export interface InlineNewCardData {
  name: string;
  contact?: string;
}

export interface InlineNewCardProps {
  stageColor: string;
  onSave: (data: InlineNewCardData) => void;
  onCancel: () => void;
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
  primaryLabel?: string;
}

export function InlineNewCard({
  stageColor,
  onSave,
  onCancel,
  primaryPlaceholder = "Title",
  secondaryPlaceholder,
  primaryLabel = "Save",
}: InlineNewCardProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), contact: contact.trim() || undefined });
  };

  return (
    <div className="rounded-lg border-2 p-3 transition-all" style={{ borderColor: stageColor }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={primaryPlaceholder}
        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) submit();
          if (e.key === "Escape") onCancel();
        }}
      />
      {secondaryPlaceholder && (
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={secondaryPlaceholder}
          className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground mt-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) submit();
            if (e.key === "Escape") onCancel();
          }}
        />
      )}
      <div className="flex gap-1 mt-2">
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: stageColor }}
        >
          <Check className="h-3 w-3" /> {primaryLabel}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}
