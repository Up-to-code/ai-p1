import * as React from "react";
import { cn } from "@qentrah/platform-core/classnames";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

function Input({ className, label, error, helperText, id, type, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const descriptionId = error || helperText ? `${inputId}-description` : undefined;

  const control = (
    <input
      id={inputId}
      type={type}
      data-slot="input"
      aria-invalid={error ? true : undefined}
      aria-describedby={descriptionId}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-[0.4]",
        error && "border-destructive focus-visible:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );

  if (!label && !error && !helperText) {
    return control;
  }

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      {control}
      {error || helperText ? (
        <p
          id={descriptionId}
          className={cn("mt-1 text-sm text-muted-foreground", error && "text-destructive")}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}

export { Input };
