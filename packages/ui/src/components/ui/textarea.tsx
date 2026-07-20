import * as React from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type TextareaProps = React.ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-input disabled:opacity-[0.4]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
