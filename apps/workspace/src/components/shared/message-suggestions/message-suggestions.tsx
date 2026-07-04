"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

export type MessageSuggestionsProps = {
  question: string;
  options: string[];
  onSelect: (value: string) => void;
  className?: string;
};

export function MessageSuggestions({
  question,
  options,
  onSelect,
  className,
}: MessageSuggestionsProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium leading-relaxed text-foreground">
        {question}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(option)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.97]"
          >
            {option}
          </button>
        ))}
      </div>
      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="self-start text-xs font-medium text-text-muted underline decoration-dotted underline-offset-2 hover:text-text-secondary"
        >
          Custom answer
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground outline-none ring-0 placeholder:text-text-muted focus:border-[var(--q-user-bubble)]"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              if (customValue.trim()) {
                onSelect(customValue.trim());
                setCustomValue("");
                setShowCustom(false);
              }
            }}
            disabled={!customValue.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--q-user-bubble)] text-[var(--q-bg)] transition-all hover:opacity-90 active:scale-90 disabled:opacity-50"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5px]" />
          </button>
        </div>
      )}
    </div>
  );
}
