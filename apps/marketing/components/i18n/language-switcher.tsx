"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

const languages = [
  { code: "en", name: "English", localName: "English" },
  { code: "ar", name: "Arabic", localName: "العربية" },
  // Additional languages can be added here
];

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  
  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Current language: ${currentLang.localName}`}
        className={cn(
          buttonVariants({ variant: "outline", size: compact ? "icon" : "sm" }),
          "shrink-0 border-zinc-100 bg-white font-bold uppercase tracking-[0.1em] text-[10px] shadow-none hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
          className
        )}
      >
        <Languages className={cn("h-4 w-4", !compact && "me-2")} />
        {!compact && <span>{currentLang.localName}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code}>
            <Link
              href={pathname}
              locale={lang.code}
              className={cn("w-full cursor-pointer", locale === lang.code && "font-bold")}
            >
              {lang.localName}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
