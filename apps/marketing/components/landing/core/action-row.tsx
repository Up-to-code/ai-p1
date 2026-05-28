import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ActionRow({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("flex flex-col sm:flex-row items-center gap-4", className)}>{children}</div>;
}
