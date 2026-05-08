import { cn } from "@/lib/utils";

interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label = "or continue with", className }: AuthDividerProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-3 text-text-muted font-medium tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
