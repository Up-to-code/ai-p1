"use client";

import { Languages } from "lucide-react";

type AdminLocale = "en" | "ar";

const localeCookie = "qentrah_admin_locale";

export function LanguageToggle({
  locale,
  labels,
}: {
  locale: AdminLocale;
  labels: {
    english: string;
    arabic: string;
    switchToEnglish: string;
    switchToArabic: string;
  };
}) {
  const nextLocale: AdminLocale = locale === "ar" ? "en" : "ar";
  const label = nextLocale === "ar" ? labels.switchToArabic : labels.switchToEnglish;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        document.cookie = `${localeCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
        window.location.reload();
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-100 bg-zinc-100 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{locale === "ar" ? labels.english : labels.arabic}</span>
    </button>
  );
}
