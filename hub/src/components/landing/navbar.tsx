"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export function Navbar() {
    const t = useTranslations("Landing.nav");

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-12">
                    <Link
                        href="/"
                        className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 transition hover:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <Image
                            src="/brand-logo.svg"
                            alt="Anan"
                            width={40}
                            height={40}
                            className="h-10 w-10"
                            priority
                        />
                    </Link>
                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400">{t("home") || "الرئيسية"}</Link>
                        <Link href="/developer" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400">{t("developers")}</Link>
                        <Link href="/broker" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400">{t("brokers") || "الوسطاء"}</Link>
                        <Link href="/about" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400">{t("about") || "عن الشركة"}</Link>
                        <Link href="/contact" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400">{t("contact") || "اتصل بنا"}</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-8">
                    <LanguageSwitcher compact className="h-10 w-10 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" />
                    <Link href="/dashboard" className="hidden sm:block text-xs font-bold text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors dark:text-slate-100 dark:hover:text-blue-400">{t("signIn")}</Link>
                    <Link
                        href="/dashboard"
                        className="rounded-lg border-none bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-700 active:scale-95 sm:px-10 sm:text-xs"
                    >
                        {t("dashboard")}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
