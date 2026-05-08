"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from 'next-intl';

export function Topbar() {
  const t = useTranslations('Topbar');
  const tWorkspace = useTranslations('Workspace');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <header className={cn(
      "flex h-[var(--topbar-height)] items-center gap-4 bg-white/70 px-8 backdrop-blur-md border-b border-zinc-100 transition-all duration-300",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-6">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 transition-all group">
          <Search className="h-4 w-4 group-hover:text-zinc-900" />
          <span className="text-sm font-medium hidden md:inline-block group-hover:text-zinc-900">{tWorkspace('searchAnything')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex opacity-70 hover:opacity-100" />
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-none">
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t('live')}</span>
          </Button>
        </div>

        <div className="ms-2 border-l border-zinc-100 ps-4">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
