"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "English" : "العربية";

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      aria-label={`Switch language to ${label}`}
      className={cn(
        buttonVariants({ variant: "outline", size: compact ? "icon" : "sm" }),
        "shrink-0 border-zinc-100 bg-white font-bold uppercase tracking-[0.1em] text-[10px] shadow-none hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        className
      )}
    >
      <Languages className={cn("h-4 w-4", !compact && "me-2")} />
      {!compact && <span>{label}</span>}
    </Link>
  );
}
