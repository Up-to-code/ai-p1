import type { ReactNode } from "react";

interface SectionProps {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    id?: string;
    bg?: "white" | "slate" | "dark" | "primary" | "glass" | "gradient" | "none";
    border?: boolean;
}

/**
 * WHY:   Public pages and marketing surfaces need a consistent section wrapper without client-side JS.
 * WHAT:  Renders a themed `<section>` with a max-width container and optional background/border presets.
 * HOW:   Uses static class composition only (no hooks), so it can remain a Server Component for SSR performance.
 */
export default function Section({
    children,
    className = "",
    containerClassName = "",
    id,
    bg = "white",
    border = false
}: SectionProps) {
    const backgrounds = {
        white: "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        slate: "bg-[#F8FAFC] text-slate-900 dark:bg-slate-900 dark:text-slate-100",
        dark: "bg-[#0F172A] text-white dark:bg-slate-950 dark:text-slate-50",
        primary: "bg-[#2563EB] text-white",
        glass: "border-y border-white/20 bg-white/70 text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100",
        gradient: "bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100",
        none: ""
    };

    return (
        <section
            id={id}
            className={`py-24 md:py-32 px-6 transition-colors ${backgrounds[bg]} ${border ? "border-b-2 border-slate-100 dark:border-slate-800" : ""} ${className}`}
        >
            <div className={`max-w-[1400px] mx-auto ${containerClassName}`}>
                {children}
            </div>
        </section>
    );
}
