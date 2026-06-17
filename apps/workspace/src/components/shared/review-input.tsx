"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Bold, Italic, List, Smile, Star, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ReviewInputUser = {
  name: string;
  image: string | null;
  initials: string;
};

export type ReviewInputSubmission = {
  rating: number;
  text: string;
};

export type ReviewInputProps = {
  /** Currently authenticated user info (avatar + name). */
  user: ReviewInputUser;
  /** Called when the user submits the review. */
  onSubmit: (review: ReviewInputSubmission) => void | Promise<void>;
  /** External loading state to disable the form. */
  isLoading?: boolean;
  /** Placeholder text for the body field. */
  placeholder?: string;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Title above the form. */
  title?: string;
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*  Star Rating Picker                                                        */
/* -------------------------------------------------------------------------- */

function StarRatingPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className={cn(
            "group/star relative h-7 w-7 rounded-full flex items-center justify-center transition-all duration-150",
            "hover:bg-amber-50 dark:hover:bg-amber-950/20 active:scale-90",
            disabled && "pointer-events-none opacity-50",
          )}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors duration-150",
              (hover || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30 dark:text-foreground",
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-[10px] font-bold text-amber-500 ms-1.5 tabular-nums">
          {value}.0
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formatting Toolbar (visual only – wraps with markdown characters)         */
/* -------------------------------------------------------------------------- */

type FormatAction = "bold" | "italic" | "list";

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  setValue: (v: string) => void,
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const replacement = `${before}${selected || "text"}${after}`;
  const next = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
  setValue(next);

  // Restore cursor after React re-render
  requestAnimationFrame(() => {
    const cursorPos = selectionStart + before.length + (selected.length || 4);
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
  });
}

const formatActions: { action: FormatAction; icon: typeof Bold; label: string; before: string; after: string }[] = [
  { action: "bold", icon: Bold, label: "Bold", before: "**", after: "**" },
  { action: "italic", icon: Italic, label: "Italic", before: "_", after: "_" },
  { action: "list", icon: List, label: "List", before: "\n- ", after: "" },
];

/* -------------------------------------------------------------------------- */
/*  ReviewInput Component                                                     */
/* -------------------------------------------------------------------------- */

function ReviewInput({
  user,
  onSubmit,
  isLoading = false,
  placeholder = "Share your experience with this integration…",
  submitLabel = "Submit Review",
  title = "Write a Review",
  className,
}: ReviewInputProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const busy = isLoading || submitting;
  const canSubmit = rating > 0 && text.trim().length > 0 && !busy;

  /* Auto-size textarea */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, text: text.trim() });
      setRating(0);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormat(action: FormatAction) {
    const el = textareaRef.current;
    if (!el) return;
    const fmt = formatActions.find((a) => a.action === action);
    if (!fmt) return;
    wrapSelection(el, fmt.before, fmt.after, setText);
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
        {title}
      </h3>

      {/* Card */}
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        {/* Top: User info + Star picker */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Avatar className="h-8 w-8 shrink-0">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground/30 truncate">
              {user.name}
            </span>
            <StarRatingPicker value={rating} onChange={setRating} disabled={busy} />
          </div>
        </div>

        {/* Textarea */}
        <div className="px-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={busy}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className={cn(
              "w-full resize-none bg-transparent text-sm text-foreground dark:text-muted-foreground",
              "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
              "outline-none border-0 focus:ring-0 min-h-[72px]",
              "leading-relaxed",
              busy && "opacity-50 cursor-not-allowed",
            )}
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-muted/50">
          {/* Formatting Actions */}
          <div className="flex items-center gap-0.5">
            {formatActions.map((fmt) => (
              <button
                key={fmt.action}
                type="button"
                disabled={busy}
                onClick={() => handleFormat(fmt.action)}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center",
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
                  "dark:text-muted-foreground dark:hover:text-muted-foreground/40 dark:hover:bg-white/[0.06]",
                  "transition-colors duration-100",
                  busy && "pointer-events-none opacity-50",
                )}
                title={fmt.label}
              >
                <fmt.icon className="h-3.5 w-3.5" />
              </button>
            ))}

            <div className="w-px h-4 bg-border mx-1" />

            <button
              type="button"
              disabled={busy}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "dark:text-muted-foreground dark:hover:text-muted-foreground/40 dark:hover:bg-white/[0.06]",
                "transition-colors duration-100",
                busy && "pointer-events-none opacity-50",
              )}
              title="Emoji"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Submit */}
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" data-icon="inline-start" />
            {submitLabel}
          </Button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground dark:text-muted-foreground font-medium">
        Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[9px]">⌘ Enter</kbd> to submit
      </p>
    </div>
  );
}

export { ReviewInput, StarRatingPicker };
