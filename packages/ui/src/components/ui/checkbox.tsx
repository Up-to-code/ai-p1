import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@qentrah/platform-core/classnames";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

function Checkbox({ className, checked, ...props }: CheckboxProps) {
  return (
    <label className="relative inline-flex size-4 items-center justify-center">
      <input type="checkbox" checked={checked} className="peer sr-only" {...props} />
      <span
        className={cn(
          "absolute inset-0 rounded border border-border bg-background peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-[0.4]",
          className,
        )}
      />
      <Check className="pointer-events-none relative size-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </label>
  );
}

export { Checkbox };
