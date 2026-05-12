import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

interface ActionRowProps {
    children: ReactNode;
    className?: string;
}

/**
 * WHY:   CTA blocks often need consistent spacing/alignment but should remain server-rendered.
 * WHAT:  Wraps action elements (buttons/links) in a flex/grid row with customizable classes.
 * HOW:   Minimal `<div>` wrapper only.
 */
export default function ActionRow({ children, className }: ActionRowProps) {
    return <div className={cn(className)}>{children}</div>;
}
