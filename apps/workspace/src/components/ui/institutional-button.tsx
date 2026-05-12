"use client";

import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "outline" | "ghost" | "dark" | "white";
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    href?: string;
    disabled?: boolean;
}

export default function InstitutionalButton({
    children,
    variant = "primary",
    className = "",
    onClick,
    type = "button",
    href,
    disabled = false,
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-[0.98] rounded-lg";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 px-8 py-2.5 text-xs font-black tracking-widest",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-5 text-sm font-black tracking-widest",
        ghost: "text-slate-900 hover:bg-slate-50 px-6 py-3 text-xs border-b-2 border-transparent hover:border-blue-600 dark:text-slate-100 dark:hover:bg-slate-800",
        dark: "bg-slate-900 text-white hover:bg-slate-800 px-12 py-5 text-sm font-black tracking-widest dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
        white: "bg-white text-blue-600 hover:bg-slate-50 px-12 py-5 text-sm font-black tracking-widest"
    };
    const content = <span className="flex items-center gap-3">{children}</span>;

    if (href) {
        return (
            <Link href={href} className={cn(baseStyles, variants[variant], className)}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], className, disabled && "cursor-not-allowed opacity-60")}
        >
            {content}
        </button>
    );
}
