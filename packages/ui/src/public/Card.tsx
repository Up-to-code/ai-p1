import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "default" | "dark" | "accent";
    className?: string;
    children?: ReactNode;
}

/**
 * WHY:   Public surfaces need a consistent card primitive that can be rendered server-side for speed.
 * WHAT:  Displays an optional icon, title/description, and an optional children slot with variant styling.
 * HOW:   Pure presentational component (no interactivity), so it remains SSR-friendly.
 */
export default function Card({
    title,
    description,
    icon: Icon,
    variant = "default",
    className = "",
    children
}: CardProps) {
    const variants = {
        default: "border-2 border-slate-100 bg-white hover:border-blue-600 dark:border-slate-800 dark:bg-slate-950/80",
        dark: "border-2 border-slate-800 bg-slate-900 text-white dark:border-slate-700 dark:bg-slate-950",
        accent: "border-2 border-blue-600/20 bg-blue-600/5 hover:border-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10"
    };

    return (
        <div className={`space-y-8 rounded-lg p-12 transition-all group ${variants[variant]} ${className}`}>
            {Icon && (
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${variant === "dark" ? "bg-blue-600/20" : "bg-blue-600/10"}`}>
                    <Icon className={`h-6 w-6 ${variant === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                </div>
            )}
            <div className="space-y-3">
                <h3 className={`text-xl font-black uppercase leading-[1.1] tracking-normal ${variant === "dark" ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                    {title}
                </h3>
                <p className={`text-sm font-bold leading-relaxed ${variant === "dark" ? "text-slate-400" : "text-slate-500 dark:text-slate-300"}`}>
                    {description}
                </p>
            </div>
            {children && <div className="pt-4">{children}</div>}
        </div>
    );
}
